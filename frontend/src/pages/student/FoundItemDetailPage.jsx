import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import foundItemService from '../../api/foundItemService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiCalendar, 
  FiMapPin, 
  FiImage,
  FiTag,
  FiUser,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';

const FoundItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  const { data, loading, error, refetch } = useFetch(
    () => foundItemService.getFoundItem(id),
    [id]
  );

  const [images, setImages] = useState([]);

  useEffect(() => {
    if (data?.success && data.data) {
      // Convert relative URLs to absolute URLs
      const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
      const imageUrls = (data.data.images || []).map(url => {
        if (!url) return null;
        // If URL already starts with http, use as is
        if (url.startsWith('http')) return url;
        // If URL starts with /, prepend BASE_URL
        if (url.startsWith('/')) return `${BASE_URL}${url}`;
        // Otherwise, assume it's relative to uploads
        return `${BASE_URL}/uploads/${url}`;
      }).filter(Boolean); // Remove null/empty values
      
      setImages(imageUrls);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'unclaimed':
        return { bg: '#F5F5F5', color: '#444444', border: '#D0D0D0', label: 'Chưa được nhận' };
      case 'claimed':
        return { bg: '#999999', color: '#FFFFFF', border: '#888888', label: 'Đã được nhận' };
      case 'returned':
        return { bg: '#E0E0E0', color: '#444444', border: '#BBBBBB', label: 'Đã trả lại' };
      default:
        return { bg: '#FAFAFA', color: '#444444', border: '#E0E0E0', label: status };
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


  if (loading) {
    return (
      <div className="found-item-detail-page">
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
      <div className="found-item-detail-page">
        <AnimatedBackground intensity={0.1} />
        <div className="page-content">
          <div className="error-enhanced">
            <p>{error || 'Không tìm thấy đồ vật'}</p>
            <button 
              onClick={() => navigate('/found-items/search')}
              className="btn-retry"
            >
              Quay lại tìm kiếm
            </button>
          </div>
        </div>
      </div>
    );
  }

  const item = data.data;
  const statusColors = getStatusColor(item.status);

  return (
    <div ref={pageRef} className="found-item-detail-page">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-content">
        <div ref={headerRef} className="detail-header">
          <button 
            onClick={() => navigate('/found-items/search')}
            className="back-button"
          >
            <FiArrowLeft />
            <span>Quay lại</span>
          </button>
        </div>

        <div ref={contentRef} className="detail-content">
          <div className="detail-card">
            {/* Image Section */}
            <div className="detail-image-section">
              {images.length > 0 ? (
                <div className="image-gallery">
                  {images.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`${item.itemName} - ${index + 1}`} 
                      className="detail-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ))}
                </div>
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
                  <h1 className="detail-title">{item.itemName}</h1>
                </div>
                <div className="detail-status-badge" style={{
                  backgroundColor: statusColors.bg,
                  color: statusColors.color,
                  borderColor: statusColors.border
                }}>
                  {statusColors.label}
                </div>
              </div>

              <div className="detail-description">
                <p>{item.description || 'Không có mô tả'}</p>
              </div>

              {/* Meta Information */}
              <div className="detail-meta-grid">
                <div className="meta-item">
                  <FiTag className="meta-icon" />
                  <div className="meta-content">
                    <label>Loại</label>
                    <span>{getCategoryLabel(item.category)}</span>
                  </div>
                </div>

                <div className="meta-item">
                  <div className="meta-icon">🎨</div>
                  <div className="meta-content">
                    <label>Màu sắc</label>
                    <span>{item.color || 'N/A'}</span>
                  </div>
                </div>

                <div className="meta-item">
                  <FiCalendar className="meta-icon" />
                  <div className="meta-content">
                    <label>Ngày tìm thấy</label>
                    <span>{formatDate(item.dateFound)}</span>
                  </div>
                </div>

                <div className="meta-item">
                  <FiMapPin className="meta-icon" />
                  <div className="meta-content">
                    <label>Địa điểm tìm thấy</label>
                    <span>{item.locationFound || 'N/A'}</span>
                  </div>
                </div>

                <div className="meta-item">
                  <FiMapPin className="meta-icon" />
                  <div className="meta-content">
                    <label>Campus</label>
                    <span>{getCampusLabel(item.campus)}</span>
                  </div>
                </div>

                {item.foundBy && (
                  <div className="meta-item">
                    <FiUser className="meta-icon" />
                    <div className="meta-content">
                      <label>Người tìm thấy</label>
                      <span>{item.foundBy.name || item.foundBy.email || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information (if available) */}
              {item.foundBy && (item.foundBy.email || item.foundBy.phone) && (
                <div className="detail-contact-section">
                  <h3 className="section-title">Thông tin liên hệ</h3>
                  <div className="contact-info">
                    {item.foundBy.email && (
                      <div className="contact-item">
                        <FiMail className="contact-icon" />
                        <span>{item.foundBy.email}</span>
                      </div>
                    )}
                    {item.foundBy.phone && (
                      <div className="contact-item">
                        <FiPhone className="contact-icon" />
                        <span>{item.foundBy.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="detail-additional">
                <div className="additional-item">
                  <strong>Found ID:</strong> {item.foundId || item._id}
                </div>
                {item.createdAt && (
                  <div className="additional-item">
                    <strong>Ngày tạo:</strong> {formatDate(item.createdAt)}
                  </div>
                )}
                {item.updatedAt && (
                  <div className="additional-item">
                    <strong>Cập nhật lần cuối:</strong> {formatDate(item.updatedAt)}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FoundItemDetailPage;

