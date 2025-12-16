/**
 * Route Path Constants
 * Centralized route definitions for easy maintenance
 */

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Home
  HOME: '/',
  
  // Lost Items
  LOST_ITEMS: '/lost-items',
  LOST_ITEM_DETAIL: (id) => `/lost-items/${id}`,
  LOST_ITEMS_MANAGEMENT: '/lost-items/management',
  
  // Found Items
  FOUND_ITEMS: '/found-items',
  FOUND_ITEM_DETAIL: (id) => `/found-items/${id}`,
  FOUND_ITEMS_SEARCH: '/found-items/search',
  FOUND_ITEMS_MANAGEMENT: '/found-items/management',
  
  // Matching
  MATCHING: '/matching',
  MATCHING_MANAGEMENT: '/matching/management',
  
  // Returns
  RETURNS_MANAGEMENT: '/returns/management',
  RETURNS_MY_TRANSACTIONS: '/returns/my-transactions',
  RETURN_DETAIL: (id) => `/returns/${id}`,
  
  // Security
  SECURITY_FOUND_ITEMS: '/security/found-items/list',
  SECURITY_READY_TO_RETURN: '/security/ready-to-return',
  SECURITY_RETURN_HISTORY: '/security/return-history',
  
  // Reports
  REPORTS: '/reports',
  
  // Profile
  PROFILE: '/profile',
  
  // 404
  NOT_FOUND: '*'
};

/**
 * Route permissions by role
 */
export const ROUTE_PERMISSIONS = {
  [ROUTES.LOST_ITEMS]: ['student'],
  [ROUTES.FOUND_ITEMS]: ['student'],
  [ROUTES.FOUND_ITEMS_SEARCH]: ['student'],
  [ROUTES.MATCHING]: ['student'],
  [ROUTES.RETURNS_MY_TRANSACTIONS]: ['student'],
  
  [ROUTES.LOST_ITEMS_MANAGEMENT]: ['staff'],
  [ROUTES.FOUND_ITEMS_MANAGEMENT]: ['staff'],
  [ROUTES.MATCHING_MANAGEMENT]: ['staff'],
  [ROUTES.RETURNS_MANAGEMENT]: ['staff'],
  [ROUTES.REPORTS]: ['staff'],
  
  [ROUTES.SECURITY_FOUND_ITEMS]: ['security'],
  [ROUTES.SECURITY_READY_TO_RETURN]: ['security'],
  [ROUTES.SECURITY_RETURN_HISTORY]: ['security'],
  
  [ROUTES.HOME]: ['student', 'staff', 'security'],
  [ROUTES.PROFILE]: ['student', 'staff', 'security']
};

