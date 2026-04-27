// Direct API calls using fetch - consistent with api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://afrimercato-backend.fly.dev/api';


const apiCall = async (endpoint) => {
  const token = localStorage.getItem('afrimercato_token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const analyticsAPI = {
  /**
   * Get detailed analytics for a specific date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   */
  getDetailedAnalytics: async (startDate, endDate) => {
    const response = await apiCall(`/vendor/analytics/detailed?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  /**
   * Get sales forecast
   * @param {number} days - Number of days to forecast (default: 7)
   */
  getSalesForecast: async (days = 7) => {
    const response = await apiCall(`/vendor/analytics/forecast?days=${days}`);
    return response.data;
  }
};