import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import returnService from '../../api/returnService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiClock, 
  FiCalendar, 
  FiMapPin, 
  FiFilter, 
  FiUser, 
  FiPackage, 
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiGrid,
  FiList,
  FiTag,
  FiImage
} from 'react-icons/fi';
import { formatDate, getStatusLabel, getStatusColor, getImageUrl } from '../../utils/helpers';
import { CAMPUSES } from '../../utils/constants';

const ReturnsManagementPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const statsRef = useRef([]);
  const itemsRef = useRef([]);
  const searchRef = useRef(null);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(campusFilter && { campus: campusFilter }),
    ...(dateFilter && { date: dateFilter })
  };

  const { data, loading, error, refetch } = useFetch(
    () => returnService.getReturns(page, 20, filters),
    [page, statusFilter, campusFilter, dateFilter]
  );

  // Fetch all returns for statistics
  const { data: statsData } = useFetch(
    () => returnService.getReturns(1, 1000, {}),
    []
  );

  useEffect(() => {
    if (!titleRef.current) return;
    
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  useEffect(() => {
    if (!statsData?.data || statsRef.current.length === 0) return;

    const timer = setTimeout(() => {
      const validRefs = statsRef.current.filter(ref => ref !== null && ref !== undefined);
      if (validRefs.length > 0) {
        gsap.fromTo(validRefs,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [statsData]);

  useEffect(() => {
    if (!data?.data || data.data.length === 0) {
      itemsRef.current = [];
      return;
    }

    itemsRef.current = new Array(data.data.length).fill(null);

    const timer = setTimeout(() => {
      const validRefs = itemsRef.current.filter(ref => ref !== null && ref !== undefined);
      if (validRefs.length > 0) {
        gsap.fromTo(validRefs,
          { opacity: 0, y: 30, rotationX: -15 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  const calculateStats = () => {
    if (!statsData?.data) return { total: 0, completed: 0, pending: 0, failed: 0 };
    
    const transactions = statsData.data;
    return {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      failed: transactions.filter(t => t.status === 'failed').length
    };
  };

  const stats = calculateStats();

  const handleSearch = async () => {
    if (!keyword.trim()) {
      refetch();
      return;
    }
    
    // Search functionality can be implemented here
    refetch();
  };

  const handleCardHover = (index, isHovering) => {
    const card = itemsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      scale: isHovering ? 1.02 : 1,
      y: isHovering ? -8 : 0,
      rotationY: isHovering ? 2 : 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const getCampusLabel = (campus) => {
    const camp = CAMPUSES.find(c => c.value === campus);
    return camp ? camp.label : campus;
  };

  const getCategoryLabel = (category) => {
    // Simple category label mapping
    const categoryMap = {
      'PHONE': 'Điện thoại',
      'WALLET': 'Ví/Bóp',
      'BAG': 'Túi xách',
      'LAPTOP': 'Laptop',
      'WATCH': 'Đồng hồ',
      'BOOK': 'Sách',
      'KEYS': 'Chìa khóa',
      'OTHER': 'Khác'
    };
    return categoryMap[category] || category;
  };

  return (
    <div ref={pageRef} className="returns-management-page">
      <AnimatedBackground intensity={0.08} />
      
      {/* Header */}
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiClock className="title-icon" />
          <h1 ref={titleRef} className="page-title">Quản Lý Trả Đồ</h1>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="found-items-stats-section">
        <div 
          ref={el => statsRef.current[0] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
        </div>

        <div 
          ref={el => statsRef.current[1] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Đang xử lý</span>
          </div>
        </div>

        <div 
          ref={el => statsRef.current[2] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiXCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.failed}</span>
            <span className="stat-label">Thất bại</span>
          </div>
        </div>

        <div 
          ref={el => statsRef.current[3] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng giao dịch</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="found-items-controls">
        <div className="search-bar-wrapper">
          <div className="search-input-group">
            <FiSearch className="search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm kiếm theo mã GD, tên sinh viên, đồ vật..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="btn-search">
              <FiSearch /> Tìm kiếm
            </button>
          </div>
        </div>

        <div className="controls-right">
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Xem dạng lưới"
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Xem dạng bảng"
            >
              <FiList />
            </button>
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-filter ${showFilters ? 'active' : ''}`}
          >
            <FiFilter /> {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Campus:</label>
            <select 
              value={campusFilter} 
              onChange={(e) => { setCampusFilter(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              {CAMPUSES.map(campus => (
                <option key={campus.value} value={campus.value}>{campus.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ngày:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="filter-input"
            />
          </div>

          <button 
            onClick={() => {
              setStatusFilter('');
              setCampusFilter('');
              setDateFilter('');
              setPage(1);
            }}
            className="btn-clear-filters"
          >
            <FiXCircle /> Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Transactions Content */}
      <div className="found-items-content">
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

        {data && data.data && data.data.length === 0 && (
          <div className="empty-state">
            <FiClock className="empty-icon" />
            <p>Không tìm thấy giao dịch trả đồ nào</p>
          </div>
        )}

        {data && data.data && data.data.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="found-items-grid">
                {data.data.map((transaction, index) => {
                  const statusColors = getStatusColor(transaction.status);
                  return (
                    <div
                      key={transaction._id || transaction.transactionId}
                      ref={el => itemsRef.current[index] = el}
                      className="found-item-card"
                      onMouseEnter={() => handleCardHover(index, true)}
                      onMouseLeave={() => handleCardHover(index, false)}
                    >
                      {/* Image Section */}
                      <div className="found-item-image-wrapper">
                        {transaction.foundItem?.images && transaction.foundItem.images.length > 0 ? (
                          <img 
                            src={getImageUrl(transaction.foundItem.images[0])} 
                            alt={transaction.foundItem.itemName || 'Đồ vật'}
                            className="found-item-image"
                          />
                        ) : (
                          <div className="found-item-image-placeholder">
                            <FiImage className="placeholder-icon" />
                          </div>
                        )}
                        <div 
                          className="found-item-status-badge" 
                          style={{ 
                            backgroundColor: statusColors.bg,
                            color: statusColors.color
                          }}
                        >
                          {getStatusLabel(transaction.status)}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="found-item-content">
                        <div className="found-item-header">
                          <h3 className="found-item-title">
                            {transaction.foundItem?.itemName || 'Đồ vật không xác định'}
                          </h3>
                          <span className="found-item-id">
                            {transaction.transactionId || `#${transaction._id?.slice(-6)}`}
                          </span>
                        </div>

                        <div className="found-item-meta">
                          <div className="meta-item">
                            <FiUser className="meta-icon" />
                            <span>
                              {transaction.student 
                                ? `${transaction.student.firstName} ${transaction.student.lastName}`
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="meta-item">
                            <FiMapPin className="meta-icon" />
                            <span>{getCampusLabel(transaction.campus)}</span>
                          </div>
                          <div className="meta-item">
                            <FiCalendar className="meta-icon" />
                            <span>
                              {transaction.returnedDate 
                                ? formatDate(transaction.returnedDate)
                                : 'N/A'}
                            </span>
                          </div>
                          {transaction.foundItem?.category && (
                            <div className="meta-item">
                              <FiTag className="meta-icon" />
                              <span>{getCategoryLabel(transaction.foundItem.category)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="found-item-actions">
                        <Link 
                          to={`/returns/${transaction.transactionId || transaction._id}`}
                          className="btn-action btn-view"
                        >
                          <FiEye /> Chi tiết
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="found-items-table-wrapper">
                <table className="found-items-table">
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Mã GD</th>
                      <th>Đồ vật</th>
                      <th>Sinh viên</th>
                      <th>Campus</th>
                      <th>Ngày trả</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((transaction, index) => {
                      const statusColors = getStatusColor(transaction.status);
                      return (
                        <tr
                          key={transaction._id || transaction.transactionId}
                          ref={el => itemsRef.current[index] = el}
                        >
                          <td>
                            <div className="table-image-cell">
                              {transaction.foundItem?.images && transaction.foundItem.images.length > 0 ? (
                                <img 
                                  src={getImageUrl(transaction.foundItem.images[0])} 
                                  alt={transaction.foundItem.itemName || 'Đồ vật'}
                                  className="table-image"
                                />
                              ) : (
                                <div className="table-image-placeholder">
                                  <FiImage />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="table-id">
                              {transaction.transactionId || `#${transaction._id?.slice(-6)}`}
                            </span>
                          </td>
                          <td>
                            <div className="table-item-name">
                              <strong>{transaction.foundItem?.itemName || 'N/A'}</strong>
                              {transaction.foundItem?.category && (
                                <span className="table-description">
                                  {getCategoryLabel(transaction.foundItem.category)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="table-campus">
                              {transaction.student 
                                ? `${transaction.student.firstName} ${transaction.student.lastName}`
                                : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className="table-campus">{getCampusLabel(transaction.campus)}</span>
                          </td>
                          <td>
                            <span className="table-date">
                              {transaction.returnedDate 
                                ? formatDate(transaction.returnedDate)
                                : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span 
                              className="table-status-badge"
                              style={{ 
                                backgroundColor: statusColors.bg,
                                color: statusColors.color
                              }}
                            >
                              {getStatusLabel(transaction.status)}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <Link 
                                to={`/returns/${transaction.transactionId || transaction._id}`}
                                className="btn-action-table btn-view-table"
                                title="Xem chi tiết"
                              >
                                <FiEye />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {data && data.pagination && data.pagination.pages > 1 && (
          <div className="pagination-wrapper">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              Trước
            </button>
            <span className="pagination-info">
              Trang {data.pagination.page} / {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="pagination-btn"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnsManagementPage;
