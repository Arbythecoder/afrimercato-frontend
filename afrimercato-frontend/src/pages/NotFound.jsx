import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Big 404 */}
          <div className="relative mb-8">
            <p className="text-[10rem] font-black text-gray-100 leading-none select-none">404</p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-afri-green/10 rounded-full flex items-center justify-center">
                <Search size={36} className="text-afri-green" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              <ArrowLeft size={16} /> Go back
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark transition-colors w-full sm:w-auto justify-center"
            >
              <Home size={16} /> Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
