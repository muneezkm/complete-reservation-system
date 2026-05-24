'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [products, setProducts]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [reserving, setReserving] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  async function reserve(
    productId: string,
    warehouseId: string,
    stockId: string
  ) {
    setError('')
    setReserving(stockId)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
      })

      if (res.status === 409) {
        setError('Sorry, this item just sold out!')
        setReserving(null)
        return
      }

      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        setReserving(null)
        return
      }

      const reservation = await res.json()
      router.prefetch(`/checkout/${reservation.id}`)
      router.push(`/checkout/${reservation.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setReserving(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent
                        rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading products...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">

        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="text-4xl font-bold mb-1">Allo Store</h1>
          <p className="text-gray-400">
            Items reserved for 10 minutes at checkout
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
                         px-4 py-3 rounded-xl mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          {products.map(product => {
            const totalAvailable = product.stocks.reduce(
              (sum: number, s: any) => sum + (s.totalUnits - s.reservedUnits),
              0
            )

            return (
              <div key={product.id}
                className="bg-white rounded-2xl p-6 shadow-sm">

                {/* Product header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <p className="text-gray-400 text-sm">{product.sku}</p>
                    <p className="text-sm mt-1 text-gray-500">
                      {totalAvailable > 0
                        ? `${totalAvailable} units available total`
                        : 'Out of stock'}
                    </p>
                  </div>
                  <span className="text-2xl font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Warehouse stock */}
                <div className="space-y-2">
                  {product.stocks.map((stock: any) => {
                    const available = stock.totalUnits - stock.reservedUnits
                    const isReserving = reserving === stock.id

                    return (
                      <div key={stock.id}
                        className="flex items-center justify-between
                                   bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                          <span className="font-medium text-sm">
                            {stock.warehouse.name}
                          </span>
                          <span className={`text-sm ml-2 ${
                            available === 0
                              ? 'text-red-400'
                              : available <= 2
                              ? 'text-orange-500'
                              : 'text-green-600'
                          }`}>
                            {available === 0
                              ? 'Out of stock'
                              : available <= 2
                              ? `⚡ Only ${available} left`
                              : `${available} available`}
                          </span>
                        </div>

                        <button
                          disabled={available === 0 || reserving !== null}
                          onClick={() => reserve(
                            product.id,
                            stock.warehouseId,
                            stock.id
                          )}
                          className={`px-5 py-2 rounded-xl text-sm font-semibold
                                     transition-all ${
                            isReserving
                              ? 'bg-gray-800 text-white'
                              : available === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          {isReserving ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white
                                             border-t-transparent rounded-full
                                             animate-spin inline-block"></span>
                              Reserving...
                            </span>
                          ) : available === 0 ? 'Sold Out' : 'Reserve'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 pb-8">
          🔒 Secure checkout · Free shipping · 10 min reservation
        </p>
      </div>
    </div>
  )
}