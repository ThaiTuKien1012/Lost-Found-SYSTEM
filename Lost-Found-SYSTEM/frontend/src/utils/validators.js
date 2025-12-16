/**
 * Validation Utilities
 * Functions for validating form inputs and data
 */

import { VALIDATION_RULES } from '../app/config/constants';

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate FPTU email format
 */
export const isValidFPTUEmail = (email) => {
  if (!email) return false;
  const fptuEmailRegex = /^[a-zA-Z0-9._%+-]+@fptu\.edu\.vn$/;
  return fptuEmailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  const cleaned = phone.replace(/\D/g, '');
  return VALIDATION_RULES.PHONE.PATTERN.test(cleaned) && 
         cleaned.length >= VALIDATION_RULES.PHONE.MIN && 
         cleaned.length <= VALIDATION_RULES.PHONE.MAX;
};

/**
 * Validate item name
 */
export const validateItemName = (name) => {
  if (!name) return 'Tên đồ không được để trống';
  const trimmed = name.trim();
  if (trimmed.length < VALIDATION_RULES.ITEM_NAME.MIN) {
    return `Tên đồ phải có ít nhất ${VALIDATION_RULES.ITEM_NAME.MIN} ký tự`;
  }
  if (trimmed.length > VALIDATION_RULES.ITEM_NAME.MAX) {
    return `Tên đồ không được vượt quá ${VALIDATION_RULES.ITEM_NAME.MAX} ký tự`;
  }
  // Check for HTML tags
  if (/<[^>]*>/g.test(trimmed)) {
    return 'Tên đồ không được chứa HTML';
  }
  return null;
};

/**
 * Validate description
 */
export const validateDescription = (description) => {
  if (!description) return 'Mô tả không được để trống';
  const trimmed = description.trim();
  if (trimmed.length < VALIDATION_RULES.DESCRIPTION.MIN) {
    return `Mô tả phải có ít nhất ${VALIDATION_RULES.DESCRIPTION.MIN} ký tự`;
  }
  if (trimmed.length > VALIDATION_RULES.DESCRIPTION.MAX) {
    return `Mô tả không được vượt quá ${VALIDATION_RULES.DESCRIPTION.MAX} ký tự`;
  }
  // Check for HTML tags
  if (/<[^>]*>/g.test(trimmed)) {
    return 'Mô tả không được chứa HTML';
  }
  return null;
};

/**
 * Validate date (not in future)
 */
export const validateDate = (date) => {
  if (!date) return 'Ngày không được để trống';
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (selectedDate > today) {
    return 'Ngày không được là ngày tương lai';
  }
  return null;
};

/**
 * Validate image files
 */
export const validateImageFiles = (files) => {
  if (!files || files.length === 0) return null; // Optional
  
  if (files.length > 5) {
    return 'Chỉ được tải lên tối đa 5 ảnh';
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!allowedTypes.includes(file.type)) {
      return `Ảnh ${i + 1}: Chỉ chấp nhận định dạng JPG, PNG, WEBP`;
    }
    
    if (file.size > maxSize) {
      return `Ảnh ${i + 1}: Kích thước không được vượt quá 5MB`;
    }
  }
  
  return null;
};

/**
 * Sanitize HTML (remove HTML tags)
 */
export const sanitizeHTML = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

