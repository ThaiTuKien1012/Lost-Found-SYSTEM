import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import lostItemService from '../api/lostItemService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { FiPackage, FiSearch, FiCheckCircle, FiXCircle, FiTrash2, FiFilter, FiEye } from 'react-icons/fi';
import { formatDate, getStatusLabel, getStatusColor } from '../utils/helpers';

const LostItemsManagementPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const itemsRef = useRef([]);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(campusFilter && { campus: campusFilter }),
    ...(categoryFilter && { category: categoryFilter })
  };

  const { data, loading, error, refetch } = useFetch(
    () => lostItemService.getAllReports(page, 20, filters),
    [page, statusFilter, campusFilter, categoryFilter]
  );

  useEffect(() => {
    if (!titleRef.current) return;
    
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  // Separate effect for animating items when data changes
  useEffect(() => {
    if (!data?.data || data.data.length === 0) {
      itemsRef.current = [];
      return;
    }

    // Reset refs array to match new data length
    itemsRef.current = new Array(data.data.length).fill(null);

    // Wait for DOM to update before animating
    const timer = setTimeout(() => {
      const validRefs = itemsRef.current.filter(ref => ref !== null && ref !== undefined);
      if (validRefs.length > 0) {
        gsap.fromTo(validRefs,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      refetch();
      return;
    }
    
    try {
      const result = await lostItemService.searchReports(keyword, filters, page, 20);
      if (result.success) {
        // Update data manually
        refetch();
      } else {
        showError(result.error?.message || 'Tìm kiếm thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi tìm kiếm');
    }
  };

  const handleVerify = async (reportId) => {
    if (!window.confirm('Xác nhận xác minh báo cáo này?')) return;

    try {
      const result = await lostItemService.verifyReport(reportId, {});
      if (result.success) {
        showSuccess('Đã xác minh báo cáo thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xác minh thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xác minh');
    }
  };

  const handleReject = async (reportId) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason || reason.trim() === '') {
      return; // User cancelled or entered empty string
    }

    try {
      const result = await lostItemService.rejectReport(reportId, reason.trim());
      if (result?.success) {
        showSuccess('Đã từ chối báo cáo!');
        refetch();
      } else {
        showError(result?.error?.message || result?.error || 'Từ chối thất bại');
      }
    } catch (error) {
      console.error('Reject error:', error);
      showError(error?.message || 'Có lỗi xảy ra khi từ chối');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return;

    try {
      const result = await lostItemService.deleteReport(reportId);
      if (result.success) {
        showSuccess('Đã xóa báo cáo thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xóa thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa');
    }
  };

  return (
    <div ref={pageRef} className="lost-items-management-page">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiPackage className="title-icon" />
          <h1 ref={titleRef} className="page-title">Quản Lý Báo Mất</h1>
        </div>
      </div>

      <div className="content-container-enhanced">
        {/* Search and Filters */}
        <div ref={searchRef} className="search-filters-section">
          <div className="search-bar">
            <div className="search-input-group">
              <FiSearch className="search-icon" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm theo tên, mô tả..."
                className="search-input"
              />
              <button onClick={handleSearch} className="btn-search">
                Tìm kiếm
              </button>
            </div>
          </div>

          <div className="filters-group">
            <div className="filter-item">
              <label>Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác minh</option>
                <option value="verified">Đã xác minh</option>
                <option value="rejected">Đã từ chối</option>
                <option value="matched">Đã khớp</option>
                <option value="returned">Đã trả</option>
              </select>
            </div>

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
              <label>Loại</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Tất cả</option>
                <option value="PHONE">Điện thoại</option>
                <option value="WALLET">Ví</option>
                <option value="BAG">Túi</option>
                <option value="LAPTOP">Laptop</option>
                <option value="WATCH">Đồng hồ</option>
                <option value="BOOK">Sách</option>
                <option value="KEYS">Chìa khóa</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {(statusFilter || campusFilter || categoryFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCampusFilter('');
                  setCategoryFilter('');
                }}
                className="btn-clear-filters"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Reports List */}
        {loading && (
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="error-enhanced">
            <p>{typeof error === 'object' ? (error.message || error.code || JSON.stringify(error)) : error}</p>
          </div>
        )}

        {data && (
          <>
            {data.data?.length === 0 ? (
              <div className="empty-state-enhanced">
                <FiPackage className="empty-icon" />
                <p>Không có báo cáo nào</p>
              </div>
            ) : (
              <>
                <div className="reports-list-enhanced">
                  {data.data?.map((report, index) => {
                    const statusColors = getStatusColor(report.status);
                    return (
                      <div
                        key={report._id}
                        ref={el => {
                          if (el) {
                            itemsRef.current[index] = el;
                          }
                        }}
                        className="report-card-enhanced"
                      >
                        <div className="report-header">
                          <div className="report-title-section">
                            <h3 className="report-title">{report.itemName}</h3>
                            <span className="report-id">ID: {report.reportId}</span>
                          </div>
                          <div
                            className="status-badge clickable-status-badge"
                            onClick={() => {
                              setStatusFilter(report.status);
                              setPage(1);
                            }}
                            title={`Click để lọc theo trạng thái: ${getStatusLabel(report.status)}`}
                            style={{
                              backgroundColor: statusColors.bg,
                              color: statusColors.color,
                              borderColor: statusColors.border,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {getStatusLabel(report.status)}
                          </div>
                        </div>

                        <div className="report-body">
                          <p className="report-description">{report.description}</p>
                          <div className="report-meta">
                            <span 
                              className="meta-item clickable-meta"
                              onClick={() => {
                                setCategoryFilter(report.category);
                                setPage(1);
                              }}
                              title={`Click để lọc theo loại: ${report.category}`}
                            >
                              <FiPackage /> {report.category}
                            </span>
                            <span 
                              className="meta-item clickable-meta"
                              onClick={() => {
                                setCampusFilter(report.campus);
                                setPage(1);
                              }}
                              title={`Click để lọc theo campus: ${report.campus}`}
                            >
                              📍 {report.campus}
                            </span>
                            <span className="meta-item">
                              📅 {formatDate(report.dateLost)}
                            </span>
                          </div>
                        </div>

                        <div className="report-actions">
                          <Link
                            to={`/lost-items/${report._id}`}
                            state={{ from: '/lost-items/management' }}
                            className="btn-action btn-view"
                          >
                            <FiEye />
                            Xem chi tiết
                          </Link>
                          
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerify(report._id)}
                                className="btn-action btn-verify"
                              >
                                <FiCheckCircle />
                                Xác minh
                              </button>
                              <button
                                onClick={() => handleReject(report._id)}
                                className="btn-action btn-reject"
                              >
                                <FiXCircle />
                                Từ chối
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="btn-action btn-delete"
                          >
                            <FiTrash2 />
                            Xóa
                          </button>
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

export default LostItemsManagementPage;

