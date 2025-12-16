import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiPackage, FiSearch, FiBarChart2, FiTrendingUp, FiUser, FiLogOut, FiCheckCircle, FiClock, FiPlus, FiList } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    { path: '/', label: 'Trang Chủ', icon: FiHome, roles: ['student', 'staff', 'security', 'admin'] },
    { path: '/lost-items', label: 'Báo Mất', icon: FiPackage, roles: ['student'] },
    { path: '/lost-items/management', label: 'Quản Lý Báo Mất', icon: FiPackage, roles: ['staff'] },
    { path: '/found-items/search', label: 'Tìm Kiếm Đồ Tìm Thấy', icon: FiSearch, roles: ['student'] },
    { path: '/matching', label: 'Matching Requests', icon: FiTrendingUp, roles: ['student'] },
    { path: '/matching/management', label: 'Quản Lý Khớp Đồ', icon: FiTrendingUp, roles: ['staff'] },
    { path: '/security/found-items/list', label: 'Danh Sách Đồ', icon: FiList, roles: ['security'] },
    { path: '/security/ready-to-return', label: 'Đồ Sẵn Sàng Trả', icon: FiCheckCircle, roles: ['security'] },
    { path: '/security/return-history', label: 'Lịch Sử Trả', icon: FiClock, roles: ['security'] },
    { path: '/returns/my-transactions', label: 'Lịch Sử Trả Đồ', icon: FiClock, roles: ['student'] },
    { path: '/returns/management', label: 'Quản Lý Trả Đồ', icon: FiClock, roles: ['staff'] },
    { path: '/found-items/management', label: 'Quản Lý Đồ Tìm Thấy', icon: FiCheckCircle, roles: ['staff'] },
    { path: '/reports', label: 'Báo Cáo', icon: FiBarChart2, roles: ['staff', 'admin'] },
    { path: '/profile', label: 'Hồ Sơ', icon: FiUser, roles: ['student', 'staff', 'security', 'admin'] }
  ];

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();
  
  const filteredItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );
  
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
            {getUserInitials(user?.fullName)}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user?.fullName || 'Người dùng'}</span>
            <span className="sidebar-user-role">{user?.role || ''}</span>
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

