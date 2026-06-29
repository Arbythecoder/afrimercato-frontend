import { AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RiderVerificationBanner() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isVerified = user?.approvalStatus === 'approved';

    return (
        <div className="bg-gray-50 pb- absolute top-32 left-0 right-0 z-50">
            {!isVerified && (
                <div className="bg-red-50 border-l-4 border-red-500 p-2 mx-2 mt -6 rounded-r-xl shadow-sm animate-slideDown">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                            <AlertTriangle className="text-red-600 w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 text-lg">Action Required: Account Verification</h3>
                            <p className="text-red-700 text-sm mt-1 mb-3 leading-relaxed">
                                You cannot accept delivery gigs until your identity, vehicle, and insurance documents have been submitted and approved by our team.
                            </p>
                            <button
                                onClick={() => navigate('/rider/profile')}
                                className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-all active:scale-95 shadow-sm text-sm"
                            >
                                <FileText className="w-4 h-4" />
                                Upload Documents Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}