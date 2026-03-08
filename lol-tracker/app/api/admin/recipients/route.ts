import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function checkAuth(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password')
  return password === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const recipients = await prisma.notificationRecipient.findMany({
    orderBy: { id: 'asc' },
  })

  return NextResponse.json({ recipients })
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, phoneNumber, apiKey } = body

  if (!name || !phoneNumber || !apiKey) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const recipient = await prisma.notificationRecipient.create({
    data: { name, phoneNumber, apiKey },
  })

  return NextResponse.json({ recipient })
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, active } = body

  const recipient = await prisma.notificationRecipient.update({
    where: { id },
    data: { active },
  })

  return NextResponse.json({ recipient })
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id } = body

  await prisma.notificationRecipient.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
