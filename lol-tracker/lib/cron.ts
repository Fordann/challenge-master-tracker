import cron from 'node-cron'
import { prisma } from './db'
import {
  getAccountByRiotId,
  getLeagueEntriesByPuuid,
  getMatchIds,
  getMatch,
  getSoloQueueEntry,
} from './riot'
import { assignMatchToSession, closeStaleSession, getSessionStats } from './session'
import { getLPToMaster, getAvgLpChange, getEstimatedGames, getChallengeTimeRemaining } from './lpCalculator'
import { sendNotification, formatSessionRecap } from './notifications'
import { getChampionCutout } from './removebg'

let cronStarted = false

export async function initCron() {
  if (cronStarted) return
  cronStarted = true

  const intervalMinutes = parseInt(process.env.CRON_INTERVAL_MINUTES || '5', 10)

  console.log(`[Cron] Starting sync every ${intervalMinutes} minutes`)

  // Run immediately on startup
  await syncRiotData().catch((e) => console.error('[Cron] Initial sync error:', e))

  // Schedule
  cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
    console.log('[Cron] Running sync...')
    await syncRiotData().catch((e) => console.error('[Cron] Sync error:', e))
  })

  // Daily recap at 23:30
  cron.schedule('30 23 * * *', async () => {
    console.log('[Cron] Sending daily recap...')
    await sendDailyRecap().catch((e) => console.error('[Cron] Daily recap error:', e))
  })
}

export async function getOrCreatePlayer() {
  let player = await prisma.player.findFirst()
  if (player) return player

  // First run — resolve player via Riot ID
  const account = await getAccountByRiotId('AbatJourBleu', 'EUW11')

  player = await prisma.player.create({
    data: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
    },
  })

  return player
}

async function syncRiotData() {
  const player = await getOrCreatePlayer()

  // Get current rank
  const entries = await getLeagueEntriesByPuuid(player.puuid)
  const soloQ = getSoloQueueEntry(entries)

  if (!soloQ) {
    console.log('[Sync] No Solo/Duo queue data found')
    return
  }

  // Save rank snapshot
  const lastSnapshot = await prisma.rankSnapshot.findFirst({
    where: { playerId: player.id },
    orderBy: { takenAt: 'desc' },
  })

  const rankChanged =
    !lastSnapshot ||
    lastSnapshot.tier !== soloQ.tier ||
    lastSnapshot.rank !== soloQ.rank ||
    lastSnapshot.lp !== soloQ.leaguePoints

  if (rankChanged) {
    await prisma.rankSnapshot.create({
      data: {
        tier: soloQ.tier,
        rank: soloQ.rank,
        lp: soloQ.leaguePoints,
        playerId: player.id,
      },
    })
  }

  // Check for division change notification
  if (
    lastSnapshot &&
    (lastSnapshot.tier !== soloQ.tier || lastSnapshot.rank !== soloQ.rank)
  ) {
    const oldRank = `${lastSnapshot.tier} ${lastSnapshot.rank}`
    const newRank = `${soloQ.tier} ${soloQ.rank}`

    if (soloQ.tier === 'MASTER') {
      await sendNotification({
        event: 'master_reached',
        message: `🏆 MASTER ATTEINT ! AbatJourBleu a réussi le défi !`,
      })
    } else {
      await sendNotification({
        event: 'division_change',
        message: `⬆️ ${oldRank} → ${newRank} !`,
      })
    }
  }

  // Fetch recent match IDs
  const matchIds = await getMatchIds(player.puuid, 20)

  // Collect new matches and sort oldest-first for proper LP tracking
  const newMatchesData: { matchId: string; matchData: Awaited<ReturnType<typeof getMatch>> }[] = []

  for (const matchId of matchIds) {
    const exists = await prisma.match.findUnique({ where: { matchId } })
    if (exists) continue

    const matchData = await getMatch(matchId)
    const participant = matchData.info.participants.find(
      (p) => p.puuid === player.puuid
    )
    if (!participant) continue
    newMatchesData.push({ matchId, matchData })
  }

  // Sort oldest first so LP tracking accumulates correctly
  newMatchesData.sort((a, b) => a.matchData.info.gameStartTimestamp - b.matchData.info.gameStartTimestamp)

  for (const { matchId, matchData } of newMatchesData) {
    const participant = matchData.info.participants.find(
      (p) => p.puuid === player.puuid
    )!

    // Get the snapshot just before this match for LP tracking
    const snapshotBefore = await prisma.rankSnapshot.findFirst({
      where: {
        playerId: player.id,
        takenAt: { lt: new Date(matchData.info.gameEndTimestamp) },
      },
      orderBy: { takenAt: 'desc' },
    })

    // If we have two snapshots around this match, compute exact LP change
    // Otherwise, estimate based on typical LP gain/loss for the tier
    let lpBefore: number
    let lpAfter: number
    let lpChange: number

    const snapshotAfter = await prisma.rankSnapshot.findFirst({
      where: {
        playerId: player.id,
        takenAt: { gte: new Date(matchData.info.gameEndTimestamp) },
      },
      orderBy: { takenAt: 'asc' },
    })

    if (snapshotBefore && snapshotAfter && snapshotBefore.id !== snapshotAfter.id) {
      // Exact LP change from snapshots
      lpBefore = snapshotBefore.lp
      lpAfter = snapshotAfter.lp
      lpChange = lpAfter - lpBefore
    } else {
      // Estimate LP change: typical values per tier
      const estimatedGain = 25
      const estimatedLoss = -20
      lpChange = participant.win ? estimatedGain : estimatedLoss
      lpBefore = soloQ.leaguePoints - lpChange
      lpAfter = soloQ.leaguePoints
    }

    const match = await prisma.match.create({
      data: {
        matchId,
        playedAt: new Date(matchData.info.gameStartTimestamp),
        champion: participant.championName,
        championId: participant.championId,
        skinId: 0,
        win: participant.win,
        lpBefore,
        lpAfter,
        lpChange,
        tier: soloQ.tier,
        rank: soloQ.rank,
        duration: matchData.info.gameDuration,
        playerId: player.id,
      },
    })

    // Assign to session
    await assignMatchToSession(player.id, match.playedAt, match.id)

    // Pre-cache champion assets
    await getChampionCutout(participant.championName, 0).catch((e) =>
      console.error(`[Sync] Failed to cache champion asset: ${e}`)
    )
  }

  // Close stale sessions & notify
  const activeSessionBefore = await prisma.session.findFirst({
    where: { playerId: player.id, isActive: true },
  })

  await closeStaleSession(player.id)

  // If session was just closed, send recap
  if (activeSessionBefore) {
    const stillActive = await prisma.session.findFirst({
      where: { id: activeSessionBefore.id, isActive: true },
    })
    if (!stillActive) {
      const stats = await getSessionStats(activeSessionBefore.id)
      if (stats) {
        const time = getChallengeTimeRemaining()
        const recentMatches = await prisma.match.findMany({
          where: { playerId: player.id },
          orderBy: { playedAt: 'desc' },
          take: 5,
        })
        const avgLp = getAvgLpChange(recentMatches)
        const lpToMaster = getLPToMaster(stats.tier, stats.rank, stats.lpChange)
        const estimated = getEstimatedGames(lpToMaster, avgLp)

        await sendNotification({
          event: 'session_ended',
          message: formatSessionRecap({
            ...stats,
            lpToMaster,
            estimatedGames: estimated,
            daysLeft: time.days,
            hoursLeft: time.hours,
          }),
        })
      }
    }
  }

  console.log(`[Sync] Done. ${soloQ.tier} ${soloQ.rank} ${soloQ.leaguePoints} LP`)
}

