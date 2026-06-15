import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Package, RefreshCw } from 'lucide-react'

function RiderRadar() {
    const navigate = useNavigate()
    const [availableGigs, setAvailableGigs] = useState([])
    const [loading, setLoading] = useState(true)
    const [acceptingId, setAcceptingId] = useState(null)

    const fetchGigs = async () => {
        setLoading(true)
        try {
            // This hits the endpoint we wrote yesterday!
            const res = await apiCall('/riders/gigs/available')
            setAvailableGigs(res?.data || [])
        } catch (error) {
            console.error("Failed to fetch radar", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGigs()
        const interval = setInterval(fetchGigs, 15000)
        return () => clearInterval(interval)
    }, [])

    const handleAcceptGig = async (orderId) => {
        setAcceptingId(orderId)
        try {
            await apiCall(`/riders/gigs/${orderId}/accept`, { method: 'POST' })
            alert("Gig Accepted! Head to the store.")
            navigate(`/rider/delivery/${orderId}`)
        } catch (error) {
            alert("Too slow! Another rider might have grabbed this gig.")
            fetchGigs()
        } finally {
            setAcceptingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-afri-gray-50">
            <div className="bg-[#1A1A1A] px-5 pt-14 pb-8 rounded-b-[2rem] shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-white text-2xl font-bold flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-afri-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-afri-green"></span>
                        </span>
                        Live Radar
                    </h1>
                    <button onClick={fetchGigs} className="text-afri-green p-2 bg-white/10 rounded-full">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
                <p className="text-gray-400 text-sm">Scanning for nearby orders...</p>
            </div>

            <div className="px-5 py-6 space-y-4">
                {loading && availableGigs.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10 animate-pulse">Scanning area...</p>
                ) : availableGigs.length === 0 ? (
                    <div className="text-center mt-16">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <Navigation size={30} className="text-gray-400" />
                        </div>
                        <p className="font-bold text-gray-700">No gigs nearby</p>
                        <p className="text-sm text-gray-400 mt-1">Stay online, orders update in real-time.</p>
                    </div>
                ) : (
                    availableGigs.map((gig, i) => (
                        <motion.div
                            key={gig._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-afri-yellow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{gig.vendor?.storeName || 'Store'}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <MapPin size={12} /> {gig.vendor?.address?.city || 'City Center'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-afri-green-dark">£{(gig.deliveryFee || 5).toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Payout</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-5 text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl">
                                <Package size={16} className="text-afri-green" />
                                <span>Order {gig.orderNumber} is Packed & Ready</span>
                            </div>

                            <button
                                onClick={() => handleAcceptGig(gig._id)}
                                disabled={acceptingId === gig._id}
                                className="w-full py-3 bg-[#FF8F00] hover:bg-[#E68100] text-white font-bold rounded-xl text-lg shadow-md transition-colors active:scale-95 disabled:opacity-50"
                            >
                                {acceptingId === gig._id ? 'Securing Gig...' : 'Accept Gig'}
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}

export default RiderRadar