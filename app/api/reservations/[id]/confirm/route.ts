import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id }
  })

  if (!reservation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (reservation.status !== 'PENDING' || reservation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Reservation has expired' }, { status: 410 }
    )
  }

  const confirmed = await prisma.$transaction(async (tx) => {
    await tx.stock.update({
      where: { id: reservation.stockId },
      data: {
        totalUnits:    { decrement: reservation.quantity },
        reservedUnits: { decrement: reservation.quantity },
      }
    })

    return tx.reservation.update({
      where: { id: params.id },
      data:  { status: 'CONFIRMED' }
    })
  })

  return NextResponse.json(confirmed)
}