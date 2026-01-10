import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, AlertCircle, LogOut } from 'lucide-react';

function VendorPendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-afri-green to-afri-green-dark flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-gray-600">
            Thank you for registering as a vendor!
          </p>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-700 font-medium">Status: Pending</span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            Your vendor account is currently under review by our admin team.
            This process typically takes 24-48 hours. You will receive an email
            notification once your account has been approved.
          </p>
        </div>

        {/* What's Next */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-afri-green mt-1">•</span>
              <span className="text-sm text-gray-700">Our team will review your application</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-afri-green mt-1">•</span>
              <span className="text-sm text-gray-700">You'll receive an email when approved</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-afri-green mt-1">•</span>
              <span className="text-sm text-gray-700">Once approved, you can access your vendor dashboard</span>
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Need help?</span> Contact our support team at{' '}
            <a href="mailto:support@afrimercato.com" className="text-afri-green hover:underline">
              support@afrimercato.com
            </a>
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </motion.div>
    </div>
  );
}

export default VendorPendingApproval;
