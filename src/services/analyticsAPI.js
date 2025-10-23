import api from './api';

export const analyticsAPI = {
  /**
   * Get detailed analytics for a specific date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   */
  getDetailedAnalytics: async (startDate, endDate) => {
    const response = await api.get(`/vendor/analytics/detailed?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  /**
   * Get sales forecast
   * @param {number} days - Number of days to forecast (default: 7)
   */
  getSalesForecast: async (days = 7) => {
    const response = await api.get(`/vendor/analytics/forecast?days=${days}`);
    return response.data;
  }
};