import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '../api/requests'
import type { Product } from '../api/requests'
import { Link } from 'react-router-dom'

const AdminProducts: React.FC = () => {
  const { data: products, refetch } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete product?')
    if (!confirmed) return

    try {
      await deleteProduct(id)
      refetch()
    } catch (error) {
      console.error('Failed to delete product', error)
      alert('Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Admin ‑ Products</h2>
        <Link to="/admin/products/new" className="btn-cta">
          Create product
        </Link>
      </div>

      <div className="space-y-3">
        {products?.map((product) => {
          const imageUrl: string = product.images && product.images.length > 0
            ? product.images[0].url
            : 'https://placehold.co/80x60?text=No'

          return (
            <div key={product._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-20 h-14 object-cover rounded-md"
              />

              <div className="flex-1 ml-4">
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/products/${product._id}`}
                  className="text-sm font-medium text-tpred"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}

        {(!products || products.length === 0) && (
          <div className="text-gray-500">No products found.</div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
