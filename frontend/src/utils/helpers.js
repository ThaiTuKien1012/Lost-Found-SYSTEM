import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch (error) {
    return date;
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return date;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    case 'verified':
      return { bg: '#DBEAFE', color: '#1E40AF', border: '#60A5FA' };
    case 'rejected':
      return { bg: '#FEE2E2', color: '#991B1B', border: '#F87171' };
    case 'matched':
      return { bg: '#D1FAE5', color: '#065F46', border: '#34D399' };
    case 'returned':
      return { bg: '#E0E7FF', color: '#3730A3', border: '#818CF8' };
    case 'unclaimed':
      return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    default:
      return { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' };
  }
};

export const getStatusLabel = (status) => {
  const statusLabels = {
    pending: 'Chờ xác nhận',
    verified: 'Đã xác minh',
    rejected: 'Đã từ chối',
    matched: 'Đã khớp',
    returned: 'Đã trả',
    unclaimed: 'Chưa được nhận',
    completed: 'Đã hoàn thành',
    failed: 'Thất bại'
  };
  return statusLabels[status] || status;
};

