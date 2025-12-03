import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { gsap } from 'gsap';
import { FiSearch, FiPackage, FiBarChart2, FiUser, FiLogOut, FiHome } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const tl = gsap.timeline();
    
    tl.fromTo(logoRef.current, 
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo(navRef.current?.children || [],
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(userMenuRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
      '-=0.2'
    );
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    gsap.to(headerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        logout();
        navigate('/login');
      }
    });
  };

  const navItems = [
    { path: '/lost-items', label: 'Báo Mất', icon: FiPackage },
    { path: '/found-items', label: 'Đồ Tìm Thấy', icon: FiSearch },
    { path: '/matching', label: 'Khớp Đồ', icon: FiSearch },
    { path: '/reports', label: 'Báo Cáo', icon: FiBarChart2 },
    { path: '/profile', label: 'Hồ Sơ', icon: FiUser }
  ];

  return (
    <header ref={headerRef} className="header-enhanced">
      <div className="header-container">
        <Link to="/" className="logo" ref={logoRef}>
          <div className="logo-icon">
            <FiHome />
          </div>
          <h1>FPTU Lost & Found</h1>
        </Link>
        
        {isAuthenticated && (
          <nav ref={navRef} className="nav-enhanced">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.05, y: -2, duration: 0.2 });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, y: 0, duration: 0.2 });
                  }}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div ref={userMenuRef} className="user-menu-enhanced">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-logout"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { scale: 1.1, rotation: 5, duration: 0.2 });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { scale: 1, rotation: 0, duration: 0.2 });
                }}
              >
                <FiLogOut />
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

