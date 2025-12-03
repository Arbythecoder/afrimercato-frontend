import { useState } from 'react'
import { getDefaultProductImage, getDefaultStoreLogo } from '../utils/defaultImages'

/**
 * Image component with automatic fallback to default images
 * Handles loading errors gracefully
 */
export default function ImageWithFallback({
  src,
  alt,
  category = 'default',
  type = 'product', // 'product' or 'store'
  className = '',
  ...props
}) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const getFallbackImage = () => {
    if (type === 'store') {
      return getDefaultStoreLogo(category)
    }
    return getDefaultProductImage(category)
  }

  const imageSrc = (error || !src) ? getFallbackImage() : src

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
        {...props}
      />
    </div>
  )
}
