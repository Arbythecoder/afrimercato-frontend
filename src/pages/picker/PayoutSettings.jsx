import { useNavigate } from 'react-router-dom';
import { Banknote } from 'lucide-react';
import PayoutSettings from '../../components/PayoutSettingComponent';

const PickerPayoutSettings = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header - Updated to orange gradient for picker consistency */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button onClick={() => navigate(-1)} className="text-afri-green-light hover:text-white mb-4 text-sm font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                            <Banknote className="w-8 h-8 text-afri-green-light" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Payout Settings</h1>
                            <p className="text-sm text-gray-300 mt-1">Manage how you receive your earnings.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
                    <PayoutSettings />
                </div>
            </div>
        </div>
    );
}

export default PickerPayoutSettings;