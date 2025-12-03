import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiPackage, FiSearch, FiBarChart2, FiTrendingUp, FiUser, FiLogOut, FiCheckCircle, FiClock } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    { path: '/', label: 'Trang Chủ', icon: FiHome, roles: ['student', 'staff', 'security', 'admin'] },
    { path: '/lost-items', label: 'Báo Mất', icon: FiPackage, roles: ['student'] },
    { path: '/found-items/search', label: 'Tìm Kiếm Đồ Tìm Thấy', icon: FiSearch, roles: ['student'] },
    { path: '/matching', label: 'Khớp Đồ', icon: FiTrendingUp, roles: ['student', 'staff'] },
    { path: '/returns/my-transactions', label: 'Lịch Sử Trả Đồ', icon: FiClock, roles: ['student'] },
    { path: '/found-items', label: 'Đồ Tìm Thấy', icon: FiCheckCircle, roles: ['security', 'staff'] },
    { path: '/reports', label: 'Báo Cáo', icon: FiBarChart2, roles: ['staff', 'admin'] },
    { path: '/profile', label: 'Hồ Sơ', icon: FiUser, roles: ['student', 'staff', 'security', 'admin'] }
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <aside className="sidebar-enhanced">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <Link to="/" className="sidebar-logo-link">
          <div className="sidebar-logo-icon">
            <FiHome />
          </div>
          <h1 className="sidebar-logo-text">FPTU Lost & Found</h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item-enhanced ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <Icon />
              </div>
              <span className="sidebar-item-label">{item.label}</span>
              {isActive && (
                <div className="sidebar-item-indicator" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu Section */}
      <div className="sidebar-user-menu">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user?.firstName} {user?.lastName}</span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="sidebar-btn-logout"
        >
          <FiLogOut />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

