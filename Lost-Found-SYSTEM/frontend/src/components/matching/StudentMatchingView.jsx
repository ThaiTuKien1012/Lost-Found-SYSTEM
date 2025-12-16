import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { gsap } from 'gsap';
import matchingService from '../../api/matchingService';
import AnimatedBackground from '../common/AnimatedBackground';
import { formatDate, getImageUrl, getStatusColor } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiPackage, 
  FiUser, 
  FiClock,
  FiMapPin,
  FiTag,
  FiImage,
  FiTrendingUp
} from 'react-icons/fi';

const StudentMatchingView = () => {
  const { showSuccess, showError } = useNotification();
  const [processing, setProcessing] = useState(null);
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  const { data, loading, error, refetch } = useFetch(
    () => matchingService.getPendingMatches(1, 50),
    []
  );

  useEffect(() => {
    if (!titleRef.current) return;
    
    const tl = gsap.timeline();
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  useEffect(() => {
    if (!data?.data || data.data.length === 0) {
      cardsRef.current = [];
      return;
    }

    cardsRef.current = new Array(data.data.length).fill(null);

    const timer = setTimeout(() => {
      const validRefs = cardsRef.current.filter(ref => ref !== null && ref !== undefined);
      if (validRefs.length > 0) {
        gsap.fromTo(validRefs,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [data]);

  const handleConfirm = async (matchId, notes = '') => {
    setProcessing(matchId);
    try {
      const result = await matchingService.confirmMatch(matchId, notes);
      
      if (result.success) {
        showSuccess('Đã xác nhận match thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xác nhận match thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xác nhận match');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (matchId, reason = '') => {
    const reasonText = reason || window.prompt('Nhập lý do từ chối (tùy chọn):') || '';
    
    setProcessing(matchId);
    try {
      const result = await matchingService.rejectMatch(matchId, reasonText);
      
      if (result.success) {
        showSuccess('Đã từ chối match');
        refetch();
      } else {
        showError(result.error?.message || 'Từ chối match thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi từ chối match');
    } finally {
      setProcessing(null);
    }
  };

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCampusLabel = (campus) => {
    const camp = CAMPUSES.find(c => c.value === campus);
    return camp ? camp.label : campus;
  };

  if (loading) {
    return (
      <div className="page-container">
        <AnimatedBackground />
        <div className="page-content">
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : (error?.message || error?.code || 'Có lỗi xảy ra');
    return (
      <div className="page-container">
        <AnimatedBackground />
        <div className="page-content">
          <div className="error-enhanced">
            <p>{errorMessage}</p>
            {errorMessage.includes('404') && (
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Vui lòng đảm bảo backend đã được khởi động và route /api/matching đã được đăng ký.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="page-container">
        <AnimatedBackground />
        <div className="page-content">
          <div className="empty-state-redesign">
            <FiPackage className="empty-icon-redesign" />
            <h3>Bạn chưa có yêu cầu match nào</h3>
            <p>Khi staff tạo match cho bạn, yêu cầu sẽ xuất hiện ở đây</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" ref={pageRef}>
      <AnimatedBackground />
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title" ref={titleRef}>
            <FiTrendingUp /> Yêu Cầu Khớp Đồ
          </h1>
          <p className="page-subtitle">Xem và xác nhận các yêu cầu khớp đồ từ staff</p>
        </div>

        <div className="matches-list-redesign">
          {data.data.map((match, index) => (
            <div
              key={match.requestId}
              ref={el => cardsRef.current[index] = el}
              className="match-request-card-redesign"
            >
              {/* Card Header */}
              <div className="match-card-header-redesign">
                <div className="match-header-left">
                  <div className="match-id-badge-redesign">
                    <FiTrendingUp />
                    <span>Request ID: {match.requestId}</span>
                  </div>
                  <div className="match-date-redesign">
                    <FiClock />
                    <span>{formatDate(match.createdAt)}</span>
                  </div>
                </div>
                {match.staff && (
                  <div className="match-staff-badge-redesign">
                    <FiUser />
                    <span>Match bởi: {match.staff.name}</span>
                  </div>
                )}
              </div>

              {/* Found Item Section */}
              {match.foundItem && (
                <div className="match-found-item-section-redesign">
                  <div className="found-item-image-wrapper-redesign">
                    {match.foundItem.images?.[0] ? (
                      <img
                        src={getImageUrl(match.foundItem.images[0])}
                        alt={match.foundItem.itemName}
                        className="found-item-image-match-redesign"
                      />
                    ) : (
                      <div className="found-item-image-placeholder-match-redesign">
                        <FiImage className="placeholder-icon-redesign" />
                      </div>
                    )}
                  </div>

                  <div className="found-item-info-redesign">
                    <div className="found-item-title-section-redesign">
                      <h3 className="found-item-title-match-redesign">
                        <FiPackage />
                        {match.foundItem.itemName}
                      </h3>
                      {match.foundItem.foundId && (
                        <span className="found-item-id-match-redesign">#{match.foundItem.foundId}</span>
                      )}
                    </div>

                    {match.foundItem.description && (
                      <p className="found-item-description-match-redesign">
                        {match.foundItem.description}
                      </p>
                    )}

                    <div className="found-item-meta-match-redesign">
                      <div className="meta-item-match-redesign">
                        <FiTag className="meta-icon-match-redesign" />
                        <span>{getCategoryLabel(match.foundItem.category)}</span>
                      </div>
                      <div className="meta-item-match-redesign">
                        <span className="meta-color-dot" style={{ backgroundColor: match.foundItem.color?.toLowerCase() || '#000' }}></span>
                        <span>{match.foundItem.color}</span>
                      </div>
                      <div className="meta-item-match-redesign">
                        <FiMapPin className="meta-icon-match-redesign" />
                        <span>{getCampusLabel(match.foundItem.campus)}</span>
                      </div>
                      <div className="meta-item-match-redesign">
                        <FiClock className="meta-icon-match-redesign" />
                        <span>{formatDate(match.foundItem.dateFound)}</span>
                      </div>
                    </div>

                    {match.foundItem.locationFound && (
                      <div className="found-item-location-match-redesign">
                        <FiMapPin />
                        <span>{match.foundItem.locationFound}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Match Reason Box */}
              {match.matchReason && (
                <div className="match-reason-box-redesign">
                  <div className="match-reason-header-redesign">
                    <FiTrendingUp />
                    <strong>Lý do match:</strong>
                  </div>
                  <p className="match-reason-text-redesign">{match.matchReason}</p>
                </div>
              )}

              {/* Notes */}
              {match.notes && (
                <div className="match-notes-redesign">
                  <strong>Ghi chú:</strong>
                  <p>{match.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="match-actions-redesign">
                <button
                  className="btn-confirm-match-redesign"
                  onClick={() => handleConfirm(match.requestId)}
                  disabled={processing === match.requestId}
                >
                  <FiCheckCircle />
                  {processing === match.requestId ? 'Đang xử lý...' : 'Confirm'}
                </button>
                <button
                  className="btn-reject-match-redesign"
                  onClick={() => handleReject(match.requestId)}
                  disabled={processing === match.requestId}
                >
                  <FiXCircle />
                  {processing === match.requestId ? 'Đang xử lý...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentMatchingView;
