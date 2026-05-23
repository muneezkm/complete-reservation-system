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

    if (!reservation || reservation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.stock.update({
      where: { id: reservation.stockId },
      data: { reservedUnits: { decrement: reservation.quantity } }
    })

    const released = await prisma.reservation.update({
      where: { id },
      data: { status: 'RELEASED' }
    })

    return NextResponse.json(released)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 }
    )
  }
}