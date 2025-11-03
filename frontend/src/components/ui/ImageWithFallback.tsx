import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

const ImageWithFallback: React.FC<Props> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://placehold.co/600x400?text=No+Image' 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      
      <motion.img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

export default ImageWithFallback