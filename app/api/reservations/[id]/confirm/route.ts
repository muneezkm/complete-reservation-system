import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

type Props = {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, { params }: Props) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (
      reservation.status !== 'PENDING' ||
      reservation.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: 'Reservation has expired' }, { status: 410 }
      )
    }

    await prisma.stock.update({
      where: { id: reservation.stockId },
      data: {
        totalUnits:    { decrement: reservation.quantity },
        reservedUnits: { decrement: reservation.quantity },
      }
    })

    const confirmed = await prisma.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    })

    return NextResponse.json(confirmed)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 }
    )
  }
}