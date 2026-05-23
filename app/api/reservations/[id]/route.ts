import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Props) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        stock: {
          include: { product: true, warehouse: true }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(reservation)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 }
    )
  }
}