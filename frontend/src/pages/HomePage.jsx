import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiPackage, FiSearch, FiTrendingUp, FiBarChart2, FiPlus } from 'react-icons/fi';
import AnimatedBackground from '../components/common/AnimatedBackground';
import StudentStats from '../components/common/StudentStats';

const HomePage = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);

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
    )
    .fromTo(cardsRef.current,
      { opacity: 0, y: 50, rotationY: -15 },
      { opacity: 1, y: 0, rotationY: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' },
      '-=0.3'
    );

    // Floating animation for cards
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
  }, []);

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
      to: '/found-items',
      icon: FiSearch,
      title: 'Ghi Nhận Đồ Tìm Thấy',
      description: 'Ghi nhận đồ vật được tìm thấy',
      color: '#22C55E'
    },
    {
      to: '/matching',
      icon: FiTrendingUp,
      title: 'Khớp Đồ',
      description: 'Xem các gợi ý khớp đồ',
      color: '#06B6D4'
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

