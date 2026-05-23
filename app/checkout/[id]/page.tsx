'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId]               = useState('')
  const [reservation, setReservation] = useState<any>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [status, setStatus]       = useState('')
  const [error, setError]         = useState('')
  const router = useRouter()

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/reservations/${id}`)
      .then(r => r.json())
      .then(data => {
        setReservation(data)
        const secs = Math.floor(
          (new Date(data.expiresAt).getTime() - Date.now()) / 1000
        )
        setSecondsLeft(Math.max(0, secs))
      })
  }, [id])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft])

  async function confirm() {
    setError('')
    const res = await fetch(`/api/reservations/${id}/confirm`, {
      method: 'POST'
    })
    if (res.status === 410) {
      setError('Your reservation expired before we could confirm it.')
      return
    }
    setStatus('confirmed')
  }

  async function cancel() {
    await fetch(`/api/reservations/${id}/release`, {
      method: 'POST'
    })
    setStatus('cancelled')
  }

  if (!reservation) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  const mins    = Math.floor(secondsLeft / 60)
  const secs    = secondsLeft % 60
  const expired = secondsLeft === 0

  if (status === 'confirmed') return (
    <main className="max-w-lg mx-auto p-8 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 mb-6">Your purchase was successful.</p>
      <button
        onClick={() => router.push('/')}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        Back to Store
      </button>
    </main>
  )

  if (status === 'cancelled') return (
    <main className="max-w-lg mx-auto p-8 text-center">
      <div className="text-6xl mb-4">👋</div>
      <h1 className="text-2xl font-bold mb-2">Reservation Cancelled</h1>
      <p className="text-gray-500 mb-6">Stock released back to inventory.</p>
      <button
        onClick={() => router.push('/')}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        Back to Store
      </button>
    </main>
  )

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className={`rounded-xl p-6 mb-6 text-center border ${
        expired
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <p className="text-sm text-gray-500 mb-1">
          {expired ? 'Reservation expired' : 'Time remaining'}
        </p>
        <p className={`text-5xl font-mono font-bold ${
          expired ? 'text-red-600' : 'text-amber-600'
        }`}>
          {expired
            ? '0:00'
            : `${mins}:${secs.toString().padStart(2, '0')}`}
        </p>
      </div>

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Order Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="font-medium">
              {reservation.stock?.product?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Warehouse</span>
            <span>{reservation.stock?.warehouse?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity</span>
            <span>{reservation.quantity}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-3 border-t">
            <span>Total</span>
            <span>${reservation.stock?.product?.price?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="flex-1 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={expired}
          className="flex-1 bg-black text-white px-6 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Confirm Purchase
        </button>
      </div>
    </main>
  )
}