import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getActiveSession, getSessionStats } from '@/lib/session'

export async function GET() {
  const player = await prisma.player.findFirst()
  if (!player) {
    return NextResponse.json({ session: null })
  }

  const activeSession = await getActiveSession(player.id)
  if (!activeSession) {
    return NextResponse.json({ session: null })
  }

  const stats = await getSessionStats(activeSession.id)

  return NextResponse.json({
    session: {
      ...activeSession,
      stats,
    },
  })
}
