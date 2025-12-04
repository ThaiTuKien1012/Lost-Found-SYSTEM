import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const lostItemService = {
  createReport: async (itemData) => {
    try {
      const response = await axios.post(
        `${API_URL}/lost-items`,
        itemData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create report'
      };
    }
  },

  getMyReports: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/lost-items/my-reports?page=${page}&limit=${limit}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch reports'
      };
    }
  },

  getReport: async (reportId) => {
    try {
      const response = await axios.get(
        `${API_URL}/lost-items/${reportId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch report'
      };
    }
  },

  searchReports: async (keyword, filters = {}, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        keyword,
        page,
        limit,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/lost-items/search?${params}`
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Search failed'
      };
    }
  },

  updateReport: async (reportId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/lost-items/${reportId}`,
        updateData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update report'
      };
    }
  },

  deleteReport: async (reportId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/lost-items/${reportId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete report'
      };
    }
  },

  // Staff methods
  getAllReports: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/lost-items?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch reports'
      };
    }
  },

  verifyReport: async (reportId, verificationData) => {
    try {
      const response = await axios.put(
        `${API_URL}/lost-items/${reportId}/verify`,
        verificationData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to verify report'
      };
    }
  },

  rejectReport: async (reportId, reason) => {
    try {
      const response = await axios.put(
        `${API_URL}/lost-items/${reportId}/reject`,
        { reason },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to reject report'
      };
    }
  }
};

export default lostItemService;

