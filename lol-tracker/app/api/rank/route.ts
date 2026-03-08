import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLPToMaster, getAvgLpChange, getEstimatedGames, getTotalLP } from '@/lib/lpCalculator'

export const dynamic = 'force-dynamic'

export async function GET() {
  const player = await prisma.player.findFirst()
  if (!player) {
    return NextResponse.json({ rank: null })
  }

  const latestSnapshot = await prisma.rankSnapshot.findFirst({
    where: { playerId: player.id },
    orderBy: { takenAt: 'desc' },
  })

  if (!latestSnapshot) {
    return NextResponse.json({ rank: null })
  }

  const recentMatches = await prisma.match.findMany({
    where: { playerId: player.id },
    orderBy: { playedAt: 'desc' },
    take: 5,
  })

  const allMatches = await prisma.match.findMany({
    where: { playerId: player.id },
    orderBy: { playedAt: 'desc' },
  })

  const avgLp = getAvgLpChange(recentMatches)
  const lpToMaster = getLPToMaster(latestSnapshot.tier, latestSnapshot.rank, latestSnapshot.lp)
  const estimatedGames = getEstimatedGames(lpToMaster, avgLp)
  const totalLP = getTotalLP(latestSnapshot.tier, latestSnapshot.rank, latestSnapshot.lp)

  // Calculate current streak
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

  // Last match for hero champion
  const lastMatch = allMatches[0] || null

  // Snapshots for graph
  const snapshots = await prisma.rankSnapshot.findMany({
    where: { playerId: player.id },
    orderBy: { takenAt: 'asc' },
  })

  return NextResponse.json({
    rank: {
      tier: latestSnapshot.tier,
      rank: latestSnapshot.rank,
      lp: latestSnapshot.lp,
      totalLP,
      lpToMaster,
      estimatedGames,
      avgLpChange: avgLp,
      currentStreak,
      streakType,
      lastMatch,
      totalMatches: allMatches.length,
      wins: allMatches.filter((m) => m.win).length,
      losses: allMatches.filter((m) => !m.win).length,
    },
    snapshots,
  })
}
