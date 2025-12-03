import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import { gsap } from 'gsap';
import matchingService from '../api/matchingService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { 
  FiTrendingUp, 
  FiCheck, 
  FiX, 
  FiPackage,
  FiCalendar,
  FiMapPin,
  FiTag,
  FiEye,
  FiImage,
  FiArrowRight
} from 'react-icons/fi';
import { formatDate } from '../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../utils/constants';

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
    // Reset refs when data changes
    cardsRef.current = [];
  }, [data]);

  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      setTimeout(() => {
        const validRefs = cardsRef.current.filter(ref => ref !== null && ref !== undefined);
        if (validRefs.length > 0) {
          gsap.fromTo(validRefs,
            { opacity: 0, x: -100, rotationY: -45 },
            { 
              opacity: 1, 
              x: 0, 
              rotationY: 0, 
              duration: 0.6, 
              stagger: 0.15,
              ease: 'power3.out' 
            },
            '-=0.2'
          );
        }
      }, 100);
    }
  }, [data]);

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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return { bg: '#D1FAE5', color: '#065F46', border: '#34D399' };
    if (confidence >= 60) return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
    return { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' };
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return `${BASE_URL}${image}`;
    return `${BASE_URL}/uploads/${image}`;
  };

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCampusLabel = (campus) => {
    const camp = CAMPUSES.find(c => c.value === campus);
    return camp ? camp.label : campus;
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
                const confidenceColors = getConfidenceColor(suggestion.matchConfidence);
                const lostItem = suggestion.lostItem || {};
                const foundItem = suggestion.foundItem || {};
                const lostImage = lostItem.images && lostItem.images.length > 0 
                  ? getImageUrl(lostItem.images[0]) 
                  : null;
                const foundImage = foundItem.images && foundItem.images.length > 0 
                  ? getImageUrl(foundItem.images[0]) 
                  : null;

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
                    {/* Confidence Badge */}
                    <div 
                      className="confidence-badge-top"
                      style={{
                        backgroundColor: confidenceColors.bg,
                        color: confidenceColors.color,
                        borderColor: confidenceColors.border
                      }}
                    >
                      <FiTrendingUp />
                      <span>Độ khớp: {suggestion.matchConfidence}%</span>
                    </div>

                    {/* Card Content */}
                    <div className="suggestion-card-content">
                      {/* Comparison Section */}
                      <div className="comparison-section">
                        {/* Lost Item */}
                        <div className="comparison-item lost-item">
                          <div className="comparison-header">
                            <h4>Đồ bị mất</h4>
                            <button 
                              className="btn-view-detail-small"
                              onClick={() => navigate(`/lost-items/${lostItem.reportId || lostItem._id}`)}
                            >
                              <FiEye size={14} />
                              Xem
                            </button>
                          </div>
                          <div className="comparison-image">
                            {lostImage ? (
                              <img 
                                src={lostImage} 
                                alt={lostItem.itemName}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="image-placeholder"
                              style={{ display: lostImage ? 'none' : 'flex' }}
                            >
                              <FiPackage size={32} />
                            </div>
                          </div>
                          <div className="comparison-info">
                            <h5>{lostItem.itemName || 'N/A'}</h5>
                            <div className="info-row">
                              <FiTag size={14} />
                              <span>{getCategoryLabel(lostItem.category)}</span>
                            </div>
                            <div className="info-row">
                              <span>🎨</span>
                              <span>{lostItem.color || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                              <FiMapPin size={14} />
                              <span>{getCampusLabel(lostItem.campus)}</span>
                            </div>
                            {lostItem.dateLost && (
                              <div className="info-row">
                                <FiCalendar size={14} />
                                <span>{formatDate(lostItem.dateLost)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="comparison-arrow">
                          <FiArrowRight size={24} />
                        </div>

                        {/* Found Item */}
                        <div className="comparison-item found-item">
                          <div className="comparison-header">
                            <h4>Đồ tìm thấy</h4>
                            <button 
                              className="btn-view-detail-small"
                              onClick={() => navigate(`/found-items/${foundItem.foundId || foundItem._id}`)}
                            >
                              <FiEye size={14} />
                              Xem
                            </button>
                          </div>
                          <div className="comparison-image">
                            {foundImage ? (
                              <img 
                                src={foundImage} 
                                alt={foundItem.itemName}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="image-placeholder"
                              style={{ display: foundImage ? 'none' : 'flex' }}
                            >
                              <FiPackage size={32} />
                            </div>
                          </div>
                          <div className="comparison-info">
                            <h5>{foundItem.itemName || 'N/A'}</h5>
                            <div className="info-row">
                              <FiTag size={14} />
                              <span>{getCategoryLabel(foundItem.category)}</span>
                            </div>
                            <div className="info-row">
                              <span>🎨</span>
                              <span>{foundItem.color || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                              <FiMapPin size={14} />
                              <span>{getCampusLabel(foundItem.campus)}</span>
                            </div>
                            {foundItem.dateFound && (
                              <div className="info-row">
                                <FiCalendar size={14} />
                                <span>{formatDate(foundItem.dateFound)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Reason */}
                      <div className="match-reason-section">
                        <div className="match-reason-header">
                          <FiTrendingUp size={18} />
                          <strong>Lý do khớp:</strong>
                        </div>
                        <p className="match-reason-text">{suggestion.matchReason || 'Khớp về loại, màu, campus'}</p>
                      </div>

                      {/* Actions */}
                      <div className="card-actions">
                        <button 
                          className="btn-confirm"
                          onClick={() => handleConfirm(suggestion.matchId)}
                          disabled={processing[suggestion.matchId]}
                        >
                          <FiCheck />
                          {processing[suggestion.matchId] ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleReject(suggestion.matchId)}
                          disabled={processing[suggestion.matchId]}
                        >
                          <FiX />
                          {processing[suggestion.matchId] ? 'Đang xử lý...' : 'Từ chối'}
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

