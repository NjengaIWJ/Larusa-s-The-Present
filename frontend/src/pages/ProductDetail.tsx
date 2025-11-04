import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '../api/requests'
import type { Product } from '../api/requests'
import useCart from '../stores/useCart'
import { useToast } from '../stores/useToast'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ImageWithFallback from '../components/ui/ImageWithFallback'

const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const { data, isLoading } = useQuery<Product | null, Error>({ queryKey: ['product', id], queryFn: () => getProduct(id as string) })

  // product data received from API

  const add = useCart(s => s.add)
  const showToast = useToast(s => s.showToast)
  const [added, setAdded] = useState(false)

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  const p = data
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
      <div className="container-max">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="product-card-img-container rounded-md overflow-hidden">
            <ImageWithFallback src={p.images?.[0]?.url ?? null} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-tpred">{p.name}</h2>
              <p className="text-gray-500 mt-3">{p.description}</p>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="text-2xl font-extrabold text-tpgold">${p.price.toFixed(2)}</div>
              <button
                className="btn-cta"
                onClick={() => {
                  add({ productId: p._id, name: p.name, price: p.price, quantity: 1 })
                  showToast('Added to cart', 'success')
                  setAdded(true)
                  setTimeout(() => setAdded(false), 1200)
                }}
                aria-pressed={added}
              >
                {added ? 'Added ✓' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductDetail