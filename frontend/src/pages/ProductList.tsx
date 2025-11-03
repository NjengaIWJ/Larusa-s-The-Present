import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/requests'
import type { Product } from '../api/requests'
import { motion } from 'framer-motion'

const ProductList: React.FC = () => {
  const { data, isLoading, error } = useQuery<Product[], Error>({ queryKey: ['products'], queryFn: getProducts })
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading products</div>
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
      </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 product-grid-tight">
        {data?.map((p: Product) => (
          <motion.div whileHover={{ y: -6 }} key={p._id} className="product-card-custom">
            <Link to={`/product/${p._id}`} className="block">
              <img src={p.images && p.images.length ? p.images[0] : 'https://placehold.co/600x400?text=No+Image'} alt={p.name} className="product-card-img" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-tpred">{p.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-lg font-bold text-tpgold">${p.price.toFixed(2)}</div>
                  <button className="btn-cta">View</button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProductList