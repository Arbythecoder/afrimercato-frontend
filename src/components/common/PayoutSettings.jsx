import { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, AlertCircle, CheckCircle2, ExternalLink, RefreshCw, Clock, Lock } from 'lucide-react';
import { apiCall } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PayoutSettings() {
    const { user } = useAuth();
    const role = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : 'vendor');

    const [connectStatus, setConnectStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [onboarding, setOnboarding] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConnectStatus();
    }, [role]);

    const getEndpoints = () => {
        if (role === 'picker' || user?.roles?.includes('picker')) {
            return { status: '/pickers/connect/status', onboard: '/pickers/connect/onboard' };
        }
        if (role === 'rider' || user?.roles?.includes('rider')) {
            return { status: '/riders/connect/status', onboard: '/riders/connect/onboard' };
        }
        return { status: '/vendor/connect/status', onboard: '/vendor/connect/onboard' };
    };

    const fetchConnectStatus = async () => {
        try {
            setLoading(true);
            const { status } = getEndpoints();
            const response = await apiCall(status);
            if (response.success && response.data) {
                setConnectStatus(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch Stripe Connect status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartOnboarding = async () => {
        try {
            setOnboarding(true);
            setMessage({ type: '', text: '' });
            const { onboard } = getEndpoints();
            const response = await apiCall(onboard, { method: 'POST' });

            if (response.success && response.data?.url) {
                window.location.href = response.data.url;
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to generate Stripe onboarding link.' });
                setOnboarding(false);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Server error initializing Stripe Connect.' });
            setOnboarding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#00897B]" />
            </div>
        );
    }

    const isFullyConnected = connectStatus?.connected && connectStatus?.canReceivePayments && connectStatus?.onboardingComplete;
    const isPendingVerification = connectStatus?.connected && !isFullyConnected;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-[#1B4D3E] to-[#00897B] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5" /> Stripe Connect Express
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold">Payout & Bank Settings</h2>
                        <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                            Bank details, identity verification, and payouts are managed securely by Stripe. Afrimercato does not store raw bank account numbers.
                        </p>
                    </div>

                    <button
                        onClick={handleStartOnboarding}
                        disabled={onboarding}
                        className="px-6 py-3 bg-white text-[#1B4D3E] hover:bg-emerald-50 active:scale-95 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0 cursor-pointer disabled:opacity-60"
                    >
                        {onboarding ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" /> Connecting to Stripe...
                            </>
                        ) : isFullyConnected ? (
                            <>
                                <ExternalLink className="w-4 h-4" /> Manage Stripe Account
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" /> Set Up Payouts with Stripe
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error / Feedback Message */}
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                    <div className="flex items-start gap-2.5">
                        {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                        <div className="space-y-2">
                            <p>{message.text}</p>
                            {(message.text.includes('signed up for Connect') || message.text.includes('dashboard.stripe.com/connect')) && (
                                <div className="pt-1">
                                    <a
                                        href="https://dashboard.stripe.com/connect"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Enable Stripe Connect on Stripe Dashboard
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Live Stripe Connect Account Status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00897B]" /> Stripe Connect Payout Account Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Account Connection</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${connectStatus?.connected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className="font-bold text-gray-900 text-sm">
                                {connectStatus?.connected ? 'Stripe Express Connected' : 'Not Connected'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Payout Status</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${connectStatus?.payoutsEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-bold text-gray-900 text-sm">
                                {connectStatus?.payoutsEnabled ? 'Payouts Active' : 'Payouts Pending'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Identity Verification</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${connectStatus?.onboardingComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-bold text-gray-900 text-sm">
                                {connectStatus?.onboardingComplete ? 'Verified by Stripe' : 'Action Required'}
                            </span>
                        </div>
                    </div>
                </div>

                {isFullyConnected ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-emerald-900">Your Stripe Payout Account is Active</p>
                            <p className="text-xs mt-0.5 text-emerald-700">
                                {role === 'picker' || role === 'rider' || user?.roles?.some(r => ['picker', 'rider'].includes(r))
                                    ? "Payouts will automatically be deposited into your verified bank account every other Friday (work done this week is paid next Friday)."
                                    : "Payouts will automatically be deposited into your verified bank account after the 7-day escrow holding period."
                                }
                            </p>
                        </div>
                    </div>
                ) : isPendingVerification ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-900">Stripe Onboarding Pending</p>
                            <p className="text-xs mt-0.5 text-amber-700">
                                Please click "Set Up Payouts with Stripe" above to complete your bank account details and ID verification on Stripe Express.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3 text-gray-700 text-sm">
                        <CreditCard className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-gray-900">Connect Stripe to Receive Earnings</p>
                            <p className="text-xs mt-0.5 text-gray-600">
                                You must set up a Stripe Express payout account before Afrimercato can transfer your earnings.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Afrimercato Marketplace Payment Architecture Policy Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                {(role === 'picker' || role === 'rider' || user?.roles?.some(r => ['picker', 'rider'].includes(r))) ? (
                    <>
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#00897B]" /> Payout Policy & Bi-Weekly Schedule
                        </h3>

                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Weekly Work Window</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Earnings accumulate for all order picking sessions or completed deliveries between Monday 00:00 and Sunday 23:59.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Next Friday Cutoff Rule</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Anything you do this week gets paid next Friday. The 1-week processing period verifies completed sessions and prevents dispute holds.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold flex items-center justify-center shrink-0 text-xs">3</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Bi-Weekly Direct Deposit</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Payouts are transferred automatically to your verified bank account via Stripe Express every other Friday.</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-600" /> Payout Policy & 7-Day Escrow Period
                        </h3>

                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold flex items-center justify-center shrink-0 text-xs">1</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Customer Payment Held in Escrow</p>
                                    <p className="text-xs text-gray-500 mt-0.5">When a customer places an order via Stripe, funds are received by Afrimercato and held securely in escrow during order fulfillment.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold flex items-center justify-center shrink-0 text-xs">2</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">7-Day Post-Delivery Holding Period</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Upon order completion & delivery, a mandatory 7-day holding period begins to allow for customer satisfaction, quality verification, and dispute resolution.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold flex items-center justify-center shrink-0 text-xs">3</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Automated Direct Payout</p>
                                    <p className="text-xs text-gray-500 mt-0.5">If no disputes or refunds are filed within the 7-day period, automated payouts trigger directly to your connected Stripe Express bank account.</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}