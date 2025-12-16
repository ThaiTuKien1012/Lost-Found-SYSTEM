import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import foundItemService from '../../api/foundItemService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiPackage, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiImage,
  FiTrendingUp,
  FiClock,
  FiGrid,
  FiList,
  FiDownload
} from 'react-icons/fi';
import { formatDate, getStatusLabel, getStatusColor, getImageUrl } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';

const FoundItemsManagementPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const statsRef = useRef([]);
  const itemsRef = useRef([]);
  const searchRef = useRef(null);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(campusFilter && { campus: campusFilter }),
    ...(categoryFilter && { category: categoryFilter })
  };

  const { data, loading, error, refetch } = useFetch(
    () => foundItemService.getFoundItems(page, 20, filters),
    [page, statusFilter, campusFilter, categoryFilter]
  );

  // Fetch statistics
  const { data: statsData } = useFetch(
    () => foundItemService.getFoundItems(1, 1000, {}),
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
    if (!statsData?.data) return { total: 0, unclaimed: 0, returned: 0, disposed: 0 };
    
    const items = statsData.data;
    return {
      total: items.length,
      unclaimed: items.filter(item => item.status === 'unclaimed').length,
      returned: items.filter(item => item.status === 'returned').length,
      disposed: items.filter(item => item.status === 'disposed').length
    };
  };

  const stats = calculateStats();

  const handleSearch = async () => {
    if (!keyword.trim()) {
      refetch();
      return;
    }
    
    try {
      const result = await foundItemService.searchFoundItems(keyword, filters, page, 20);
      if (result.success) {
        refetch();
      } else {
        showError(result.error?.message || 'Tìm kiếm thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi tìm kiếm');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đồ vật này?')) return;

    try {
      const result = await foundItemService.deleteFoundItem(itemId);
      if (result.success) {
        showSuccess('Đã xóa đồ vật thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xóa thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa');
    }
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

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCampusLabel = (campus) => {
    const camp = CAMPUSES.find(c => c.value === campus);
    return camp ? camp.label : campus;
  };

  return (
    <div ref={pageRef} className="found-items-management-page">
      <AnimatedBackground intensity={0.08} />
      
      {/* Header */}
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiPackage className="title-icon" />
          <h1 ref={titleRef} className="page-title">Quản Lý Đồ Tìm Thấy</h1>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="found-items-stats-section">
        <div 
          ref={el => statsRef.current[0] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng số đồ vật</span>
          </div>
        </div>

        <div 
          ref={el => statsRef.current[1] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.unclaimed}</span>
            <span className="stat-label">Chưa nhận</span>
          </div>
        </div>

        <div 
          ref={el => statsRef.current[2] = el}
          className="stat-card-found"
        >
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.returned}</span>
            <span className="stat-label">Đã trả</span>
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
              placeholder="Tìm kiếm theo tên, mô tả, ID..."
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
              <option value="unclaimed">Chưa nhận</option>
              <option value="returned">Đã trả</option>
              <option value="disposed">Đã hủy</option>
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
            <label>Danh mục:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              setStatusFilter('');
              setCampusFilter('');
              setCategoryFilter('');
              setPage(1);
            }}
            className="btn-clear-filters"
          >
            <FiXCircle /> Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Items Grid */}
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
            <FiPackage className="empty-icon" />
            <p>Không tìm thấy đồ vật nào</p>
          </div>
        )}

        {data && data.data && data.data.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="found-items-grid">
                {data.data.map((item, index) => (
                  <div
                    key={item._id}
                    ref={el => itemsRef.current[index] = el}
                    className="found-item-card"
                    onMouseEnter={() => handleCardHover(index, true)}
                    onMouseLeave={() => handleCardHover(index, false)}
                  >
                    {/* Image Section */}
                    <div className="found-item-image-wrapper">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={getImageUrl(item.images[0])} 
                          alt={item.itemName}
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
                          backgroundColor: getStatusColor(item.status).bg,
                          color: getStatusColor(item.status).color
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="found-item-content">
                      <div className="found-item-header">
                        <h3 className="found-item-title">{item.itemName}</h3>
                        <span className="found-item-id">{item.foundId || `#${item._id.slice(-6)}`}</span>
                      </div>

                      <p className="found-item-description">{item.description}</p>

                      <div className="found-item-meta">
                        <div className="meta-item">
                          <FiTag className="meta-icon" />
                          <span>{getCategoryLabel(item.category)}</span>
                        </div>
                        <div className="meta-item">
                          <FiMapPin className="meta-icon" />
                          <span>{getCampusLabel(item.campus)}</span>
                        </div>
                        <div className="meta-item">
                          <FiCalendar className="meta-icon" />
                          <span>{formatDate(item.dateFound)}</span>
                        </div>
                      </div>

                      {item.locationFound && (
                        <div className="found-item-location">
                          <FiMapPin className="location-icon" />
                          <span>{item.locationFound}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="found-item-actions">
                      <Link 
                        to={`/found-items/${item._id}`}
                        className="btn-action btn-view"
                      >
                        <FiEye /> Chi tiết
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn-action btn-delete"
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="found-items-table-wrapper">
                <table className="found-items-table">
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên đồ vật</th>
                      <th>ID</th>
                      <th>Danh mục</th>
                      <th>Campus</th>
                      <th>Trạng thái</th>
                      <th>Ngày tìm thấy</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((item, index) => (
                      <tr
                        key={item._id}
                        ref={el => itemsRef.current[index] = el}
                      >
                        <td>
                          <div className="table-image-cell">
                            {item.images && item.images.length > 0 ? (
                              <img 
                                src={getImageUrl(item.images[0])} 
                                alt={item.itemName}
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
                          <div className="table-item-name">
                            <strong>{item.itemName}</strong>
                            {item.description && (
                              <span className="table-description">{item.description.substring(0, 50)}...</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="table-id">{item.foundId || `#${item._id.slice(-6)}`}</span>
                        </td>
                        <td>
                          <span className="table-category">{getCategoryLabel(item.category)}</span>
                        </td>
                        <td>
                          <span className="table-campus">{getCampusLabel(item.campus)}</span>
                        </td>
                        <td>
                          <span 
                            className="table-status-badge"
                            style={{ 
                              backgroundColor: getStatusColor(item.status).bg,
                              color: getStatusColor(item.status).color
                            }}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td>
                          <span className="table-date">{formatDate(item.dateFound)}</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link 
                              to={`/found-items/${item._id}`}
                              className="btn-action-table btn-view-table"
                              title="Xem chi tiết"
                            >
                              <FiEye />
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="btn-action-table btn-delete-table"
                              title="Xóa"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default FoundItemsManagementPage;

