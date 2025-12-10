import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, CAMPUSES, CONDITIONS } from '../../utils/constants';
import uploadService from '../../api/uploadService';
import { FiX, FiUpload } from 'react-icons/fi';

const FoundItemForm = ({ onSubmit }) => {
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { values, handleChange, handleSubmit, reset, setValues } = useForm(
    {
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
    },
    async (formData) => {
      try {
        // Validation theo doc
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

        // 4. Màu: REQUIRED (khác Lost Form - optional)
        if (!formData.color || formData.color.trim().length === 0) {
          showError('Màu sắc là bắt buộc');
          return;
        }
        if (formData.color.trim().length > 50) {
          showError('Màu sắc tối đa 50 ký tự');
          return;
        }

        // 5. Ngày: No future
        if (!formData.dateFound) {
          showError('Vui lòng chọn ngày tìm được');
          return;
        }
        const foundDate = new Date(formData.dateFound);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (foundDate > today) {
          showError('Ngày tìm được không thể là ngày tương lai');
          return;
        }

        // 6. Nơi Tìm Được: REQUIRED (khác Lost Form - optional)
        if (!formData.locationFound || formData.locationFound.trim().length === 0) {
          showError('Nơi tìm được là bắt buộc');
          return;
        }
        if (formData.locationFound.trim().length > 200) {
          showError('Nơi tìm được tối đa 200 ký tự');
          return;
        }

        // 7. Campus: REQUIRED
        if (!formData.campus) {
          showError('Vui lòng chọn campus');
          return;
        }

        // 8. Condition: REQUIRED
        if (!formData.condition) {
          showError('Vui lòng chọn tình trạng đồ');
          return;
        }

        // 9. Warehouse Location: Optional, max 200 chars
        if (formData.warehouseLocation && formData.warehouseLocation.trim().length > 200) {
          showError('Vị trí kho tối đa 200 ký tự');
          return;
        }

        // 10. Ảnh: Optional, max 5 files
        if (images.length > 5) {
          showError('Tối đa 5 hình ảnh');
          return;
        }

        // Sanitize HTML
        const submitData = {
          itemName: formData.itemName.trim().replace(/<[^>]*>/g, ''),
          description: formData.description.trim().replace(/<[^>]*>/g, ''),
          category: formData.category,
          color: formData.color.trim(),
          condition: formData.condition,
          campus: formData.campus,
          dateFound: foundDate,
          locationFound: formData.locationFound.trim(),
          warehouseLocation: formData.warehouseLocation ? formData.warehouseLocation.trim() : '',
          images: images
        };

        const success = await onSubmit(submitData);
        if (success) {
          reset();
          setImages([]);
          setPreviewImages([]);
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

    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...previewUrls]);
    
    handleImageUpload(files);
  };

  const handleImageUpload = async (files) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadImages(files);
      
      if (result.success && result.data?.urls) {
        setImages(prev => [...prev, ...result.data.urls]);
        
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
        showError('Upload hình ảnh thất bại');
        setPreviewImages(prev => prev.slice(0, prev.length - files.length));
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi upload hình ảnh');
      setPreviewImages(prev => prev.slice(0, prev.length - files.length));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (previewImages[index]) {
      URL.revokeObjectURL(previewImages[index]);
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="found-item-form">
      <div className="form-row">
        <div className="form-group">
          <label>Tên Đồ Vật *</label>
          <input
            type="text"
            name="itemName"
            value={values.itemName}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={100}
            className="form-input"
            placeholder="Tối thiểu 3 ký tự, tối đa 100 ký tự"
          />
          <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
            {values.itemName.length}/100 ký tự
          </small>
        </div>

        <div className="form-group">
          <label>Loại Đồ Vật *</label>
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Chọn loại</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Mô Tả Chi Tiết *</label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={1000}
          rows="4"
          className="form-textarea"
          placeholder="Tối thiểu 10 ký tự, tối đa 1000 ký tự"
        />
        <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          {values.description.length}/1000 ký tự
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Màu Sắc * <span style={{ color: '#999', fontSize: '12px' }}>(Bắt buộc)</span></label>
          <input
            type="text"
            name="color"
            value={values.color}
            onChange={handleChange}
            required
            maxLength={50}
            className="form-input"
            placeholder="Ví dụ: Đen, Trắng, Xanh..."
          />
          <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
            {values.color.length}/50 ký tự
          </small>
        </div>

        <div className="form-group">
          <label>Tình Trạng *</label>
          <select
            name="condition"
            value={values.condition}
            onChange={handleChange}
            required
            className="form-select"
          >
            {CONDITIONS.map(cond => (
              <option key={cond.value} value={cond.value}>{cond.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ngày Tìm Được *</label>
          <input
            type="date"
            name="dateFound"
            value={values.dateFound}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Campus *</label>
          <select
            name="campus"
            value={values.campus}
            onChange={handleChange}
            required
            className="form-select"
          >
            {CAMPUSES.map(campus => (
              <option key={campus.value} value={campus.value}>{campus.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Nơi Tìm Được * <span style={{ color: '#999', fontSize: '12px' }}>(Bắt buộc)</span></label>
        <input
          type="text"
          name="locationFound"
          value={values.locationFound}
          onChange={handleChange}
          required
          maxLength={200}
          className="form-input"
          placeholder="Ví dụ: Thư viện tầng 2, Quầy tiếp tân..."
        />
        <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          {values.locationFound.length}/200 ký tự
        </small>
      </div>

      <div className="form-group">
        <label>Vị Trí Kho <span style={{ color: '#999', fontSize: '12px' }}>(Tùy chọn)</span></label>
        <input
          type="text"
          name="warehouseLocation"
          value={values.warehouseLocation}
          onChange={handleChange}
          maxLength={200}
          className="form-input"
          placeholder="Ví dụ: Kho A, Kệ 3"
        />
        <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          {values.warehouseLocation.length}/200 ký tự
        </small>
      </div>

      <div className="form-group">
        <label>Hình Ảnh <span style={{ color: '#999', fontSize: '12px' }}>(Tùy chọn, tối đa 5 file, mỗi file 5MB)</span></label>
        <div className="image-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            disabled={uploading || images.length >= 5}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            disabled={uploading || images.length >= 5}
          >
            <FiUpload /> {uploading ? 'Đang upload...' : images.length >= 5 ? 'Đã đạt tối đa 5 ảnh' : 'Chọn Hình Ảnh'}
          </button>
          {images.length >= 5 && (
            <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ Đã đạt tối đa 5 hình ảnh
            </p>
          )}
          
          {previewImages.length > 0 && (
            <div className="image-preview-grid">
              {previewImages.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          ✅ Lưu Đồ Tìm Thấy
        </button>
      </div>
    </form>
  );
};

export default FoundItemForm;

