import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * GDPR-Compliant Cookie Consent Banner
 * Required for UK/EU compliance
 *
 * Features:
 * - Accept all cookies
 * - Reject non-essential cookies
 * - Customize cookie preferences
 * - Persistent storage of user choice
 */
function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');

    if (!consent) {
      // Show banner after 1 second delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        applyConsent(savedPreferences);
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
      }
    }
  }, []);

  const applyConsent = (prefs) => {
    // Apply consent choices
    if (prefs.analytics) {
      // Enable Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    } else {
      // Disable analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }

    if (prefs.marketing) {
      // Enable marketing cookies
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'ad_storage': 'granted'
        });
      }
    } else {
      // Disable marketing
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'ad_storage': 'denied'
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };

    setPreferences(allAccepted);
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    applyConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };

    setPreferences(onlyNecessary);
    localStorage.setItem('cookie_consent', JSON.stringify(onlyNecessary));
    applyConsent(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    applyConsent(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key) => {
    if (key === 'necessary') return; // Can't disable necessary cookies

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowBanner(false)}
          />

          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {showPreferences ? (
                  // Preferences Panel
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Cookie Preferences
                        </h3>
                        <p className="text-sm text-gray-600">
                          Manage your cookie settings. You can enable or disable different types of cookies below.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPreferences(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Necessary Cookies */}
                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Always Active</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Essential for the website to function. Cannot be disabled.
                          </p>
                        </div>
                        <div className="ml-4">
                          <div className="w-12 h-6 bg-afri-green rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                          <p className="text-sm text-gray-600">
                            Help us understand how visitors interact with our website.
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('analytics')}
                          className="ml-4"
                        >
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${
                            preferences.analytics ? 'bg-afri-green' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                              preferences.analytics ? 'right-1' : 'left-1'
                            }`}></div>
                          </div>
                        </button>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Marketing Cookies</h4>
                          <p className="text-sm text-gray-600">
                            Used to deliver personalized advertisements.
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('marketing')}
                          className="ml-4"
                        >
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${
                            preferences.marketing ? 'bg-afri-green' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                              preferences.marketing ? 'right-1' : 'left-1'
                            }`}></div>
                          </div>
                        </button>
                      </div>

                      {/* Functional Cookies */}
                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Functional Cookies</h4>
                          <p className="text-sm text-gray-600">
                            Enable enhanced functionality and personalization.
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('functional')}
                          className="ml-4"
                        >
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${
                            preferences.functional ? 'bg-afri-green' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                              preferences.functional ? 'right-1' : 'left-1'
                            }`}></div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleSavePreferences}
                        className="flex-1 bg-afri-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-afri-green-dark transition"
                      >
                        Save Preferences
                      </button>
                      <button
                        onClick={() => setShowPreferences(false)}
                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Main Banner
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      {/* Cookie Icon */}
                      <div className="hidden sm:block">
                        <div className="w-12 h-12 bg-afri-green/10 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-afri-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          We Value Your Privacy
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                          We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                          By clicking "Accept All", you consent to our use of cookies.
                          <Link to="/privacy-policy" className="text-afri-green hover:text-afri-green-dark ml-1 underline">
                            Learn more
                          </Link>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleAcceptAll}
                            className="bg-afri-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-afri-green-dark transition"
                          >
                            Accept All
                          </button>
                          <button
                            onClick={handleRejectAll}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                          >
                            Reject All
                          </button>
                          <button
                            onClick={() => setShowPreferences(true)}
                            className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition"
                          >
                            Customize
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
