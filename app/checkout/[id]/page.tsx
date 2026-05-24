'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function PaymentModal({
  onSuccess,
  onClose,
  amount
}: {
  onSuccess: () => void
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
      .replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  function formatExpiry(val: string) {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    if (clean.length >= 3) {
      return clean.slice(0, 2) + '/' + clean.slice(2)
    }
    return clean
  }

  function validateCard() {
    const cleanCard = cardNumber.replace(/\s/g, '')
    if (name.trim().length < 2) return 'Please enter your full name'
    if (cleanCard.length !== 16) return `Card number must be 16 digits (you entered ${cleanCard.length})`
    if (expiry.length !== 5) return 'Please enter expiry date as MM/YY'
    const [month, year] = expiry.split('/')
    const expMonth = parseInt(month)
    const expYear  = parseInt('20' + year)
    const now      = new Date()
    if (expMonth < 1 || expMonth > 12) return 'Invalid expiry month'
    if (expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1))
      return 'Your card has expired'
    if (cvv.length !== 3) return `CVV must be 3 digits (you entered ${cvv.length})`
    return null
  }

  async function handlePay() {
    const validationError = validateCard()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setProcessing(true)
    await new Promise(r => setTimeout(r, 3000))
    setProcessing(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70
                    flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {processing ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 border-4 border-black border-t-transparent
                           rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-bold mb-2">Processing Payment</p>
            <p className="text-gray-400 text-sm">
              Please do not close this page
            </p>
            <div className="mt-8 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-black h-full rounded-full animate-pulse"
                   style={{width: '75%'}}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Contacting your bank...
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">Pay Now</h2>
                <p className="text-gray-400 text-sm">
                  Secure payment simulation
                </p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center
                           rounded-full bg-gray-100 hover:bg-gray-200
                           text-gray-500 transition-colors">
                ✕
              </button>
            </div>

            <div className="bg-gradient-to-r from-gray-900 to-gray-700
                           rounded-2xl p-6 mb-8 text-white">
              <p className="text-gray-400 text-sm mb-1">Total Amount</p>
              <p className="text-4xl font-bold">${amount}</p>
              <p className="text-gray-400 text-xs mt-4">
                🔒 256-bit encrypted
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600
                             px-4 py-3 rounded-xl mb-6 text-sm flex gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700
                                  block mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  className="w-full border-2 border-gray-200 rounded-xl
                             px-4 py-3 focus:outline-none focus:border-black
                             transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700
                                  block mb-2">
                  Card Number
                  <span className="text-gray-400 font-normal ml-2">
                    {cardNumber.replace(/\s/g, '').length}/16
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={e => {
                    setCardNumber(formatCard(e.target.value))
                    setError('')
                  }}
                  className={`w-full border-2 rounded-xl px-4 py-3
                             focus:outline-none transition-colors
                             font-mono tracking-wider ${
                    cardNumber.replace(/\s/g, '').length === 16
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 focus:border-black'
                  }`}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700
                                    block mb-2">
                    Expiry
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => {
                      setExpiry(formatExpiry(e.target.value))
                      setError('')
                    }}
                    className={`w-full border-2 rounded-xl px-4 py-3
                               focus:outline-none transition-colors ${
                      expiry.length === 5
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 focus:border-black'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700
                                    block mb-2">
                    CVV
                    <span className="text-gray-400 font-normal ml-2">
                      {cvv.length}/3
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={e => {
                      setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                      setError('')
                    }}
                    className={`w-full border-2 rounded-xl px-4 py-3
                               focus:outline-none transition-colors ${
                      cvv.length === 3
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 focus:border-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-black text-white py-4 rounded-xl
                         font-bold mt-8 hover:bg-gray-800 transition-colors
                         text-lg tracking-wide"
            >
              Pay ${amount}
            </button>
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

  async function cancel() {
    await fetch(`/api/reservations/${id}/release`, {
      method: 'POST'
    })
    setStatus('cancelled')
  }

  if (!reservation) return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent
                        rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your order...</p>
      </div>
    </div>
  )

  const mins    = Math.floor(secondsLeft / 60)
  const secs    = secondsLeft % 60
  const expired = secondsLeft === 0
  const urgent  = secondsLeft < 120 && !expired

  if (status === 'confirmed') return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center p-8">
      <div className="text-center max-w-md bg-white rounded-3xl
                      p-10 shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex
                        items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">
          Your order has been confirmed.
        </p>
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Product</span>
            <span className="font-medium text-sm">
              {reservation.stock?.product?.name}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Warehouse</span>
            <span className="text-sm">
              {reservation.stock?.warehouse?.name}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t mt-2">
            <span className="font-bold">Total Paid</span>
            <span className="font-bold">
              ${reservation.stock?.product?.price?.toFixed(2)}
            </span>
          </div>
        </div>
        <button onClick={() => router.push('/')}
          className="w-full bg-black text-white py-4 rounded-xl
                     font-bold hover:bg-gray-800 transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  )

  if (status === 'cancelled') return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center p-8">
      <div className="text-center max-w-md bg-white rounded-3xl
                      p-10 shadow-lg">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex
                        items-center justify-center mx-auto mb-6">
          <span className="text-4xl">👋</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Order Cancelled</h1>
        <p className="text-gray-500 mb-8">
          Stock has been released back to inventory.
        </p>
        <button onClick={() => router.push('/')}
          className="w-full bg-black text-white py-4 rounded-xl
                     font-bold hover:bg-gray-800 transition-colors">
          Back to Store
        </button>
      </div>
    </div>
  )

  return (
    <>
      {showPayment && (
        <PaymentModal
          amount={reservation.stock?.product?.price?.toFixed(2)}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8 pt-4">
            <button onClick={() => router.push('/')}
              className="w-10 h-10 bg-white rounded-full flex items-center
                         justify-center shadow-sm hover:shadow-md transition-shadow">
              ←
            </button>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
                           px-4 py-3 rounded-xl mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Timer */}
          <div className={`rounded-2xl p-6 mb-6 text-center ${
            expired
              ? 'bg-red-500 text-white'
              : urgent
              ? 'bg-orange-500 text-white'
              : 'bg-black text-white'
          }`}>
            <p className="text-sm opacity-70 mb-1">
              {expired
                ? 'Reservation Expired'
                : urgent
                ? '⚡ Hurry! Limited time left'
                : 'Time Remaining'}
            </p>
            <p className="text-6xl font-mono font-bold tracking-wider">
              {expired
                ? '0:00'
                : `${mins}:${secs.toString().padStart(2, '0')}`}
            </p>
            {!expired && (
              <p className="text-xs opacity-60 mt-2">
                Your items are reserved
              </p>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="font-bold text-lg mb-5">Order Summary</h2>

            <div className="flex items-start gap-4 pb-5 border-b mb-5">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex
                              items-center justify-center text-2xl">
                🛍️
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {reservation.stock?.product?.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {reservation.stock?.product?.sku}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  📦 {reservation.stock?.warehouse?.name}
                </p>
              </div>
              <p className="font-bold text-lg">
                ${reservation.stock?.product?.price?.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${reservation.stock?.product?.price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base
                              pt-3 border-t">
                <span>Total</span>
                <span>${reservation.stock?.product?.price?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={cancel}
              className="flex-1 bg-white border-2 border-gray-200 py-4
                         rounded-xl font-semibold hover:border-gray-300
                         transition-colors text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowPayment(true)}
              disabled={expired}
              className="flex-2 flex-grow-[2] bg-black text-white py-4
                         rounded-xl font-bold disabled:opacity-40
                         disabled:cursor-not-allowed hover:bg-gray-800
                         transition-colors"
            >
              {expired ? 'Reservation Expired' : '💳 Pay Now'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            🔒 Your order is protected and secure
          </p>

        </div>
      </div>
    </>
  )
}