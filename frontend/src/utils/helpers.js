/**
 * General Helper Utilities
 * Re-export formatters for backward compatibility
 */

export { formatDate, formatDateTime, formatRelativeTime, formatFileSize, formatPhoneNumber } from './formatters';

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return { bg: '#F5F5F5', color: '#444444', border: '#D0D0D0' };
    case 'verified':
      return { bg: '#EEEEEE', color: '#444444', border: '#CCCCCC' };
    case 'rejected':
      return { bg: '#666666', color: '#FFFFFF', border: '#555555' };
    case 'returned':
      return { bg: '#E0E0E0', color: '#444444', border: '#BBBBBB' };
    case 'unclaimed':
      return { bg: '#F5F5F5', color: '#444444', border: '#D0D0D0' };
    case 'disposed':
      return { bg: '#AAAAAA', color: '#FFFFFF', border: '#999999' };
    case 'completed':
      return { bg: '#999999', color: '#FFFFFF', border: '#888888' };
    case 'failed':
      return { bg: '#666666', color: '#FFFFFF', border: '#555555' };
    default:
      return { bg: '#FAFAFA', color: '#444444', border: '#E0E0E0' };
  }
};

export const getStatusLabel = (status) => {
  const statusLabels = {
    pending: 'Chờ xác nhận',
    verified: 'Đã xác minh',
    rejected: 'Đã từ chối',
    returned: 'Đã trả',
    unclaimed: 'Chưa được nhận',
    disposed: 'Đã hủy',
    completed: 'Đã hoàn thành',
    failed: 'Thất bại'
  };
  return statusLabels[status] || status;
};

export const getImageUrl = (url) => {
  if (!url) return '';
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/uploads/${url}`;
};

export const getConditionLabel = (condition) => {
  const conditionLabels = {
    excellent: 'Tuyệt vời',
    good: 'Tốt',
    slightly_damaged: 'Hơi hỏng',
    damaged: 'Hỏng'
  };
  return conditionLabels[condition] || condition;
};

