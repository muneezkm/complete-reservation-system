import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expired = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: new Date() }
    }
  })

  for (const r of expired) {
    await prisma.stock.update({
      where: { id: r.stockId },
      data: { reservedUnits: { decrement: r.quantity } }
    })
    await prisma.reservation.update({
      where: { id: r.id },
      data: { status: 'RELEASED' }
    })
  }

  return NextResponse.json({
    message: `Released ${expired.length} expired reservations`
  })
}