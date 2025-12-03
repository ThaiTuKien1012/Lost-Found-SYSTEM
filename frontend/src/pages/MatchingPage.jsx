import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import { gsap } from 'gsap';
import matchingService from '../api/matchingService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { FiTrendingUp, FiCheck, FiX, FiEye, FiCalendar, FiPackage } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';

const MatchingPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [processing, setProcessing] = useState({});
  
  const fetchSuggestions = async () => {
    return await matchingService.getSuggestions();
  };
  
  const { data, loading, error, refetch } = useFetch(fetchSuggestions, []);
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline();
    
    if (titleRef.current) {
      tl.fromTo(titleRef.current,
        { opacity: 0, y: -30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  useEffect(() => {
    cardsRef.current = [];
  }, [data]);

  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      setTimeout(() => {
        const validRefs = cardsRef.current.filter(ref => ref !== null && ref !== undefined);
        if (validRefs.length > 0) {
          gsap.fromTo(validRefs,
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.5, 
              stagger: 0.1,
              ease: 'power2.out' 
            }
          );
        }
      }, 100);
    }
  }, [data]);

  const handleCardHover = (index, isHovering) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      scale: isHovering ? 1.02 : 1,
      y: isHovering ? -5 : 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#22C55E';
    if (confidence >= 60) return '#F97316';
    return '#EF4444';
  };

  const handleConfirm = async (matchId) => {
    if (processing[matchId]) return;
    
    setProcessing(prev => ({ ...prev, [matchId]: true }));
    try {
      const result = await matchingService.confirmMatch(matchId, true);
      if (result.success) {
        showSuccess('Đã xác nhận khớp đồ thành công!');
        refetch();
      } else {
        showError(result.error || 'Xác nhận thất bại');
      }
    } catch (err) {
      showError('Có lỗi xảy ra khi xác nhận');
    } finally {
      setProcessing(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const handleReject = async (matchId) => {
    if (processing[matchId]) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn từ chối gợi ý này?')) {
      return;
    }
    
    setProcessing(prev => ({ ...prev, [matchId]: true }));
    try {
      const result = await matchingService.rejectMatch(matchId);
      if (result.success) {
        showSuccess('Đã từ chối gợi ý');
        refetch();
      } else {
        showError(result.error || 'Từ chối thất bại');
      }
    } catch (err) {
      showError('Có lỗi xảy ra khi từ chối');
    } finally {
      setProcessing(prev => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div ref={pageRef} className="matching-page-enhanced">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiTrendingUp className="title-icon" />
          <h1 ref={titleRef} className="page-title">Gợi Ý Khớp Đồ</h1>
        </div>
      </div>

      <div className="content-container-enhanced">
        {loading && (
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}
        
        {error && (
          <div className="error-enhanced">
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && data && data.data && data.data.length === 0 && (
          <div className="empty-state-enhanced">
            <FiTrendingUp className="empty-icon" />
            <h3>Không có gợi ý khớp đồ nào</h3>
            <p>Hiện tại không có gợi ý khớp đồ nào cho bạn. Hệ thống sẽ tự động tìm và gợi ý khi có đồ vật phù hợp.</p>
          </div>
        )}

        {data && data.data && data.data.length > 0 && (
          <>
            <div className="suggestions-stats">
              <p>Tìm thấy <strong>{data.data.length}</strong> gợi ý khớp đồ</p>
            </div>
            <div className="suggestions-grid-enhanced">
              {data.data.map((suggestion, index) => {
                const confidenceColor = getConfidenceColor(suggestion.matchConfidence);

                return (
                  <div
                    key={suggestion.matchId || index}
                    ref={el => {
                      if (el) cardsRef.current[index] = el;
                    }}
                    className="suggestion-card-enhanced"
                    onMouseEnter={() => handleCardHover(index, true)}
                    onMouseLeave={() => handleCardHover(index, false)}
                  >
                    {/* Confidence Badge - Top */}
                    <div 
                      className="confidence-badge-top"
                      style={{ 
                        backgroundColor: confidenceColor,
                        color: 'white'
                      }}
                    >
                      <FiTrendingUp />
                      <span>Độ khớp: {suggestion.matchConfidence}%</span>
                    </div>

                    {/* Card Content */}
                    <div className="suggestion-card-content-simple">
                      {/* Item Icon & Title */}
                      <div className="card-title-section">
                        <div className="item-icon-wrapper">
                          <FiPackage size={32} />
                        </div>
                        <div className="title-content">
                          <h3 className="card-title">{suggestion.itemName}</h3>
                          {suggestion.dateFound && (
                            <div className="card-date">
                              <FiCalendar size={14} />
                              <span>Tìm thấy: {formatDate(suggestion.dateFound)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Match Reason */}
                      <div className="match-reason-box">
                        <div className="match-reason-icon">
                          <FiTrendingUp size={20} />
                        </div>
                        <div className="match-reason-content">
                          <strong>Lý do khớp:</strong>
                          <p>{suggestion.matchReason || 'Khớp về loại, màu, campus'}</p>
                        </div>
                      </div>

                      {/* View Detail Button */}
                      {suggestion.foundItemId && (
                        <button 
                          className="btn-view-detail-full"
                          onClick={() => navigate(`/found-items/${suggestion.foundItemId}`)}
                        >
                          <FiEye size={18} />
                          <span>Xem chi tiết đồ tìm thấy</span>
                        </button>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="card-actions">
                        <button 
                          className="btn-confirm"
                          onClick={() => handleConfirm(suggestion.matchId)}
                          disabled={processing[suggestion.matchId]}
                        >
                          <FiCheck size={18} />
                          <span>{processing[suggestion.matchId] ? 'Đang xử lý...' : 'Xác nhận'}</span>
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(suggestion.matchId)}
                          disabled={processing[suggestion.matchId]}
                        >
                          <FiX size={18} />
                          <span>{processing[suggestion.matchId] ? 'Đang xử lý...' : 'Từ chối'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;
