import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
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