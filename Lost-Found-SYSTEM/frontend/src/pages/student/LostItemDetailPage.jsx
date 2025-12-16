import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import lostItemService from '../../api/lostItemService';
import uploadService from '../../api/uploadService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
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
  FiTag,
  FiUpload,
  FiXCircle
} from 'react-icons/fi';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';

const LostItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return path from location state or default to /lost-items
  const returnPath = location.state?.from || '/lost-items';
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]); // Local preview before upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
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
      // Convert relative URLs to absolute URLs
      // Static files are served from base URL, not API URL
      const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
      const imageUrls = (data.data.images || []).map(url => {
        if (!url) return null;
        // If URL already starts with http, use as is
        if (url.startsWith('http')) return url;
        // If URL starts with /, prepend BASE_URL (not API_URL)
        if (url.startsWith('/')) return `${BASE_URL}${url}`;
        // Otherwise, assume it's relative to uploads
        return `${BASE_URL}/uploads/${url}`;
      }).filter(Boolean); // Remove null/empty values
      
      console.log('📸 Loaded images from API:', data.data.images);
      console.log('🔗 Converted image URLs:', imageUrls);
      console.log('📊 Images state will be set to:', imageUrls);
      
      setImages(imageUrls);
      setPreviewImages([]); // Clear preview when loading new data
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

  // Debug: Log when images state changes
  useEffect(() => {
    console.log('🔄 Images state changed:', images);
    console.log('🔄 Preview images state changed:', previewImages);
  }, [images, previewImages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('📁 Files selected:', files.length);

    // Create preview URLs for local files
    const previewUrls = files.map(file => URL.createObjectURL(file));
    console.log('🖼️ Created preview URLs:', previewUrls);
    
    // Add preview images first
    setPreviewImages(prev => {
      const newPreviews = [...prev, ...previewUrls];
      console.log('🖼️ Preview images state updated:', newPreviews);
      return newPreviews;
    });
    
    // Upload immediately
    handleImageUpload(files);
  };

  const handleImageUpload = async (files) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadImages(files);
      console.log('Upload result:', result); // Debug log
      
      if (result.success && result.data?.urls) {
        // Convert relative URLs to absolute URLs
        // Static files are served from base URL, not API URL
        const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
        const absoluteUrls = result.data.urls.map(url => {
          // If URL already starts with http, use as is
          if (url.startsWith('http')) return url;
          // If URL starts with /, prepend BASE_URL (not API_URL)
          if (url.startsWith('/')) return `${BASE_URL}${url}`;
          // Otherwise, assume it's relative to uploads
          return `${BASE_URL}/uploads/${url}`;
        });
        
        console.log('Absolute URLs:', absoluteUrls); // Debug log
        console.log('Current images state:', images); // Debug log
        
        // Use functional update to ensure we have the latest state
        setImages(prevImages => {
          const newImages = [...prevImages, ...absoluteUrls];
          console.log('📸 Previous images:', prevImages);
          console.log('📸 New images:', newImages);
          console.log('📸 Absolute URLs added:', absoluteUrls);
          return newImages;
        });
        
        // Clear preview images after successful upload
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          setPreviewImages(prev => {
            const previewStartIndex = prev.length - files.length;
            console.log('🗑️ Clearing preview images, start index:', previewStartIndex);
            files.forEach((_, index) => {
              if (prev[previewStartIndex + index]) {
                URL.revokeObjectURL(prev[previewStartIndex + index]);
              }
            });
            const newPreviews = prev.slice(0, previewStartIndex);
            console.log('🗑️ Preview images after clear:', newPreviews);
            return newPreviews;
          });
        }, 100);
        
        showSuccess(`Đã upload ${result.data.urls.length} hình ảnh thành công!`);
      } else {
        console.error('Upload failed:', result); // Debug log
        showError(result.error?.message || result.error || 'Upload hình ảnh thất bại');
        // Remove preview on error
        const previewStartIndex = previewImages.length - files.length;
        files.forEach((_, index) => {
          if (previewImages[previewStartIndex + index]) {
            URL.revokeObjectURL(previewImages[previewStartIndex + index]);
          }
        });
        setPreviewImages(prev => prev.slice(0, previewStartIndex));
      }
    } catch (error) {
      console.error('Upload error:', error); // Debug log
      showError('Có lỗi xảy ra khi upload hình ảnh');
      // Remove preview on error
      const previewStartIndex = previewImages.length - files.length;
      files.forEach((_, index) => {
        if (previewImages[previewStartIndex + index]) {
          URL.revokeObjectURL(previewImages[previewStartIndex + index]);
        }
      });
      setPreviewImages(prev => prev.slice(0, previewStartIndex));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index) => {
    // Check if it's a preview image (local) or uploaded image
    const totalImages = images.length + previewImages.length;
    if (index < images.length) {
      // Remove uploaded image
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    } else {
      // Remove preview image
      const previewIndex = index - images.length;
      URL.revokeObjectURL(previewImages[previewIndex]);
      const newPreviewImages = previewImages.filter((_, i) => i !== previewIndex);
      setPreviewImages(newPreviewImages);
    }
  };

  const handleUpdate = async () => {
    try {
      // Convert absolute URLs back to relative URLs for storage
      const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
      const imageUrlsForStorage = images.map(url => {
        if (!url) return url;
        // If URL contains BASE_URL, extract relative path
        if (url.includes(BASE_URL)) {
          return url.replace(BASE_URL, '');
        }
        // If already relative, use as is
        if (url.startsWith('/')) return url;
        // If it's already a full URL from another source, extract path
        if (url.startsWith('http')) {
          // Extract path from full URL
          try {
            const urlObj = new URL(url);
            return urlObj.pathname;
          } catch (e) {
            return url;
          }
        }
        return url;
      });

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
        priority: formData.priority,
        images: imageUrlsForStorage // Include updated images (relative URLs)
      };

      console.log('Updating with data:', updateData); // Debug log

      const result = await lostItemService.updateReport(id, updateData);
      if (result.success) {
        showSuccess('Cập nhật báo cáo thành công!');
        setIsEditing(false);
        // Clear preview images
        previewImages.forEach(url => URL.revokeObjectURL(url));
        setPreviewImages([]);
        refetch(); // This will reload data and convert URLs again
      } else {
        showError(result.error?.message || result.error || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update error:', error); // Debug log
      showError('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      try {
        const result = await lostItemService.deleteReport(id);
        if (result.success) {
          showSuccess('Xóa báo cáo thành công!');
          navigate(returnPath);
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
            <Link to={returnPath} className="btn-primary">
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
          <Link to={returnPath} className="back-button">
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
                    // Clear preview images
                    previewImages.forEach(url => URL.revokeObjectURL(url));
                    setPreviewImages([]);
                    // Reset images to original
                    if (data?.success && data.data) {
                      const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                      const imageUrls = (data.data.images || []).map(url => {
                        if (!url) return null;
                        if (url.startsWith('http')) return url;
                        if (url.startsWith('/')) return `${BASE_URL}${url}`;
                        return `${BASE_URL}/uploads/${url}`;
                      }).filter(Boolean);
                      setImages(imageUrls);
                    }
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
              {isEditing ? (
                <div className="image-upload-section">
                  {(() => {
                    const totalImages = images.length + previewImages.length;
                    console.log('🖼️ Rendering images - Total:', totalImages, 'Uploaded:', images.length, 'Preview:', previewImages.length);
                    console.log('🖼️ Images URLs:', images);
                    console.log('🖼️ Preview URLs:', previewImages);
                    
                    if (totalImages > 0) {
                      return (
                        <div className="images-preview-grid">
                          {/* Show uploaded images */}
                          {images.map((img, index) => {
                            console.log(`🖼️ Rendering uploaded image ${index}:`, img);
                            return (
                              <div key={`uploaded-${index}-${img}`} className="image-preview-item">
                                <img 
                                  src={img} 
                                  alt={`Uploaded ${index + 1}`} 
                                  onError={(e) => {
                                    console.error(`❌ Image load error for ${img}:`, e);
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                                  }}
                                  onLoad={() => {
                                    console.log(`✅ Image loaded successfully: ${img}`);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="remove-image-btn"
                                >
                                  <FiXCircle />
                                </button>
                              </div>
                            );
                          })}
                          {/* Show preview images (local, before upload) */}
                          {previewImages.map((img, index) => {
                            console.log(`🖼️ Rendering preview image ${index}:`, img);
                            return (
                              <div key={`preview-${index}-${img}`} className="image-preview-item preview">
                                <img src={img} alt={`Preview ${index + 1}`} />
                                <div className="preview-badge">Đang upload...</div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(images.length + index)}
                                  className="remove-image-btn"
                                >
                                  <FiXCircle />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="detail-image-placeholder">
                          <FiImage size={64} />
                          <span>Chưa có hình ảnh</span>
                        </div>
                      );
                    }
                  })()}
                  <div className="upload-controls">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="file-input-hidden"
                      id="image-upload-input"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload-input" className="upload-button">
                      <FiUpload />
                      <span>{uploading ? 'Đang upload...' : 'Thêm hình ảnh'}</span>
                    </label>
                    <small className="upload-hint">Tối đa 5 ảnh, mỗi ảnh tối đa 5MB</small>
                  </div>
                </div>
              ) : (
                (images.length > 0 || (item.images && item.images.length > 0)) ? (
                  <img 
                    src={images.length > 0 ? images[0] : (() => {
                      const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                      const url = item.images[0];
                      if (!url) return '';
                      if (url.startsWith('http')) return url;
                      if (url.startsWith('/')) return `${BASE_URL}${url}`;
                      return `${BASE_URL}/uploads/${url}`;
                    })()} 
                    alt={item.itemName} 
                    className="detail-image" 
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }} 
                    onLoad={() => {
                      console.log('Image loaded successfully');
                    }}
                  />
                ) : (
                  <div className="detail-image-placeholder">
                    <FiImage size={64} />
                    <span>Không có hình ảnh</span>
                  </div>
                )
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

