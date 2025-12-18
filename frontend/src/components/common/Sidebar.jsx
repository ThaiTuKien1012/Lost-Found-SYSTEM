import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiHome, 
  FiPackage, 
  FiBarChart2, 
  FiTrendingUp, 
  FiUser, 
  FiLogOut, 
  FiCheckCircle, 
  FiClock, 
  FiList,
  FiSettings,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiFileText
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu items organized by sections
  const getMenuSections = () => {
    const role = user?.role;
    
    if (role === 'student') {
      return [
        {
          title: 'GENERAL',
          items: [
            { path: '/', label: 'Dashboard', icon: FiHome, badge: null },
            { path: '/lost-items', label: 'Báo Mất', icon: FiPackage, badge: null },
            { path: '/matching', label: 'Yêu Cầu Khớp Đồ', icon: FiTrendingUp, badge: null },
            { path: '/returns/my-transactions', label: 'Lịch Sử Trả Đồ', icon: FiClock, badge: null },
          ]
        },
        {
          title: 'SUPPORT',
          items: [
            { path: '/profile', label: 'Settings', icon: FiSettings, badge: null },
          ]
        }
      ];
    } else if (role === 'staff') {
      return [
        {
          title: 'GENERAL',
          items: [
            { path: '/', label: 'Dashboard', icon: FiHome, badge: null },
            { path: '/lost-items/management', label: 'Quản Lý Báo Mất', icon: FiPackage, badge: null },
            { path: '/found-items/management', label: 'Quản Lý Đồ Tìm Thấy', icon: FiCheckCircle, badge: null },
            { path: '/matching/management', label: 'Quản Lý Khớp Đồ', icon: FiTrendingUp, badge: null },
            { path: '/returns/management', label: 'Quản Lý Trả Đồ', icon: FiClock, badge: null },
          ]
        },
        {
          title: 'TOOLS',
          items: [
            { path: '/reports', label: 'Báo Cáo', icon: FiFileText, badge: null },
          ]
        },
        {
          title: 'SUPPORT',
          items: [
            { path: '/profile', label: 'Settings', icon: FiSettings, badge: null },
          ]
        }
      ];
    } else if (role === 'security') {
      return [
        {
          title: 'GENERAL',
          items: [
            { path: '/', label: 'Dashboard', icon: FiHome, badge: null },
            { path: '/security/found-items/list', label: 'Danh Sách Đồ', icon: FiList, badge: null },
            { path: '/security/ready-to-return', label: 'Đồ Sẵn Sàng Trả', icon: FiCheckCircle, badge: null },
            { path: '/security/return-history', label: 'Lịch Sử Trả', icon: FiClock, badge: null },
          ]
        },
        {
          title: 'SUPPORT',
          items: [
            { path: '/profile', label: 'Settings', icon: FiSettings, badge: null },
          ]
        }
      ];
    } else {
      // Admin or default
      return [
        {
          title: 'GENERAL',
          items: [
            { path: '/', label: 'Dashboard', icon: FiHome, badge: null },
            { path: '/reports', label: 'Báo Cáo', icon: FiBarChart2, badge: null },
          ]
        },
        {
          title: 'SUPPORT',
          items: [
            { path: '/profile', label: 'Settings', icon: FiSettings, badge: null },
          ]
        }
      ];
    }
  };

  const menuSections = getMenuSections();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <aside
      style={{
        width: isCollapsed ? '80px' : '280px',
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E0E0E0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {!isCollapsed && (
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#000000',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              FPTU Lost &<br />Found
            </span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #E0E0E0',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#666666',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#F5F5F5';
            e.target.style.borderColor = '#D1D5DB';
            e.target.style.color = '#333333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#FFFFFF';
            e.target.style.borderColor = '#E0E0E0';
            e.target.style.color = '#666666';
          }}
        >
          {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav
        style={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
        }}
      >
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '24px' }}>
            {!isCollapsed && (
              <div
                style={{
                  padding: '8px 20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#999999',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </div>
            )}
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
                    padding: '10px 20px',
                    margin: '2px 0',
                    textDecoration: 'none',
                    color: isActive ? '#333333' : '#666666',
                    background: isActive ? '#F5F5F5' : 'transparent',
                    transition: 'all 0.2s',
                    position: 'relative',
                    borderRadius: '0',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#FAFAFA';
                      e.currentTarget.style.color = '#333333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666666';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span
                        style={{
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: item.badge.type === 'notification' ? '#FF0000' : '#8B5CF6',
                            color: '#FFFFFF',
                            minWidth: '20px',
                            textAlign: 'center',
                          }}
                        >
                          {item.badge.value}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
            {sectionIndex < menuSections.length - 1 && (
              <div
                style={{
                  height: '1px',
                  background: '#E0E0E0',
                  margin: '16px 20px',
                }}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div
        style={{
          padding: '20px',
          borderTop: '1px solid #E0E0E0',
        }}
      >
        {/* User Info */}
        {!isCollapsed && (
          <>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#F5F5F5',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <FiUsers size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999999',
                    fontWeight: 500,
                    marginBottom: '2px',
                  }}
                >
                  {user?.role === 'student' ? 'Sinh viên' : user?.role === 'staff' ? 'Nhân viên' : 'Bảo vệ'}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                background: '#FFFFFF',
                color: '#333333',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginBottom: '16px',
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
              <FiLogOut size={16} />
              <span>Đăng xuất</span>
            </button>

            {/* Copyright */}
            <div
              style={{
                fontSize: '11px',
                color: '#999999',
                textAlign: 'center',
              }}
            >
              © 2024 FPTU Lost & Found
            </div>
          </>
        )}
        {isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                background: '#FFFFFF',
                color: '#333333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              title="Đăng xuất"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
