import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import matchingService from '../../api/matchingService';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { gsap } from 'gsap';
import { 
  FiClock, 
  FiSearch, 
  FiCalendar, 
  FiUser, 
  FiPackage, 
  FiCheckCircle,
  FiMapPin,
  FiTag,
  FiImage,
  FiFilter
} from 'react-icons/fi';
import { formatDate, getImageUrl } from '../../utils/helpers';

const SecurityReturnHistoryPage = () => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const itemsRef = useRef([]);

  const { data, loading, error, refetch } = useFetch(
    () => {
      const additionalParams = {};
      if (fromDate) additionalParams.fromDate = fromDate;
      if (toDate) additionalParams.toDate = toDate;
      return matchingService.getMatches(1, 50, 'completed', additionalParams);
    },
    [fromDate, toDate]
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
      itemsRef.current = [];
      return;
    }

    itemsRef.current = new Array(data.data.length).fill(null);

    const timer = setTimeout(() => {
      const validRefs = itemsRef.current.filter(ref => ref !== null && ref !== undefined);
      if (validRefs.length > 0) {
        gsap.fromTo(validRefs,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        );
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

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
          </div>
        </div>
      </div>
    );
  }

  const filteredData = data?.data?.filter((match) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      match.foundItem?.itemName?.toLowerCase().includes(searchLower) ||
      match.student?.name?.toLowerCase().includes(searchLower) ||
      match.foundItem?.category?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="page-container" ref={pageRef}>
      <AnimatedBackground />
      <div className="page-content">
        <div className="page-header-enhanced">
          <div className="title-wrapper">
            <FiClock className="title-icon" />
            <div>
              <h1 className="page-title" ref={titleRef}>Lịch Sử Trả Đồ</h1>
              <p className="page-subtitle">Xem lịch sử các giao dịch trả đồ đã hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="found-items-controls-redesign">
          <div className="search-bar-redesign">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon-redesign" />
              <input
                type="text"
                className="search-input-redesign"
                placeholder="Tìm kiếm theo tên đồ vật, sinh viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <button
            className={`btn-filter-redesign ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Ẩn Bộ Lọc' : 'Bộ Lọc'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel-redesign">
            <div className="filter-group-redesign">
              <label>Từ ngày</label>
              <div className="date-input-wrapper-redesign">
                <FiCalendar className="date-icon-redesign" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="filter-select-redesign"
                />
              </div>
            </div>

            <div className="filter-group-redesign">
              <label>Đến ngày</label>
              <div className="date-input-wrapper-redesign">
                <FiCalendar className="date-icon-redesign" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="filter-select-redesign"
                />
              </div>
            </div>

            <button
              className="btn-clear-filters-redesign"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setSearch('');
              }}
            >
              Xóa Bộ Lọc
            </button>
          </div>
        )}

        {/* Content */}
        {!filteredData.length ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state-redesign">
                <FiClock className="empty-icon-redesign" />
                <h3>Chưa có lịch sử trả đồ</h3>
                <p>Chưa có giao dịch trả đồ nào được hoàn thành</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="found-items-grid-redesign">
            {filteredData.map((match, index) => (
              <div
                key={match._id || match.requestId}
                ref={el => itemsRef.current[index] = el}
                className="found-item-card-redesign"
              >
                <div className="found-item-image-section-redesign">
                  {match.foundItem?.images?.[0] ? (
                    <img
                      src={getImageUrl(match.foundItem.images[0])}
                      alt={match.foundItem.itemName}
                      className="found-item-image-redesign"
                    />
                  ) : (
                    <div className="found-item-image-placeholder-redesign">
                      <FiImage className="placeholder-icon-redesign" />
                    </div>
                  )}
                  <div className="found-item-status-badge-redesign" style={{
                    background: '#22C55E',
                    color: 'white'
                  }}>
                    <FiCheckCircle /> Đã hoàn thành
                  </div>
                </div>

                <div className="found-item-content-redesign">
                  <div className="found-item-header-redesign">
                    <h3 className="found-item-title-redesign">{match.foundItem?.itemName || 'N/A'}</h3>
                    <span className="found-item-id-redesign">#{match.requestId || 'N/A'}</span>
                  </div>

                  {match.foundItem?.description && (
                    <p className="found-item-description-redesign">{match.foundItem.description}</p>
                  )}

                  <div className="found-item-meta-redesign">
                    {match.foundItem?.category && (
                      <div className="meta-item-redesign">
                        <FiTag className="meta-icon-redesign" />
                        <span>{match.foundItem.category}</span>
                      </div>
                    )}
                    {match.foundItem?.color && (
                      <div className="meta-item-redesign">
                        <FiPackage className="meta-icon-redesign" />
                        <span>{match.foundItem.color}</span>
                      </div>
                    )}
                    {match.completedAt && (
                      <div className="meta-item-redesign">
                        <FiCalendar className="meta-icon-redesign" />
                        <span>{formatDate(match.completedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  {match.student && (
                    <div className="found-item-location-redesign" style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FiUser style={{ color: '#2180A0' }} />
                        <strong style={{ color: '#134252' }}>{match.student.name || 'N/A'}</strong>
                      </div>
                      {match.student.email && (
                        <div style={{ fontSize: '14px', color: '#666', marginLeft: '24px', marginBottom: '4px' }}>
                          ✉️ {match.student.email}
                        </div>
                      )}
                      {match.student.phone && (
                        <div style={{ fontSize: '14px', color: '#666', marginLeft: '24px' }}>
                          📱 {match.student.phone}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completion Info */}
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FiCheckCircle style={{ color: '#22C55E' }} />
                      <strong style={{ color: '#166534' }}>Đã trả thành công</strong>
                    </div>
                    {match.completedAt && (
                      <div style={{ fontSize: '14px', color: '#166534', marginLeft: '24px', marginBottom: '4px' }}>
                        📅 {formatDate(match.completedAt)}
                      </div>
                    )}
                    {match.completedBy && (
                      <div style={{ fontSize: '14px', color: '#166534', marginLeft: '24px' }}>
                        👤 Xác nhận bởi: {match.completedBy}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {match.completionNotes && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      backgroundColor: '#fff9e6', 
                      borderRadius: '8px',
                      border: '1px solid #fde68a'
                    }}>
                      <div style={{ fontSize: '14px', color: '#92400e' }}>
                        <strong>📝 Ghi chú:</strong> {match.completionNotes}
                      </div>
                    </div>
                  )}

                  {/* Match Reason */}
                  {match.matchReason && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      backgroundColor: '#eff6ff', 
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{ fontSize: '13px', color: '#1e40af' }}>
                        💡 <strong>Lý do match:</strong> {match.matchReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityReturnHistoryPage;

