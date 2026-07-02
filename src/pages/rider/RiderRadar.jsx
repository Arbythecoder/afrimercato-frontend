import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Lock, RefreshCw, Navigation, Package, FileText } from 'lucide-react'

export default function RiderRadar() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [availableGigs, setAvailableGigs] = useState([])
    const [loading, setLoading] = useState(true)
    const [acceptingId, setAcceptingId] = useState(null)

    // Set local state for verification to bypass global cache
    const [isVerified, setIsVerified] = useState(user?.status === 'active' || user?.approvalStatus === 'approved')
    const [checkingAuth, setCheckingAuth] = useState(true)

    // FORCE check the real database the second the Radar opens
    useEffect(() => {
        const verifyRider = async () => {
            try {
                const res = await apiCall('/rider-auth/profile')
                if (res?.data) {
                    const actuallyVerified = res.data.approvalStatus === 'approved' || res.data.status === 'active';
                    setIsVerified(actuallyVerified);
                }
            } catch (error) {
                console.error("Failed to verify rider status", error);
            } finally {
                setCheckingAuth(false);
            }
        };
        verifyRider();
    }, []);

    const fetchGigs = async () => {
        if (!isVerified) return;
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

    // Only start scanning AFTER we confirm they are verified
    useEffect(() => {
        if (isVerified && !checkingAuth) {
            fetchGigs()
            const interval = setInterval(fetchGigs, 15000)
            return () => clearInterval(interval)
        }
    }, [isVerified, checkingAuth])

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

    // SHOW BLANK SCREEN FOR A SPLIT SECOND WHILE CHECKING (Prevents Red Flash)
    if (checkingAuth) {
        return <div className="min-h-screen bg-[#1A1A1A]"></div>
    }

    // If Rider is Unverified
    if (!isVerified) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] px-5 py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-red-500/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-red-500/40 rounded-full" />

                <div className="relative z-10 w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/50 backdrop-blur-sm">
                    <Lock size={40} className="text-red-400" />
                </div>

                <h1 className="text-white text-3xl font-black mb-3 relative z-10">Radar Locked</h1>
                <p className="text-gray-400 font-medium mb-8 max-w-xs relative z-10">
                    Your account must be verified by an administrator before you can scan for live deliveries.
                </p>

                <button
                    onClick={() => navigate('/rider/profile')}
                    className="relative z-10 flex items-center gap-2 bg-white text-[#1A1A1A] px-8 py-4 rounded-2xl font-black hover:bg-gray-200 active:scale-95 transition-all shadow-xl"
                >
                    <FileText size={20} />
                    Go to Documents
                </button>
            </div>
        )
    }

    // NORMAL RADAR STATE
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-[#1A1A1A] px-5 pt-14 pb-8 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
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
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
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
                        const actualVendor = gig.vendor || (gig.items?.length > 0 ? gig.items[0].vendor : null);
                        const vendorName = typeof actualVendor === 'object' && actualVendor?.storeName ? actualVendor.storeName : 'Partner Store';
                        const pickupCity = typeof actualVendor === 'object' && actualVendor?.address?.city ? actualVendor.address.city : 'Store Location';

                        const dropoffCity = gig.deliveryAddress?.city || 'Customer Location';
                        const dropoffPostcode = gig.deliveryAddress?.postcode || '';

                        const earningsValue = Number(gig.deliveryFee || gig.earnings || gig.riderEarnings || 5).toFixed(2);
                        const itemTotal = gig.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || gig.items?.length || 0;
                        const distance = gig.distance || null;

                        return (
                            <motion.div
                                key={gig._id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                                className="bg-white rounded-3xl p-5 shadow-lg shadow-gray-200/40 border-2 border-transparent hover:border-[#FFB300] transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 pr-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                                            <Package size={12} /> {itemTotal} item{itemTotal !== 1 && 's'}
                                        </div>

                                        {/* ROUTE DISPLAY */}
                                        <div className="relative pl-6 space-y-4">
                                            <div className="absolute top-1 bottom-1 left-2 w-0.5 bg-gray-200" />

                                            <div className="relative">
                                                <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Pickup</p>
                                                <p className="font-bold text-gray-900 leading-tight">{vendorName}</p>
                                                <p className="text-xs text-gray-500">{pickupCity}</p>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Dropoff</p>
                                                <p className="font-bold text-gray-900 leading-tight">{dropoffCity}</p>
                                                <p className="text-xs text-gray-500">{dropoffPostcode}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payout Block */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-right bg-emerald-50 rounded-2xl p-3 border border-emerald-100 min-w-[80px]">
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Payout</p>
                                            <p className="text-xl font-black text-emerald-700">£{earningsValue}</p>
                                        </div>
                                        {distance && (
                                            <div className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">
                                                {distance} km total
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-5 text-xs font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span>Ready for pickup right now</span>
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