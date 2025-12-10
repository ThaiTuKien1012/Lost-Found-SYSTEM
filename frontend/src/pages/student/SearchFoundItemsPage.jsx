import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import foundItemService from '../../api/foundItemService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { 
  FiSearch, 
  FiPackage, 
  FiFilter, 
  FiImage, 
  FiEye,
  FiTag,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';
import { getImageUrl, getStatusLabel, getStatusColor } from '../../utils/helpers';

const SearchFoundItemsPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [campus, setCampus] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const itemsRef = useRef([]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounce search keyword for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Auto load all found items on initial mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      setSearchParams({ keyword: '', category: '', campus: '' });
      setIsInitialized(true);
    }
  }, []);

  // Fetch data when searchParams or page changes
  useEffect(() => {
    if (!isInitialized) return;

    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await foundItemService.searchFoundItems(
          searchParams.keyword || '', 
          { 
            category: searchParams.category || '', 
            campus: searchParams.campus || '',
            status: 'unclaimed' // Only show unclaimed items
          }, 
          page, 
          20
        );

        if (isCancelled) return;

        if (result && result.success !== false) {
          setData({
            success: true,
            data: result.data || result.items || [],
            pagination: result.pagination || { total: 0, page: 1, pages: 0 }
          });
        } else {
          setError(result?.error || 'Tìm kiếm thất bại');
          setData({
            success: false,
            data: [],
            pagination: { total: 0, page: 1, pages: 0 }
          });
        }
      } catch (err) {
        if (isCancelled) return;
        console.error('Search error:', err);
        setError(err.message || 'Có lỗi xảy ra khi tìm kiếm');
        setData({
          success: false,
          data: [],
          pagination: { total: 0, page: 1, pages: 0 }
        });
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [searchParams.keyword, searchParams.category, searchParams.campus, page, isInitialized]);

  // Animation effects
  useEffect(() => {
    if (!titleRef.current || !searchRef.current) return;

    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: -30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo(searchRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );
  }, []);

  // Reset itemsRef when data changes
  useEffect(() => {
    itemsRef.current = [];
  }, [data]);

  // Animate items when data changes
  useEffect(() => {
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      setTimeout(() => {
        const validRefs = itemsRef.current.filter(ref => ref !== null && ref !== undefined);
        if (validRefs.length > 0) {
          gsap.fromTo(validRefs,
            { opacity: 0, y: 50, rotationX: -90 },
            { 
              opacity: 1, 
              y: 0, 
              rotationX: 0, 
              duration: 0.5, 
              stagger: 0.1,
              ease: 'power3.out' 
            },
            '-=0.2'
          );
        }
      }, 100);
    }
  }, [data]);

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const searchKeyword = keyword.trim();
    setSearchParams({ keyword: searchKeyword, category, campus });
    setPage(1);
  };

  // Auto search when category or campus changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      setCategory(value);
    } else if (filterType === 'campus') {
      setCampus(value);
    }
    
    setSearchParams({ 
      keyword: searchParams.keyword || debouncedKeyword || keyword, 
      category: filterType === 'category' ? value : category,
      campus: filterType === 'campus' ? value : campus
    });
    setPage(1);
  };

  const handleViewDetail = (itemId) => {
    navigate(`/found-items/${itemId}`);
  };

  const handleCardHover = (index, isHovering) => {
    const card = itemsRef.current[index];
    if (!card || !gsap) return;

    try {
      gsap.to(card, {
        scale: isHovering ? 1.03 : 1,
        y: isHovering ? -5 : 0,
        rotationY: isHovering ? 2 : 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    } catch (err) {
      console.error('GSAP animation error:', err);
    }
  };

  const getCategoryLabel = (categoryValue) => {
    const cat = CATEGORIES.find(c => c.value === categoryValue);
    return cat ? cat.label : categoryValue;
  };

  const getCampusLabel = (campusValue) => {
    const camp = CAMPUSES.find(c => c.value === campusValue);
    return camp ? camp.label : campusValue;
  };

  return (
    <div ref={pageRef} className="found-items-page-redesign">
      <AnimatedBackground intensity={0.08} />
      
      {/* Header */}
      <div className="page-header-redesign">
        <div className="title-wrapper-redesign">
          <div className="title-icon-wrapper">
            <FiSearch className="title-icon-redesign" />
          </div>
          <div>
            <h1 ref={titleRef} className="page-title-redesign">Tìm Kiếm Đồ Tìm Thấy</h1>
            <p className="page-subtitle">Tìm kiếm đồ vật đã được tìm thấy và chưa được nhận</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="found-items-controls-redesign">
        <div className="search-bar-redesign">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon-redesign" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              className="search-input-redesign"
            />
            <button onClick={handleSearch} className="btn-search-redesign">
              Tìm kiếm
            </button>
          </div>
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-filter-redesign ${showFilters ? 'active' : ''}`}
        >
          <FiFilter /> {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel-redesign">
          <div className="filter-group-redesign">
            <label>Danh mục:</label>
            <select 
              value={category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select-redesign"
            >
              <option value="">Tất cả</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group-redesign">
            <label>Campus:</label>
            <select 
              value={campus} 
              onChange={(e) => handleFilterChange('campus', e.target.value)}
              className="filter-select-redesign"
            >
              <option value="">Tất cả</option>
              {CAMPUSES.map(camp => (
                <option key={camp.value} value={camp.value}>{camp.label}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              setCategory('');
              setCampus('');
              setSearchParams({ 
                keyword: searchParams.keyword || keyword, 
                category: '', 
                campus: '' 
              });
              setPage(1);
            }}
            className="btn-clear-filters-redesign"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Content */}
      <div className="found-items-content-redesign">
        {loading && (
          <div className="loading-enhanced">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="error-enhanced">
            <p>Lỗi: {typeof error === 'string' ? error : error?.message || 'Có lỗi xảy ra'}</p>
            <button 
              onClick={() => {
                setSearchParams({ keyword: debouncedKeyword || keyword, category, campus });
                setPage(1);
              }}
              className="btn-retry"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && data && data.data !== undefined && (
          <>
            {(!data.data || data.data.length === 0) ? (
              <div className="empty-state-redesign">
                <FiPackage className="empty-icon-redesign" />
                <h3>Không tìm thấy đồ vật nào</h3>
                <p>
                  {searchParams.keyword || searchParams.category || searchParams.campus
                    ? 'Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại'
                    : 'Nhập từ khóa hoặc chọn bộ lọc để bắt đầu tìm kiếm'}
                </p>
              </div>
            ) : (
              <>
                <div className="results-count" style={{ 
                  marginBottom: '20px', 
                  fontSize: '14px', 
                  color: '#666',
                  fontWeight: 500
                }}>
                  Tìm thấy <strong style={{ color: '#667eea' }}>{data.pagination?.total || data.data?.length || 0}</strong> kết quả
                </div>
                
                <div className="found-items-grid-redesign">
                  {data.data && Array.isArray(data.data) && data.data.map((item, index) => {
                    if (!item) return null;
                    return (
                      <div
                        key={item._id || item.foundId || index}
                        ref={el => {
                          if (el) itemsRef.current[index] = el;
                        }}
                        className="found-item-card-redesign"
                        onMouseEnter={() => handleCardHover(index, true)}
                        onMouseLeave={() => handleCardHover(index, false)}
                        onClick={() => {
                          const itemId = item._id || item.foundId;
                          if (itemId) {
                            handleViewDetail(itemId);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Image Section */}
                        <div className="found-item-image-section-redesign">
                          {item.images && item.images.length > 0 ? (
                            <img 
                              src={getImageUrl(item.images[0])} 
                              alt={item.itemName}
                              className="found-item-image-redesign"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : (
                            <div className="found-item-image-placeholder-redesign">
                              <FiImage className="placeholder-icon-redesign" />
                            </div>
                          )}
                          <div 
                            className="found-item-status-badge-redesign" 
                            style={{ 
                              backgroundColor: getStatusColor(item.status || 'unclaimed').bg,
                              color: getStatusColor(item.status || 'unclaimed').color,
                              borderColor: getStatusColor(item.status || 'unclaimed').border
                            }}
                          >
                            {getStatusLabel(item.status || 'unclaimed')}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="found-item-content-redesign">
                          <div className="found-item-header-redesign">
                            <h3 className="found-item-title-redesign">{item.itemName || 'Không có tên'}</h3>
                            {item.foundId && (
                              <span className="found-item-id-redesign">#{item.foundId}</span>
                            )}
                          </div>

                          {item.description && (
                            <p className="found-item-description-redesign">
                              {item.description.length > 100 
                                ? `${item.description.substring(0, 100)}...` 
                                : item.description}
                            </p>
                          )}

                          <div className="found-item-meta-redesign">
                            <div className="meta-item-redesign">
                              <FiTag className="meta-icon-redesign" />
                              <span>{getCategoryLabel(item.category)}</span>
                            </div>
                            {item.color && (
                              <div className="meta-item-redesign">
                                <span>Màu: {item.color}</span>
                              </div>
                            )}
                            <div className="meta-item-redesign">
                              <FiMapPin className="meta-icon-redesign" />
                              <span>{getCampusLabel(item.campus)}</span>
                            </div>
                          </div>

                          <div className="found-item-footer-redesign" style={{ 
                            marginTop: '12px', 
                            paddingTop: '12px', 
                            borderTop: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div className="found-item-date-redesign" style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              <FiCalendar size={14} />
                              <span>
                                {item.dateFound 
                                  ? new Date(item.dateFound).toLocaleDateString('vi-VN')
                                  : 'N/A'}
                              </span>
                            </div>
                            <button
                              className="btn-view-detail-redesign"
                              onClick={(e) => {
                                e.stopPropagation();
                                const itemId = item._id || item.foundId;
                                if (itemId) {
                                  handleViewDetail(itemId);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#5568d3';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#667eea';
                              }}
                            >
                              <FiEye size={14} />
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {data.pagination && data.pagination.pages > 1 && (
                  <div className="pagination-enhanced">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchFoundItemsPage;
