import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  getLeagueEntries,
  getMatchIds,
  getMatch,
  getSoloQueueEntry,
} from '@/lib/riot'
import { assignMatchToSession, closeStaleSession } from '@/lib/session'
import { getChampionCutout } from '@/lib/removebg'

export async function POST() {
  try {
    const player = await prisma.player.findFirst()
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const entries = await getLeagueEntries(player.summonerId)
    const soloQ = getSoloQueueEntry(entries)
    if (!soloQ) {
      return NextResponse.json({ error: 'No Solo/Duo data' }, { status: 404 })
    }

    // Snapshot
    await prisma.rankSnapshot.create({
      data: {
        tier: soloQ.tier,
        rank: soloQ.rank,
        lp: soloQ.leaguePoints,
        playerId: player.id,
      },
    })

    // Matches
    const matchIds = await getMatchIds(player.puuid, 10)
    let newMatches = 0

    for (const matchId of matchIds) {
      const exists = await prisma.match.findUnique({ where: { matchId } })
      if (exists) continue

      const matchData = await getMatch(matchId)
      const participant = matchData.info.participants.find(
        (p) => p.puuid === player.puuid
      )
      if (!participant) continue

      const match = await prisma.match.create({
        data: {
          matchId,
          playedAt: new Date(matchData.info.gameStartTimestamp),
          champion: participant.championName,
          championId: participant.championId,
          skinId: 0,
          win: participant.win,
          lpBefore: soloQ.leaguePoints,
          lpAfter: soloQ.leaguePoints,
          lpChange: 0,
          tier: soloQ.tier,
          rank: soloQ.rank,
          duration: matchData.info.gameDuration,
          playerId: player.id,
        },
      })

      await assignMatchToSession(player.id, match.playedAt, match.id)
      await getChampionCutout(participant.championName, 0).catch(() => {})
      newMatches++
    }

    await closeStaleSession(player.id)

    return NextResponse.json({
      success: true,
      newMatches,
      rank: `${soloQ.tier} ${soloQ.rank} ${soloQ.leaguePoints} LP`,
    })
  } catch (error) {
    console.error('[API/sync] Error:', error)
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}
