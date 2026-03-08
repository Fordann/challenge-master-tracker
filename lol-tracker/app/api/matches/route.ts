import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '0', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const player = await prisma.player.findFirst()
  if (!player) {
    return NextResponse.json({ matches: [], total: 0 })
  }

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where: { playerId: player.id },
      orderBy: { playedAt: 'desc' },
      skip: page * limit,
      take: limit,
    }),
    prisma.match.count({ where: { playerId: player.id } }),
  ])

  return NextResponse.json({ matches, total })
}
