import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiSearch, FiTrendingUp, FiBarChart2, FiPlus, FiCheckCircle, FiClock } from 'react-icons/fi';
import StudentStats from '../../components/common/StudentStats';
import { useFetch } from '../../hooks/useFetch';
import reportService from '../../api/reportService';

const HomePage = () => {
  const { user } = useAuth();

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();

  // Fetch dashboard data for Staff/Admin
  const { data: dashboardData } = useFetch(
    () => (userRole === 'staff' || userRole === 'admin') ? reportService.getDashboard() : Promise.resolve({ success: false }),
    [userRole]
  );

  const actionCards = [
    userRole === 'student' && {
      to: '/lost-items',
      icon: FiPackage,
      title: 'Báo Mất Đồ',
      description: 'Báo cáo đồ vật bị mất',
      color: '#EF4444'
    },
    userRole === 'security' && {
      to: '/security/found-items/list',
      icon: FiPlus,
      title: 'Ghi Nhận Đồ Tìm Thấy',
      description: 'Ghi nhận đồ vật được tìm thấy',
      color: '#22C55E'
    },
    (userRole === 'staff' || userRole === 'admin') && {
      to: '/reports',
      icon: FiBarChart2,
      title: 'Báo Cáo',
      description: 'Xem báo cáo và thống kê',
      color: '#F97316'
    }
  ].filter(Boolean);

  // Student view with login page style
  if (userRole === 'student') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F5F5',
        padding: '20px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Welcome Section */}
          <motion.div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              padding: '40px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Chào mừng, {user?.fullName || 'Người dùng'}!
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666666',
              fontWeight: 400,
            }}>
              Hệ thống tìm kiếm đồ thất lạc FPTU
            </p>
          </motion.div>

          {/* Stats Section */}
          <StudentStats />
        </div>
      </div>
    );
  }

  // Staff/Admin view
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Welcome Section */}
        <motion.div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '40px',
            marginBottom: '24px',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Chào mừng, {user?.fullName || 'Người dùng'}!
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            fontWeight: 400,
          }}>
            Hệ thống tìm kiếm đồ thất lạc FPTU
          </p>
        </motion.div>

        {/* Dashboard Stats for Staff/Admin */}
        {(userRole === 'staff' || userRole === 'admin') && dashboardData?.success && (
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}>
              {[
                { title: 'TỔNG BÁO CÁO', value: dashboardData.data?.totalLost || 0, icon: FiPackage, color: '#6366F1' },
                { title: 'ĐÃ TÌM THẤY', value: dashboardData.data?.totalFound || 0, icon: FiCheckCircle, color: '#22C55E' },
                { title: 'ĐÃ TRẢ LẠI', value: dashboardData.data?.totalReturned || 0, icon: FiTrendingUp, color: '#A855F7' },
                { title: 'TỶ LỆ TRẢ LẠI', value: dashboardData.data?.recoveryRate || '0%', icon: null, color: '#F97316' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  >
                    {Icon && (
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        background: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon style={{ fontSize: '24px', color: stat.color }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        {stat.title}
                      </p>
                      <p style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        lineHeight: 1,
                      }}>
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Action Cards */}
        {actionCards.length > 0 && (
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    to={card.to}
                    style={{
                      display: 'block',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '32px 24px',
                      border: '1px solid #E5E7EB',
                      textDecoration: 'none',
                      color: '#1A1A1A',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = card.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
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
                      background: `${card.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}>
                      <Icon style={{ fontSize: '24px', color: card.color }} />
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '8px',
                      letterSpacing: '-0.01em',
                    }}>
                      {card.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      fontWeight: 400,
                      margin: 0,
                    }}>
                      {card.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

