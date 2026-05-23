import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  productId:   z.string(),
  warehouseId: z.string(),
  quantity:    z.number().int().positive(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' }, { status: 400 }
      )
    }

    const { productId, warehouseId, quantity } = parsed.data

    const stock = await prisma.stock.findFirst({
      where: { productId, warehouseId }
    })

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' }, { status: 404 }
      )
    }

    const available = stock.totalUnits - stock.reservedUnits

    if (available < quantity) {
      return NextResponse.json(
        { error: 'Not enough stock available' }, { status: 409 }
      )
    }

    await prisma.stock.update({
      where: { id: stock.id },
      data: { reservedUnits: { increment: quantity } }
    })

    const reservation = await prisma.reservation.create({
      data: {
        stockId:   stock.id,
        quantity,
        status:    'PENDING',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      include: {
        stock: {
          include: { product: true, warehouse: true }
        }
      }
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 }
    )
  }
}