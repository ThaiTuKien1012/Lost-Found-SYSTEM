/**
 * Formatting Utilities
 * Functions for formatting data (dates, numbers, strings, etc.)
 */

import { format } from 'date-fns';

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch (error) {
    return date;
  }
};

/**
 * Format date and time to DD/MM/YYYY HH:mm
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return date;
  }
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return formatDate(date);
  } catch (error) {
    return date;
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format: 09XX XXX XXX or 01XX XXX XXXX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{5})/, '$1 $2 $3');
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{6})/, '$1 $2 $3');
  }
  return phone;
};

