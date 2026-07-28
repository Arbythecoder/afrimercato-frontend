import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Truck, AlertCircle, CheckCircle2, RefreshCw, Check } from 'lucide-react';
import { calculateDeliveryFee, updateOrderAddress } from '../../services/api';

export default function EditOrderAddressModal({ order, onClose, onSuccess }) {
  const existingAddress = order?.deliveryAddress || {};

  const [formData, setFormData] = useState({
    fullName: existingAddress.fullName || order?.customer?.name || '',
    phone: existingAddress.phone || order?.customer?.phone || '',
    street: existingAddress.street || '',
    city: existingAddress.city || 'London',
    county: existingAddress.county || '',
    postcode: existingAddress.postcode || '',
    country: existingAddress.country || 'United Kingdom',
    instructions: existingAddress.instructions || ''
  });

  const [calculating, setCalculating] = useState(false);
  const [feeInfo, setFeeInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cityMatchedNotice, setCityMatchedNotice] = useState('');

  // 1. Auto-update City/Town when UK postcode is typed or changed
  useEffect(() => {
    const cleanPostcode = formData.postcode.trim().replace(/\s+/g, '');
    if (!cleanPostcode || cleanPostcode.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`);
        const data = await res.json();
        if (data.status === 200 && data.result) {
          const matchedCity = data.result.admin_district || data.result.parish || data.result.region || 'London';
          const matchedCounty = data.result.admin_county || data.result.region || '';

          setFormData(prev => ({
            ...prev,
            city: matchedCity,
            county: matchedCounty
          }));
          setCityMatchedNotice(`✓ City updated to "${matchedCity}" to match UK postcode ${formData.postcode}`);
        }
      } catch (err) {
        console.warn('Postcode lookup error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.postcode]);

  // 2. Debounced fee & distance recalculation when postcode or street changes
  useEffect(() => {
    if (!formData.postcode || formData.postcode.trim().length < 3) return;

    const timer = setTimeout(() => {
      handleRecalculateFee();
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.postcode, formData.street]);

  const handleRecalculateFee = async () => {
    if (!formData.postcode.trim() || !formData.street.trim()) return;

    setCalculating(true);
    setError('');

    try {
      const vendorId = order?.vendor?._id || order?.vendor || (order?.items?.[0]?.vendor);
      const subtotal = order?.pricing?.subtotal || order?.subtotal || order?.totalAmount || 0;

      const res = await calculateDeliveryFee({
        deliveryAddress: formData,
        vendorId,
        subtotal
      });

      if (res?.success && res?.data) {
        setFeeInfo(res.data);
        if (res.data.resolvedCity && (!formData.city || formData.city === 'London')) {
          setFormData(prev => ({
            ...prev,
            city: res.data.resolvedCity,
            county: res.data.resolvedCounty || prev.county
          }));
          setCityMatchedNotice(`✓ City updated to "${res.data.resolvedCity}" to match UK postcode`);
        }
      }
    } catch (err) {
      console.warn('Fee recalculation notice:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.street.trim() || !formData.postcode.trim()) {
      setError('Street address and UK Postcode are required');
      return;
    }

    setSaving(true);

    try {
      const res = await updateOrderAddress(order._id || order.id, formData);

      if (res?.success) {
        setSuccessMsg(res.message || 'Delivery address updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data?.order || res.data);
          onClose();
        }, 1200);
      } else {
        throw new Error(res?.message || 'Failed to update address');
      }
    } catch (err) {
      setError(err.message || 'Error updating delivery address.');
    } finally {
      setSaving(false);
    }
  };

  const oldFee = order?.pricing?.deliveryFee || order?.deliveryFee || 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-lg font-bold">Edit Delivery Address</h3>
              <p className="text-xs text-white/80">Order {order?.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg text-xs text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 12 High Street, Flat 4B"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            />
          </div>

          {/* City & UK Postcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City / Town</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => {
                  setFormData({ ...formData, city: e.target.value });
                  setCityMatchedNotice('');
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">UK Postcode *</label>
              <input
                type="text"
                required
                placeholder="e.g. SW1A 1AA or EC1A 2BJ"
                value={formData.postcode}
                onChange={(e) => {
                  setFormData({ ...formData, postcode: e.target.value.toUpperCase() });
                  setCityMatchedNotice('');
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green font-mono uppercase"
              />
            </div>
          </div>

          {cityMatchedNotice && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{cityMatchedNotice}</span>
            </p>
          )}

          {/* Delivery Instructions */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Instructions (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Leave at front door, ring doorbell #3..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            ></textarea>
          </div>

          {/* UK Distance & Recalculated Fee Live Preview */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" /> UK Distance Calculation
              </span>
              {calculating && (
                <span className="flex items-center gap-1 text-emerald-600 animate-spin">
                  <RefreshCw className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {feeInfo ? (
              <div className="text-xs space-y-1 text-emerald-800 pt-1">
                <div className="flex justify-between">
                  <span>Estimated Road Distance:</span>
                  <span className="font-bold">{feeInfo.formattedDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Delivery Fee:</span>
                  <span className="font-bold text-emerald-700">
                    {feeInfo.isFreeDelivery ? 'FREE (Over Threshold)' : `£${feeInfo.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {feeInfo.deliveryFee !== oldFee && (
                  <p className="text-[11px] text-emerald-600 italic">
                    Fee adjusted from £{oldFee.toFixed(2)} based on new location distance.
                  </p>
                )}
                {feeInfo.outOfRadius && (
                  <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    Address is outside the vendor's maximum delivery radius ({feeInfo.maxRadiusMiles} miles).
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-emerald-700">
                Enter your street and UK postcode above to preview calculated distance and updated delivery fee.
              </p>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (feeInfo && feeInfo.outOfRadius)}
              className="px-6 py-2.5 bg-gradient-to-r from-afri-green to-afri-green-dark text-white font-bold rounded-xl text-sm hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save & Update Address'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