async function sendDailyRecap() {
  const player = await prisma.player.findFirst()
  if (!player) return

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayMatches = await prisma.match.findMany({
    where: {
      playerId: player.id,
      playedAt: { gte: todayStart },
    },
    orderBy: { playedAt: 'asc' },
  })

  if (todayMatches.length === 0) return

  const wins = todayMatches.filter((m) => m.win).length
  const losses = todayMatches.length - wins
  const lpChange = todayMatches.reduce((sum, m) => sum + m.lpChange, 0)

  let bestStreak = 0
  let currentStreak = 0
  for (const m of todayMatches) {
    if (m.win) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  const champCounts = todayMatches.reduce<Record<string, number>>((acc, m) => {
    acc[m.champion] = (acc[m.champion] || 0) + 1
    return acc
  }, {})
  const championsList = Object.entries(champCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${name} (${count})`)
    .join(', ')

  const lastMatch = todayMatches[todayMatches.length - 1]
  const time = getChallengeTimeRemaining()
  const avgLp = getAvgLpChange(todayMatches.slice(-5))
  const lpToMaster = getLPToMaster(lastMatch.tier, lastMatch.rank, lastMatch.lpAfter)

  await sendNotification({
    event: 'daily_recap',
    message: [
      `📅 Récap du ${new Date().toLocaleDateString('fr-FR')} — AbatJourBleu`,
      ``,
      `🎮 ${todayMatches.length} parties | ✅ ${wins}W ❌ ${losses}L`,
      `📈 Win rate : ${Math.round((wins / todayMatches.length) * 100)}%`,
      `💎 ${lpChange >= 0 ? '+' : ''}${lpChange} LP aujourd'hui → ${lastMatch.lpAfter} LP (${lastMatch.tier} ${lastMatch.rank})`,
      `🔥 Meilleur streak du jour : ${bestStreak}`,
      `🗡️ Champions : ${championsList}`,
      ``,
      `🏔️ LP restants : ${lpToMaster} (~${getEstimatedGames(lpToMaster, avgLp)} parties)`,
      `⏳ Il reste ${time.days}j ${time.hours}h dans le défi`,
    ].join('\n'),
  })
}
