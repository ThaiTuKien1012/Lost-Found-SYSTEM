import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const matchingService = {
  // Staff: Tạo match thủ công
  createManualMatch: async (lostItemId, foundItemId, matchReason, notes, studentId) => {
    try {
      const response = await axios.post(
        `${API_URL}/matching`,
        {
          lostItemId: lostItemId || null,
          foundItemId,
          matchReason,
          notes,
          studentId: studentId || null
        },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create match'
      };
    }
  },

  // Staff/Security: Xem danh sách matches
  getMatches: async (page = 1, limit = 20, status = null, additionalParams = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit
      });
      if (status) params.append('status', status);
      if (additionalParams.fromDate) params.append('fromDate', additionalParams.fromDate);
      if (additionalParams.toDate) params.append('toDate', additionalParams.toDate);
      if (additionalParams.search) params.append('search', additionalParams.search);
      
      const response = await axios.get(
        `${API_URL}/matching?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch matches'
      };
    }
  },

  // Student: Xem danh sách pending matches
  getPendingMatches: async (page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_URL}/matching/pending?page=${page}&limit=${limit}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : (errorData?.message || errorData?.code || error.message || 'Failed to fetch pending matches');
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Student: Confirm match
  confirmMatch: async (matchId, notes = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/matching/${matchId}/confirm`,
        { notes },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to confirm match'
      };
    }
  },

  // Student: Reject match
  rejectMatch: async (matchId, reason = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/matching/${matchId}/reject`,
        { reason },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to reject match'
      };
    }
  },

  // Security: Xem danh sách confirmed matches
  getConfirmedMatches: async (page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_URL}/matching/confirmed?page=${page}&limit=${limit}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch confirmed matches'
      };
    }
  },

  // Staff/Security: Resolve match
  resolveMatch: async (matchId, status = 'resolved', notes = '') => {
    try {
      const response = await axios.put(
        `${API_URL}/matching/${matchId}/resolve`,
        { status, notes },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to resolve match'
      };
    }
  }
};

export default matchingService;

