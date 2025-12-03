import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { getStatusLabel } from '../../utils/helpers';
import { FiPackage, FiCalendar, FiMapPin, FiArrowRight, FiImage } from 'react-icons/fi';

const LostItemList = ({ items, pagination, onPageChange }) => {
  const getCategoryIcon = (category) => {
    return <FiPackage />;
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

  return (
    <div className="lost-items-list-enhanced">
      {items.length === 0 ? (
        <div className="empty-state-enhanced">
          <FiPackage className="empty-icon" />
          <h3>Chưa có báo cáo nào</h3>
          <p>Bắt đầu bằng cách tạo báo cáo mất đồ mới</p>
        </div>
      ) : (
        <>
          <div className="items-grid-enhanced">
            {items.map((item) => {
              const statusColors = getStatusColor(item.status);
              return (
                <div key={item._id} className="lost-item-card-enhanced">
                  <div className="lost-item-image-wrapper">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.itemName} className="lost-item-image" />
                    ) : (
                      <div className="lost-item-placeholder">
                        <FiImage size={48} />
                        <span>Không có hình</span>
                      </div>
                    )}
                    <div className="lost-item-status-overlay">
                      <span 
                        className="lost-item-status-badge"
                        style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.color,
                          borderColor: statusColors.border
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="lost-item-content">
                    <h3 className="lost-item-title">{item.itemName}</h3>
                    <p className="lost-item-description">{item.description}</p>
                    
                    <div className="lost-item-meta">
                      <span className="lost-item-tag category">
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </span>
                      <span className="lost-item-tag color">
                        Màu: {item.color}
                      </span>
                    </div>
                    
                    <div className="lost-item-footer">
                      <div className="lost-item-date">
                        <FiCalendar />
                        <span>{formatDate(item.dateLost)}</span>
                      </div>
                      <div className="lost-item-location">
                        <FiMapPin />
                        <span>{item.campus}</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/lost-items/${item._id}`}
                      className="lost-item-detail-btn"
                    >
                      <span>Chi Tiết</span>
                      <FiArrowRight />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination-enhanced">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`pagination-button ${
                      pageNum === pagination.page ? 'active' : ''
                    }`}
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

