/**
 * App-wide Constants
 * Re-export from utils/constants for centralized access
 */

export { CATEGORIES, CAMPUSES, STATUSES, CONDITIONS } from '../../utils/constants';

// App-specific constants
export const APP_NAME = 'Lost & Found System';
export const APP_VERSION = '1.0.0';

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Image upload limits
export const UPLOAD_LIMITS = {
  MAX_FILES: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

// Date validation
export const DATE_RULES = {
  MAX_DAYS_AGO: 90, // Warn if lost date > 90 days ago
  NO_FUTURE: true, // Cannot select future dates
};

// Form validation rules
export const VALIDATION_RULES = {
  ITEM_NAME: {
    MIN: 3,
    MAX: 100,
  },
  DESCRIPTION: {
    MIN: 10,
    MAX: 1000,
  },
  COLOR: {
    MAX: 50,
  },
  LOCATION: {
    MAX: 200,
  },
  PHONE: {
    PATTERN: /^(09|01)[0-9]{8,9}$/,
    MIN: 10,
    MAX: 11,
  },
};

