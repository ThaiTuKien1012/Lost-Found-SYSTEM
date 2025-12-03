import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { gsap } from 'gsap';
import returnService from '../api/returnService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { FiClock, FiCheckCircle, FiCalendar, FiMapPin } from 'react-icons/fi';

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
        return '#22C55E';
      case 'pending':
        return '#F97316';
      case 'failed':
        return '#EF4444';
      default:
        return '#06B6D4';
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

                          {transaction.items && transaction.items.length > 0 && (
                            <div className="transaction-items">
                              <span className="items-label">Vật dụng:</span>
                              {transaction.items.map((item, idx) => (
                                <div key={idx} className="item-detail">
                                  <span>• {item.condition || 'Good'}</span>
                                  {item.notes && <span className="item-notes">({item.notes})</span>}
                                </div>
                              ))}
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

