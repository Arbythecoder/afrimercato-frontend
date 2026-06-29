import { useState, useEffect } from 'react';
import { Building2, CreditCard, User, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiCall } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PayoutSettings() {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        bankName: '',
        accountName: '',
        accountNumber: '',
        sortCode: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPayoutDetails();
    }, []);

    const fetchPayoutDetails = async () => {
        try {
            setLoading(true);
            const response = await apiCall('/auth/profile');
            if (response.success && response.data?.paymentDetails) {
                setFormData({
                    bankName: response.data.paymentDetails.bankName || '',
                    accountName: response.data.paymentDetails.accountName || '',
                    accountNumber: response.data.paymentDetails.accountNumber || '',
                    sortCode: response.data.paymentDetails.sortCode || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch payout details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'sortCode') {
            const clean = value.replace(/[^\d]/g, '').slice(0, 6);
            const formatted = clean.replace(/(.{2})/g, '$1-').replace(/-$/, '');
            setFormData(prev => ({ ...prev, [name]: formatted }));
            return;
        }

        if (name === 'accountNumber') {
            const clean = value.replace(/[^\d]/g, '').slice(0, 8);
            setFormData(prev => ({ ...prev, [name]: clean }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        if (formData.accountNumber.length !== 8) {
            setMessage({ type: 'error', text: 'Account number must be exactly 8 digits.' });
            setSaving(false);
            return;
        }
        if (formData.sortCode.replace(/-/g, '').length !== 6) {
            setMessage({ type: 'error', text: 'Sort code must be exactly 6 digits.' });
            setSaving(false);
            return;
        }

        try {
            const response = await apiCall('/auth/payment-details', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            if (response.success) {
                setMessage({ type: 'success', text: 'Payout details saved.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to save details.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-[#00897B]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-afri-gray-50 pb-8">
            <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-10 rounded-b-[2.5rem] relative overflow-hidden z-0 mb-6">
                <div className="absolute -top-10 -right-10 w-52 h-52 bg-afri-green/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 -left-8 w-40 h-40 bg-afri-yellow-dark/10 rounded-full blur-2xl" />
                <h2 className="text-xl font-bold text-white relative z-10">Payout settings</h2>
                <p className="text-sm text-white/60 mt-1 relative z-10">Manage your UK bank account for payouts</p>
            </div>

            <div className="px-5 space-y-4">
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        <span className="font-semibold">Important:</span> The account name must exactly match the registered name on your Afrimercato profile to avoid payout delays.
                    </p>
                </div>
                {message.text && (
                    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>
                        {message.type === 'error'
                            ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        }
                        {message.text}
                    </div>
                )}

                {/* Form card */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900">Bank account</h3>
                        <p className="text-sm text-gray-500 mt-0.5">UK bank details for receiving payouts</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                        {/* Bank Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Bank name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Barclays, Monzo, Starling"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B]/20 focus:border-[#00897B] outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Account Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Account name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Name as it appears on your bank account"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B]/20 focus:border-[#00897B] outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Account Number + Sort Code */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Account number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="8 digits"
                                        maxLength="8"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B]/20 focus:border-[#00897B] outline-none transition-all font-mono text-gray-900 placeholder-gray-400 tracking-wide"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Sort code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <CreditCard className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="sortCode"
                                        value={formData.sortCode}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="XX-XX-XX"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00897B]/20 focus:border-[#00897B] outline-none transition-all font-mono text-gray-900 placeholder-gray-400 tracking-widest"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 bg-[#00897B] hover:bg-[#00796B] active:scale-[0.98] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-[130px] justify-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}