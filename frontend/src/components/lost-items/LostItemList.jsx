import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import { getStatusLabel } from '../../utils/helpers';
import { 
  FiPackage, 
  FiCalendar, 
  FiMapPin, 
  FiArrowRight, 
  FiImage,
  FiEdit,
  FiTrash2,
  FiShare2,
  FiHeart,
  FiMoreVertical,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import lostItemService from '../../api/lostItemService';
import { useNotification } from '../../hooks/useNotification';

const LostItemList = ({ items, pagination, onPageChange, onItemDeleted, onItemUpdated }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [favorites, setFavorites] = useState(new Set());
  const [activeMenu, setActiveMenu] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Get BASE_URL for static files (without /api)
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  const getCategoryIcon = (category) => {
    return <FiPackage size={14} />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock size={14} />;
      case 'verified':
        return <FiCheckCircle size={14} />;
      case 'rejected':
        return <FiXCircle size={14} />;
      case 'returned':
        return <FiCheckCircle size={14} />;
      default:
        return <FiAlertCircle size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#F5F5F5', color: '#000000', border: '#D0D0D0', icon: '#666666' };
      case 'verified':
        return { bg: '#EEEEEE', color: '#000000', border: '#CCCCCC', icon: '#333333' };
      case 'rejected':
        return { bg: '#E0E0E0', color: '#000000', border: '#BBBBBB', icon: '#666666' };
      case 'returned':
        return { bg: '#D0D0D0', color: '#000000', border: '#AAAAAA', icon: '#333333' };
      default:
        return { bg: '#FAFAFA', color: '#000000', border: '#E0E0E0', icon: '#666666' };
    }
  };

  // Convert relative URL to absolute URL for display
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/uploads/${url}`;
  };

  const handleFavorite = (itemId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const handleShare = async (item, e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.itemName,
          text: item.description,
          url: window.location.origin + `/lost-items/${item._id}`
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      const url = window.location.origin + `/lost-items/${item._id}`;
      navigator.clipboard.writeText(url);
      showSuccess('Đã sao chép link vào clipboard');
    }
    setActiveMenu(null);
  };

  const handleEdit = (itemId, e) => {
    e.stopPropagation();
    navigate(`/lost-items/${itemId}/edit`);
    setActiveMenu(null);
  };

  const handleDelete = async (itemId, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      try {
        const result = await lostItemService.deleteReport(itemId);
        if (result.success) {
          showSuccess('Đã xóa báo cáo thành công');
          if (onItemDeleted) {
            onItemDeleted(itemId);
          }
        } else {
          showError(result.error?.message || 'Xóa báo cáo thất bại');
        }
      } catch (error) {
        showError('Có lỗi xảy ra khi xóa báo cáo');
      }
    }
    setActiveMenu(null);
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

  const getMatchingCount = (item) => {
    // This would come from API, for now return 0 or mock data
    return item.matchingCount || 0;
  };

  const getConfidenceScore = (item) => {
    // This would come from API if item has matches
    return item.confidenceScore || null;
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {items.length === 0 ? (
        <div
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E0E0E0',
          }}
        >
          <FiPackage size={64} color="#999999" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
            Chưa có báo cáo nào
          </h3>
          <p style={{ fontSize: '14px', color: '#666666' }}>
            Bắt đầu bằng cách tạo báo cáo mất đồ mới
          </p>
        </div>
      ) : (
        items.map((item) => {
          const statusColors = getStatusColor(item.status);
          const images = item.images || [];
          const currentIndex = currentImageIndex[item._id] || 0;
          const imageUrl = images.length > 0 ? getImageUrl(images[currentIndex]) : null;
          const matchingCount = getMatchingCount(item);
          const confidenceScore = getConfidenceScore(item);
          const isFavorite = favorites.has(item._id);
          const relativeTime = getRelativeTime(item.updatedAt || item.createdAt);

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E0E0E0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              whileHover={{
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                y: -4,
              }}
              onClick={() => navigate(`/lost-items/${item._id}`)}
            >
              {/* Image Section */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
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

                {/* Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: statusColors.bg,
                    color: statusColors.color,
                    border: `1px solid ${statusColors.border}`,
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {getStatusIcon(item.status)}
                  {getStatusLabel(item.status)}
                </div>

                {/* More Menu Button */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === item._id ? null : item._id);
                  }}
                >
                  <button
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#333333',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                    }}
                  >
                    <FiMoreVertical size={18} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === item._id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: 0,
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '160px',
                        zIndex: 100,
                        overflow: 'hidden',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleEdit(item._id, e)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#333333',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#F5F5F5')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <FiEdit size={16} />
                        Sửa
                      </button>
                      <button
                        onClick={(e) => handleDelete(item._id, e)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#FF0000',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#F5F5F5')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <FiTrash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div style={{ padding: '20px' }}>
                {/* Title */}
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#000000',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}
                >
                  {item.itemName}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#666666',
                    marginBottom: '16px',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>

                {/* Meta Tags */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: '#F5F5F5',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#333333',
                    }}
                  >
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </span>
                  {item.color && (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: '#F5F5F5',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#333333',
                      }}
                    >
                      🎨 {item.color}
                    </span>
                  )}
                  {item.locationLost && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: '#F5F5F5',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#333333',
                      }}
                    >
                      <FiMapPin size={12} />
                      {item.locationLost}
                    </span>
                  )}
                </div>

                {/* Date and Time Info */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#999999',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar size={14} />
                    <span>{formatDate(item.dateLost)}</span>
                  </div>
                  {relativeTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiClock size={14} />
                      <span>{relativeTime}</span>
                    </div>
                  )}
                </div>

                {/* Matching Info */}
                {matchingCount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#F5F5F5',
                      marginBottom: '16px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#333333',
                    }}
                  >
                    <FiTrendingUp size={14} />
                    <span>{matchingCount} khớp tiềm năng</span>
                    {confidenceScore && (
                      <span style={{ marginLeft: 'auto', color: '#666666' }}>
                        Độ tin cậy: {confidenceScore}%
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E0E0E0',
                  }}
                >
                  <button
                    onClick={(e) => handleFavorite(item._id, e)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E0E0E0',
                      background: isFavorite ? '#F5F5F5' : '#FFFFFF',
                      color: isFavorite ? '#FF0000' : '#333333',
                      fontSize: '14px',
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
                      e.target.style.background = isFavorite ? '#F5F5F5' : '#FFFFFF';
                      e.target.style.borderColor = '#E0E0E0';
                    }}
                  >
                    <FiHeart size={16} fill={isFavorite ? '#FF0000' : 'none'} />
                    <span>Yêu thích</span>
                  </button>
                  <button
                    onClick={(e) => handleShare(item, e)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E0E0E0',
                      background: '#FFFFFF',
                      color: '#333333',
                      fontSize: '14px',
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
                    <FiShare2 size={16} />
                    <span>Chia sẻ</span>
                  </button>
                  <Link
                    to={`/lost-items/${item._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginLeft: 'auto',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: '14px',
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
            gap: '8px',
            marginTop: '32px',
          }}
        >
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: '40px',
                height: '40px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                background: pageNum === pagination.currentPage ? '#000000' : '#FFFFFF',
                color: pageNum === pagination.currentPage ? '#FFFFFF' : '#333333',
                fontSize: '14px',
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

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
          }}
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};

export default LostItemList;
