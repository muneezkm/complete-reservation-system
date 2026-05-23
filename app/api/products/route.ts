import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  await prisma.$executeRaw`
    UPDATE "Stock"
    SET "reservedUnits" = "reservedUnits" - sub.qty
    FROM (
      SELECT r."stockId", SUM(r.quantity) as qty
      FROM "Reservation" r
      WHERE r.status = 'PENDING' AND r."expiresAt" < NOW()
      GROUP BY r."stockId"
    ) sub
    WHERE "Stock".id = sub."stockId"
  `
  await prisma.$executeRaw`
    UPDATE "Reservation"
    SET status = 'RELEASED'
    WHERE status = 'PENDING' AND "expiresAt" < NOW()
  `

  const products = await prisma.product.findMany({
    include: {
      stocks: {
        include: { warehouse: true }
      }
    }
  })

  return NextResponse.json(products)
}