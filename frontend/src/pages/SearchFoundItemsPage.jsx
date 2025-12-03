import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { gsap } from 'gsap';
import foundItemService from '../api/foundItemService';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { FiSearch, FiPackage, FiFilter, FiImage, FiEye } from 'react-icons/fi';

const SearchFoundItemsPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [campus, setCampus] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const itemsRef = useRef([]);

  // Debounce search keyword for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, loading, error } = useFetch(
    () => {
      // Only search if searchParams is set (user clicked search or changed filters)
      if (Object.keys(searchParams).length > 0) {
        return foundItemService.searchFoundItems(
          searchParams.keyword || '', 
          { 
            category: searchParams.category || '', 
            campus: searchParams.campus || '',
            status: 'unclaimed' // Only show unclaimed items
          }, 
          page, 
          20
        );
      }
      // Return empty result on initial load
      return Promise.resolve({ success: true, data: [], pagination: { total: 0, page: 1, pages: 0 } });
    },
    [searchParams, page]
  );

  useEffect(() => {
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

    if (data?.data && itemsRef.current.length > 0) {
      gsap.fromTo(itemsRef.current,
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
  }, [data]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword: debouncedKeyword || keyword, category, campus });
    setPage(1);
  };

  // Auto search when category or campus changes (but not on initial load)
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      setCategory(value);
    } else if (filterType === 'campus') {
      setCampus(value);
    }
    
    // Only trigger search if user has already searched before
    if (Object.keys(searchParams).length > 0) {
      setSearchParams({ 
        keyword: searchParams.keyword || debouncedKeyword || keyword, 
        category: filterType === 'category' ? value : category,
        campus: filterType === 'campus' ? value : campus
      });
      setPage(1);
    }
  };

  const handleViewDetail = (itemId) => {
    navigate(`/found-items/${itemId}`);
  };

  const handleCardHover = (index, isHovering) => {
    const card = itemsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      scale: isHovering ? 1.03 : 1,
      y: isHovering ? -5 : 0,
      rotationY: isHovering ? 2 : 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <div ref={pageRef} className="search-found-items-page-enhanced">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiSearch className="title-icon" />
          <h1 ref={titleRef} className="page-title">Tìm Kiếm Đồ Tìm Thấy</h1>
        </div>
      </div>

      <div ref={searchRef} className="search-form-enhanced">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả loại</option>
              <option value="PHONE">Điện thoại</option>
              <option value="WALLET">Ví/Bóp</option>
              <option value="BAG">Túi xách</option>
              <option value="LAPTOP">Laptop</option>
              <option value="WATCH">Đồng hồ</option>
              <option value="BOOK">Sách</option>
              <option value="KEYS">Chìa khóa</option>
              <option value="OTHER">Khác</option>
            </select>

            <select
              value={campus}
              onChange={(e) => handleFilterChange('campus', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả campus</option>
              <option value="NVH">Nam Sài Gòn</option>
              <option value="SHTP">Saigon Hi-Tech Park</option>
            </select>

            <button type="submit" className="btn-search">
              <FiFilter />
              Tìm kiếm
            </button>
          </div>
        </form>
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
        
        {data && (
          <>
            {data.data?.length === 0 ? (
              <div className="empty-state-enhanced">
                <FiPackage className="empty-icon" />
                <h3>Không tìm thấy đồ vật nào</h3>
                <p>
                  {searchParams.keyword || searchParams.category || searchParams.campus
                    ? 'Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại'
                    : 'Nhập từ khóa hoặc chọn bộ lọc để bắt đầu tìm kiếm'}
                </p>
              </div>
            ) : (
              <>
                <div className="results-count">
                  Tìm thấy {data.pagination?.total || data.data?.length || 0} kết quả
                </div>
                <div className="items-grid-enhanced">
                  {data.data?.map((item, index) => (
                    <div
                      key={item._id || item.foundId}
                      ref={el => itemsRef.current[index] = el}
                      className="item-card-enhanced"
                      onMouseEnter={() => handleCardHover(index, true)}
                      onMouseLeave={() => handleCardHover(index, false)}
                    >
                      {/* Image Section */}
                      <div className="card-image-wrapper">
                        {item.images && item.images.length > 0 ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.itemName}
                            className="card-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="card-image-placeholder"
                          style={{ display: item.images && item.images.length > 0 ? 'none' : 'flex' }}
                        >
                          <FiPackage className="placeholder-icon" />
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="card-header">
                          <h3 className="card-title">{item.itemName}</h3>
                        </div>
                        <p className="card-description">{item.description}</p>
                        <div className="card-meta">
                          <span className="card-category">{item.category}</span>
                          <span className="card-color">Màu: {item.color}</span>
                          <span className="card-campus">{item.campus}</span>
                        </div>
                        <div className="card-footer">
                          <div className="card-info">
                            <span className="card-date">
                              Tìm thấy: {new Date(item.dateFound).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="card-location">
                              <FiPackage size={14} /> {item.locationFound}
                            </span>
                          </div>
                          <button
                            className="btn-view-detail"
                            onClick={() => handleViewDetail(item._id || item.foundId)}
                          >
                            <FiEye size={16} />
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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

