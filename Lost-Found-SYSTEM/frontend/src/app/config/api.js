/**
 * API Configuration
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5124',
  API_PREFIX: '/api',
  TIMEOUT: 30000, // 30 seconds
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Lost Items
  LOST_ITEMS: {
    BASE: '/lost-items',
    BY_ID: (id) => `/lost-items/${id}`,
    VERIFY: (id) => `/lost-items/${id}/verify`,
    DELETE: (id) => `/lost-items/${id}`,
  },
  
  // Found Items
  FOUND_ITEMS: {
    BASE: '/found-items',
    BY_ID: (id) => `/found-items/${id}`,
    DELETE: (id) => `/found-items/${id}`,
  },
  
  // Matching
  MATCHING: {
    BASE: '/matching',
    BY_ID: (id) => `/matching/${id}`,
    CONFIRMED: '/matching/confirmed',
    CONFIRM: (id) => `/matching/${id}/confirm`,
    REJECT: (id) => `/matching/${id}/reject`,
  },
  
  // Returns
  RETURNS: {
    BASE: '/returns',
    BY_ID: (id) => `/returns/${id}`,
    MY_TRANSACTIONS: '/returns/my-transactions',
    COMPLETE: (id) => `/returns/${id}/complete`,
  },
  
  // Reports
  REPORTS: {
    BASE: '/reports',
    DASHBOARD: '/reports/dashboard',
  },
  
  // Upload
  UPLOAD: {
    BASE: '/upload',
    IMAGE: '/upload/image',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
  },
  
  // Security
  SECURITY: {
    DASHBOARD_STATS: '/security/dashboard/stats',
  },
};

