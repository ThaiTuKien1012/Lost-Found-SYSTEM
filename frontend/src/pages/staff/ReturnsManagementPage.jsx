import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { Link } from 'react-router-dom';
import returnService from '../../api/returnService';
import SearchBar from '../../components/common/SearchBar';
import { 
  FiClock, 
  FiCalendar, 
  FiMapPin, 
  FiUser, 
  FiPackage, 
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiImage
} from 'react-icons/fi';
import { formatDate, getStatusLabel, getStatusColor, getImageUrl } from '../../utils/helpers';
import { CAMPUSES } from '../../utils/constants';

const ReturnsManagementPage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('returnedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchFilters, setSearchFilters] = useState({});

  const filters = {
    ...(searchFilters.status && { status: searchFilters.status }),
    ...(searchFilters.campus && { campus: searchFilters.campus })
  };

  const { data, loading, error } = useFetch(
    () => returnService.getReturns(page, 20, filters),
    [page, searchFilters]
  );

  // Fetch all returns for statistics
  const { data: statsData } = useFetch(
    () => returnService.getReturns(1, 1000, {}),
    []
  );

  const calculateStats = () => {
    if (!statsData?.data) return { total: 0, completed: 0, pending: 0, failed: 0 };
    
    const transactions = statsData.data;
    return {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      failed: transactions.filter(t => t.status === 'failed').length
    };
  };

  const stats = calculateStats();

  const getFilteredItems = () => {
    let items = data?.data || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.transactionId?.toLowerCase().includes(query) ||
        item.foundItem?.itemName?.toLowerCase().includes(query) ||
        item.student?.firstName?.toLowerCase().includes(query) ||
        item.student?.lastName?.toLowerCase().includes(query)
      );
    }

    if (sortBy) {
      items.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'returnedDate':
            aVal = new Date(a.returnedDate || a.createdAt);
            bVal = new Date(b.returnedDate || b.createdAt);
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

  const getCampusLabel = (campus) => {
    const camp = CAMPUSES.find(c => c.value === campus);
    return camp ? camp.label : campus;
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
              Quản Lý Trả Đồ
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
            placeholder="🔍 Tìm kiếm theo mã GD, tên sinh viên, đồ vật..."
            showFilter={false}
            showSort={true}
            sortOptions={[
              { value: 'returnedDate', label: 'Ngày trả (Mới nhất)', order: 'desc' },
              { value: 'returnedDate', label: 'Ngày trả (Cũ nhất)', order: 'asc' },
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

        {/* Main Content */}
        <div>
          {/* Statistics Cards */}
          {!loading && !error && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
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
                        background: '#E3F2FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1976D2',
                      }}
                    >
                      <FiPackage size={20} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Tổng GD</div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>{stats.total}</div>
                </div>
              </div>

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
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Hoàn Thành</div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>{stats.completed}</div>
                </div>
              </div>

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
                        background: '#FFF3E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F57C00',
                      }}
                    >
                      <FiClock size={20} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Đang Xử Lý</div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>{stats.pending}</div>
                </div>
              </div>

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
                        background: '#FFEBEE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D32F2F',
                      }}
                    >
                      <FiXCircle size={20} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>Thất Bại</div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>{stats.failed}</div>
                </div>
              </div>
            </div>
          )}

          {/* Items Grid */}
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
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  textAlign: 'center',
                }}
              >
                <FiClock size={48} style={{ color: '#999999', marginBottom: '16px' }} />
                <h3 style={{ color: '#333333', marginBottom: '8px' }}>Không tìm thấy giao dịch trả đồ nào</h3>
                <p style={{ color: '#666666' }}>Danh sách trống hoặc không tìm thấy kết quả phù hợp</p>
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
                  {filteredItems.map((transaction) => {
                    const statusColors = getStatusColor(transaction.status);
                    return (
                      <div
                        key={transaction._id || transaction.transactionId}
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
                        <div style={{ position: 'relative', width: '100%', height: '180px', background: '#F5F5F5' }}>
                          {transaction.foundItem?.images && transaction.foundItem.images.length > 0 ? (
                            <img
                              src={getImageUrl(transaction.foundItem.images[0])}
                              alt={transaction.foundItem.itemName || 'Đồ vật'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                              background: statusColors.bg,
                              color: statusColors.color,
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            {getStatusLabel(transaction.status)}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0, flex: 1 }}>
                              {transaction.foundItem?.itemName || 'Đồ vật không xác định'}
                            </h3>
                            <span style={{ fontSize: '12px', color: '#999999', marginLeft: '8px' }}>
                              {transaction.transactionId || `#${transaction._id?.slice(-6)}`}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666666' }}>
                              <FiUser size={14} />
                              <span>
                                {transaction.student
                                  ? `${transaction.student.firstName} ${transaction.student.lastName}`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666666' }}>
                              <FiMapPin size={14} />
                              <span>{getCampusLabel(transaction.campus)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666666' }}>
                              <FiCalendar size={14} />
                              <span>
                                {transaction.returnedDate
                                  ? formatDate(transaction.returnedDate)
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <Link
                            to={`/returns/${transaction.transactionId || transaction._id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              background: '#000000',
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontWeight: 500,
                              border: 'none',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => (e.target.style.background = '#333333')}
                            onMouseLeave={(e) => (e.target.style.background = '#000000')}
                          >
                            <FiEye size={16} />
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
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
                    <span style={{ fontSize: '14px', color: '#666666' }}>
                      Trang {data.pagination.page} / {data.pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                      disabled={page === data.pagination.pages}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: page === data.pagination.pages ? '#F5F5F5' : '#FFFFFF',
                        color: page === data.pagination.pages ? '#999999' : '#333333',
                        fontSize: '14px',
                        fontWeight: 500,
                        border: '1px solid #E0E0E0',
                        cursor: page === data.pagination.pages ? 'not-allowed' : 'pointer',
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

export default ReturnsManagementPage;
