import { prisma } from '@/lib/db'
import { getLPToMaster, getAvgLpChange, getEstimatedGames } from '@/lib/lpCalculator'
import { getLatestVersion } from '@/lib/riot'
import ClientPage from './ClientPage'

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const player = await prisma.player.findFirst()
    if (!player) {
      return null
    }

    const latestSnapshot = await prisma.rankSnapshot.findFirst({
      where: { playerId: player.id },
      orderBy: { takenAt: 'desc' },
    })

    if (!latestSnapshot) return null

    const allMatches = await prisma.match.findMany({
      where: { playerId: player.id },
      orderBy: { playedAt: 'desc' },
    })

    const recentMatches = allMatches.slice(0, 5)
    const avgLp = getAvgLpChange(recentMatches)
    const lpToMaster = getLPToMaster(latestSnapshot.tier, latestSnapshot.rank, latestSnapshot.lp)
    const estimatedGames = getEstimatedGames(lpToMaster, avgLp)

    // Current streak
    let currentStreak = 0
    let streakType: 'win' | 'loss' | null = null
    for (const m of allMatches) {
      if (streakType === null) {
        streakType = m.win ? 'win' : 'loss'
        currentStreak = 1
      } else if ((streakType === 'win' && m.win) || (streakType === 'loss' && !m.win)) {
        currentStreak++
      } else {
        break
      }
    }

    // Active session
    const activeSession = await prisma.session.findFirst({
      where: { playerId: player.id, isActive: true },
      include: { matches: { orderBy: { playedAt: 'asc' } } },
    })

    let sessionData = null
    if (activeSession && activeSession.matches.length > 0) {
      const sessionMatches = activeSession.matches
      const wins = sessionMatches.filter((m) => m.win).length
      const losses = sessionMatches.length - wins
      const winRate = Math.round((wins / sessionMatches.length) * 100)
      const lpStart = sessionMatches[0].lpBefore
      const lpEnd = sessionMatches[sessionMatches.length - 1].lpAfter
      const lpChange = lpEnd - lpStart

      sessionData = {
        total: sessionMatches.length,
        wins,
        losses,
        winRate,
        lpChange,
        tier: latestSnapshot.tier,
        rank: latestSnapshot.rank,
        lp: latestSnapshot.lp,
      }
    }

    // Last match for hero — fetch actual asset paths from DB
    const lastMatch = allMatches[0] || null
    let lastMatchCutoutPath: string | null = null
    let lastMatchSplashPath: string | null = null
    if (lastMatch) {
      const asset = await prisma.championAsset.findUnique({
        where: { championName_skinId: { championName: lastMatch.champion, skinId: lastMatch.skinId } },
      })
      if (asset) {
        lastMatchCutoutPath = asset.cutoutPath
        lastMatchSplashPath = `/champion-cache/${lastMatch.champion}_${lastMatch.skinId}_splash.jpg`
      }
    }

    // Get DDragon version for champion icons
    const ddragonVersion = await getLatestVersion()

    const sessionWinRate = sessionData
      ? sessionData.winRate / 100
      : allMatches.length > 0
        ? allMatches.filter((m) => m.win).length / Math.min(allMatches.length, 10)
        : 0.5

    // Recent matches for table
    const displayMatches = allMatches.slice(0, 20).map((m) => ({
      id: m.id,
      matchId: m.matchId,
      champion: m.champion,
      win: m.win,
      lpChange: m.lpChange,
      duration: m.duration,
      playedAt: m.playedAt.toISOString(),
    }))

    // All matches for champion wall
    const wallMatches = allMatches.map((m) => ({
      champion: m.champion,
      win: m.win,
    }))

    // Time since last match
    let playedAgo = 'N/A'
    if (lastMatch) {
      const diff = Date.now() - lastMatch.playedAt.getTime()
      const min = Math.floor(diff / 60000)
      if (min < 60) playedAgo = `${min} min`
      else if (min < 1440) playedAgo = `${Math.floor(min / 60)}h`
      else playedAgo = `${Math.floor(min / 1440)}j`
    }

    return {
      tier: latestSnapshot.tier,
      rank: latestSnapshot.rank,
      lp: latestSnapshot.lp,
      lpToMaster,
      estimatedGames,
      currentStreak,
      streakType,
      sessionData,
      sessionWinRate,
      ddragonVersion,
      lastMatch: lastMatch
        ? {
            champion: lastMatch.champion,
            skinId: lastMatch.skinId,
            win: lastMatch.win,
            lpChange: lastMatch.lpChange,
            playedAgo,
            cutoutPath: lastMatchCutoutPath || `/champion-cache/${lastMatch.champion}_${lastMatch.skinId}_splash.jpg`,
            splashPath: lastMatchSplashPath || `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${lastMatch.champion}_${lastMatch.skinId}.jpg`,
          }
        : null,
      displayMatches,
      wallMatches,
      totalMatches: allMatches.length,
      lastSyncAt: latestSnapshot.takenAt.toISOString(),
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    return null
  }
}

export default async function Home() {
  const data = await getData()

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h1 className="font-beaufort text-4xl text-accent-gold mb-4">LoL Master Tracker</h1>
          <p className="text-text-secondary">En attente de la première synchronisation...</p>
          <p className="text-text-secondary text-sm mt-2">
            Vérifiez que la clé API Riot est configurée dans les variables d&apos;environnement.
          </p>
        </div>
      </div>
    )
  }

  return <ClientPage data={data} />
}
