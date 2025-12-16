import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import foundItemService from '../../api/foundItemService';
import FoundItemForm from '../../components/found-items/FoundItemForm';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiImage,
  FiPackage,
  FiList,
  FiPlus,
  FiX
} from 'react-icons/fi';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';

const SecurityFoundItemsListPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('unclaimed');
  const [campusFilter, setCampusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const itemsRef = useRef([]);
  const buttonRef = useRef(null);
  const formContainerRef = useRef(null);

  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(campusFilter && { campus: campusFilter }),
    ...(categoryFilter && { category: categoryFilter })
  };

  const { data, loading, error, refetch } = useFetch(
    () => foundItemService.getFoundItems(page, 20, filters),
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

  useEffect(() => {
    if (showForm && formContainerRef.current) {
      gsap.fromTo(formContainerRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [showForm]);

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
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đồ này?')) return;
    
    try {
      const result = await foundItemService.deleteFoundItem(itemId);
      if (result.success) {
        showSuccess('Đã xóa đồ tìm thấy thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xóa đồ tìm thấy thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa đồ tìm thấy');
    }
  };

  const handleCreateFoundItem = async (formData) => {
    try {
      const result = await foundItemService.createFoundItem(formData);
      if (result.success) {
        showSuccess('Đã thêm đồ tìm thấy thành công!');
        
        // Animate form out
        if (formContainerRef.current) {
          gsap.to(formContainerRef.current, {
            opacity: 0,
            y: -20,
            scale: 0.95,
            duration: 0.3,
            onComplete: () => {
              setShowForm(false);
              refetch();
            }
          });
        } else {
          setShowForm(false);
          refetch();
        }
        return true;
      } else {
        showError(result.error?.message || result.error || 'Thêm đồ tìm thấy thất bại');
        return false;
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi thêm đồ tìm thấy');
      return false;
    }
  };

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCampusLabel = (campus) => {
    const camp = CAMPUSES.find(c => c.value === campus);
    return camp ? camp.label : campus;
  };

  const filteredItems = data?.data?.filter(item => {
    if (!keyword) return true;
    const searchTerm = keyword.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.foundId?.toLowerCase().includes(searchTerm)
    );
  }) || [];

  if (loading) {
    return (
      <div className="page-container">
        <AnimatedBackground />
        <div className="page-content">
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || error?.code || 'Có lỗi xảy ra');
    return (
      <div className="page-container">
        <AnimatedBackground />
        <div className="page-content">
          <div className="error-enhanced">
            <p>{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" ref={pageRef}>
      <AnimatedBackground />
      <div className="page-content">
        <div className="page-header-enhanced">
          <div className="header-content">
            <div className="title-wrapper">
              <FiList className="title-icon" />
              <div>
                <h1 className="page-title" ref={titleRef}>Danh Sách Đồ Tìm Thấy</h1>
                <p className="page-subtitle">Quản lý và xem danh sách đồ vật tìm thấy</p>
              </div>
            </div>
            <button
              ref={buttonRef}
              onClick={() => setShowForm(!showForm)}
              className="btn-create-enhanced"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { scale: 1.05, rotation: showForm ? 0 : 5, duration: 0.2 });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { scale: 1, rotation: 0, duration: 0.2 });
              }}
            >
              {showForm ? (
                <>
                  <FiX />
                  <span>Đóng Form</span>
                </>
              ) : (
                <>
                  <FiPlus />
                  <span>Nhập Đồ Tìm Thấy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div 
            ref={formContainerRef}
            className="form-container-enhanced"
          >
            <FoundItemForm onSubmit={handleCreateFoundItem} />
          </div>
        )}

        {/* Search and Filters */}
        <div className="found-items-controls-redesign">
          <div className="search-bar-redesign">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon-redesign" />
              <input
                type="text"
                className="search-input-redesign"
                placeholder="Tìm kiếm theo tên, mô tả, ID..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          
          <button
            className={`btn-filter-redesign ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Ẩn Bộ Lọc' : 'Bộ Lọc'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel-redesign">
            <div className="filter-group-redesign">
              <label>Trạng Thái</label>
              <select
                className="filter-select-redesign"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="unclaimed">Chưa được nhận</option>
                <option value="claimed">Đã được nhận</option>
              </select>
            </div>

            <div className="filter-group-redesign">
              <label>Campus</label>
              <select
                className="filter-select-redesign"
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {CAMPUSES.map(campus => (
                  <option key={campus.value} value={campus.value}>{campus.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group-redesign">
              <label>Loại Đồ</label>
              <select
                className="filter-select-redesign"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <button
              className="btn-clear-filters-redesign"
              onClick={() => {
                setStatusFilter('unclaimed');
                setCampusFilter('');
                setCategoryFilter('');
              }}
            >
              Xóa Bộ Lọc
            </button>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="empty-state-redesign">
            <FiPackage className="empty-icon-redesign" />
            <h3>Chưa có đồ tìm thấy</h3>
            <p>Danh sách trống hoặc không tìm thấy kết quả phù hợp</p>
          </div>
        ) : (
          <>
            <div className="found-items-grid-redesign">
              {filteredItems.map((item, index) => (
                <div
                  key={item._id}
                  ref={el => itemsRef.current[index] = el}
                  className="found-item-card-redesign"
                >
                  <div className="found-item-image-section-redesign">
                    {item.images?.[0] ? (
                      <img
                        src={getImageUrl(item.images[0])}
                        alt={item.itemName}
                        className="found-item-image-redesign"
                      />
                    ) : (
                      <div className="found-item-image-placeholder-redesign">
                        <FiImage className="placeholder-icon-redesign" />
                      </div>
                    )}
                    <div className="found-item-status-badge-redesign" style={{
                      background: item.status === 'unclaimed' ? '#F59E0B' : '#10B981',
                      color: 'white'
                    }}>
                      {item.status === 'unclaimed' ? 'Chưa nhận' : 'Đã nhận'}
                    </div>
                  </div>

                  <div className="found-item-content-redesign">
                    <div className="found-item-header-redesign">
                      <h3 className="found-item-title-redesign">{item.itemName}</h3>
                      <span className="found-item-id-redesign">#{item.foundId}</span>
                    </div>

                    <p className="found-item-description-redesign">{item.description}</p>

                    <div className="found-item-meta-redesign">
                      <div className="meta-item-redesign">
                        <FiTag className="meta-icon-redesign" />
                        <span>{getCategoryLabel(item.category)}</span>
                      </div>
                      <div className="meta-item-redesign">
                        <FiPackage className="meta-icon-redesign" />
                        <span>{item.color}</span>
                      </div>
                      <div className="meta-item-redesign">
                        <FiCalendar className="meta-icon-redesign" />
                        <span>{formatDate(item.dateFound)}</span>
                      </div>
                    </div>

                    {item.locationFound && (
                      <div className="found-item-location-redesign">
                        <FiMapPin className="location-icon-redesign" />
                        <span>{item.locationFound}</span>
                      </div>
                    )}
                  </div>

                  <div className="found-item-actions-redesign">
                    <button
                      className="btn-view-detail-redesign"
                      onClick={() => window.open(`/found-items/${item._id}`, '_blank')}
                    >
                      <FiEye /> Xem Chi Tiết
                    </button>
                    <div className="action-buttons-group">
                      <button
                        className="btn-edit-found-item"
                        onClick={() => window.open(`/found-items/${item._id}`, '_blank')}
                      >
                        <FiEdit /> Sửa
                      </button>
                      <button
                        className="btn-delete-found-item"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="pagination-wrapper-redesign">
                <button
                  className="pagination-btn-redesign"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </button>
                <span className="pagination-info-redesign">
                  Trang {page} / {data.pagination.totalPages}
                </span>
                <button
                  className="pagination-btn-redesign"
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityFoundItemsListPage;

