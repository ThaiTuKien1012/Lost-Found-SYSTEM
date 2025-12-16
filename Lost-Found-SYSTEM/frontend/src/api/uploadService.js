import axios from 'axios';
import authService from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`,
    'Content-Type': 'multipart/form-data'
  }
});

const uploadService = {
  uploadImages: async (files) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post(
        `${API_URL}/upload/images`,
        formData,
        getHeaders()
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload images'
      };
    }
  },

  deleteImage: async (fileId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/upload/images/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete image'
      };
    }
  }
};

export default uploadService;

