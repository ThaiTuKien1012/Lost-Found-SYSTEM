import React from 'react';
import { FiPackage, FiCheck, FiTrendingUp } from 'react-icons/fi';

const Dashboard = ({ data }) => {
  const stats = [
    {
      title: 'Tổng Báo Cáo',
      value: data?.totalLost || 0,
      icon: FiPackage,
      color: 'blue'
    },
    {
      title: 'Đã Tìm Thấy',
      value: data?.totalFound || 0,
      icon: FiCheck,
      color: 'green'
    },
    {
      title: 'Đã Trả Lại',
      value: data?.totalReturned || 0,
      icon: FiTrendingUp,
      color: 'purple'
    },
    {
      title: 'Tỷ Lệ Trả Lại',
      value: data?.recoveryRate || '0%',
      icon: null,
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            {stat.icon && (
              <div className="stat-icon">
                <stat.icon size={32} />
              </div>
            )}
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-info">
        <div className="info-item">
          <label>Chờ Xác Nhận:</label>
          <span>{data?.pendingVerification || 0}</span>
        </div>
        <div className="info-item">
          <label>Khớp Với Đồ Tìm Thấy:</label>
          <span>{data?.activeMatches || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

