import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';
import uploadService from '../../api/uploadService';
import { FiX } from 'react-icons/fi';

const LostItemForm = ({ onSubmit, initialData = null }) => {
  const { showError, showSuccess, showWarning } = useNotification();
  const { user } = useAuth();
  const [images, setImages] = useState([]); // URLs từ server
  const [previewImages, setPreviewImages] = useState([]); // Local preview URLs
  const [uploading, setUploading] = useState(false);
  const [dateWarning, setDateWarning] = useState(null);
  const fileInputRef = useRef(null);

  // Get BASE_URL for static files
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const { values, handleChange, handleSubmit, setValues } = useForm(
    {
      itemName: initialData?.itemName || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      color: initialData?.color || '',
      dateLost: initialData?.dateLost ? new Date(initialData.dateLost).toISOString().split('T')[0] : '',
      locationLost: initialData?.locationLost || '',
      campus: initialData?.campus || user?.campus || 'NVH',
      phone: initialData?.phone || '',
      images: []
    },
    async (formData) => {
      try {
        // Validation
        // 1. Tên Đồ: 3-100 chars
        if (!formData.itemName || formData.itemName.trim().length < 3 || formData.itemName.trim().length > 100) {
          showError('Tên đồ vật phải từ 3-100 ký tự');
          return;
        }

        // 2. Mô Tả: 10-1000 chars
        if (!formData.description || formData.description.trim().length < 10 || formData.description.trim().length > 1000) {
          showError('Mô tả phải từ 10-1000 ký tự');
          return;
        }

        // 3. Loại: REQUIRED
        if (!formData.category) {
          showError('Vui lòng chọn loại đồ vật');
          return;
        }

        // 4. Màu: Optional, max 50 chars
        if (formData.color && formData.color.trim().length > 50) {
          showError('Màu sắc tối đa 50 ký tự');
          return;
        }

        // 5. Ngày: No future
        if (!formData.dateLost) {
          showError('Vui lòng chọn ngày thất lạc');
          return;
        }

        const lostDate = new Date(formData.dateLost);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (lostDate > today) {
          showError('Ngày thất lạc không thể là ngày tương lai');
          return;
        }

        // 6. Nơi: Optional, max 200 chars
        if (formData.locationLost && formData.locationLost.trim().length > 200) {
          showError('Nơi thất lạc tối đa 200 ký tự');
          return;
        }

        // 7. Campus: REQUIRED
        if (!formData.campus) {
          showError('Vui lòng chọn campus');
          return;
        }

        // 8. Số ĐT: Optional, VN format 09/01, 10-11 digits
        if (formData.phone && formData.phone.trim()) {
          const phoneRegex = /^(0[9|1])\d{8,9}$/;
          if (!phoneRegex.test(formData.phone.trim())) {
            showError('Số điện thoại không đúng định dạng (09/01 + 8-9 số)');
            return;
          }
        }

        // 9. Ảnh: Optional, max 5 files
        if (images.length > 5) {
          showError('Tối đa 5 hình ảnh');
          return;
        }

        // Convert absolute URLs back to relative URLs for storage (when editing)
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
            try {
              const urlObj = new URL(url);
              return urlObj.pathname;
            } catch (e) {
              return url;
            }
          }
          return url;
        });

        // Sanitize HTML
        const sanitizedData = {
          ...formData,
          itemName: formData.itemName.trim().replace(/<[^>]*>/g, ''),
          description: formData.description.trim().replace(/<[^>]*>/g, ''),
          color: formData.color ? formData.color.trim() : '',
          locationLost: formData.locationLost ? formData.locationLost.trim() : '',
          phone: formData.phone ? formData.phone.trim() : '',
          images: imageUrlsForStorage
        };

        console.log('📤 Submitting form data:', sanitizedData);
        console.log('🖼️ Original images:', images);
        console.log('🖼️ Converted images:', imageUrlsForStorage);
        
        await onSubmit(sanitizedData);
        // Reset images sau khi submit thành công (chỉ khi tạo mới)
        if (!initialData) {
          setImages([]);
          setPreviewImages([]);
          setDateWarning(null);
        }
      } catch (error) {
        showError(error.message);
      }
    }
  );

  // Pre-fill campus from user
  useEffect(() => {
    if (user?.campus && !values.campus) {
      setValues(prev => ({
        ...prev,
        campus: user.campus
      }));
    }
  }, [user, setValues, values.campus]);

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      // Convert relative URLs to absolute URLs for images
      const imageUrls = (initialData.images || []).map(url => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${BASE_URL}${url}`;
        return `${BASE_URL}/uploads/${url}`;
      }).filter(Boolean);
      
      setImages(imageUrls);
      
      // Update form values
      setValues({
        itemName: initialData.itemName || '',
        description: initialData.description || '',
        category: initialData.category || '',
        color: initialData.color || '',
        dateLost: initialData.dateLost ? new Date(initialData.dateLost).toISOString().split('T')[0] : '',
        locationLost: initialData.locationLost || '',
        campus: initialData.campus || user?.campus || 'NVH',
        phone: initialData.phone || '',
        images: []
      });
    }
  }, [initialData, BASE_URL, setValues, user]);

  // Check date warning
  const handleDateChange = (e) => {
    handleChange(e);
    const date = new Date(e.target.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (date <= today) {
      const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      if (daysDiff > 90) {
        setDateWarning('Cảnh báo: Đã quá 90 ngày kể từ ngày thất lạc');
      } else {
        setDateWarning(null);
      }
    } else {
      setDateWarning(null);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check max 5 files
    if (images.length + files.length > 5) {
      showError('Tối đa 5 hình ảnh');
      e.target.value = '';
      return;
    }

    // Check file size (5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showError(`Một số file vượt quá 5MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }

    // Tạo preview URLs cho local files
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previewUrls]);
    
    // Upload ngay lập tức
    handleImageUpload(files);
  };

  const handleImageUpload = async (files) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadImages(files);
      
      if (result.success && result.data?.urls) {
        // Lưu relative URLs từ server (không convert sang absolute)
        // Backend trả về relative URLs, giữ nguyên để submit
        setImages(prev => [...prev, ...result.data.urls]);
        
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
      // Xóa preview khi lỗi
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

  const handleRemoveImage = (index) => {
    // Tính toán index thực tế trong mảng images và previewImages
    if (index < images.length) {
      // Xóa URL từ server (uploaded image)
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Xóa preview image
      const previewIndex = index - images.length;
      if (previewImages[previewIndex]) {
        URL.revokeObjectURL(previewImages[previewIndex]);
        setPreviewImages(prev => prev.filter((_, i) => i !== previewIndex));
      }
    }
  };

  // Convert relative URLs to absolute URLs for display
  const getImageUrl = (url) => {
    if (!url) return null;
    // Preview images (local) are already blob URLs, use as is
    if (url.startsWith('blob:')) return url;
    // If URL already starts with http, use as is
    if (url.startsWith('http')) return url;
    // Convert relative URLs to absolute for display
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/${url}`;
  };

  // Hiển thị tất cả hình ảnh (đã upload + preview)
  const displayImages = [
    ...images.map(url => ({ url, type: 'uploaded' })),
    ...previewImages.map(url => ({ url, type: 'preview' }))
  ];

  return (
    <form onSubmit={handleSubmit} className="lost-item-form">
      <div className="form-group">
        <label>Tên Đồ Vật</label>
        <input
          type="text"
          name="itemName"
          value={values.itemName}
          onChange={handleChange}
          minLength={3}
          maxLength={100}
          required
          placeholder="Tối thiểu 3 ký tự, tối đa 100 ký tự"
        />
        <small style={{ color: '#5D6D7E', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          {values.itemName.length}/100 ký tự
        </small>
      </div>

      <div className="form-group">
        <label>Mô Tả</label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows="4"
          minLength={10}
          maxLength={1000}
          required
          placeholder="Tối thiểu 10 ký tự, tối đa 1000 ký tự"
        />
        <small style={{ color: '#5D6D7E', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          {values.description.length}/1000 ký tự
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Loại Đồ Vật</label>
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            required
          >
            <option value="">Chọn loại</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Màu Sắc <span style={{ color: '#808080', fontSize: '12px' }}>(Tùy chọn)</span></label>
          <input
            type="text"
            name="color"
            value={values.color}
            onChange={handleChange}
            maxLength={50}
            placeholder="Ví dụ: Đen, Trắng, Xanh..."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ngày Thất Lạc</label>
          <input
            type="date"
            name="dateLost"
            value={values.dateLost}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {dateWarning && (
            <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ {dateWarning}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Nơi Thất Lạc <span style={{ color: '#999', fontSize: '12px' }}>(Tùy chọn)</span></label>
          <input
            type="text"
            name="locationLost"
            value={values.locationLost}
            onChange={handleChange}
            maxLength={200}
            placeholder="Ví dụ: Phòng A101, Tầng 1..."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Campus</label>
          <select
            name="campus"
            value={values.campus}
            onChange={handleChange}
            required
          >
            {CAMPUSES.map(campus => (
              <option key={campus.value} value={campus.value}>{campus.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Số Điện Thoại <span style={{ color: '#999', fontSize: '12px' }}>(Tùy chọn)</span></label>
          <input
            type="tel"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            placeholder="0901234567 hoặc 0123456789"
            pattern="^(0[9|1])\d{8,9}$"
          />
          <small style={{ color: '#5D6D7E', fontSize: '11px', display: 'block', marginTop: '4px' }}>
            Định dạng: 09/01 + 8-9 số
          </small>
        </div>
      </div>

      <div className="form-group">
        <label>Hình Ảnh <span style={{ color: '#999', fontSize: '12px' }}>(Tùy chọn, tối đa 5 file, mỗi file 5MB)</span></label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          disabled={uploading || images.length >= 5}
        />
        {uploading && <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>Đang upload...</p>}
        {images.length >= 5 && (
          <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '4px' }}>
            ⚠️ Đã đạt tối đa 5 hình ảnh
          </p>
        )}
        
        {/* Preview Images */}
        {displayImages.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '10px', 
            marginTop: '15px' 
          }}>
            {displayImages.map((item, index) => {
              const imageUrl = getImageUrl(item.url);
              return (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={imageUrl} 
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={uploading}>
        {initialData ? 'Cập nhật' : 'Tạo Báo Cáo'}
      </button>
    </form>
  );
};

export default LostItemForm;

