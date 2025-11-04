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
  status?: string
  createdAt?: string
}

const statusClasses: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const Orders: React.FC = () => {
  const { data, isLoading } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: getOrders })
  if (isLoading) return <div className="p-4">Loading orders...</div>
  const orders = data ?? []
  return (
    <div className="container-max py-6">
      <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">No orders yet.</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => (
            <article key={o._id} className="product-card-custom p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Order</div>
                    <div className="font-mono text-sm text-gray-700 dark:text-gray-200">#{o._id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[o.status ?? 'pending'] || 'bg-gray-100 text-gray-800'}`}>
                      {o.status ?? 'pending'}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm text-gray-500">Items</div>
                  <ul className="mt-2 space-y-1">
                    {o.items.map((it) => {
                      const productName = typeof it.product === 'string' ? it.product : it.product.name ?? 'Unknown product'
                      const productKey = typeof it.product === 'string' ? it.product : it.product._id ?? productName
                      return (
                        <li key={productKey} className="text-sm flex justify-between">
                          <span>{productName}</span>
                          <span className="text-gray-500">x{it.quantity}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>

              <div className="w-full md:w-48 flex-shrink-0">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 text-center">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-xl font-semibold mt-1">${o.total.toFixed(2)}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-cta-gold w-full">View</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
