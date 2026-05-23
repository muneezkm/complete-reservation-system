import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const london = await prisma.warehouse.create({
    data: { name: 'London Hub', location: 'London, UK' }
  })
  const dubai = await prisma.warehouse.create({
    data: { name: 'Dubai Hub', location: 'Dubai, UAE' }
  })

  const shirt = await prisma.product.create({
    data: { name: 'Classic White Shirt', sku: 'SHIRT-001', price: 49.99 }
  })
  const jeans = await prisma.product.create({
    data: { name: 'Slim Fit Jeans', sku: 'JEANS-001', price: 89.99 }
  })
  const sneakers = await prisma.product.create({
    data: { name: 'Running Sneakers', sku: 'SNKR-001', price: 129.99 }
  })

  await prisma.stock.createMany({
    data: [
      { productId: shirt.id,    warehouseId: london.id, totalUnits: 10 },
      { productId: shirt.id,    warehouseId: dubai.id,  totalUnits: 5  },
      { productId: jeans.id,    warehouseId: london.id, totalUnits: 3  },
      { productId: jeans.id,    warehouseId: dubai.id,  totalUnits: 8  },
      { productId: sneakers.id, warehouseId: london.id, totalUnits: 1  },
      { productId: sneakers.id, warehouseId: dubai.id,  totalUnits: 6  },
    ]
  })

  console.log('Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())