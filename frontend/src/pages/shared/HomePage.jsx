import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiPackage, FiSearch, FiTrendingUp, FiBarChart2, FiPlus, FiCheckCircle, FiClock } from 'react-icons/fi';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import StudentStats from '../../components/common/StudentStats';
import { useFetch } from '../../hooks/useFetch';
import reportService from '../../api/reportService';

const HomePage = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
  const statsCardsRef = useRef([]);

  // Fetch dashboard data for Staff/Admin
  const { data: dashboardData } = useFetch(
    () => (user?.role === 'staff' || user?.role === 'admin') ? reportService.getDashboard() : Promise.resolve({ success: false }),
    [user?.role]
  );


  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    );

    // Animate stats cards for Staff/Admin
    if ((user?.role === 'staff' || user?.role === 'admin') && statsCardsRef.current.length > 0) {
      gsap.fromTo(statsCardsRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.2'
      );
    }

    // Animate action cards
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 50, rotationY: -15 },
        { opacity: 1, y: 0, rotationY: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' },
        '-=0.3'
      );
    }

    // Floating animation for action cards
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.to(card, {
          y: '+=10',
          duration: 2 + index * 0.2,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true
        });
      }
    });
  }, [user?.role, dashboardData]);

  const handleCardHover = (index, isHovering) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      scale: isHovering ? 1.05 : 1,
      y: isHovering ? -10 : 0,
      rotationY: isHovering ? 5 : 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const actionCards = [
    user?.role === 'student' && {
      to: '/lost-items',
      icon: FiPackage,
      title: 'Báo Mất Đồ',
      description: 'Báo cáo đồ vật bị mất',
      color: '#EF4444'
    },
    user?.role === 'security' && {
      to: '/security/found-items/list',
      icon: FiPlus,
      title: 'Ghi Nhận Đồ Tìm Thấy',
      description: 'Ghi nhận đồ vật được tìm thấy',
      color: '#22C55E'
    },
    (user?.role === 'staff' || user?.role === 'admin') && {
      to: '/reports',
      icon: FiBarChart2,
      title: 'Báo Cáo',
      description: 'Xem báo cáo và thống kê',
      color: '#F97316'
    }
  ].filter(Boolean);

  return (
    <div className="home-page-enhanced">
      <AnimatedBackground intensity={0.15} />
      
      <div ref={heroRef} className="hero-section-enhanced">
        <h1 ref={titleRef} className="hero-title">
          Chào mừng, <span className="highlight">{user?.firstName} {user?.lastName}</span>!
        </h1>
        <p ref={subtitleRef} className="hero-subtitle">
          Hệ thống tìm kiếm đồ thất lạc FPTU
        </p>
      </div>

      {user?.role === 'student' && (
        <div className="student-stats-section">
          <StudentStats />
        </div>
      )}


      {/* Dashboard Stats for Staff/Admin */}
      {(user?.role === 'staff' || user?.role === 'admin') && dashboardData?.success && (
        <div className="staff-dashboard-stats">
          <div className="stats-grid-enhanced">
            <div 
              ref={el => statsCardsRef.current[0] = el}
              className="stat-card-enhanced stat-blue"
            >
              <div className="stat-icon-wrapper">
                <FiPackage className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-title">TỔNG BÁO CÁO</p>
                <p className="stat-value">{dashboardData.data?.totalLost || 0}</p>
              </div>
            </div>

            <div 
              ref={el => statsCardsRef.current[1] = el}
              className="stat-card-enhanced stat-green"
            >
              <div className="stat-icon-wrapper">
                <FiCheckCircle className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-title">ĐÃ TÌM THẤY</p>
                <p className="stat-value">{dashboardData.data?.totalFound || 0}</p>
              </div>
            </div>

            <div 
              ref={el => statsCardsRef.current[2] = el}
              className="stat-card-enhanced stat-purple"
            >
              <div className="stat-icon-wrapper">
                <FiTrendingUp className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-title">ĐÃ TRẢ LẠI</p>
                <p className="stat-value">{dashboardData.data?.totalReturned || 0}</p>
              </div>
            </div>

            <div 
              ref={el => statsCardsRef.current[3] = el}
              className="stat-card-enhanced stat-orange"
            >
              <div className="stat-content">
                <p className="stat-title">TỶ LỆ TRẢ LẠI</p>
                <p className="stat-value">{dashboardData.data?.recoveryRate || '0%'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions-enhanced">
        {actionCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              ref={el => cardsRef.current[index] = el}
              to={card.to}
              className="action-card-enhanced"
              onMouseEnter={() => handleCardHover(index, true)}
              onMouseLeave={() => handleCardHover(index, false)}
              style={{ '--card-color': card.color }}
            >
              <div className="card-icon-wrapper">
                <Icon className="card-icon" />
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <div className="card-arrow">
                <FiPlus />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;

