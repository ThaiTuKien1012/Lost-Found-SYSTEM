import React, { useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { gsap } from 'gsap';
import reportService from '../../api/reportService';
import Dashboard from '../../components/reports/Dashboard';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { FiBarChart2, FiTrendingUp } from 'react-icons/fi';

const ReportsPage = () => {
  const { data: dashboardData } = useFetch(() => reportService.getDashboard());
  const { data: statistics } = useFetch(() => reportService.getStatistics());
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const dashboardRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );

    if (dashboardData && dashboardRef.current) {
      gsap.fromTo(dashboardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      );
    }

    if (statistics && statsRef.current) {
      gsap.fromTo(statsRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      );
    }
  }, [dashboardData, statistics]);

  return (
    <div ref={pageRef} className="reports-page-enhanced">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiBarChart2 className="title-icon" />
          <h1 ref={titleRef} className="page-title">Báo Cáo & Thống Kê</h1>
        </div>
      </div>

      <div className="content-container-enhanced">
        {dashboardData && (
          <div ref={dashboardRef} className="dashboard-container-enhanced">
            <Dashboard data={dashboardData.data} />
          </div>
        )}
        
        {statistics && (
          <div ref={statsRef} className="statistics-enhanced">
            <div className="statistics-header">
              <FiTrendingUp className="stats-icon" />
              <h2>Thống Kê Chi Tiết</h2>
            </div>
            <div className="statistics-content">
              <pre>{JSON.stringify(statistics.data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

