import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/requests'
import type { Product } from '../api/requests'
import { motion } from 'framer-motion'
import ImageWithFallback from '../components/ui/ImageWithFallback'

const ProductList: React.FC = () => {
  const { data, isLoading, error } = useQuery<Product[], Error>({ queryKey: ['products'], queryFn: getProducts })
  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 product-grid-tight">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="product-card-custom animate-pulse">
          <div className="w-full h-56 bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500">Failed to load products. Please try again later.</p>
    </div>
  )
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
      </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 product-grid-tight">
        {data?.map((p: Product) => (
          <motion.div whileHover={{ y: -6 }} key={p._id} className="product-card-custom">
            <Link to={`/product/${p._id}`} className="block h-full">
              <div className="product-card-img-container">
                <ImageWithFallback
                  src={p.images?.[0]?.url ?? null}
                  alt={p.name}
                  className="product-card-img"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-tpred">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-base md:text-lg font-bold text-tpgold">${p.price.toFixed(2)}</div>
                  <button className="btn-cta text-sm">View</button>
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