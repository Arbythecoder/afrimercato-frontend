import { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';

function VendorStaff() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [pendingRes, activeRes] = await Promise.all([
        vendorAPI.getPendingStaff(),
        vendorAPI.getActiveStaff()
      ]);

      if (pendingRes?.data) setPendingRequests(pendingRes.data);
      if (activeRes?.data) setActiveStaff(activeRes.data);
    } catch (error) {
      console.error('Failed to load staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (staffId) => {
    setActionLoading(staffId);
    try {
      await vendorAPI.approveStaff(staffId);
      setPendingRequests(prev => prev.filter(req => req._id !== staffId));
      fetchStaffData();
    } catch (error) {
      alert('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Staff & Logistics Team</h1>
        <p className="text-gray-500 mt-1">Manage pickers and riders connected to your store.</p>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'pending' ? 'text-afri-green' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs">
              {pendingRequests.length}
            </span>
          )}
          {activeTab === 'pending' && (
            <motion.div layoutId="staffTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-afri-green" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'active' ? 'text-afri-green' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Active Team
          {activeTab === 'active' && (
            <motion.div layoutId="staffTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-afri-green" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'pending' ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No pending requests at the moment.</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                        <Users className="text-orange-500" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{req.user?.name || 'Unknown User'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="capitalize text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                            {req.role}
                          </span>
                          <span className="text-xs text-gray-400">
                            Requested {new Date(req.joinedAt || req.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={actionLoading === req._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-afri-green hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                    >
                      {actionLoading === req._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Approve
                    </button>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {activeStaff.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">You don't have any active staff yet.</p>
                </div>
              ) : (
                activeStaff.map(staff => (
                  <div key={staff._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items- enter ">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <UserCheck className="text-afri-green" size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{staff.user?.name || 'Unknown User'}</h3>
                      <p className="font-normal text-xs text-gray-800"><span className="font-semibold">Phone:</span> {staff.user?.phone}</p>
                      <p className="font-normal text-xs text-gray-800"><span className="font-semibold">Email:</span> {staff.user?.email}</p>
                      {/* <p className="font-normal text-sm text-gray-800">{staff.status}</p> */}
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full mt-2 inline-block">
                        {staff.role}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-3 border-t border-gray-50 pt-3 w-full">
                      Joined {new Date(staff.joinedAt || staff.updatedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </motion.div>
          )
          }
        </AnimatePresence >
      )}
    </div >
  );
}

export default VendorStaff;