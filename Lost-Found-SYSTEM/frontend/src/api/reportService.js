import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const reportService = {
  getDashboard: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/reports/dashboard`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard'
      };
    }
  },

  getLostByCategory: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(
        `${API_URL}/reports/lost-by-category?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch category report'
      };
    }
  },

  campusComparison: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(
        `${API_URL}/reports/campus-comparison?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch campus comparison'
      };
    }
  },

  getMonthlyReport: async (year, month, campus = '') => {
    try {
      const response = await axios.get(
        `${API_URL}/reports/monthly?year=${year}&month=${month}&campus=${campus}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch monthly report'
      };
    }
  },

  getStatistics: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/reports/statistics`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch statistics'
      };
    }
  },

  exportReport: async (format, filters = {}) => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/reports/export?${params}`,
        {
          ...getHeaders(),
          responseType: format === 'excel' ? 'blob' : 'text'
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to export report'
      };
    }
  }
};

export default reportService;

