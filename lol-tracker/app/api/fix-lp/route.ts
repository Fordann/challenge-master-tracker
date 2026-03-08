import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/fix-lp
 * Recalculates LP for matches that have lpChange=0 using estimates.
 * Win = +25, Loss = -20. Run once to fix initial import data.
 */
export async function POST() {
  try {
    const zeroLpMatches = await prisma.match.findMany({
      where: { lpChange: 0 },
      orderBy: { playedAt: 'asc' },
    })

    let updated = 0

    for (const match of zeroLpMatches) {
      const estimatedChange = match.win ? 25 : -20

      await prisma.match.update({
        where: { id: match.id },
        data: {
          lpChange: estimatedChange,
          lpBefore: match.lpAfter - estimatedChange,
        },
      })
      updated++
    }

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('[API/fix-lp] Error:', error)
    return NextResponse.json({ error: 'Failed to fix LP' }, { status: 500 })
  }
}
