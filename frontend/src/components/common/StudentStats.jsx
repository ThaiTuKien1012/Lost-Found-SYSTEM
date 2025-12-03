import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Link } from 'react-router-dom';
import lostItemService from '../../api/lostItemService';
import matchingService from '../../api/matchingService';
import returnService from '../../api/returnService';
import { FiPackage, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';

const StudentStats = () => {
  // Fetch my reports
  const { data: reportsData } = useFetch(() => lostItemService.getMyReports(1, 100));
  
  // Fetch matching suggestions
  const { data: suggestionsData } = useFetch(() => matchingService.getSuggestions());
  
  // Fetch my transactions
  const { data: transactionsData } = useFetch(() => returnService.getMyTransactions(1, 100));

  // Calculate stats
  const myReports = reportsData?.data || [];
  const matchedItems = myReports.filter(item => item.status === 'matched' || item.status === 'returned');
  const pendingReports = myReports.filter(item => item.status === 'pending' || item.status === 'verified');
  const suggestions = suggestionsData?.data || [];
  const completedReturns = transactionsData?.data?.filter(t => t.status === 'completed') || [];

  const stats = [
    {
      label: 'Báo mất đang chờ',
      value: pendingReports.length,
      icon: FiClock,
      color: '#F97316',
      to: '/lost-items',
      description: 'Báo cáo chờ xác minh'
    },
    {
      label: 'Gợi ý khớp đồ',
      value: suggestions.length,
      icon: FiTrendingUp,
      color: '#06B6D4',
      to: '/matching',
      description: 'Đồ vật có thể là của bạn'
    },
    {
      label: 'Đã khớp/Trả lại',
      value: matchedItems.length,
      icon: FiCheckCircle,
      color: '#22C55E',
      to: '/lost-items',
      description: 'Đồ vật đã tìm thấy'
    },
    {
      label: 'Đã nhận lại',
      value: completedReturns.length,
      icon: FiPackage,
      color: '#2180A0',
      to: '/returns/my-transactions',
      description: 'Đồ vật đã nhận'
    }
  ];

  return (
    <div className="student-stats-container">
      <h2 className="stats-title">Tổng quan của bạn</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.to}
              className="stat-card"
              style={{ '--stat-color': stat.color }}
            >
              <div className="stat-icon-wrapper">
                <Icon className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show matched items list if any */}
      {matchedItems.length > 0 && (
        <div className="matched-items-section">
          <h3 className="section-title">
            <FiCheckCircle /> Đồ vật đã tìm thấy ({matchedItems.length})
          </h3>
          <div className="matched-items-list">
            {matchedItems.slice(0, 3).map((item) => (
              <Link
                key={item._id || item.reportId}
                to={`/lost-items/${item._id || item.reportId}`}
                className="matched-item-card"
              >
                <div className="matched-item-info">
                  <h4>{item.itemName}</h4>
                  <p className="matched-item-status">
                    {item.status === 'matched' ? 'Đã khớp' : 'Đã trả lại'}
                  </p>
                </div>
                <div className="matched-item-date">
                  {item.matchedAt 
                    ? new Date(item.matchedAt).toLocaleDateString('vi-VN')
                    : item.returnedAt
                    ? new Date(item.returnedAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </div>
              </Link>
            ))}
            {matchedItems.length > 3 && (
              <Link to="/lost-items" className="view-all-link">
                Xem tất cả ({matchedItems.length})
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Show suggestions if any */}
      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3 className="section-title">
            <FiTrendingUp /> Gợi ý khớp đồ mới ({suggestions.length})
          </h3>
          <div className="suggestions-preview">
            {suggestions.slice(0, 2).map((suggestion) => (
              <div key={suggestion.matchId} className="suggestion-preview-card">
                <div className="suggestion-info">
                  <h4>{suggestion.itemName}</h4>
                  <p className="suggestion-confidence">
                    Độ khớp: {suggestion.matchConfidence}%
                  </p>
                </div>
                <Link
                  to="/matching"
                  className="btn-view-suggestions"
                >
                  Xem chi tiết
                </Link>
              </div>
            ))}
            {suggestions.length > 2 && (
              <Link to="/matching" className="view-all-link">
                Xem tất cả gợi ý ({suggestions.length})
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStats;

