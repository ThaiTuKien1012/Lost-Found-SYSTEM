import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import { gsap } from 'gsap';
import lostItemService from '../api/lostItemService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiCalendar, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX,
  FiTrash2,
  FiImage,
  FiPhone,
  FiTag
} from 'react-icons/fi';
import { formatDate, getStatusLabel } from '../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../utils/constants';

const LostItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  const { data, loading, error, refetch } = useFetch(
    () => lostItemService.getReport(id),
    [id]
  );

  useEffect(() => {
    if (data?.success && data.data) {
      setFormData({
        itemName: data.data.itemName || '',
        description: data.data.description || '',
        category: data.data.category || '',
        color: data.data.color || '',
        dateLost: data.data.dateLost ? new Date(data.data.dateLost).toISOString().split('T')[0] : '',
        locationLost: data.data.locationLost || '',
        campus: data.data.campus || 'NVH',
        phone: data.data.phone || '',
        features: data.data.features || [],
        priority: data.data.priority || 'normal'
      });
    }
  }, [data]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      // Students can only update certain fields, not status or system fields
      const updateData = {
        itemName: formData.itemName,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        dateLost: formData.dateLost,
        locationLost: formData.locationLost,
        campus: formData.campus,
        phone: formData.phone,
        priority: formData.priority
      };

      const result = await lostItemService.updateReport(id, updateData);
      if (result.success) {
        showSuccess('Cập nhật báo cáo thành công!');
        setIsEditing(false);
        refetch();
      } else {
        showError(result.error?.message || result.error || 'Cập nhật thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      try {
        const result = await lostItemService.deleteReport(id);
        if (result.success) {
          showSuccess('Xóa báo cáo thành công!');
          navigate('/lost-items');
        } else {
          showError(result.error?.message || result.error || 'Xóa thất bại');
        }
      } catch (error) {
        showError('Có lỗi xảy ra khi xóa');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
      case 'verified':
        return { bg: '#DBEAFE', color: '#1E40AF', border: '#60A5FA' };
      case 'matched':
        return { bg: '#D1FAE5', color: '#065F46', border: '#34D399' };
      case 'returned':
        return { bg: '#E0E7FF', color: '#3730A3', border: '#818CF8' };
      default:
        return { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' };
    }
  };

  if (loading) {
    return (
      <div className="lost-item-detail-page">
        <AnimatedBackground intensity={0.1} />
        <div className="page-content">
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="lost-item-detail-page">
        <AnimatedBackground intensity={0.1} />
        <div className="page-content">
          <div className="error-enhanced">
            <p>{error || 'Không tìm thấy báo cáo'}</p>
            <Link to="/lost-items" className="btn-primary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const item = data.data;
  const statusColors = getStatusColor(item.status);

  return (
    <div ref={pageRef} className="lost-item-detail-page">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-content">
        <div ref={headerRef} className="detail-header">
          <Link to="/lost-items" className="back-button">
            <FiArrowLeft />
            <span>Quay lại</span>
          </Link>
          
          <div className="header-actions">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-edit"
                >
                  <FiEdit2 />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-delete"
                >
                  <FiTrash2 />
                  <span>Xóa</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  className="btn-save"
                >
                  <FiSave />
                  <span>Lưu</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    refetch();
                  }}
                  className="btn-cancel"
                >
                  <FiX />
                  <span>Hủy</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div ref={contentRef} className="detail-content">
          <div className="detail-card">
            {/* Image Section */}
            <div className="detail-image-section">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.itemName} className="detail-image" />
              ) : (
                <div className="detail-image-placeholder">
                  <FiImage size={64} />
                  <span>Không có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="detail-main">
              <div className="detail-title-section">
                <div className="title-wrapper">
                  <h1 className="detail-title">
                    {isEditing ? (
                      <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleInputChange}
                        className="edit-input title-input"
                      />
                    ) : (
                      item.itemName
                    )}
                  </h1>
                  {!isEditing && (
                    <div className="status-note">
                      <small>Trạng thái chỉ có thể thay đổi bởi nhân viên</small>
                    </div>
                  )}
                </div>
                <div className="detail-status-badge" style={{
                  backgroundColor: statusColors.bg,
                  color: statusColors.color,
                  borderColor: statusColors.border
                }}>
                  {getStatusLabel(item.status)}
                </div>
              </div>

              <div className="detail-description">
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="edit-input description-textarea"
                    rows="4"
                  />
                ) : (
                  <p>{item.description}</p>
                )}
              </div>

              {/* Meta Information */}
              <div className="detail-meta-grid">
                <div className="meta-item">
                  <FiTag className="meta-icon" />
                  <div className="meta-content">
                    <label>Loại</label>
                    {isEditing ? (
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="edit-input"
                      >
                        <option value="">Chọn loại</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{item.category}</span>
                    )}
                  </div>
                </div>

                <div className="meta-item">
                  <div className="meta-icon">🎨</div>
                  <div className="meta-content">
                    <label>Màu sắc</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span>{item.color}</span>
                    )}
                  </div>
                </div>

                <div className="meta-item">
                  <FiCalendar className="meta-icon" />
                  <div className="meta-content">
                    <label>Ngày mất</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateLost"
                        value={formData.dateLost}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span>{formatDate(item.dateLost)}</span>
                    )}
                  </div>
                </div>

                <div className="meta-item">
                  <FiMapPin className="meta-icon" />
                  <div className="meta-content">
                    <label>Địa điểm mất</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="locationLost"
                        value={formData.locationLost}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span>{item.locationLost}</span>
                    )}
                  </div>
                </div>

                <div className="meta-item">
                  <FiMapPin className="meta-icon" />
                  <div className="meta-content">
                    <label>Campus</label>
                    {isEditing ? (
                      <select
                        name="campus"
                        value={formData.campus}
                        onChange={handleInputChange}
                        className="edit-input"
                      >
                        {CAMPUSES.map(campus => (
                          <option key={campus.value} value={campus.value}>{campus.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{item.campus}</span>
                    )}
                  </div>
                </div>

                <div className="meta-item">
                  <FiPhone className="meta-icon" />
                  <div className="meta-content">
                    <label>Số điện thoại</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <span>{item.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="detail-additional">
                <div className="additional-item">
                  <strong>Report ID:</strong> {item.reportId}
                </div>
                <div className="additional-item">
                  <strong>Độ ưu tiên:</strong> {item.priority || 'normal'}
                </div>
                <div className="additional-item">
                  <strong>Lượt xem:</strong> {item.viewCount || 0}
                </div>
                <div className="additional-item">
                  <strong>Ngày tạo:</strong> {formatDate(item.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostItemDetailPage;

