import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/helpers';
import { getStatusLabel } from '../../utils/helpers';
import { FiPackage, FiCalendar, FiMapPin, FiArrowRight, FiImage } from 'react-icons/fi';

const LostItemList = ({ items, pagination, onPageChange }) => {
  // Get BASE_URL for static files (without /api)
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5124/api').replace('/api', '');

  const getCategoryIcon = (category) => {
    return <FiPackage />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
      case 'verified':
        return { bg: '#DBEAFE', color: '#1E40AF', border: '#60A5FA' };
      case 'returned':
        return { bg: '#D1FAE5', color: '#065F46', border: '#34D399' };
      default:
        return { bg: '#F3F4F6', color: '#374151', border: '#9CA3AF' };
    }
  };

  // Convert relative URL to absolute URL for display
  const getImageUrl = (url) => {
    if (!url) return null;
    // If URL already starts with http, use as is
    if (url.startsWith('http')) return url;
    // If URL starts with /, prepend BASE_URL
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    // Otherwise, assume it's relative to uploads
    return `${BASE_URL}/uploads/${url}`;
  };

  return (
    <div>
      {items.length === 0 ? (
        <motion.div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '60px',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FiPackage style={{ fontSize: '48px', color: '#9CA3AF', marginBottom: '16px' }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: '8px',
          }}>
            Chưa có báo cáo nào
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666666',
          }}>
            Bắt đầu bằng cách tạo báo cáo mất đồ mới
          </p>
        </motion.div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}>
            {items.map((item, index) => {
              const statusColors = getStatusColor(item.status);
              const imageUrl = item.imageUrl || (item.images && item.images.length > 0 ? getImageUrl(item.images[0]) : null);
              const itemId = item.id || item._id;
              
              return (
                <motion.div
                  key={itemId}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s ease',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    background: '#F5F5F5',
                    overflow: 'hidden',
                  }}>
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={item.title || 'Lost item'} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: imageUrl ? 'none' : 'flex',
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '8px',
                      color: '#9CA3AF',
                    }}>
                      <FiImage size={48} />
                      <span style={{ fontSize: '12px' }}>Không có hình</span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                    }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: statusColors.bg,
                        color: statusColors.color,
                        border: `1px solid ${statusColors.border}`,
                      }}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}>
                      {item.title || 'Không có tiêu đề'}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '16px',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.description || 'Không có mô tả'}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px',
                    }}>
                      {item.itemCategoryName && (
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#F5F5F5',
                          color: '#1A1A1A',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <FiPackage size={14} />
                          {item.itemCategoryName}
                        </span>
                      )}
                      {item.campusName && (
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#F5F5F5',
                          color: '#1A1A1A',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <FiMapPin size={14} />
                          {item.campusName}
                        </span>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#666666',
                    }}>
                      {item.lostTime && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <FiCalendar size={14} />
                          <span>{formatDate(item.lostTime)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/lost-items/${itemId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#000000',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <span>Chi Tiết</span>
                      <FiArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px',
            }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: pageNum === pagination.page ? 'none' : '1px solid #E5E7EB',
                      background: pageNum === pagination.page ? '#000000' : '#FFFFFF',
                      color: pageNum === pagination.page ? '#FFFFFF' : '#1A1A1A',
                      fontSize: '14px',
                      fontWeight: pageNum === pagination.page ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (pageNum !== pagination.page) {
                        e.currentTarget.style.background = '#F5F5F5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pageNum !== pagination.page) {
                        e.currentTarget.style.background = '#FFFFFF';
                      }
                    }}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LostItemList;

