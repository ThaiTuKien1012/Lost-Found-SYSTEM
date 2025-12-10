import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import lostItemService from '../../api/lostItemService';
import LostItemForm from '../../components/lost-items/LostItemForm';
import LostItemList from '../../components/lost-items/LostItemList';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { FiPlus, FiX, FiPackage } from 'react-icons/fi';

const LostItemsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const formRef = useRef(null);
  const listRef = useRef(null);

  const { data, loading, error, refetch } = useFetch(
    () => lostItemService.getMyReports(page),
    [page]
  );

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo(buttonRef.current,
      { opacity: 0, scale: 0.8, rotation: -180 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.3'
    );

    if (data && !loading && !error) {
      gsap.fromTo(listRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      );
    }
  }, [data, loading, error]);

  useEffect(() => {
    if (showForm && formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [showForm]);

  const handleCreateReport = async (formData) => {
    const result = await lostItemService.createReport(formData);
    if (result.success) {
      showSuccess('Báo cáo đã được tạo thành công!');
      
      // Show warning if exists (e.g., date > 90 days)
      if (result.warning) {
        showWarning(result.warning);
      }
      
      // Animate form out
      gsap.to(formRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.95,
        duration: 0.3,
        onComplete: () => {
          setShowForm(false);
          // Refetch data instead of reloading the page
          refetch();
        }
      });
    } else {
      showError(result.error?.message || result.error || 'Tạo báo cáo thất bại');
      
      // Shake animation on error
      gsap.to(formRef.current, {
        x: -10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(formRef.current, { x: 0 });
        }
      });
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div ref={pageRef} className="lost-items-page-enhanced">
      <AnimatedBackground intensity={0.1} />
      
      <div ref={headerRef} className="page-header-enhanced">
        <div className="header-content">
          <div className="title-wrapper">
            <FiPackage className="title-icon" />
            <h1 ref={titleRef} className="page-title">Báo Cáo Đồ Thất Lạc</h1>
          </div>
          <button
            ref={buttonRef}
            onClick={toggleForm}
            className="btn-create-enhanced"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { scale: 1.05, rotation: 5, duration: 0.2 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { scale: 1, rotation: 0, duration: 0.2 });
            }}
          >
            {showForm ? (
              <>
                <FiX />
                <span>Hủy</span>
              </>
            ) : (
              <>
                <FiPlus />
                <span>Tạo Báo Cáo Mới</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="form-container-enhanced">
          <LostItemForm onSubmit={handleCreateReport} />
        </div>
      )}

      <div ref={listRef} className="content-container-enhanced">
        {loading ? (
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : error ? (
          <div className="error-enhanced">
            <p>{error}</p>
          </div>
        ) : (
          <LostItemList
            items={data?.data || []}
            pagination={data?.pagination}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default LostItemsPage;

