import { useState, useEffect } from 'react'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Search, MapPin, Store, Clock, ArrowRight } from 'lucide-react'
import { vendorAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function StoreExplorer({ userRole = 'rider' }) {
  const [stores, setStores] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestingId, setRequestingId] = useState(null)
  const { user: authUser } = useAuth()
  const role = authUser?.role ?? userRole

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async (latitude = null, longitude = null) => {
    setLoading(true)
    try {
      const res = await vendorAPI.getNearbyVendors(latitude, longitude, 15)
      
      const connectionsRes = await apiCall(`/picker-auth/requests`)
      const pendingIds = connectionsRes?.data?.requests?.map(r => r.id) || []
      
      const activeRes = await apiCall(`/picker-auth/my-stores`)
      const activeIds = activeRes?.data?.stores?.map(s => s.id) || []

      const formattedStores = (res?.data || []).map(store => {
        const rawCoordinates = store.location?.coordinates
        const coordsArray = Array.isArray(rawCoordinates)
          ? rawCoordinates
          : Array.isArray(rawCoordinates?.coordinates)
            ? rawCoordinates.coordinates
            : null

        const locationString = typeof store.location === 'string'
          ? store.location
          : store.location?.address
            ? store.location.address
            : coordsArray
              ? `${coordsArray[1].toFixed(5)}, ${coordsArray[0].toFixed(5)}`
              : 'Location not set'

        return {
          ...store,
          connectionStatus: activeIds.includes(store._id)
            ? 'active'
            : pendingIds.includes(store._id)
              ? 'pending'
              : 'none',
          locationString,
          latitude: store.location?.latitude ?? (coordsArray ? coordsArray[1] : null),
          longitude: store.location?.longitude ?? (coordsArray ? coordsArray[0] : null),
        }
      })

      setStores(formattedStores)
    } catch (error) {
      console.error('Failed to load stores', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchStores(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.warn("User denied location or it failed. Fetching all stores.", error)
          fetchStores()
        },
        { timeout: 10000 }
      )
    } else {
      fetchStores()
    }
  }, [])

  const handleRequestJoin = async (storeId) => {
    setRequestingId(storeId)
    try {
      await apiCall(`/picker-auth/connect-store/request/${storeId}`, { method: 'POST' })
      
      setStores(prev => prev.map(s => 
        s._id === storeId ? { ...s, connectionStatus: 'pending' } : s
      ))
    } catch (error) {
      alert(error?.message || 'Failed to send request. Try again.')
    } finally {
      setRequestingId(null)
    }
  }

  const filteredStores = stores.filter(s => 
    s.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.locationString?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-afri-gray-50 pb-20">
      <div className="bg-gradient-to-br from-afri-yellow-dark to-[#FFB300] px-5 pt-14 pb-8 rounded-b-[2.5rem]">
        <h1 className="text-white text-2xl font-bold">Find Stores</h1>
        <p className="text-white/80 text-sm mt-1">Connect with vendors to start receiving orders.</p>
        
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by store name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl shadow-sm outline-none text-sm text-gray-700 focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading nearby stores...</p>
        ) : filteredStores.length === 0 ? (
          <div className="text-center mt-10">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No stores found</p>
          </div>
        ) : (
          filteredStores.map((store, i) => (
            <motion.div
              key={store._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="text-orange-500" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{store.storeName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{store.locationString || 'Location not set'}</span>
                  </div>
                </div>
              </div>

              {store.distance !== undefined && store.distance !== 9999 && (
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold ml-2">
                {store.distance < 1 ? '< 1 km away' : `${Math.round(store.distance)} km away`}
                </span>
              )}

              {store.connectionStatus === 'active' ? (
                <div className="w-full py-2.5 bg-green-50 text-green-600 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Active Connection
                </div>
              ) : store.connectionStatus === 'pending' ? (
                <div className="w-full py-2.5 bg-orange-50 text-orange-500 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                  <Clock size={16} /> Request Pending
                </div>
              ) : (
                <button
                  onClick={() => handleRequestJoin(store._id)}
                  disabled={requestingId === store._id}
                  className="w-full py-2.5 bg-afri-yellow-dark hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {requestingId === store._id ? 'Sending...' : 'Request to Join'} <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default StoreExplorer