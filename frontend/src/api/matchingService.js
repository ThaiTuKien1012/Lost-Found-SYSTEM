import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const matchingService = {
  getSuggestions: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/matching/suggestions`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch suggestions'
      };
    }
  },

  getMatches: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
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

  confirmMatch: async (matchId, confirmation, notes = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/matching/${matchId}/confirm`,
        { confirmation, notes },
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

  resolveMatch: async (matchId, status, notes = '') => {
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
  },

  createMatch: async (lostItemId, foundItemId, notes = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/matching`,
        { lostItemId, foundItemId, notes },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create match'
      };
    }
  }
};

export default matchingService;

