/**
 * General Helper Utilities
 * Re-export formatters for backward compatibility
 */

export { formatDate, formatDateTime, formatRelativeTime, formatFileSize, formatPhoneNumber } from './formatters';

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    case 'verified':
      return { bg: '#DBEAFE', color: '#1E40AF', border: '#60A5FA' };
    case 'rejected':
      return { bg: '#FEE2E2', color: '#991B1B', border: '#F87171' };
    case 'returned':
      return { bg: '#E0E7FF', color: '#3730A3', border: '#818CF8' };
    case 'unclaimed':
      return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    case 'disposed':
      return { bg: '#E5E7EB', color: '#374151', border: '#9CA3AF' };
    case 'completed':
      return { bg: '#D1FAE5', color: '#065F46', border: '#34D399' };
    case 'failed':
      return { bg: '#FEE2E2', color: '#991B1B', border: '#F87171' };
    default:
      return { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' };
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

