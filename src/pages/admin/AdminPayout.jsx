import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiCall } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Wallet, Landmark, ArrowUpRight, CheckCircle, AlertCircle, RefreshCw, CreditCard, Eye } from 'lucide-react';

export default function AdminPayouts() {
    const [activeTab, setActiveTab] = useState('vendor');
    const [data, setData] = useState({ globalStats: {}, users: [] });
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalState, setModalState] = useState({ isOpen: false, user: null, processing: false });
    const [bankModal, setBankModal] = useState({ isOpen: false, user: null });

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const res = await apiCall('/admin/payouts');
            if (res?.success) setData(res.data);
        } catch (error) {
            console.error("Failed to fetch payouts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayouts(); }, []);

    const handleProcessPayout = async () => {
        const { user } = modalState;
        if (!user) return;

        setModalState(prev => ({ ...prev, processing: true }));
        try {
            await apiCall(`/admin/payouts/${user._id}/process`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: user.pendingBalance,
                    role: user.role,
                    onModel: user.onModel
                })
            });

            setModalState({ isOpen: false, user: null, processing: false });
            fetchPayouts();
        } catch (error) {
            alert("Failed to process payout.");
            setModalState(prev => ({ ...prev, processing: false }));
        }
    };

    const tabs = [
        { id: 'vendor', label: 'Vendors', icon: '🏪' },
        { id: 'rider', label: 'Riders', icon: '🚴' },
        { id: 'picker', label: 'Pickers', icon: '🛒' }
    ];

    const displayedUsers = data.users.filter(u => u.role === activeTab);

    const roleColors = {
        vendor: 'bg-orange-50 text-orange-700',
        rider: 'bg-blue-50 text-blue-700',
        picker: 'bg-purple-50 text-purple-700',
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 relative">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 relative z-10">
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium">
                    <ChevronLeft size={16} /> Dashboard
                </Link>
                <span className="text-gray-200">/</span>
                <span className="text-gray-900 font-semibold text-sm">Financial Payouts</span>
            </div>

            <div className="max-w-[83%] mx-auto px-4 py-6">

                {/* HERO SECTION: Global Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Landmark size={64} /></div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Total Pending Payouts</p>
                        <h2 className="text-3xl font-black text-amber-600">
                            £{loading ? '...' : (data.globalStats?.totalPending || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <p className="text-xs font-medium text-amber-600/70 mt-2 bg-amber-50 inline-block px-2 py-1 rounded-md">Awaiting transfer</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={64} /></div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Lifetime Disbursed</p>
                        <h2 className="text-3xl font-black text-emerald-600">
                            £{loading ? '...' : (data.globalStats?.totalDisbursed || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <p className="text-xs font-medium text-emerald-600/70 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">Successfully paid out</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><ArrowUpRight size={64} /></div>
                        <p className="text-sm font-bold text-slate-400 mb-1">Platform Revenue</p>
                        <h2 className="text-3xl font-black text-white">
                            £{loading ? '...' : (data.globalStats?.platformRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <p className="text-xs font-medium text-slate-400 mt-2">Afrimercato gross cut</p>
                    </div>
                </div>

                {/* PILL TABS */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                ? 'border-afri-green text-afri-green-dark bg-white rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]'
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-t-xl'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span> {tab.label}
                            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-afri-green/10 text-afri-green-dark' : 'bg-gray-100 text-gray-400'}`}>
                                {loading ? '-' : data.users.filter(u => u.role === tab.id && u.pendingBalance > 0).length} pending
                            </span>
                        </button>
                    ))}
                </div>

                {/* PAYOUT CARDS LIST */}
                <div className="space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-24 border border-gray-100 animate-pulse" />)
                    ) : displayedUsers.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Wallet size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-bold">No {activeTab}s found.</p>
                        </div>
                    ) : (
                        displayedUsers.map((user, i) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
                            >
                                {/* Left: User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                                        {user.pendingBalance > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                    </div>
                                    <p className="text-sm text-gray-500">{user.email}</p>

                                    {/* Bank Details */}
                                    {user.bankDetails ? (
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
                                                    <CreditCard size={14} className="text-gray-400" />
                                                    <span className="text-gray-700 font-bold">{user.bankDetails.bankName || 'Bank'}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="font-mono text-gray-500">
                                                        •••• {user.bankDetails.accountNumber ? user.bankDetails.accountNumber.slice(-4) : '••••'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 👇 NEW: View bank details button */}
                                            <button
                                                onClick={() => setBankModal({ isOpen: true, user })}
                                                className="flex items-center gap-1.5 text-xs font-bold text-afri-green hover:text-afri-green-dark hover:underline transition"
                                            >
                                                <Eye size={13} /> View details
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-50/60 border border-red-100 px-3 py-1.5 rounded-lg w-max shadow-sm">
                                            <AlertCircle size={14} />
                                            No bank details on file
                                        </div>
                                    )}
                                </div>

                                {/* Middle: Financials */}
                                <div className="flex gap-8 md:px-8 border-y md:border-y-0 md:border-x border-gray-100 py-4 md:py-0">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Pending</p>
                                        <p className={`text-2xl font-black ${user.pendingBalance > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
                                            £{user.pendingBalance.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Lifetime</p>
                                        <p className="text-xl font-bold text-gray-900">£{user.lifetimeEarnings.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Right: Action */}
                                <div className="w-full md:w-auto">
                                    {user.pendingBalance > 0 ? (
                                        <button
                                            onClick={() => setModalState({ isOpen: true, user, processing: false })}
                                            className="w-full md:w-auto bg-afri-green text-white px-6 py-3 rounded-xl font-bold hover:bg-afri-green-dark active:scale-95 transition shadow-sm"
                                        >
                                            Process Payout
                                        </button>
                                    ) : (
                                        <div className="w-full md:w-auto bg-gray-50 text-gray-400 px-6 py-3 rounded-xl font-bold text-center border border-gray-200 cursor-not-allowed">
                                            Settled
                                        </div>
                                    )}
                                    {user.lastPayoutDate && (
                                        <p className="text-[10px] text-gray-400 text-center mt-2">
                                            Last paid: {new Date(user.lastPayoutDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            <AnimatePresence>
                {modalState.isOpen && modalState.user && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet className="text-amber-500 w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Process Payout?</h2>
                            <p className="text-center text-gray-500 text-sm mb-6 px-4">
                                You are about to mark a pending balance as fully paid. This will reset their pending wallet to £0.00.
                            </p>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-500">Recipient</span>
                                    <span className="text-sm font-bold text-gray-900">{modalState.user.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-500">Amount to clear</span>
                                    <span className="text-lg font-black text-amber-600">£{modalState.user.pendingBalance.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModalState({ isOpen: false, user: null, processing: false })}
                                    disabled={modalState.processing}
                                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProcessPayout}
                                    disabled={modalState.processing}
                                    className="flex-1 py-3.5 bg-afri-green text-white font-bold rounded-xl hover:bg-afri-green-dark transition flex justify-center items-center gap-2 shadow-lg shadow-afri-green/30 disabled:opacity-70"
                                >
                                    {modalState.processing ? (
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Confirm Transfer'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 👇 BANK DETAILS MODAL */}
            <AnimatePresence>
                {bankModal.isOpen && bankModal.user && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setBankModal({ isOpen: false, user: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Landmark className="text-blue-500 w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-black text-center text-gray-900 mb-1">Bank details</h2>
                            <p className="text-center text-gray-400 text-sm mb-6">
                                Registered payout account for{' '}
                                <span className="font-bold text-gray-700">{bankModal.user.name}</span>
                            </p>

                            {/* Details card */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 space-y-3">

                                {/* Account holder row */}
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <CreditCard size={16} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account holder</p>
                                        <p className="text-sm font-bold text-gray-900">{bankModal.user.bankDetails.accountName || '—'}</p>
                                    </div>
                                </div>

                                {/* Grid: bank name + account number */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank name</p>
                                        <p className="text-sm font-bold text-gray-900">{bankModal.user.bankDetails.bankName || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account number</p>
                                        <p className="text-sm font-bold text-gray-900 font-mono tracking-widest">
                                            {bankModal.user.bankDetails.accountNumber || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sort code</p>
                                        <p className="text-sm font-bold text-gray-900 font-mono">
                                            {bankModal.user.bankDetails.sortCode || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${roleColors[bankModal.user.role] || 'bg-gray-100 text-gray-500'}`}>
                                            {bankModal.user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setBankModal({ isOpen: false, user: null })}
                                className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}