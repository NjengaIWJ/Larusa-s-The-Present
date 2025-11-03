import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../api/requests'

type OrderItem = {
  product: { _id?: string; name?: string } | string
  quantity: number
}

type Order = {
  _id: string
  total: number
  items: OrderItem[]
}

const Orders: React.FC = () => {
  const { data, isLoading } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: getOrders })
  if (isLoading) return <div>Loading orders...</div>
  const orders = data ?? []
  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? <div>No orders yet.</div> : (
        <div>
          {orders.map((o) => (
            <div key={o._id} className="product-card" style={{ marginBottom: 8 }}>
              <div>Order: {o._id}</div>
              <div>Total: ${o.total.toFixed(2)}</div>
              <div>Items:
                <ul>
                  {o.items.map((it) => {
                    const productName = typeof it.product === 'string' ? it.product : it.product.name ?? 'Unknown product'
                    const productKey = typeof it.product === 'string' ? it.product : it.product._id ?? productName
                    return <li key={productKey}>{productName} x {it.quantity}</li>
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
