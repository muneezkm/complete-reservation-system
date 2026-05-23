'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function PaymentModal({ 
  onSuccess, 
  onFailure, 
  onClose,
  amount
}: { 
  onSuccess: () => void
  onFailure: () => void
  onClose: () => void
  amount: string
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry]         = useState('')
  const [cvv, setCvv]               = useState('')
  const [name, setName]             = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError]           = useState('')

  function formatCard(val: string) {
    return val.replace(/\D/g, '').slice(0, 16)
      .replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    return val.replace(/\D/g, '').slice(0, 4)
      .replace(/(.{2})/, '$1/')
  }

  async function handlePay() {
    if (!cardNumber || !expiry || !cvv || !name) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setProcessing(true)

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2500))

    // 70% success rate simulation
    const success = Math.random() < 0.7
    setProcessing(false)

    if (success) {
      onSuccess()
    } else {
      onFailure()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 
                    flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">

        {processing ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-black border-t-transparent 
                           rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Processing payment...</p>
            <p className="text-gray-500 text-sm mt-1">Please do not close this page</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Payment</h2>
              <button onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light">
                ×
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">Amount to pay</p>
              <p className="text-3xl font-bold">${amount}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 
                             px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCard(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3
                             focus:outline-none focus:ring-2 focus:ring-black
                             font-mono tracking-wider"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.slice(0, 3))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3
                               focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold
                         mt-6 hover:bg-gray-800 transition-colors text-lg"
            >
              Pay ${amount}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              🔒 Secured payment simulation
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId]                   = useState('')
  const [reservation, setReservation] = useState<any>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [status, setStatus]           = useState('')
  const [error, setError]             = useState('')
  const [showPayment, setShowPayment] = useState(false)
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

  async function handlePaymentSuccess() {
    setShowPayment(false)
    setError('')
    const res = await fetch(`/api/reservations/${id}/confirm`, {
      method: 'POST'
    })
    if (res.status === 410) {
      setError('Your reservation expired during payment.')
      return
    }
    setStatus('confirmed')
  }

  async function handlePaymentFailure() {
    setShowPayment(false)
    setStatus('failed')
  }

  async function cancel() {
    await fetch(`/api/reservations/${id}/release`, {
      method: 'POST'
    })
    setStatus('cancelled')
  }

  if (!reservation) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-black border-t-transparent 
                      rounded-full animate-spin"></div>
    </div>
  )

  const mins    = Math.floor(secondsLeft / 60)
  const secs    = secondsLeft % 60
  const expired = secondsLeft === 0

  if (status === 'confirmed') return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-gray-500 mb-2">Your order has been confirmed.</p>
        <p className="text-gray-400 text-sm mb-8">
          A confirmation has been sent to your email.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
          <p className="text-green-700 font-medium">
            ✓ {reservation.stock?.product?.name}
          </p>
          <p className="text-green-600 text-sm">
            {reservation.stock?.warehouse?.name}
          </p>
        </div>
        <button onClick={() => router.push('/')}
          className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors">
          Continue Shopping
        </button>
      </div>
    </main>
  )

  if (status === 'failed') return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">❌</div>
        <h1 className="text-3xl font-bold mb-3">Payment Failed</h1>
        <p className="text-gray-500 mb-8">
          Your card was declined. Your reservation is still active.
        </p>
        <div className="flex gap-3">
          <button onClick={cancel}
            className="flex-1 border border-gray-300 px-6 py-3 rounded-xl
                       hover:bg-gray-50 transition-colors">
            Cancel Order
          </button>
          <button onClick={() => setShowPayment(true)}
            className="flex-1 bg-black text-white px-6 py-3 rounded-xl
                       hover:bg-gray-800 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    </main>
  )

  if (status === 'cancelled') return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">👋</div>
        <h1 className="text-3xl font-bold mb-3">Order Cancelled</h1>
        <p className="text-gray-500 mb-8">
          Stock has been released back to inventory.
        </p>
        <button onClick={() => router.push('/')}
          className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors">
          Back to Store
        </button>
      </div>
    </main>
  )

  return (
    <>
      {showPayment && (
        <PaymentModal
          amount={reservation.stock?.product?.price?.toFixed(2)}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => setShowPayment(false)}
        />
      )}

      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
                         px-4 py-3 rounded-lg mb-6">
            ⚠️ {error}
          </div>
        )}

        <div className={`rounded-xl p-6 mb-6 text-center border ${
          expired
            ? 'bg-red-50 border-red-200'
            : secondsLeft < 120
            ? 'bg-orange-50 border-orange-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className="text-sm text-gray-500 mb-1">
            {expired ? 'Reservation expired' : 'Time remaining'}
          </p>
          <p className={`text-5xl font-mono font-bold ${
            expired ? 'text-red-600'
            : secondsLeft < 120 ? 'text-orange-500'
            : 'text-amber-600'
          }`}>
            {expired
              ? '0:00'
              : `${mins}:${secs.toString().padStart(2, '0')}`}
          </p>
          {!expired && secondsLeft < 120 && (
            <p className="text-orange-500 text-sm mt-2 font-medium">
              ⚠️ Hurry! Your reservation is about to expire
            </p>
          )}
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
            className="flex-1 border border-gray-300 px-6 py-3 rounded-xl
                       hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowPayment(true)}
            disabled={expired}
            className="flex-1 bg-black text-white px-6 py-3 rounded-xl
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-gray-800 transition-colors"
          >
            Pay Now
          </button>
        </div>
      </main>
    </>
  )
}