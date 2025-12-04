import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import { gsap } from 'gsap';
import matchingService from '../api/matchingService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { FiTrendingUp, FiCheckCircle, FiXCircle, FiEye, FiFilter } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';

const MatchingManagementPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const itemsRef = useRef([]);

  const filters = {
    ...(statusFilter && { status: statusFilter })
  };

  const { data, loading, error, refetch } = useFetch(
    () => matchingService.getMatches(page, 20, filters),
    [page, statusFilter]
  );

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    if (data?.data && itemsRef.current.length > 0) {
      gsap.fromTo(itemsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }, [data]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
      case 'confirmed':
        return { bg: '#D1FAE5', color: '#065F46', border: '#34D399' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', border: '#F87171' };
      case 'resolved':
        return { bg: '#DBEAFE', color: '#1E40AF', border: '#60A5FA' };
      default:
        return { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' };
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      rejected: 'Đã từ chối',
      resolved: 'Đã giải quyết'
    };
    return labels[status] || status;
  };

  const handleResolve = async (matchId, status) => {
    const notes = window.prompt('Nhập ghi chú (nếu có):') || '';
    
    try {
      const result = await matchingService.resolveMatch(matchId, status, notes);
      if (result.success) {
        showSuccess('Đã giải quyết match thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Giải quyết thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi giải quyết');
    }
  };

  return (
    <div ref={pageRef} className="matching-management-page">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiTrendingUp className="title-icon" />
          <h1 ref={titleRef} className="page-title">Quản Lý Khớp Đồ</h1>
        </div>
      </div>

      <div className="content-container-enhanced">
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-item">
            <label>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="rejected">Đã từ chối</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </div>

          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="btn-clear-filters"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Matches List */}
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
                <FiTrendingUp className="empty-icon" />
                <p>Không có match nào</p>
              </div>
            ) : (
              <>
                <div className="matches-list-enhanced">
                  {data.data?.map((match, index) => {
                    const statusColors = getStatusColor(match.status);
                    return (
                      <div
                        key={match._id}
                        ref={el => itemsRef.current[index] = el}
                        className="match-card-enhanced"
                      >
                        <div className="match-header">
                          <div className="match-info">
                            <h3 className="match-title">
                              Match #{match.matchId || match._id.slice(-6)}
                            </h3>
                            <span className="match-date">
                              {formatDate(match.createdAt)}
                            </span>
                          </div>
                          <div
                            className="status-badge"
                            style={{
                              backgroundColor: statusColors.bg,
                              color: statusColors.color,
                              borderColor: statusColors.border
                            }}
                          >
                            {getStatusLabel(match.status)}
                          </div>
                        </div>

                        <div className="match-body">
                          <div className="match-items">
                            <div className="match-item">
                              <span className="item-label">Báo mất:</span>
                              <span className="item-value">{match.lostItemId || 'N/A'}</span>
                            </div>
                            <div className="match-item">
                              <span className="item-label">Đồ tìm được:</span>
                              <span className="item-value">{match.foundItemId || 'N/A'}</span>
                            </div>
                            {match.confidenceScore && (
                              <div className="match-item">
                                <span className="item-label">Độ khớp:</span>
                                <span className="item-value">{match.confidenceScore}%</span>
                              </div>
                            )}
                          </div>

                          {match.notes && (
                            <div className="match-notes">
                              <strong>Ghi chú:</strong> {match.notes}
                            </div>
                          )}
                        </div>

                        <div className="match-actions">
                          {match.status === 'confirmed' && (
                            <button
                              onClick={() => handleResolve(match._id, 'resolved')}
                              className="btn-action btn-resolve"
                            >
                              <FiCheckCircle />
                              Giải quyết
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

export default MatchingManagementPage;

