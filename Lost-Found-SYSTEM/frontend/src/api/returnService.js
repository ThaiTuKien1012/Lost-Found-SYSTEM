import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5124/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const returnService = {
  createReturn: async (returnData) => {
    try {
      const response = await axios.post(
        `${API_URL}/returns`,
        returnData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create return'
      };
    }
  },

  getReturnDetail: async (transactionId) => {
    try {
      const response = await axios.get(
        `${API_URL}/returns/${transactionId}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch return'
      };
    }
  },

  getMyTransactions: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/student/returns?page=${page}&limit=${limit}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch transactions'
      };
    }
  },

  getReturns: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/returns?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch returns'
      };
    }
  }
};

export default returnService;

