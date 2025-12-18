import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import matchingService from '../../api/matchingService';
import SearchBar from '../../components/common/SearchBar';
import { 
  FiClock, 
  FiCalendar, 
  FiUser, 
  FiPackage, 
  FiCheckCircle,
  FiMapPin,
  FiTag,
  FiImage
} from 'react-icons/fi';
import { formatDate, getImageUrl } from '../../utils/helpers';

const SecurityReturnHistoryPage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('completedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, loading, error, refetch } = useFetch(
    () => {
      const additionalParams = {};
      if (dateFrom) additionalParams.fromDate = dateFrom;
      if (dateTo) additionalParams.toDate = dateTo;
      return matchingService.getMatches(1, 50, 'completed', additionalParams);
    },
    [dateFrom, dateTo]
  );

  // Apply filters to items
  const getFilteredItems = () => {
    let items = data?.data || [];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.foundItem?.itemName?.toLowerCase().includes(query) ||
        item.student?.name?.toLowerCase().includes(query) ||
        item.foundItem?.category?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy) {
      items.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'completedAt':
            aVal = new Date(a.completedAt || a.createdAt);
            bVal = new Date(b.completedAt || b.createdAt);
            break;
          case 'itemName':
            aVal = a.foundItem?.itemName?.toLowerCase() || '';
            bVal = b.foundItem?.itemName?.toLowerCase() || '';
            break;
          default:
            return 0;
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  };

  const filteredItems = getFilteredItems();
  const displayedItems = filteredItems.slice((page - 1) * 20, page * 20);
  const totalPages = Math.ceil(filteredItems.length / 20);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px',
        background: '#F5F5F5',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiClock size={28} color="#333333" />
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#333333',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Lịch Sử Trả Đồ
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '1400px', margin: '0 auto 24px auto' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
              setPage(1);
            }}
            onClear={() => {
              setSearchQuery('');
              setPage(1);
            }}
            placeholder="🔍 Tìm kiếm theo tên đồ vật, sinh viên..."
            showFilter={false}
            showSort={true}
            sortOptions={[
              { value: 'completedAt', label: 'Ngày hoàn thành (Mới nhất)', order: 'desc' },
              { value: 'completedAt', label: 'Ngày hoàn thành (Cũ nhất)', order: 'asc' },
              { value: 'itemName', label: 'Tên đồ vật (A-Z)', order: 'asc' },
              { value: 'itemName', label: 'Tên đồ vật (Z-A)', order: 'desc' },
            ]}
            currentSort={sortBy ? { field: sortBy, order: sortOrder } : null}
            onSortChange={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          />
        </div>

        {/* Date Range Filter */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            marginBottom: '24px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCalendar size={18} color="#666666" />
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#666666', marginRight: '8px' }}>
              Từ ngày:
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #E0E0E0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000000';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#666666', marginRight: '8px' }}>
              Đến ngày:
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #E0E0E0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000000';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#F5F5F5',
                color: '#666666',
                fontSize: '14px',
                border: '1px solid #E0E0E0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#E0E0E0';
                e.target.style.borderColor = '#D1D5DB';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#F5F5F5';
                e.target.style.borderColor = '#E0E0E0';
              }}
            >
              Xóa Bộ Lọc
            </button>
          )}
        </div>

        {/* Main Content */}
        <div>
          {/* Items List */}
          <div>
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px 20px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #E0E0E0',
                    borderTopColor: '#333333',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: '16px',
                  }}
                />
                <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải...</p>
              </div>
            ) : error ? (
              <div
                style={{
                  padding: '40px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: '#FF0000', fontSize: '14px' }}>{error}</p>
              </div>
            ) : displayedItems.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <FiClock size={48} style={{ color: '#999999', marginBottom: '16px' }} />
                <h3 style={{ color: '#333333', marginBottom: '8px' }}>Chưa có lịch sử trả đồ</h3>
                <p style={{ color: '#666666' }}>Chưa có giao dịch trả đồ nào được hoàn thành</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px',
                  }}
                >
                  {displayedItems.map((match) => (
                    <div
                      key={match._id || match.requestId}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E0E0E0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Image Section */}
                      <div style={{ position: 'relative', width: '100%', height: '200px', background: '#F5F5F5' }}>
                        {match.foundItem?.images?.[0] ? (
                          <img
                            src={getImageUrl(match.foundItem.images[0])}
                            alt={match.foundItem.itemName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#999999',
                            }}
                          >
                            <FiImage size={48} />
                          </div>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: '#22C55E',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <FiCheckCircle size={14} />
                          Đã hoàn thành
                        </div>
                      </div>

                      {/* Content Section */}
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3
                            style={{
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#333333',
                              margin: 0,
                              flex: 1,
                            }}
                          >
                            {match.foundItem?.itemName || 'N/A'}
                          </h3>
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#999999',
                              marginLeft: '8px',
                            }}
                          >
                            #{match.requestId || 'N/A'}
                          </span>
                        </div>

                        {match.foundItem?.description && (
                          <p
                            style={{
                              fontSize: '14px',
                              color: '#666666',
                              marginBottom: '12px',
                              lineHeight: '1.5',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {match.foundItem.description}
                          </p>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: '12px',
                          }}
                        >
                          {match.foundItem?.category && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666666' }}>
                              <FiTag size={14} />
                              <span>{match.foundItem.category}</span>
                            </div>
                          )}
                          {match.foundItem?.color && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666666' }}>
                              <FiPackage size={14} />
                              <span>{match.foundItem.color}</span>
                            </div>
                          )}
                          {match.completedAt && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666666' }}>
                              <FiCalendar size={14} />
                              <span>{formatDate(match.completedAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Student Info */}
                        {match.student && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '12px',
                              backgroundColor: '#F8F9FA',
                              borderRadius: '8px',
                              border: '1px solid #E9ECEF',
                              marginBottom: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <FiUser style={{ color: '#2180A0' }} size={16} />
                              <strong style={{ color: '#134252', fontSize: '14px' }}>{match.student.name || 'N/A'}</strong>
                            </div>
                            {match.student.email && (
                              <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px', marginBottom: '4px' }}>
                                ✉️ {match.student.email}
                              </div>
                            )}
                            {match.student.phone && (
                              <div style={{ fontSize: '12px', color: '#666', marginLeft: '24px' }}>
                                📱 {match.student.phone}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Completion Info */}
                        <div
                          style={{
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#F0FDF4',
                            borderRadius: '8px',
                            border: '1px solid #BBF7D0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiCheckCircle style={{ color: '#22C55E' }} size={16} />
                            <strong style={{ color: '#166534', fontSize: '14px' }}>Đã trả thành công</strong>
                          </div>
                          {match.completedAt && (
                            <div style={{ fontSize: '12px', color: '#166534', marginLeft: '24px', marginBottom: '4px' }}>
                              📅 {formatDate(match.completedAt)}
                            </div>
                          )}
                          {match.completedBy && (
                            <div style={{ fontSize: '12px', color: '#166534', marginLeft: '24px' }}>
                              👤 Xác nhận bởi: {match.completedBy}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {match.completionNotes && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '12px',
                              backgroundColor: '#FFF9E6',
                              borderRadius: '8px',
                              border: '1px solid #FDE68A',
                            }}
                          >
                            <div style={{ fontSize: '12px', color: '#92400E' }}>
                              <strong>📝 Ghi chú:</strong> {match.completionNotes}
                            </div>
                          </div>
                        )}

                        {/* Match Reason */}
                        {match.matchReason && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '12px',
                              backgroundColor: '#EFF6FF',
                              borderRadius: '8px',
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            <div style={{ fontSize: '12px', color: '#1E40AF' }}>
                              💡 <strong>Lý do match:</strong> {match.matchReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      marginTop: '32px',
                    }}
                  >
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: page === 1 ? '#F5F5F5' : '#FFFFFF',
                        color: page === 1 ? '#999999' : '#333333',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: '1px solid #E0E0E0',
                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Trước
                    </button>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#666666',
                      }}
                    >
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: page === totalPages ? '#F5F5F5' : '#FFFFFF',
                        color: page === totalPages ? '#999999' : '#333333',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: '1px solid #E0E0E0',
                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SecurityReturnHistoryPage;
