import React from 'react';
import { motion } from 'framer-motion';
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
      color: '#6366F1',
      to: '/returns/my-transactions',
      description: 'Đồ vật đã nhận'
    }
  ];

  return (
    <motion.div
      style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '40px',
        marginBottom: '24px',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h2 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: '#1A1A1A',
        marginBottom: '24px',
        letterSpacing: '-0.02em',
      }}>
        Tổng quan của bạn
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <Link
                to={stat.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: '#FFFFFF',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#1A1A1A',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = stat.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{
                    fontSize: '24px',
                    color: stat.color,
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '4px',
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666666',
                    fontWeight: 400,
                  }}>
                    {stat.description}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Show matched items list if any */}
      {matchedItems.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <FiCheckCircle style={{ color: '#22C55E' }} /> 
            Đồ vật đã tìm thấy ({matchedItems.length})
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {matchedItems.slice(0, 3).map((item) => (
              <Link
                key={item._id || item.reportId}
                to={`/lost-items/${item._id || item.reportId}`}
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  textDecoration: 'none',
                  color: '#1A1A1A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#22C55E';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    color: '#1A1A1A',
                  }}>
                    {item.itemName}
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#22C55E',
                    fontWeight: 500,
                    margin: 0,
                  }}>
                    Đã trả lại
                  </p>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666666',
                  fontWeight: 400,
                }}>
                  {item.returnedAt
                    ? new Date(item.returnedAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </div>
              </Link>
            ))}
            {matchedItems.length > 3 && (
              <Link
                to="/lost-items"
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontWeight: 500,
                  border: '1px dashed #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Xem tất cả ({matchedItems.length})
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentStats;

