import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const securityService = {
  // Get Security Dashboard Stats
  getDashboardStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/security/dashboard/stats`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : (errorData?.message || errorData?.code || 'Failed to fetch dashboard stats');
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

export default securityService;

