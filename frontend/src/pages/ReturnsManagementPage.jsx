import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { gsap } from 'gsap';
import returnService from '../api/returnService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { FiClock, FiCalendar, FiMapPin, FiFilter } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';

const ReturnsManagementPage = () => {
  const [page, setPage] = useState(1);
  const [campusFilter, setCampusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const itemsRef = useRef([]);

  const filters = {
    ...(campusFilter && { campus: campusFilter }),
    ...(dateFilter && { date: dateFilter })
  };

  const { data, loading, error } = useFetch(
    () => returnService.getReturns(page, 20, filters),
    [page, campusFilter, dateFilter]
  );

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    if (data?.data && itemsRef.current.length > 0) {
      gsap.fromTo(itemsRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }, [data]);

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
    const labels = {
      completed: 'Đã hoàn thành',
      pending: 'Đang xử lý',
      failed: 'Thất bại'
    };
    return labels[status] || status;
  };

  return (
    <div ref={pageRef} className="returns-management-page">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiClock className="title-icon" />
          <h1 ref={titleRef} className="page-title">Quản Lý Trả Đồ</h1>
        </div>
      </div>

      <div className="content-container-enhanced">
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-item">
            <label>Campus</label>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="NVH">NVH</option>
              <option value="SHTP">SHTP</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Ngày</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          {(campusFilter || dateFilter) && (
            <button
              onClick={() => {
                setCampusFilter('');
                setDateFilter('');
              }}
              className="btn-clear-filters"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Returns List */}
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
                <p>Không có giao dịch trả đồ nào</p>
              </div>
            ) : (
              <>
                <div className="returns-list-enhanced">
                  {data.data?.map((transaction, index) => (
                    <div
                      key={transaction._id || transaction.transactionId}
                      ref={el => itemsRef.current[index] = el}
                      className="return-card-enhanced"
                    >
                      <div className="return-header">
                        <div className="return-id">
                          <span>Mã GD: {transaction.transactionId}</span>
                        </div>
                        <div
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(transaction.status) }}
                        >
                          {getStatusLabel(transaction.status)}
                        </div>
                      </div>

                      <div className="return-body">
                        <div className="return-info">
                          <div className="info-item">
                            <FiCalendar className="info-icon" />
                            <div className="info-content">
                              <span className="info-label">Ngày trả</span>
                              <span className="info-value">
                                {formatDate(transaction.returnedDate)}
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

                          {transaction.studentId && (
                            <div className="info-item">
                              <span className="info-label">Sinh viên:</span>
                              <span className="info-value">{transaction.studentId}</span>
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

export default ReturnsManagementPage;

