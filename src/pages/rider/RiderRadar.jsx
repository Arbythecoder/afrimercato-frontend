// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { apiCall } from '../../services/api'
// import { motion } from 'framer-motion'
// import { MapPin, Navigation, Package, RefreshCw } from 'lucide-react'

// function RiderRadar() {
//     const navigate = useNavigate()
//     const [availableGigs, setAvailableGigs] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [acceptingId, setAcceptingId] = useState(null)

//     const fetchGigs = async () => {
//         setLoading(true)
//         try {
//             // This hits the endpoint we wrote yesterday!
//             const res = await apiCall('/riders/gigs/available')
//             setAvailableGigs(res?.data || [])
//         } catch (error) {
//             console.error("Failed to fetch radar", error)
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => {
//         fetchGigs()
//         const interval = setInterval(fetchGigs, 15000)
//         return () => clearInterval(interval)
//     }, [])

//     const handleAcceptGig = async (orderId) => {
//         setAcceptingId(orderId)
//         try {
//             await apiCall(`/riders/gigs/${orderId}/accept`, { method: 'POST' })
//             alert("Gig Accepted! Head to the store.")
//             navigate(`/rider/delivery/${orderId}`)
//         } catch (error) {
//             alert("Too slow! Another rider might have grabbed this gig.")
//             fetchGigs()
//         } finally {
//             setAcceptingId(null)
//         }
//     }

//     return (
//         <div className="min-h-screen bg-afri-gray-50">
//             <div className="bg-[#1A1A1A] px-5 pt-14 pb-8 rounded-b-[2rem] shadow-lg">
//                 <div className="flex justify-between items-center mb-2">
//                     <h1 className="text-white text-2xl font-bold flex items-center gap-2">
//                         <span className="relative flex h-3 w-3">
//                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-afri-green opacity-75"></span>
//                             <span className="relative inline-flex rounded-full h-3 w-3 bg-afri-green"></span>
//                         </span>
//                         Live Radar
//                     </h1>
//                     <button onClick={fetchGigs} className="text-afri-green p-2 bg-white/10 rounded-full">
//                         <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//                     </button>
//                 </div>
//                 <p className="text-gray-400 text-sm">Scanning for nearby orders...</p>
//             </div>

//             <div className="px-5 py-6 space-y-4">
//                 {loading && availableGigs.length === 0 ? (
//                     <p className="text-center text-gray-500 mt-10 animate-pulse">Scanning area...</p>
//                 ) : availableGigs.length === 0 ? (
//                     <div className="text-center mt-16">
//                         <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
//                             <Navigation size={30} className="text-gray-400" />
//                         </div>
//                         <p className="font-bold text-gray-700">No gigs nearby</p>
//                         <p className="text-sm text-gray-400 mt-1">Stay online, orders update in real-time.</p>
//                     </div>
//                 ) : (
//                     availableGigs.map((gig, i) => (
//                         <motion.div
//                             key={gig._id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: i * 0.1 }}
//                             className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-afri-yellow"
//                         >
//                             <div className="flex justify-between items-start mb-4">
//                                 <div>
//                                     <h3 className="font-bold text-lg text-gray-900">{gig.vendor?.storeName || 'Store'}</h3>
//                                     <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
//                                         <MapPin size={12} /> {gig.vendor?.address?.city || 'City Center'}
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-xl font-black text-afri-green-dark">£{(gig.deliveryFee || 5).toFixed(2)}</p>
//                                     <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Payout</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-2 mb-5 text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl">
//                                 <Package size={16} className="text-afri-green" />
//                                 <span>Order {gig.orderNumber} is Packed & Ready</span>
//                             </div>

//                             <button
//                                 onClick={() => handleAcceptGig(gig._id)}
//                                 disabled={acceptingId === gig._id}
//                                 className="w-full py-3 bg-[#FF8F00] hover:bg-[#E68100] text-white font-bold rounded-xl text-lg shadow-md transition-colors active:scale-95 disabled:opacity-50"
//                             >
//                                 {acceptingId === gig._id ? 'Securing Gig...' : 'Accept Gig'}
//                             </button>
//                         </motion.div>
//                     ))
//                 )}
//             </div>
//         </div>
//     )
// }

// export default RiderRadar

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
            navigate(`/rider/delivery/${orderId}`)
        } catch (error) {
            alert("Too slow! Another rider might have grabbed this gig.")
            fetchGigs()
        } finally {
            setAcceptingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-afri-gray-50 pb-20">
            <div className="bg-[#1A1A1A] px-5 pt-14 pb-8 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                {/* Decorative radar rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full animate-[ping_3s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full animate-[ping_3s_linear_infinite_0.5s]" />

                <div className="relative flex justify-between items-center mb-2 z-10">
                    <h1 className="text-white text-3xl font-black tracking-tight flex items-center gap-3">
                        <span className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00E676]"></span>
                        </span>
                        Live Radar
                    </h1>
                    <button
                        onClick={fetchGigs}
                        className="text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
                <p className="text-gray-400 text-sm font-medium relative z-10">Scanning for nearby orders...</p>
            </div>

            <div className="px-5 py-6 space-y-4">
                {loading && availableGigs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-afri-gray-200 border-t-afri-green rounded-full animate-spin" />
                        <p className="text-gray-500 font-semibold animate-pulse">Syncing with satellite...</p>
                    </div>
                ) : availableGigs.length === 0 ? (
                    <div className="text-center mt-20 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                            <Navigation size={28} className="text-gray-400" />
                        </div>
                        <p className="font-bold text-gray-800 text-lg">Area is quiet</p>
                        <p className="text-sm text-gray-400 mt-1">Stay online. Gigs will appear here instantly when stores finish packing.</p>
                    </div>
                ) : (
                    availableGigs.map((gig, i) => {
                        // Extracting vendor details properly based on the JSON payload
                        const actualVendor = gig.vendor || (gig.items?.length > 0 ? gig.items[0].vendor : null);

                        // We check if it's an object with a storeName, otherwise we fallback gracefully
                        const vendorName = typeof actualVendor === 'object' && actualVendor?.storeName
                            ? actualVendor.storeName
                            : 'Partner Store';

                        const pickupCity = typeof actualVendor === 'object' && actualVendor?.address?.city
                            ? actualVendor.address.city
                            : 'City Center';

                        const earningsValue = Number(gig.deliveryFee || gig.earnings || gig.riderEarnings || 5).toFixed(2);
                        const itemTotal = gig.items?.length || 0;

                        return (
                            <motion.div
                                key={gig._id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                                className="bg-white rounded-3xl p-5 shadow-lg shadow-afri-gray-200/40 border-2 border-transparent hover:border-[#FFB300] transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 pr-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            <Package size={12} /> {itemTotal} item{itemTotal !== 1 && 's'}
                                        </div>
                                        <h3 className="font-black text-xl text-gray-900 leading-tight">
                                            {vendorName}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 font-medium">
                                            <MapPin size={12} className="text-gray-400" /> {pickupCity}
                                        </div>
                                    </div>

                                    <div className="text-right bg-emerald-50 rounded-2xl p-3 border border-emerald-100 min-w-[80px]">
                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Payout</p>
                                        <p className="text-2xl font-black text-emerald-700">£{earningsValue}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-5 text-xs font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-afri-green opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-afri-green"></span>
                                    </span>
                                    <span>Order <span className="font-mono text-gray-900">{gig.orderNumber?.slice(-6) || gig._id.slice(-6)}</span> is Packed & Ready</span>
                                </div>

                                <button
                                    onClick={() => handleAcceptGig(gig._id)}
                                    disabled={acceptingId === gig._id}
                                    className="relative w-full overflow-hidden py-4 bg-gradient-to-r from-[#FFB300] to-[#FF8F00] text-white font-black rounded-2xl text-lg shadow-md hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    {acceptingId === gig._id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Securing...
                                        </span>
                                    ) : (
                                        'Accept Gig'
                                    )}

                                    {/* Shimmer effect */}
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-[shimmer_2s_infinite]" />
                                </button>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default RiderRadar