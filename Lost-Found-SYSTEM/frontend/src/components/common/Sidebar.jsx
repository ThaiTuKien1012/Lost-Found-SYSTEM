import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiPackage, FiSearch, FiBarChart2, FiTrendingUp, FiUser, FiLogOut, FiCheckCircle, FiClock, FiPlus, FiList } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Organize menu items by sections
  const menuSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        { path: '/', label: 'Trang Chủ', icon: FiHome, roles: ['student', 'staff', 'security', 'admin'] },
        { path: '/profile', label: 'Hồ Sơ', icon: FiUser, roles: ['student', 'staff', 'security', 'admin'] },
      ]
    },
    {
      title: 'QUẢN LÝ',
      items: [
        { path: '/lost-items', label: 'Báo Mất', icon: FiPackage, roles: ['student'] },
        { path: '/lost-items/management', label: 'Quản Lý Báo Mất', icon: FiPackage, roles: ['staff'] },
        { path: '/found-items/search', label: 'Tìm Kiếm Đồ Tìm Thấy', icon: FiSearch, roles: ['student'] },
        { path: '/found-items/management', label: 'Quản Lý Đồ Tìm Thấy', icon: FiCheckCircle, roles: ['staff'] },
        { path: '/matching', label: 'Matching Requests', icon: FiTrendingUp, roles: ['student'] },
        { path: '/matching/management', label: 'Quản Lý Khớp Đồ', icon: FiTrendingUp, roles: ['staff'] },
        { path: '/returns/my-transactions', label: 'Lịch Sử Trả Đồ', icon: FiClock, roles: ['student'] },
        { path: '/returns/management', label: 'Quản Lý Trả Đồ', icon: FiClock, roles: ['staff'] },
      ]
    },
    {
      title: 'BẢO VỆ',
      items: [
        { path: '/security/found-items/list', label: 'Danh Sách Đồ', icon: FiList, roles: ['security'] },
        { path: '/security/ready-to-return', label: 'Đồ Sẵn Sàng Trả', icon: FiCheckCircle, roles: ['security'] },
        { path: '/security/return-history', label: 'Lịch Sử Trả', icon: FiClock, roles: ['security'] },
      ]
    },
    {
      title: 'BÁO CÁO',
      items: [
        { path: '/reports', label: 'Báo Cáo', icon: FiBarChart2, roles: ['staff', 'admin'] },
      ]
    }
  ];

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();
  
  // Filter sections and items based on user role
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
  })).filter(section => section.items.length > 0);
  
  // Get user initials from fullName
  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
    }}>
      {/* Logo Section */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: '#1A1A1A',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#F5F5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1A1A1A',
            fontSize: '18px',
          }}>
            <FiHome />
          </div>
          <h1 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1A1A1A',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            FPTU Lost & Found
          </h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        overflowY: 'auto',
      }}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '24px' }}>
            {/* Section Header */}
            <div style={{
              padding: '8px 12px',
              marginBottom: '8px',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {section.title}
              </span>
            </div>
            
            {/* Section Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    marginBottom: '2px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    background: isActive 
                      ? '#F5F5F5' 
                      : 'transparent',
                    color: '#1A1A1A',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon style={{
                    fontSize: '18px',
                    color: '#666666',
                  }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Menu Section */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #E5E7EB',
        background: '#FFFFFF',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          padding: '10px',
          background: '#F5F5F5',
          borderRadius: '8px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#E5E7EB',
            color: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '14px',
            flexShrink: 0,
          }}>
            {getUserInitials(user?.fullName)}
          </div>
          <div style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <span style={{
              fontWeight: 600,
              color: '#1A1A1A',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.fullName || 'Người dùng'}
            </span>
            <span style={{
              fontSize: '11px',
              color: '#9CA3AF',
              fontWeight: 400,
              textTransform: 'uppercase',
            }}>
              {user?.role || ''}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'transparent',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: 400,
            fontSize: '14px',
            transition: 'all 0.2s ease',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5F5F5';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <FiLogOut style={{ fontSize: '16px', color: '#666666' }} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

