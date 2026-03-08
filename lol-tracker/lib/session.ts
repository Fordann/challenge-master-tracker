import { prisma } from './db'

const SESSION_GAP_MS = 2 * 60 * 60 * 1000 // 2 hours

export async function assignMatchToSession(
  playerId: number,
  matchPlayedAt: Date,
  matchId: number
): Promise<number> {
  // Find active session
  const activeSession = await prisma.session.findFirst({
    where: { playerId, isActive: true },
    include: { matches: { orderBy: { playedAt: 'desc' }, take: 1 } },
  })

  if (!activeSession) {
    // Create new session
    const session = await prisma.session.create({
      data: {
        startedAt: matchPlayedAt,
        isActive: true,
        playerId,
      },
    })
    await prisma.match.update({
      where: { id: matchId },
      data: { sessionId: session.id },
    })
    return session.id
  }

  const lastMatch = activeSession.matches[0]
  const gap = lastMatch
    ? matchPlayedAt.getTime() - lastMatch.playedAt.getTime()
    : 0

  if (lastMatch && gap > SESSION_GAP_MS) {
    // Close current session
    await prisma.session.update({
      where: { id: activeSession.id },
      data: { isActive: false, endedAt: lastMatch.playedAt },
    })

    // Create new session
    const newSession = await prisma.session.create({
      data: {
        startedAt: matchPlayedAt,
        isActive: true,
        playerId,
      },
    })
    await prisma.match.update({
      where: { id: matchId },
      data: { sessionId: newSession.id },
    })
    return newSession.id
  }

  // Attach to existing session
  await prisma.match.update({
    where: { id: matchId },
    data: { sessionId: activeSession.id },
  })
  return activeSession.id
}

export async function closeStaleSession(playerId: number): Promise<void> {
  const activeSession = await prisma.session.findFirst({
    where: { playerId, isActive: true },
    include: { matches: { orderBy: { playedAt: 'desc' }, take: 1 } },
  })

  if (!activeSession) return

  const lastMatch = activeSession.matches[0]
  if (!lastMatch) return

  const gap = Date.now() - lastMatch.playedAt.getTime()
  if (gap > SESSION_GAP_MS) {
    await prisma.session.update({
      where: { id: activeSession.id },
      data: { isActive: false, endedAt: lastMatch.playedAt },
    })
  }
}

export async function getActiveSession(playerId: number) {
  return prisma.session.findFirst({
    where: { playerId, isActive: true },
    include: {
      matches: { orderBy: { playedAt: 'asc' } },
    },
  })
}

export async function getSessionStats(sessionId: number) {
  const matches = await prisma.match.findMany({
    where: { sessionId },
    orderBy: { playedAt: 'asc' },
  })

  if (matches.length === 0) return null

  const wins = matches.filter((m) => m.win).length
  const losses = matches.length - wins
  const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0
  const lpStart = matches[0].lpBefore
  const lpEnd = matches[matches.length - 1].lpAfter
  const lpChange = lpEnd - lpStart

  // Calculate best streak
  let currentStreak = 0
  let bestStreak = 0
  for (const m of matches) {
    if (m.win) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return {
    total: matches.length,
    wins,
    losses,
    winRate: Math.round(winRate),
    lpStart,
    lpEnd,
    lpChange,
    bestStreak,
    tier: matches[matches.length - 1].tier,
    rank: matches[matches.length - 1].rank,
  }
}
