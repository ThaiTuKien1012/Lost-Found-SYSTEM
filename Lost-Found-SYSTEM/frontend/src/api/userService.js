import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

const userService = {
  getProfile: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/users/profile`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch profile'
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        profileData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile'
      };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/users/change-password`,
        { currentPassword, newPassword },
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change password'
      };
    }
  },

  getUsers: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await axios.get(
        `${API_URL}/users?${params}`,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        userData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user'
      };
    }
  }
};

export default userService;

