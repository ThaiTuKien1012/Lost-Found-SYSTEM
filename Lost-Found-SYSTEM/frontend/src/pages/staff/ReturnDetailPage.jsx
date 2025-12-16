import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { gsap } from 'gsap';
import returnService from '../../api/returnService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiArrowLeft, 
  FiUser, 
  FiPackage, 
  FiCalendar, 
  FiMapPin, 
  FiShield, 
  FiEye,
  FiImage
} from 'react-icons/fi';
import { getStatusLabel, getStatusColor, getImageUrl, getConditionLabel } from '../../utils/helpers';

const ReturnDetailPage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  const { data, loading, error } = useFetch(
    () => {
      if (!transactionId || transactionId === 'undefined') {
        return Promise.reject(new Error('Transaction ID is required'));
      }
      return returnService.getReturnDetail(transactionId);
    },
    [transactionId]
  );

  useEffect(() => {
    if (data && !loading) {
      const tl = gsap.timeline();
      tl.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
      .fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.2'
      );
    }
  }, [data, loading]);

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
      <div className="return-detail-page">
        <AnimatedBackground intensity={0.1} />
        <div className="page-content">
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải chi tiết giao dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="return-detail-page">
        <AnimatedBackground intensity={0.1} />
        <div className="page-content">
          <div className="error-enhanced">
            <p>{error || 'Không tìm thấy giao dịch'}</p>
            <button 
              onClick={() => navigate('/returns/management')}
              className="btn-primary"
            >
              <FiArrowLeft /> Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const transaction = data.data;
  const statusColors = getStatusColor(transaction.status);

  return (
    <div ref={pageRef} className="return-detail-page">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-content">
        <div ref={headerRef} className="detail-header">
          <button 
            onClick={() => navigate('/returns/management')}
            className="back-button"
          >
            <FiArrowLeft />
            <span>Quay lại</span>
          </button>
          <div className="header-info">
            <div className="transaction-id-header">
              <span className="id-label">MÃ GD:</span>
              <span className="id-value">{transaction.transactionId}</span>
            </div>
            <div
              className="status-badge-header"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.color,
                borderColor: statusColors.border
              }}
            >
              {getStatusLabel(transaction.status)}
            </div>
          </div>
        </div>

        <div ref={contentRef} className="detail-content">
          {/* Student Information */}
          {transaction.student && (
            <div className="detail-section">
              <div className="section-header">
                <FiUser className="section-icon" />
                <span className="section-title">Thông tin sinh viên</span>
              </div>
              <div className="section-content">
                <div className="info-row">
                  <span className="info-label">Họ tên:</span>
                  <span className="info-value">
                    {transaction.student.firstName} {transaction.student.lastName}
                  </span>
                </div>
                {transaction.student.email && (
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{transaction.student.email}</span>
                  </div>
                )}
                {transaction.student.phone && (
                  <div className="info-row">
                    <span className="info-label">SĐT:</span>
                    <span className="info-value">{transaction.student.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Found Item Information */}
          {transaction.foundItem && (
            <div className="detail-section">
              <div className="section-header">
                <FiPackage className="section-icon" />
                <span className="section-title">Đồ vật trả</span>
              </div>
              <div className="section-content-with-image">
                {transaction.foundItem.images && transaction.foundItem.images.length > 0 && (
                  <div className="item-image-wrapper">
                    <img 
                      src={getImageUrl(transaction.foundItem.images[0])} 
                      alt={transaction.foundItem.itemName}
                      className="item-thumbnail"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
                <div className="item-info">
                  <div className="info-row">
                    <span className="info-label">Tên:</span>
                    <span className="info-value">{transaction.foundItem.itemName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Loại:</span>
                    <span className="info-value">{transaction.foundItem.category}</span>
                  </div>
                  {transaction.foundItem.color && (
                    <div className="info-row">
                      <span className="info-label">Màu:</span>
                      <span className="info-value">{transaction.foundItem.color}</span>
                    </div>
                  )}
                  {transaction.foundItem.foundId && (
                    <div className="info-row">
                      <span className="info-label">Found ID:</span>
                      <span className="info-value">{transaction.foundItem.foundId}</span>
                    </div>
                  )}
                  {transaction.foundItem._id && (
                    <Link 
                      to={`/found-items/${transaction.foundItem._id}`}
                      className="view-item-link"
                    >
                      <FiEye /> Xem chi tiết đồ vật
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="detail-section">
            <div className="section-header">
              <FiCalendar className="section-icon" />
              <span className="section-title">Chi tiết giao dịch</span>
            </div>
            <div className="section-content">
              <div className="info-item">
                <FiCalendar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Ngày trả</span>
                  <span className="info-value">
                    {transaction.returnedDate 
                      ? new Date(transaction.returnedDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <FiMapPin className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Campus</span>
                  <span className="info-value">{transaction.campus || 'N/A'}</span>
                </div>
              </div>

              {transaction.verificationMethod && (
                <div className="info-item">
                  <FiShield className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Phương thức xác minh</span>
                    <span className="info-value">
                      {getVerificationMethodLabel(transaction.verificationMethod)}
                    </span>
                  </div>
                </div>
              )}

              {transaction.items && transaction.items.length > 0 && transaction.items[0].condition && (
                <div className="info-item">
                  <FiPackage className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Tình trạng khi trả</span>
                    <span className="info-value">
                      {getConditionLabel(transaction.items[0].condition)}
                    </span>
                  </div>
                </div>
              )}

              {transaction.items && transaction.items.length > 0 && transaction.items[0].notes && (
                <div className="info-item notes-item">
                  <div className="info-content">
                    <span className="info-label">Ghi chú</span>
                    <span className="info-value notes-text">
                      {transaction.items[0].notes}
                    </span>
                  </div>
                </div>
              )}

              {transaction.securityOfficer && (
                <div className="info-item">
                  <FiUser className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Bảo vệ xử lý</span>
                    <span className="info-value">
                      {transaction.securityOfficer.firstName} {transaction.securityOfficer.lastName}
                    </span>
                  </div>
                </div>
              )}

              {transaction.photo && (
                <div className="info-item photo-item">
                  <div className="info-content">
                    <span className="info-label">Ảnh giao dịch</span>
                    <div className="photo-wrapper">
                      <img 
                        src={getImageUrl(transaction.photo)} 
                        alt="Transaction Photo" 
                        className="transaction-photo"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailPage;
