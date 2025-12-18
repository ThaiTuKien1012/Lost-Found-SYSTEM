import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import reportService from '../../api/reportService';
import Dashboard from '../../components/reports/Dashboard';
import { FiBarChart2, FiTrendingUp, FiPackage, FiCheckCircle, FiClock } from 'react-icons/fi';

const ReportsPage = () => {
  const { data: dashboardData, loading: loadingDashboard } = useFetch(() => reportService.getDashboard());
  const { data: statistics, loading: loadingStats } = useFetch(() => reportService.getStatistics());

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px',
        background: '#F5F5F5',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiBarChart2 size={28} color="#333333" />
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#333333',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Báo Cáo & Thống Kê
            </h1>
          </div>
        </div>

        {/* Quick Stats */}
        {statistics?.data && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#E3F2FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1976D2',
                    }}
                  >
                    <FiPackage size={20} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Tổng Báo Cáo</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                  {statistics.data.totalLostReports || 0}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#388E3C',
                    }}
                  >
                    <FiCheckCircle size={20} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Đồ Tìm Thấy</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                  {statistics.data.totalFoundItems || 0}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#FFF3E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F57C00',
                    }}
                  >
                    <FiClock size={20} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Đang Chờ</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                  {statistics.data.pendingMatches || 0}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#E0F2F1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00796B',
                    }}
                  >
                    <FiTrendingUp size={20} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Tỷ Lệ Tìm Lại</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                  {statistics.data.recoveryRate || 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {loadingDashboard ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
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
              <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải dashboard...</p>
            </div>
          ) : dashboardData ? (
            <Dashboard data={dashboardData.data} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
              Không có dữ liệu dashboard
            </div>
          )}
        </div>

        {/* Statistics Details */}
        {statistics && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FiTrendingUp size={20} color="#333333" />
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#333333', margin: 0 }}>
                Thống Kê Chi Tiết
              </h2>
            </div>
            
            {loadingStats ? (
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
                <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải thống kê...</p>
              </div>
            ) : (
              <pre
                style={{
                  background: '#F5F5F5',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#333333',
                  overflow: 'auto',
                  maxHeight: '400px',
                  margin: 0,
                }}
              >
                {JSON.stringify(statistics.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
