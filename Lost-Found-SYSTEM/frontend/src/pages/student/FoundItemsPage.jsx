import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import foundItemService from '../../api/foundItemService';
import uploadService from '../../api/uploadService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiSearch, 
  FiPackage, 
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiImage,
  FiEye,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX
} from 'react-icons/fi';
import { formatDate, getStatusLabel, getStatusColor, getImageUrl } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES, CONDITIONS } from '../../utils/constants';

const FoundItemsPage = () => {
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: '',
    color: '',
    condition: 'good',
    campus: user?.campus || 'NVH',
    dateFound: new Date().toISOString().split('T')[0],
    locationFound: '',
    warehouseLocation: '',
    images: []
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const pageRef = useRef(null);
  const titleRef = useRef(null);
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

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    if (data?.data && data.data.length > 0) {
      itemsRef.current = new Array(data.data.length).fill(null);
      
      const timer = setTimeout(() => {
        const validRefs = itemsRef.current.filter(ref => ref !== null && ref !== undefined);
        if (validRefs.length > 0) {
          gsap.fromTo(validRefs,
            { opacity: 0, y: 30, rotationX: -15 },
            { 
              opacity: 1, 
              y: 0, 
              rotationX: 0, 
              duration: 0.5, 
              stagger: 0.08,
              ease: 'power3.out' 
            }
          );
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [data]);

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

  const handleSearch = async () => {
    if (!keyword.trim()) {
      refetch();
      return;
    }
    
    try {
      const result = await foundItemService.searchFoundItems(keyword, filters, page, 20);
      if (result.success) {
        refetch();
      }
    } catch (error) {
      console.error('Search error:', error);
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

  // Handle Create
  const handleCreate = () => {
    setFormData({
      itemName: '',
      description: '',
      category: '',
      color: '',
      condition: 'good',
      campus: user?.campus || 'NVH',
      dateFound: new Date().toISOString().split('T')[0],
      locationFound: '',
      warehouseLocation: '',
      images: []
    });
    setUploadedImages([]);
    setPreviewImages([]);
    setShowCreateModal(true);
  };

  // Handle Edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName || '',
      description: item.description || '',
      category: item.category || '',
      color: item.color || '',
      condition: item.condition || 'good',
      campus: item.campus || user?.campus || 'NVH',
      dateFound: item.dateFound ? new Date(item.dateFound).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      locationFound: item.locationFound || '',
      warehouseLocation: item.warehouseLocation || '',
      images: item.images || []
    });
    setUploadedImages(item.images || []);
    setPreviewImages([]);
    setShowEditModal(true);
  };

  // Handle Delete
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

  // Handle Image Upload
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Tạo preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previewUrls]);
    
    // Upload ngay
    handleImageUpload(files);
  };

  const handleImageUpload = async (files) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadImages(files);
      
      if (result.success && result.data?.urls) {
        setUploadedImages(prev => [...prev, ...result.data.urls]);
        
        // Xóa preview sau khi upload thành công
        setTimeout(() => {
          setPreviewImages(prev => {
            const startIndex = prev.length - files.length;
            files.forEach((_, index) => {
              if (prev[startIndex + index]) {
                URL.revokeObjectURL(prev[startIndex + index]);
              }
            });
            return prev.slice(0, startIndex);
          });
        }, 100);
        
        showSuccess(`Đã upload ${result.data.urls.length} hình ảnh thành công!`);
      } else {
        showError(result.error?.message || result.error || 'Upload hình ảnh thất bại');
        // Xóa preview khi lỗi
        const startIndex = previewImages.length - files.length;
        files.forEach((_, index) => {
          if (previewImages[startIndex + index]) {
            URL.revokeObjectURL(previewImages[startIndex + index]);
          }
        });
        setPreviewImages(prev => prev.slice(0, startIndex));
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Có lỗi xảy ra khi upload hình ảnh');
      const startIndex = previewImages.length - files.length;
      files.forEach((_, index) => {
        if (previewImages[startIndex + index]) {
          URL.revokeObjectURL(previewImages[startIndex + index]);
        }
      });
      setPreviewImages(prev => prev.slice(0, startIndex));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index, isPreview = false) => {
    if (isPreview) {
      const previewIndex = index;
      if (previewImages[previewIndex]) {
        URL.revokeObjectURL(previewImages[previewIndex]);
        setPreviewImages(prev => prev.filter((_, i) => i !== previewIndex));
      }
    } else {
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        images: uploadedImages
      };

      let result;
      if (showEditModal && editingItem) {
        result = await foundItemService.updateFoundItem(editingItem._id, submitData);
      } else {
        result = await foundItemService.createFoundItem(submitData);
      }

      if (result.success) {
        showSuccess(showEditModal ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingItem(null);
        setUploadedImages([]);
        setPreviewImages([]);
        refetch();
      } else {
        showError(result.error?.message || 'Thao tác thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra');
    }
  };

  const displayImages = [
    ...uploadedImages.map(url => ({ url, type: 'uploaded' })),
    ...previewImages.map(url => ({ url, type: 'preview' }))
  ];

  return (
    <div ref={pageRef} className="found-items-page-redesign">
      <AnimatedBackground intensity={0.08} />
      
      {/* Header */}
      <div className="page-header-redesign">
        <div className="title-wrapper-redesign">
          <div className="title-icon-wrapper">
            <FiCheckCircle className="title-icon-redesign" />
          </div>
          <div>
            <h1 ref={titleRef} className="page-title-redesign">Đồ Tìm Thấy</h1>
            <p className="page-subtitle">Danh sách các đồ vật đã được tìm thấy</p>
          </div>
        </div>
        <button onClick={handleCreate} className="btn-create-found-item">
          <FiPlus /> Tạo mới
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="found-items-controls-redesign">
        <div className="search-bar-redesign">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon-redesign" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input-redesign"
            />
            <button onClick={handleSearch} className="btn-search-redesign">
              Tìm kiếm
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-filter-redesign ${showFilters ? 'active' : ''}`}
        >
          <FiFilter /> {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel-redesign">
          <div className="filter-group-redesign">
            <label>Trạng thái:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="filter-select-redesign"
            >
              <option value="">Tất cả</option>
              <option value="unclaimed">Chưa nhận</option>
              <option value="returned">Đã trả</option>
              <option value="disposed">Đã hủy</option>
            </select>
          </div>

          <div className="filter-group-redesign">
            <label>Campus:</label>
            <select 
              value={campusFilter} 
              onChange={(e) => { setCampusFilter(e.target.value); setPage(1); }}
              className="filter-select-redesign"
            >
              <option value="">Tất cả</option>
              {CAMPUSES.map(campus => (
                <option key={campus.value} value={campus.value}>{campus.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group-redesign">
            <label>Danh mục:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="filter-select-redesign"
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
            className="btn-clear-filters-redesign"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Content */}
      <div className="found-items-content-redesign">
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
          <div className="empty-state-redesign">
            <FiPackage className="empty-icon-redesign" />
            <h3>Không tìm thấy đồ vật nào</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
        
        {data && data.data && data.data.length > 0 && (
          <div className="found-items-grid-redesign">
            {data.data.map((item, index) => (
              <div
                key={item._id}
                ref={el => itemsRef.current[index] = el}
                className="found-item-card-redesign"
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
              >
                {/* Image Section */}
                <div className="found-item-image-section-redesign">
                  {item.images && item.images.length > 0 ? (
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
                  <div 
                    className="found-item-status-badge-redesign" 
                    style={{ 
                      backgroundColor: getStatusColor(item.status).bg,
                      color: getStatusColor(item.status).color,
                      borderColor: getStatusColor(item.status).border
                    }}
                  >
                    {getStatusLabel(item.status)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="found-item-content-redesign">
                  <div className="found-item-header-redesign">
                    <h3 className="found-item-title-redesign">{item.itemName}</h3>
                    {item.foundId && (
                      <span className="found-item-id-redesign">#{item.foundId}</span>
                    )}
                  </div>

                  {item.description && (
                    <p className="found-item-description-redesign">{item.description}</p>
                  )}

                  <div className="found-item-meta-redesign">
                    <div className="meta-item-redesign">
                      <FiTag className="meta-icon-redesign" />
                      <span>{getCategoryLabel(item.category)}</span>
                    </div>
                    <div className="meta-item-redesign">
                      <FiMapPin className="meta-icon-redesign" />
                      <span>{getCampusLabel(item.campus)}</span>
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

                {/* Actions */}
                <div className="found-item-actions-redesign">
                  <Link 
                    to={`/found-items/${item._id}`}
                    className="btn-view-detail-redesign"
                  >
                    <FiEye /> Xem chi tiết
                  </Link>
                  <div className="action-buttons-group">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-edit-found-item"
                      title="Sửa"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn-delete-found-item"
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination && data.pagination.pages > 1 && (
          <div className="pagination-wrapper-redesign">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn-redesign"
            >
              Trước
            </button>
            <span className="pagination-info-redesign">
              Trang {data.pagination.page} / {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="pagination-btn-redesign"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay-redesign" onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingItem(null);
        }}>
          <div className="modal-content-redesign" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-redesign">
              <h2>{showEditModal ? 'Sửa Đồ Tìm Thấy' : 'Tạo Mới Đồ Tìm Thấy'}</h2>
              <button 
                className="modal-close-redesign"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="found-item-form-redesign">
              <div className="form-row-redesign">
                <div className="form-group-redesign">
                  <label>Tên đồ vật <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group-redesign">
                  <label>Danh mục <span className="required">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-redesign">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-row-redesign">
                <div className="form-group-redesign">
                  <label>Màu sắc</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>

                <div className="form-group-redesign">
                  <label>Tình trạng <span className="required">*</span></label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    required
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-redesign">
                <div className="form-group-redesign">
                  <label>Campus <span className="required">*</span></label>
                  <select
                    value={formData.campus}
                    onChange={(e) => setFormData({...formData, campus: e.target.value})}
                    required
                  >
                    {CAMPUSES.map(campus => (
                      <option key={campus.value} value={campus.value}>{campus.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-redesign">
                  <label>Ngày tìm thấy <span className="required">*</span></label>
                  <input
                    type="date"
                    value={formData.dateFound}
                    onChange={(e) => setFormData({...formData, dateFound: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group-redesign">
                <label>Vị trí tìm thấy</label>
                <input
                  type="text"
                  value={formData.locationFound}
                  onChange={(e) => setFormData({...formData, locationFound: e.target.value})}
                  placeholder="Ví dụ: Quầy tiếp tân, Thư viện..."
                />
              </div>

              <div className="form-group-redesign">
                <label>Vị trí kho lưu giữ</label>
                <input
                  type="text"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({...formData, warehouseLocation: e.target.value})}
                  placeholder="Ví dụ: Kệ A-01"
                />
              </div>

              <div className="form-group-redesign">
                <label>Hình ảnh</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={uploading}
                />
                {uploading && <p className="upload-status">Đang upload...</p>}
                
                {displayImages.length > 0 && (
                  <div className="image-preview-grid-redesign">
                    {displayImages.map((item, index) => {
                      const imageUrl = item.type === 'preview' 
                        ? item.url 
                        : getImageUrl(item.url);
                      return (
                        <div key={index} className="image-preview-item-redesign">
                          <img src={imageUrl} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, item.type === 'preview')}
                            className="btn-remove-image-redesign"
                          >
                            <FiX />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-footer-redesign">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="btn-cancel-redesign"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit-redesign"
                  disabled={uploading}
                >
                  {showEditModal ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoundItemsPage;

