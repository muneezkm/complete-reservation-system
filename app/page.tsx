'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  async function reserve(productId: string, warehouseId: string) {
    setError('')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
      })

      const text = await res.text()
      console.log('Status:', res.status)
      console.log('Body:', text)

      if (res.status === 409) {
        setError('Sorry, this item just sold out!')
        return
      }

      if (!res.ok) {
        setError('Something went wrong: ' + text)
        return
      }

      const reservation = JSON.parse(text)
      router.push(`/checkout/${reservation.id}`)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Loading products...</p>
    </div>
  )

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Allo Store</h1>
        <p className="text-gray-500">
          Units are reserved for 10 minutes at checkout.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-6">
        {products.map(product => (
          <div key={product.id}
            className="border rounded-xl p-6 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{product.sku}</p>
              </div>
              <span className="text-2xl font-bold">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              {product.stocks.map((stock: any) => {
                const available = stock.totalUnits - stock.reservedUnits
                return (
                  <div key={stock.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <span className="font-medium">
                        {stock.warehouse.name}
                      </span>
                      <span className={`text-sm ml-2 ${available === 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {available === 0 ? 'Out of stock' : `${available} available`}
                      </span>
                    </div>
                    <button
                      disabled={available === 0}
                      onClick={() => reserve(product.id, stock.warehouseId)}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 hover:bg-gray-800 transition-colors"
                    >
                      Reserve
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}