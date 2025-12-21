import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import { 
  FiPackage, 
  FiCalendar, 
  FiArrowRight, 
  FiImage,
  FiEdit,
  FiTrash2,
  FiClock,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import lostItemService from '../../api/lostItemService';
import { useNotification } from '../../hooks/useNotification';
import LostItemForm from './LostItemForm';

const LostItemList = ({ items, pagination, onPageChange, onItemDeleted, onItemUpdated }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, itemId: null, itemName: '' });
  const [editForm, setEditForm] = useState({ show: false, item: null, loading: false });

  // Get BASE_URL for static files (without /api)
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const getCategoryIcon = (category) => {
    return <FiPackage size={14} />;
  };


  // Convert relative URL to absolute URL for display
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/${url}`;
  };


  const handleEdit = async (itemId, e) => {
    e.stopPropagation();
    setEditForm({ show: true, item: null, loading: true });
    
    try {
      const result = await lostItemService.getReport(itemId);
      if (result.success && result.data) {
        setEditForm({ show: true, item: result.data, loading: false });
      } else {
        showError('Không thể tải thông tin báo cáo');
        setEditForm({ show: false, item: null, loading: false });
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi tải thông tin báo cáo');
      setEditForm({ show: false, item: null, loading: false });
    }
  };

  const handleUpdateReport = async (formData) => {
    if (!editForm.item) return;
    
    try {
      console.log('📝 Updating report with data:', formData);
      const result = await lostItemService.updateReport(editForm.item._id, formData);
      console.log('📝 Update result:', result);
      
      if (result.success) {
        showSuccess('Cập nhật báo cáo thành công!');
        setEditForm({ show: false, item: null, loading: false });
        if (onItemUpdated) {
          onItemUpdated(editForm.item._id);
        }
      } else {
        showError(result.error?.message || result.error || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      showError('Có lỗi xảy ra khi cập nhật báo cáo');
    }
  };

  const handleCloseEditForm = () => {
    setEditForm({ show: false, item: null, loading: false });
  };

  const handleDeleteClick = (itemId, itemName, e) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, itemId, itemName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.itemId) return;
    
    try {
      const result = await lostItemService.deleteReport(deleteConfirm.itemId);
      if (result.success) {
        showSuccess('Đã xóa báo cáo thành công');
        if (onItemDeleted) {
          onItemDeleted(deleteConfirm.itemId);
        }
        setDeleteConfirm({ show: false, itemId: null, itemName: '' });
      } else {
        showError(result.error?.message || 'Xóa báo cáo thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa báo cáo');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, itemId: null, itemName: '' });
  };

  const handleImageNavigation = (itemId, direction, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => {
      const current = prev[itemId] || 0;
      let newIndex;
      if (direction === 'next') {
        newIndex = (current + 1) % totalImages;
      } else {
        newIndex = (current - 1 + totalImages) % totalImages;
      }
      return { ...prev, [itemId]: newIndex };
    });
  };


  const getRelativeTime = (date) => {
    if (!date) return '';
    try {
      return formatRelativeTime(new Date(date));
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {items.length === 0 ? (
        <div
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 20px',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
          }}
        >
          <FiPackage size={48} color="#999999" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333333', marginBottom: '6px' }}>
            Chưa có báo cáo nào
          </h3>
          <p style={{ fontSize: '13px', color: '#666666' }}>
            Bắt đầu bằng cách tạo báo cáo mất đồ mới
          </p>
        </div>
      ) : (
        items.map((item) => {
          const images = item.images || [];
          const currentIndex = currentImageIndex[item._id] || 0;
          const imageUrl = images.length > 0 ? getImageUrl(images[currentIndex]) : null;
          const relativeTime = getRelativeTime(item.updatedAt || item.createdAt);

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E0E0E0',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              whileHover={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                y: -2,
              }}
              onClick={() => navigate(`/lost-items/${item._id}`)}
            >
              {/* Image Section */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  background: '#F5F5F5',
                  overflow: 'hidden',
                }}
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={item.itemName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#FFFFFF',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        {currentIndex + 1}/{images.length}
                      </div>
                    )}
                    {/* Image Navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => handleImageNavigation(item._id, 'prev', images.length, e)}
                          style={{
                            position: 'absolute',
                            left: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#333333',
                            fontSize: '14px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#FFFFFF';
                            e.target.style.transform = 'translateY(-50%) scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.transform = 'translateY(-50%) scale(1)';
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => handleImageNavigation(item._id, 'next', images.length, e)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#333333',
                            fontSize: '14px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#FFFFFF';
                            e.target.style.transform = 'translateY(-50%) scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                            e.target.style.transform = 'translateY(-50%) scale(1)';
                          }}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999999',
                    }}
                  >
                    <FiImage size={48} />
                    <span style={{ fontSize: '12px', marginTop: '8px' }}>Không có hình</span>
                  </div>
                )}

              </div>

              {/* Content Section */}
              <div style={{ padding: '16px' }}>
                {/* Title */}
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#000000',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                  }}
                >
                  {item.itemName}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#666666',
                    marginBottom: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  {item.description}
                </p>

                {/* Category Tag */}
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      background: '#F5F5F5',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#333333',
                    }}
                  >
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </span>
                </div>

                {/* Date and Time Info */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#666666',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar size={14} color="#666666" />
                    <span>{formatDate(item.dateLost || item.createdAt)}</span>
                  </div>
                  {relativeTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiClock size={14} color="#666666" />
                      <span>{relativeTime}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={(e) => handleEdit(item._id, e)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #E0E0E0',
                      background: '#FFFFFF',
                      color: '#333333',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#F5F5F5';
                      e.target.style.borderColor = '#D1D5DB';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#E0E0E0';
                    }}
                  >
                    <FiEdit size={16} />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(item._id, item.itemName, e)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #E0E0E0',
                      background: '#FFFFFF',
                      color: '#DC2626',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#FEF2F2';
                      e.target.style.borderColor = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#E0E0E0';
                    }}
                  >
                    <FiTrash2 size={16} color="#DC2626" />
                    <span>Xóa</span>
                  </button>
                  <Link
                    to={`/lost-items/${item._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginLeft: 'auto',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#333333')}
                    onMouseLeave={(e) => (e.target.style.background = '#000000')}
                  >
                    <span>Chi Tiết</span>
                    <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            marginTop: '24px',
          }}
        >
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: '36px',
                height: '36px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #E0E0E0',
                background: pageNum === pagination.currentPage ? '#000000' : '#FFFFFF',
                color: pageNum === pagination.currentPage ? '#FFFFFF' : '#333333',
                fontSize: '13px',
                fontWeight: pageNum === pagination.currentPage ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (pageNum !== pagination.currentPage) {
                  e.target.style.background = '#F5F5F5';
                  e.target.style.borderColor = '#D1D5DB';
                }
              }}
              onMouseLeave={(e) => {
                if (pageNum !== pagination.currentPage) {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.borderColor = '#E0E0E0';
                }
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={handleDeleteCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              width: '100%',
              maxWidth: '400px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
                  }}
                >
                  <FiAlertTriangle size={20} />
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#333333',
                    margin: 0,
                  }}
                >
                  Xác nhận xóa
                </h3>
              </div>
              <button
                onClick={handleDeleteCancel}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #E0E0E0',
                  background: '#FFFFFF',
                  color: '#666666',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F5F5F5';
                  e.target.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.borderColor = '#E0E0E0';
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#333333',
                  lineHeight: 1.6,
                  margin: 0,
                  marginBottom: '8px',
                }}
              >
                Bạn có chắc chắn muốn xóa báo cáo này?
              </p>
              {deleteConfirm.itemName && (
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#666666',
                    margin: 0,
                    padding: '8px 12px',
                    background: '#F5F5F5',
                    borderRadius: '6px',
                  }}
                >
                  "{deleteConfirm.itemName}"
                </p>
              )}
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#999999',
                  margin: '12px 0 0 0',
                }}
              >
                Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E0E0E0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #E0E0E0',
                  background: '#FFFFFF',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F5F5F5';
                  e.target.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.borderColor = '#E0E0E0';
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#DC2626';
                }}
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editForm.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={handleCloseEditForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#333333',
                  margin: 0,
                }}
              >
                Chỉnh sửa báo cáo
              </h3>
              <button
                onClick={handleCloseEditForm}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #E0E0E0',
                  background: '#FFFFFF',
                  color: '#666666',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F5F5F5';
                  e.target.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.borderColor = '#E0E0E0';
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {editForm.loading ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #E0E0E0',
                      borderTopColor: '#333333',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      marginBottom: '16px',
                    }}
                  />
                  <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải...</p>
                </div>
              ) : editForm.item ? (
                <LostItemForm
                  initialData={editForm.item}
                  onSubmit={handleUpdateReport}
                />
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LostItemList;
