import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Link } from 'react-router-dom';
import lostItemService from '../../api/lostItemService';
import returnService from '../../api/returnService';
import { FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';

const StudentStats = () => {
  // Fetch my reports
  const { data: reportsData } = useFetch(() => lostItemService.getMyReports(1, 100));
  
  // Fetch my transactions
  const { data: transactionsData } = useFetch(() => returnService.getMyTransactions(1, 100));

  // Calculate stats
  const myReports = reportsData?.data || [];
  const matchedItems = myReports.filter(item => item.status === 'returned');
  const pendingReports = myReports.filter(item => item.status === 'pending' || item.status === 'verified');
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
      label: 'Đã trả lại',
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
                    Đã trả lại
                  </p>
                </div>
                <div className="matched-item-date">
                  {item.returnedAt
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
    </div>
  );
};

export default StudentStats;

