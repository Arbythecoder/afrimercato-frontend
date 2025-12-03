import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
    title: 'Fresh African Vegetables',
    subtitle: 'Delivered to your doorstep in 20-40 minutes',
    cta: 'Shop Now',
    gradient: 'from-green-600/90 to-emerald-700/90'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1600&q=80',
    title: 'Exotic Tropical Fruits',
    subtitle: 'Plantain, Yam, Cassava & More - Always Fresh',
    cta: 'Discover',
    gradient: 'from-yellow-600/90 to-orange-700/90'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80',
    title: 'Authentic Spices & Grains',
    subtitle: 'Bringing Africa to UK with premium quality',
    cta: 'Explore',
    gradient: 'from-red-600/90 to-pink-700/90'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1600&q=80',
    title: 'Fresh Meat & Fish',
    subtitle: 'Halal certified, quality guaranteed',
    cta: 'Order Now',
    gradient: 'from-blue-600/90 to-purple-700/90'
  }
]

export default function HeroSlider({ onSearch }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient}`} />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center px-4 sm:px-6 max-w-4xl">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl"
              >
                {slides[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl lg:text-2xl text-white/95 mb-6 sm:mb-8 drop-shadow-lg"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.button
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                onClick={onSearch}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-900 px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-2xl hover:bg-yellow-400 transition-all"
              >
                {slides[currentSlide].cta} →
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all z-10 shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all z-10 shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'bg-white w-8 sm:w-12 h-2 sm:h-3'
                : 'bg-white/50 w-2 sm:w-3 h-2 sm:h-3 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Auto
        </div>
      )}
    </div>
  )
}
