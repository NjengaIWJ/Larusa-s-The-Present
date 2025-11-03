import React, { useState } from 'react'
import useCart from '../stores/useCart'
import { createOrder } from '../api/requests'
import type { OrderPayload } from '../api/requests'
import { useNavigate } from 'react-router-dom'

const Cart: React.FC = () => {
  const items = useCart(s => s.items)
  const remove = useCart(s => s.remove)
  const clear = useCart(s => s.clear)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  async function doCheckout() {
    setLoading(true)
    try {
      const payload: OrderPayload = { items: items.map(i => ({ product: i.productId, quantity: i.quantity, price: i.price })), total }
      await createOrder(payload)
      clear()
      navigate('/orders')
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Checkout failed: ${err.message}`)
      } else {
        alert('Checkout failed: Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {items.length === 0 ? <div className="text-gray-500">Cart is empty</div> : (
        <div className="space-y-3">
          {items.map(i => (
            <div key={i.productId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={'https://placehold.co/80x60?text=Item'} alt={i.name} className="w-20 h-14 object-cover rounded-md" />
                <div>
                  <div className="font-semibold">{i.name} x {i.quantity}</div>
                  <div className="text-sm text-gray-500">${(i.price * i.quantity).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => remove(i.productId)} className="text-sm text-red-500">Remove</button>
              </div>
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between">
            <strong className="text-lg">Total: ${total.toFixed(2)}</strong>
            <div className="flex items-center gap-2">
              <button disabled={loading} onClick={doCheckout} className="btn-cta">{loading ? 'Processing...' : 'Checkout'}</button>
              <button onClick={() => clear()} className="btn-cta-gold">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart