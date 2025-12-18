import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import matchingService from '../../api/matchingService';
import SearchBar from '../../components/common/SearchBar';
import { 
  FiCheckCircle, 
  FiUser, 
  FiPackage, 
  FiClock, 
  FiMapPin,
  FiImage,
  FiTag,
  FiCalendar,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { formatDate, getImageUrl } from '../../utils/helpers';

const SecurityReadyToReturnPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('confirmedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [resolving, setResolving] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => matchingService.getConfirmedMatches(1, 50),
    []
  );

  // Calculate statistics
  const calculateStats = () => {
    const items = data?.data || [];
    const total = items.length;
    
    return {
      total
    };
  };

  const stats = calculateStats();

  // Apply filters to items
  const getFilteredItems = () => {
    let items = data?.data || [];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.foundItem?.itemName?.toLowerCase().includes(query) ||
        item.student?.name?.toLowerCase().includes(query) ||
        item.student?.email?.toLowerCase().includes(query) ||
        item.requestId?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy) {
      items.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'confirmedAt':
            aVal = new Date(a.confirmedAt || a.createdAt);
            bVal = new Date(b.confirmedAt || b.createdAt);
            break;
          case 'itemName':
            aVal = a.foundItem?.itemName?.toLowerCase() || '';
            bVal = b.foundItem?.itemName?.toLowerCase() || '';
            break;
          case 'studentName':
            aVal = a.student?.name?.toLowerCase() || '';
            bVal = b.student?.name?.toLowerCase() || '';
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

  const handleConfirmReturn = async (matchId) => {
    if (!window.confirm('Xác nhận đã trả đồ cho sinh viên?')) return;

    setResolving(matchId);
    try {
      const result = await matchingService.resolveMatch(matchId, 'resolved', 'Đã trả đồ cho sinh viên');
      
      if (result.success) {
        showSuccess('Đã xác nhận trả đồ thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xác nhận trả đồ thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xác nhận trả đồ');
    } finally {
      setResolving(null);
    }
  };

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
            <FiCheckCircle size={28} color="#333333" />
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#333333',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Đồ Sẵn Sàng Trả
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
            placeholder="🔍 Tìm kiếm theo tên đồ vật, sinh viên, mã match..."
            showFilter={false}
            showSort={true}
            sortOptions={[
              { value: 'confirmedAt', label: 'Ngày xác nhận (Mới nhất)', order: 'desc' },
              { value: 'confirmedAt', label: 'Ngày xác nhận (Cũ nhất)', order: 'asc' },
              { value: 'itemName', label: 'Tên đồ vật (A-Z)', order: 'asc' },
              { value: 'itemName', label: 'Tên đồ vật (Z-A)', order: 'desc' },
              { value: 'studentName', label: 'Tên sinh viên (A-Z)', order: 'asc' },
              { value: 'studentName', label: 'Tên sinh viên (Z-A)', order: 'desc' },
            ]}
            currentSort={sortBy ? { field: sortBy, order: sortOrder } : null}
            onSortChange={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          />
        </div>

        {/* Main Content */}
        <div>
          {/* Statistics Card */}
          {!loading && !error && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {/* Total Card */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E0E0E0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: '#E8F5E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#388E3C',
                      }}
                    >
                      <FiCheckCircle size={20} />
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#999999',
                      }}
                    >
                      Sẵn Sàng Trả
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#000000',
                      lineHeight: 1,
                    }}
                  >
                    {stats.total}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                <FiCheckCircle size={48} style={{ color: '#999999', marginBottom: '16px' }} />
                <h3 style={{ color: '#333333', marginBottom: '8px' }}>Chưa có đồ sẵn sàng trả</h3>
                <p style={{ color: '#666666' }}>Danh sách trống hoặc không tìm thấy kết quả phù hợp</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px',
                  }}
                >
                  {displayedItems.map((match) => (
                    <div
                      key={match.requestId}
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
                      {/* Card Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: '#F8F9FA',
                          borderBottom: '1px solid #E0E0E0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#666666',
                            }}
                          >
                            Match ID: {match.requestId}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999999' }}>
                          <FiClock size={14} />
                          <span>{formatDate(match.confirmedAt)}</span>
                        </div>
                      </div>

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
                          Sẵn sàng trả
                        </div>
                      </div>

                      {/* Content Section */}
                      <div style={{ padding: '16px' }}>
                        {/* Found Item Info */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FiPackage size={16} style={{ color: '#1976D2' }} />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#333333' }}>Đồ Tìm Thấy</span>
                          </div>
                          <h3
                            style={{
                              fontSize: '18px',
                              fontWeight: 600,
                              color: '#333333',
                              margin: '0 0 8px 0',
                            }}
                          >
                            {match.foundItem?.itemName || 'N/A'}
                          </h3>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              marginBottom: '8px',
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
                          </div>
                          {match.foundItem?.locationFound && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: '#666666',
                                marginBottom: '4px',
                              }}
                            >
                              <FiMapPin size={14} />
                              <span>{match.foundItem.locationFound}</span>
                            </div>
                          )}
                          {match.foundItem?.warehouseLocation && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: '#1976D2',
                                background: '#E3F2FD',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontWeight: 500,
                              }}
                            >
                              📦 Kho: {match.foundItem.warehouseLocation}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                              <FiUser size={16} style={{ color: '#1976D2' }} />
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#333333' }}>Sinh Viên Nhận Đồ</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: '#333333', marginBottom: '8px' }}>
                              {match.student.name || 'N/A'}
                            </div>
                            {match.student.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                <FiMail size={14} />
                                {match.student.email}
                              </div>
                            )}
                            {match.student.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
                                <FiPhone size={14} />
                                {match.student.phone}
                              </div>
                            )}
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

                        {/* Action Button */}
                        <button
                          onClick={() => handleConfirmReturn(match.requestId)}
                          disabled={resolving === match.requestId}
                          style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            background: resolving === match.requestId ? '#9CA3AF' : '#22C55E',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: resolving === match.requestId ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (resolving !== match.requestId) {
                              e.target.style.background = '#16A34A';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (resolving !== match.requestId) {
                              e.target.style.background = '#22C55E';
                            }
                          }}
                        >
                          <FiCheckCircle size={18} />
                          {resolving === match.requestId ? 'Đang xử lý...' : '✅ Xác Nhận Trả Đồ'}
                        </button>
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

export default SecurityReadyToReturnPage;
