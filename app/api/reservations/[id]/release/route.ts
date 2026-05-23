import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id }
  })

  if (!reservation || reservation.status !== 'PENDING') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const released = await prisma.$transaction(async (tx) => {
    await tx.stock.update({
      where: { id: reservation.stockId },
      data:  { reservedUnits: { decrement: reservation.quantity } }
    })

    return tx.reservation.update({
      where: { id: params.id },
      data:  { status: 'RELEASED' }
    })
  })

  return NextResponse.json(released)
}