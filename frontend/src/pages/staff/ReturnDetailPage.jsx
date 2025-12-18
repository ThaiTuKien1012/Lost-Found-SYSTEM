import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import returnService from '../../api/returnService';
import { 
  FiArrowLeft, 
  FiUser, 
  FiPackage, 
  FiCalendar, 
  FiMapPin, 
  FiShield, 
  FiEye,
  FiImage,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import { getStatusLabel, getStatusColor, getImageUrl, getConditionLabel } from '../../utils/helpers';

const ReturnDetailPage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(
    () => {
      if (!transactionId || transactionId === 'undefined') {
        return Promise.reject(new Error('Transaction ID is required'));
      }
      return returnService.getReturnDetail(transactionId);
    },
    [transactionId]
  );

  const getVerificationMethodLabel = (method) => {
    switch (method) {
      case 'signature': return 'Chữ ký';
      case 'id_check': return 'Kiểm tra ID';
      case 'otp': return 'OTP';
      default: return method || 'N/A';
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '40px',
          background: '#F5F5F5',
          fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #E0E0E0',
                borderTopColor: '#333333',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '16px',
              }}
            />
            <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải chi tiết giao dịch...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '40px',
          background: '#F5F5F5',
          fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#FF0000', fontSize: '14px', marginBottom: '20px' }}>
              {error || 'Không tìm thấy giao dịch'}
            </p>
            <button
              onClick={() => navigate('/returns/management')}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#000000',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FiArrowLeft size={16} />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const transaction = data.data;
  const statusColors = getStatusColor(transaction.status);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px',
        background: '#F5F5F5',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <button
            onClick={() => navigate('/returns/management')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#333333',
              fontSize: '14px',
              fontWeight: 500,
              border: '1px solid #E0E0E0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#F5F5F5')}
            onMouseLeave={(e) => (e.target.style.background = '#FFFFFF')}
          >
            <FiArrowLeft size={16} />
            Quay lại
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#666666' }}>Mã GD:</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#333333' }}>{transaction.transactionId}</span>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: statusColors.bg,
                color: statusColors.color,
                border: `1px solid ${statusColors.border}`,
              }}
            >
              {getStatusLabel(transaction.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Student Information */}
          {transaction.student && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#E3F2FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1976D2',
                  }}
                >
                  <FiUser size={20} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', margin: 0 }}>
                  Thông tin sinh viên
                </h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Họ tên</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#333333' }}>
                    {transaction.student.firstName} {transaction.student.lastName}
                  </span>
                </div>
                {transaction.student.email && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Email</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
                      <FiMail size={14} />
                      {transaction.student.email}
                    </div>
                  </div>
                )}
                {transaction.student.phone && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>SĐT</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
                      <FiPhone size={14} />
                      {transaction.student.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Found Item Information */}
          {transaction.foundItem && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#E8F5E9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#388E3C',
                  }}
                >
                  <FiPackage size={20} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', margin: 0 }}>
                  Đồ vật trả
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {transaction.foundItem.images && transaction.foundItem.images.length > 0 && (
                  <div
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#F5F5F5',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={getImageUrl(transaction.foundItem.images[0])}
                      alt={transaction.foundItem.itemName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Tên</span>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: '#333333' }}>
                        {transaction.foundItem.itemName}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Loại</span>
                      <span style={{ fontSize: '14px', color: '#333333' }}>
                        {transaction.foundItem.category}
                      </span>
                    </div>
                    {transaction.foundItem.color && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Màu</span>
                        <span style={{ fontSize: '14px', color: '#333333' }}>
                          {transaction.foundItem.color}
                        </span>
                      </div>
                    )}
                    {transaction.foundItem.foundId && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Found ID</span>
                        <span style={{ fontSize: '14px', color: '#333333' }}>
                          {transaction.foundItem.foundId}
                        </span>
                      </div>
                    )}
                    {transaction.foundItem._id && (
                      <Link
                        to={`/found-items/${transaction.foundItem._id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: '#000000',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 500,
                          textDecoration: 'none',
                          width: 'fit-content',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#333333')}
                        onMouseLeave={(e) => (e.target.style.background = '#000000')}
                      >
                        <FiEye size={14} />
                        Xem chi tiết đồ vật
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#FFF3E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F57C00',
                }}
              >
                <FiCalendar size={20} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', margin: 0 }}>
                Chi tiết giao dịch
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Ngày trả</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
                  <FiCalendar size={14} />
                  {transaction.returnedDate
                    ? new Date(transaction.returnedDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Campus</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
                  <FiMapPin size={14} />
                  {transaction.campus || 'N/A'}
                </div>
              </div>

              {transaction.verificationMethod && (
                <div>
                  <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Phương thức xác minh</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
                    <FiShield size={14} />
                    {getVerificationMethodLabel(transaction.verificationMethod)}
                  </div>
                </div>
              )}

              {transaction.items && transaction.items.length > 0 && transaction.items[0].condition && (
                <div>
                  <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Tình trạng khi trả</span>
                  <span style={{ fontSize: '14px', color: '#333333' }}>
                    {getConditionLabel(transaction.items[0].condition)}
                  </span>
                </div>
              )}

              {transaction.securityOfficer && (
                <div>
                  <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '4px' }}>Bảo vệ xử lý</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#333333' }}>
                    <FiUser size={14} />
                    {transaction.securityOfficer.firstName} {transaction.securityOfficer.lastName}
                  </div>
                </div>
              )}
            </div>

            {transaction.items && transaction.items.length > 0 && transaction.items[0].notes && (
              <div style={{ marginTop: '20px' }}>
                <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '8px' }}>Ghi chú</span>
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#333333',
                    lineHeight: 1.5,
                  }}
                >
                  {transaction.items[0].notes}
                </div>
              </div>
            )}

            {transaction.photo && (
              <div style={{ marginTop: '20px' }}>
                <span style={{ fontSize: '12px', color: '#999999', display: 'block', marginBottom: '8px' }}>Ảnh giao dịch</span>
                <div
                  style={{
                    width: '300px',
                    height: '200px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#F5F5F5',
                  }}
                >
                  <img
                    src={getImageUrl(transaction.photo)}
                    alt="Transaction Photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReturnDetailPage;
