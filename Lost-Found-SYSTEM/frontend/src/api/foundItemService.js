import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const foundItemService = {
  createFoundItem: async (itemData) => {
    try {
      const response = await axios.post(
        `${API_URL}/found-items`,
        itemData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create found item'
      };
    }
  },

  getFoundItems: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/found-items?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch found items'
      };
    }
  },

  getFoundItem: async (itemId) => {
    try {
      const response = await axios.get(
        `${API_URL}/found-items/${itemId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch found item'
      };
    }
  },

  searchFoundItems: async (keyword, filters = {}, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        keyword,
        page,
        limit,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/found-items/search?${params}`
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Search failed'
      };
    }
  },

  updateFoundItem: async (itemId, updateData) => {
    try {
      const response = await axios.put(
        `${API_URL}/found-items/${itemId}`,
        updateData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update found item'
      };
    }
  },

  deleteFoundItem: async (itemId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/found-items/${itemId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete found item'
      };
    }
  }
};

export default foundItemService;

