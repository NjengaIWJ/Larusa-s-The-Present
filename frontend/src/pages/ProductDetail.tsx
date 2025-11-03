import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '../api/requests'
import type { Product } from '../api/requests'
import useCart from '../stores/useCart'
import { useToast } from '../stores/useToast'
import { useState } from 'react'
import { motion } from 'framer-motion'

const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const { data, isLoading } = useQuery<Product | null, Error>({ queryKey: ['product', id], queryFn: () => getProduct(id as string) })
  const add = useCart(s => s.add)
  const showToast = useToast(s => s.showToast)
  const [added, setAdded] = useState(false)

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  const p = data
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="product-card-custom p-4">
      <img src={p.images && p.images.length ? p.images[0] : 'https://placehold.co/800x400?text=No+Image'} alt={p.name} className="product-card-img" />
      <div className="mt-4">
        <h2 className="text-2xl font-bold text-tpred">{p.name}</h2>
        <p className="text-gray-500 mt-2">{p.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="text-xl font-extrabold text-tpgold">${p.price.toFixed(2)}</div>
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
    </motion.div>
  )
}

export default ProductDetail