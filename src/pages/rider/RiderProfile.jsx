import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiCall } from '../../services/api'
import { CheckCircle, Clock, UploadCloud, FileText, AlertCircle, Trash2, MapPin, Search, User, Bike, Settings, Shield, Car, Truck } from 'lucide-react'
import GdprPrivacyTab from '../../components/GdprPrivacyTab'

function RiderProfile() {
  const navigate = useNavigate()
  const { user, logout, updateToken } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [postcodeLoading, setPostcodeLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [riderProfile, setRiderProfile] = useState(null);

  const isVerified = riderProfile?.approvalStatus === 'approved' || riderProfile?.status === 'active' || user?.status === 'active' || user?.approvalStatus === 'approved'

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    address: {
      street: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
      latitude: null,
      longitude: null
    },
    vehicleType: 'bicycle',
    licensePlate: ''
  })

  const [documents, setDocuments] = useState({
    idVerification: { status: 'missing', url: null, pendingFile: null },
    rightToWork: { status: 'missing', url: null, pendingFile: null },
    insurance: { status: 'missing', url: null, pendingFile: null, expiryDate: '' }
  })

  const [uploadingDoc, setUploadingDoc] = useState(null)
  const fileInputRefs = {
    idVerification: useRef(null),
    rightToWork: useRef(null),
    insurance: useRef(null)
  }

  const [stats, setStats] = useState({
    totalDeliveries: 0,
    rating: 0,
    completionRate: 0,
    memberSince: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiCall('/rider-auth/profile')
        if (res?.data) {
          const d = res.data;
          setRiderProfile(d);
          const primaryAddress = d.addresses && d.addresses.length > 0 ? d.addresses[0] : profile.address;
          setProfile(prev => ({
            ...prev,
            name: d.name || prev.name,
            email: d.email || prev.email,
            phone: d.phone || prev.phone,
            location: d.location || prev.location,
            address: {
              street: primaryAddress.street || '',
              city: primaryAddress.city || '',
              county: primaryAddress.county || '',
              postcode: primaryAddress.postcode || '',
              country: primaryAddress.country || 'United Kingdom',
              latitude: primaryAddress.latitude || null,
              longitude: primaryAddress.longitude || null
            },
            vehicleType: d.vehicleType || prev.vehicleType,
            licensePlate: d.licensePlate || prev.licensePlate
          }))

          if (d.documents) {
            setDocuments(prev => ({
              idVerification: { ...prev.idVerification, ...d.documents.idVerification },
              rightToWork: { ...prev.rightToWork, ...d.documents.rightToWork },
              insurance: { ...prev.insurance, ...d.documents.insurance }
            }))
          }

          const s = d.stats || {}
          setStats({
            totalDeliveries: s.totalDeliveries || 0,
            rating: parseFloat(s.averageRating) || 0,
            completionRate: parseFloat(s.completionRate) || 0,
            memberSince: d.createdAt || ''
          })
        }
      } catch (_e) {
      } finally {
        setPageLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const lookupPostcode = async () => {
    const postcode = profile.address?.postcode?.trim()
    const country = profile.address?.country || 'United Kingdom'

    if (!postcode) {
      setMessage({ type: 'error', text: 'Please enter a postcode first' });
      return;
    }

    try {
      setPostcodeLoading(true)
      setMessage({ type: '', text: '' })

      if (country === 'United Kingdom') {
        const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`)
        const data = await response.json()

        if (data.status === 200 && data.result) {
          const result = data.result
          setProfile((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              city: result.admin_district || result.postcode_area || '',
              county: result.admin_county || result.region || '',
            },
          }))
          setMessage({ type: 'success', text: 'Address details found! Please enter your street name.' })
        } else {
          setMessage({ type: 'error', text: 'Postcode not found. Please check and try again or enter manually.' })
        }
      }
    } catch (err) {
      console.error('Postcode lookup error:', err)
      setMessage({ type: 'error', text: 'Failed to lookup postcode. You can still enter it manually.' })
    } finally {
      setPostcodeLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (!profile.address.street || !profile.address.city || !profile.address.postcode) {
      setMessage({ type: 'error', text: 'Please fill in your complete address (Street, City, and Postcode).' });
      setLoading(false);
      return;
    }

    try {
      let payloadToSave = {
        name: profile.name,
        phone: profile.phone,
        vehicleType: profile.vehicleType,
        licensePlate: profile.licensePlate,
        address: { ...profile.address }
      }

      // Silent Geocoding via Nominatim OpenStreetMap
      if (!payloadToSave.address.latitude || !payloadToSave.address.longitude) {
        try {
          const { street, city, county, country } = payloadToSave.address
          const searchQuery = encodeURIComponent(`${street}, ${city}, ${county || ''}, ${country}`)
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`)
          const geoData = await geoRes.json()

          if (geoData && geoData.length > 0) {
            payloadToSave.address.latitude = parseFloat(geoData[0].lat)
            payloadToSave.address.longitude = parseFloat(geoData[0].lon)
          }
        } catch (geoErr) {
          console.error('Geocoding failed silently:', geoErr)
        }
      }

      const combinedLocationString = `${payloadToSave.address.city}, ${payloadToSave.address.postcode}`.trim();

      const finalPayload = {
        ...payloadToSave,
        location: combinedLocationString,
        addresses: [payloadToSave.address]
      }

      await apiCall('/rider-auth/profile', {
        method: 'PUT',
        body: JSON.stringify(finalPayload)
      })

      setMessage({ type: 'success', text: 'Profile and GPS coordinates updated successfully!' })
      if (updateToken) await updateToken();

    } catch (error) {
      // Safe error extraction to prevent Object to Primitive crashes
      const errorText = error?.response?.data?.message || error?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: typeof errorText === 'string' ? errorText : 'An unexpected error occurred.' })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const handleFileSelect = (docType, e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' })
      return
    }

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], pendingFile: file }
    }))
  }

  const handleDocUpload = async (docType) => {
    const file = documents[docType].pendingFile
    if (!file) return

    setUploadingDoc(docType)
    setMessage({ type: '', text: '' })

    const formData = new FormData()
    formData.append('documents', file)
    formData.append('docType', docType)

    if (docType === 'insurance' && documents.insurance.expiryDate) {
      formData.append('expiryDate', documents.insurance.expiryDate)
    }

    try {
      const response = await apiCall('/rider-auth/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        setDocuments(prev => ({
          ...prev,
          [docType]: { status: 'pending', url: response.data.url, pendingFile: null }
        }));
        setMessage({ type: 'success', text: `${docType} uploaded successfully. Awaiting admin review.` });
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      const errorText = error?.message || 'Failed to upload document';
      setMessage({ type: 'error', text: typeof errorText === 'string' ? errorText : 'Upload failed.' });
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'vehicle', label: 'Vehicle', icon: Bike },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy & My Data', icon: Shield }
  ]

  const vehicleTypes = [
    { id: 'bicycle', label: 'Bicycle', icon: Bike },
    { id: 'motorbike', label: 'Motorbike', icon: Bike },
    { id: 'car', label: 'Car', icon: Car },
    { id: 'van', label: 'Van', icon: Truck }
  ]

  const renderDocStatus = (status) => {
    switch (status) {
      case 'verified': return <span className="flex items-center gap-1 text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle size={14} /> Verified</span>;
      case 'pending': return <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded"><Clock size={14} /> In Review</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded"><AlertCircle size={14} /> Rejected</span>;
      default: return <span className="text-sm text-gray-400">Required</span>;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/rider/dashboard')} className="text-afri-green-light hover:text-white mb-4">
            ← Back to Dashboard
          </button>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg relative">
              👤
              {isVerified && (
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {!isVerified && <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded border border-amber-500/30">UNVERIFIED</span>}
              </div>

              {pageLoading ? (
                <div className="flex gap-3 mt-2">
                  <div className="h-4 bg-white/20 rounded w-20 animate-pulse" />
                  <div className="h-4 bg-white/20 rounded w-28 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-300">
                  {stats.rating > 0 && (
                    <div className="flex items-center gap-1 text-white">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{stats.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {stats.rating > 0 && <span>•</span>}
                  <span>{stats.totalDeliveries} deliveries</span>
                  {stats.completionRate > 0 && (
                    <><span>•</span><span className="text-green-400">{stats.completionRate}% completion</span></>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* DYNAMIC VERIFICATION & REVIEW BANNER */}
        {!isVerified && activeTab !== 'documents' && (() => {
          const hasPendingDocs = Object.values(documents).some(doc => doc.status === 'pending');
          const hasVerifiedDocs = Object.values(documents).some(doc => doc.status === 'verified');
          const isUnderReview = hasPendingDocs || hasVerifiedDocs;

          if (isUnderReview) {
            return (
              <div
                className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-amber-100/70 transition"
                onClick={() => setActiveTab('documents')}
              >
                <Clock className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">Documents Under Review</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    We've received your verification documents! Our admin team is currently auditing them. We'll unlock your Gig Radar the moment they are verified.
                  </p>
                </div>
                <button className="ml-auto text-xs font-bold text-amber-800 bg-amber-200/60 px-3 py-1.5 rounded-lg whitespace-nowrap">
                  Check Status →
                </button>
              </div>
            );
          }

          return (
            <div
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-red-100 transition"
              onClick={() => setActiveTab('documents')}
            >
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800">Account Restricted</h4>
                <p className="text-sm text-red-600 mt-1">
                  Please upload your required verification documents in the Documents tab to verify your identity and start accepting gigs.
                </p>
              </div>
              <button className="ml-auto text-xs font-bold text-red-700 bg-red-200/50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Upload Now →
              </button>
            </div>
          );
        })()}

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex border-b overflow-x-auto hide-scrollbar bg-gray-50/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab.id
                  ? 'text-afri-green bg-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === 'documents' && !isVerified && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-afri-green"></div>}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-afri-green" /> Home Address & Geolocation</h3>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Postcode <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={profile.address.postcode}
                          onChange={(e) => setProfile({ ...profile, address: { ...profile.address, postcode: e.target.value.toUpperCase() } })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none transition font-mono"
                          placeholder="e.g. SW1A 1AA"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={lookupPostcode}
                          disabled={postcodeLoading}
                          className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition disabled:opacity-50 h-[50px] flex items-center gap-2"
                        >
                          {postcodeLoading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
                          Find
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Street Name / Building <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={profile.address.street}
                        onChange={(e) => setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none transition"
                        placeholder="e.g. 123 High Street"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={profile.address.city}
                          onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">County / Region</label>
                        <input
                          type="text"
                          value={profile.address.county}
                          onChange={(e) => setProfile({ ...profile, address: { ...profile.address, county: e.target.value } })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none transition bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3.5 bg-afri-green text-white rounded-xl font-bold hover:bg-afri-green-dark disabled:opacity-50 transition active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : null}
                    {loading ? 'Updating Coordinates & Saving...' : 'Save Profile & Update GPS Location'}
                  </button>
                </div>
              </form>
            )}

            {/* Vehicle Tab */}
            {activeTab === 'vehicle' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">What vehicle do you use?</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicleTypes.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setProfile({ ...profile, vehicleType: v.id })}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${profile.vehicleType === v.id
                          ? 'border-afri-green bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-3xl block mb-2">{v.icon}</span>
                        <span className={`font-semibold text-sm ${profile.vehicleType === v.id ? 'text-afri-green-dark' : 'text-gray-700'}`}>{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {['motorbike', 'car', 'van'].includes(profile.vehicleType) && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-bold text-gray-900 mb-2">License Plate Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={profile.licensePlate}
                      onChange={(e) => setProfile({ ...profile, licensePlate: e.target.value.toUpperCase() })}
                      placeholder="e.g. AB12 CDE"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-afri-green outline-none font-mono uppercase text-lg"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3.5 bg-afri-green text-white rounded-xl font-bold hover:bg-afri-green-dark disabled:opacity-50 transition active:scale-95 shadow-md"
                >
                  {loading ? 'Saving...' : 'Update Vehicle Details'}
                </button>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-5 max-w-3xl">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Verification Documents</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload clear photos or PDFs of the required documents to activate your rider account.</p>
                </div>

                {/* ID Verification */}
                <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xl">🪪</div>
                    <div>
                      <p className="font-bold text-gray-900">ID Verification</p>
                      <p className="text-xs text-gray-500 mt-0.5">Passport, BRP, or National ID</p>
                      <div className="mt-2">{renderDocStatus(documents.idVerification.status)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {documents.idVerification.pendingFile ? (
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border w-full sm:w-auto">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-600 truncate max-w-[100px]">{documents.idVerification.pendingFile.name}</span>
                        <button onClick={() => handleDocUpload('idVerification')} disabled={uploadingDoc === 'idVerification'} className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 disabled:opacity-50">
                          {uploadingDoc === 'idVerification' ? '...' : 'Upload'}
                        </button>
                        <button onClick={() => setDocuments(p => ({ ...p, idVerification: { ...p.idVerification, pendingFile: null } }))} className="p-1.5 text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : documents.idVerification.status !== 'verified' && documents.idVerification.status !== 'pending' ? (
                      <>
                        <input type="file" ref={fileInputRefs.idVerification} onChange={(e) => handleFileSelect('idVerification', e)} className="hidden" accept="image/*,.pdf" />
                        <button onClick={() => fileInputRefs.idVerification.current?.click()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
                          <UploadCloud size={16} /> Select File
                        </button>
                      </>
                    ) : documents.idVerification.url && (
                      <a href={documents.idVerification.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">View Document</a>
                    )}
                  </div>
                </div>

                {/* Right to Work */}
                <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-xl">📄</div>
                    <div>
                      <p className="font-bold text-gray-900">Right to Work (UK)</p>
                      <p className="text-xs text-gray-500 mt-0.5">Share code document or residency permit</p>
                      <div className="mt-2">{renderDocStatus(documents.rightToWork.status)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {documents.rightToWork.pendingFile ? (
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border w-full sm:w-auto">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-600 truncate max-w-[100px]">{documents.rightToWork.pendingFile.name}</span>
                        <button onClick={() => handleDocUpload('rightToWork')} disabled={uploadingDoc === 'rightToWork'} className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 disabled:opacity-50">
                          {uploadingDoc === 'rightToWork' ? '...' : 'Upload'}
                        </button>
                        <button onClick={() => setDocuments(p => ({ ...p, rightToWork: { ...p.rightToWork, pendingFile: null } }))} className="p-1.5 text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : documents.rightToWork.status !== 'verified' && documents.rightToWork.status !== 'pending' ? (
                      <>
                        <input type="file" ref={fileInputRefs.rightToWork} onChange={(e) => handleFileSelect('rightToWork', e)} className="hidden" accept="image/*,.pdf" />
                        <button onClick={() => fileInputRefs.rightToWork.current?.click()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
                          <UploadCloud size={16} /> Select File
                        </button>
                      </>
                    ) : documents.rightToWork.url && (
                      <a href={documents.rightToWork.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">View Document</a>
                    )}
                  </div>
                </div>

                {/* Insurance (Conditional) */}
                {['motorbike', 'car', 'van'].includes(profile.vehicleType) ? (
                  <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Shield className="w-6 h-6" /></div>
                      <div>
                        <p className="font-bold text-gray-900">Vehicle Insurance</p>
                        <p className="text-xs text-gray-500 mt-0.5">Certificate of motor insurance</p>
                        <div className="mt-2">{renderDocStatus(documents.insurance.status)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {documents.insurance.pendingFile && (
                        <input
                          type="date"
                          required
                          value={documents.insurance.expiryDate}
                          onChange={(e) => setDocuments(p => ({ ...p, insurance: { ...p.insurance, expiryDate: e.target.value } }))}
                          className="text-xs px-3 py-1.5 border rounded-lg outline-none"
                        />
                      )}
                      {documents.insurance.pendingFile ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border w-full sm:w-auto">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-xs text-gray-600 truncate max-w-[100px]">{documents.insurance.pendingFile.name}</span>
                          <button
                            onClick={() => handleDocUpload('insurance')}
                            disabled={uploadingDoc === 'insurance' || !documents.insurance.expiryDate}
                            className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {uploadingDoc === 'insurance' ? '...' : 'Upload'}
                          </button>
                          <button onClick={() => setDocuments(p => ({ ...p, insurance: { ...p.insurance, pendingFile: null, expiryDate: '' } }))} className="p-1.5 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : documents.insurance.status !== 'verified' && documents.insurance.status !== 'pending' ? (
                        <>
                          <input type="file" ref={fileInputRefs.insurance} onChange={(e) => handleFileSelect('insurance', e)} className="hidden" accept="image/*,.pdf" />
                          <button onClick={() => fileInputRefs.insurance.current?.click()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition">
                            <UploadCloud size={16} /> Select File
                          </button>
                        </>
                      ) : documents.insurance.url && (
                        <div className="flex flex-col items-end gap-1">
                          <a href={documents.insurance.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">View Document</a>
                          <button onClick={() => fileInputRefs.insurance.current?.click()} className="text-xs text-gray-500 hover:text-gray-800 underline">Update Insurance</button>
                          <input type="file" ref={fileInputRefs.insurance} onChange={(e) => handleFileSelect('insurance', e)} className="hidden" accept="image/*,.pdf" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border border-dashed border-gray-300 rounded-2xl bg-gray-50 flex items-center gap-4 opacity-70">
                    <div className="p-3 bg-gray-200 text-gray-500 rounded-xl opacity-50"><Shield className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold text-gray-700 line-through decoration-gray-400">Vehicle Insurance</p>
                      <p className="text-sm text-gray-500 mt-0.5">Not required for bicycle accounts</p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get notified of new gigs instantly</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-afri-green"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900">Sound Alerts</p>
                    <p className="text-sm text-gray-500">Play radar ping for new orders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-afri-green"></div>
                  </label>
                </div>

                <div className="pt-8 mt-4 border-t border-gray-200">
                  <button
                    onClick={logout}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition shadow-sm active:scale-95 border border-red-100"
                  >
                    Sign Out of Account
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & My Data Tab — GDPR */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <GdprPrivacyTab roleTitle="Rider" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderProfile