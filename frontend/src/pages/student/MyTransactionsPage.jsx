import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import returnService from '../../api/returnService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { FiClock, FiCheckCircle, FiCalendar, FiMapPin, FiPackage, FiShield, FiImage, FiExternalLink } from 'react-icons/fi';

const MyTransactionsPage = () => {
  const [page, setPage] = useState(1);
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const itemsRef = useRef([]);

  const { data, loading, error } = useFetch(
    () => returnService.getMyTransactions(page, 10),
    [page]
  );

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    if (data?.data && itemsRef.current.length > 0) {
      gsap.fromTo(itemsRef.current,
        { opacity: 0, x: -100, rotationY: -45 },
        { 
          opacity: 1, 
          x: 0, 
          rotationY: 0, 
          duration: 0.6, 
          stagger: 0.15,
          ease: 'power3.out' 
        },
        '-=0.2'
      );
    }
  }, [data]);

  const handleCardHover = (index, isHovering) => {
    const card = itemsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      scale: isHovering ? 1.02 : 1,
      y: isHovering ? -5 : 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#555555';
      case 'pending':
        return '#888888';
      case 'failed':
        return '#666666';
      default:
        return '#555555';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getVerificationMethodLabel = (method) => {
    const labels = {
      signature: 'Chữ ký',
      id_check: 'Kiểm tra ID',
      otp: 'OTP'
    };
    return labels[method] || method;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      slightly_damaged: 'Hơi hỏng',
      damaged: 'Hỏng'
    };
    return labels[condition] || condition;
  };

  // Get BASE_URL for images
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/${url}`;
  };

  return (
    <div ref={pageRef} className="my-transactions-page-enhanced">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiClock className="title-icon" />
          <h1 ref={titleRef} className="page-title">Lịch Sử Trả Đồ</h1>
        </div>
      </div>

      <div className="content-container-enhanced">
        {loading && (
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}
        
        {error && (
          <div className="error-enhanced">
            <p>{error}</p>
          </div>
        )}
        
        {data && (
          <>
            {data.data?.length === 0 ? (
              <div className="empty-state-enhanced">
                <FiClock className="empty-icon" />
                <p>Chưa có giao dịch trả đồ nào</p>
              </div>
            ) : (
              <>
                <div className="transactions-list-enhanced">
                  {data.data?.map((transaction, index) => (
                    <div
                      key={transaction._id || transaction.transactionId}
                      ref={el => itemsRef.current[index] = el}
                      className="transaction-card-enhanced"
                      onMouseEnter={() => handleCardHover(index, true)}
                      onMouseLeave={() => handleCardHover(index, false)}
                    >
                      <div className="transaction-header">
                        <div className="transaction-id">
                          <FiCheckCircle className="id-icon" />
                          <span>Mã giao dịch: {transaction.transactionId}</span>
                        </div>
                        <div 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(transaction.status) }}
                        >
                          {getStatusLabel(transaction.status)}
                        </div>
                      </div>

                      <div className="transaction-body">
                        {/* Item Image and Name */}
                        {transaction.foundItem ? (
                          <div className="transaction-item-header">
                            {transaction.foundItem.images && transaction.foundItem.images.length > 0 && (
                              <div className="transaction-item-image">
                                <img 
                                  src={getImageUrl(transaction.foundItem.images[0])} 
                                  alt={transaction.foundItem.itemName}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="transaction-item-info">
                              <h3 className="item-name">
                                <FiPackage className="item-icon" />
                                {transaction.foundItem.itemName || 'Vật dụng đã trả'}
                              </h3>
                              {transaction.foundItem.category && (
                                <span className="item-category">{transaction.foundItem.category}</span>
                              )}
                              {transaction.foundItem._id && (
                                <Link 
                                  to={`/found-items/${transaction.foundItem._id}`}
                                  className="item-link"
                                >
                                  Xem chi tiết <FiExternalLink />
                                </Link>
                              )}
                            </div>
                          </div>
                        ) : transaction.foundItemId && (
                          <div className="transaction-item-header">
                            <div className="transaction-item-info">
                              <h3 className="item-name">
                                <FiPackage className="item-icon" />
                                Vật dụng đã trả
                              </h3>
                              <span className="item-category">ID: {transaction.foundItemId}</span>
                            </div>
                          </div>
                        )}

                        <div className="transaction-info">
                          <div className="info-item">
                            <FiCalendar className="info-icon" />
                            <div className="info-content">
                              <span className="info-label">Ngày trả</span>
                              <span className="info-value">
                                {new Date(transaction.returnedDate).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="info-item">
                            <FiMapPin className="info-icon" />
                            <div className="info-content">
                              <span className="info-label">Campus</span>
                              <span className="info-value">{transaction.campus}</span>
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

                          {/* Item Details */}
                          {transaction.foundItem && (
                            <div className="transaction-item-details">
                              <span className="items-label">Thông tin vật dụng:</span>
                              <div className="item-details-grid">
                                {transaction.foundItem.condition && (
                                  <div className="item-detail">
                                    <span className="detail-label">Tình trạng:</span>
                                    <span className="detail-value">
                                      {getConditionLabel(transaction.foundItem.condition)}
                                    </span>
                                  </div>
                                )}
                                {transaction.foundItem.color && (
                                  <div className="item-detail">
                                    <span className="detail-label">Màu sắc:</span>
                                    <span className="detail-value">{transaction.foundItem.color}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Items from transaction.items array */}
                          {transaction.items && transaction.items.length > 0 && (
                            <div className="transaction-items">
                              <span className="items-label">Ghi chú trả:</span>
                              {transaction.items.map((item, idx) => (
                                <div key={idx} className="item-detail">
                                  {item.condition && (
                                    <span>• Tình trạng: {getConditionLabel(item.condition)}</span>
                                  )}
                                  {item.notes && (
                                    <span className="item-notes"> - {item.notes}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Transaction Photo */}
                          {transaction.photo && (
                            <div className="transaction-photo">
                              <span className="items-label">Ảnh giao dịch:</span>
                              <div className="photo-preview">
                                <img 
                                  src={getImageUrl(transaction.photo)} 
                                  alt="Transaction photo"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data.pagination && data.pagination.pages > 1 && (
                  <div className="pagination-enhanced">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyTransactionsPage;

