import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { Link } from 'react-router-dom';
import lostItemService from '../../api/lostItemService';
import SearchBar from '../../components/common/SearchBar';
import { FiPackage, FiCheckCircle, FiXCircle, FiTrash2, FiEye, FiClock } from 'react-icons/fi';
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers';

const LostItemsManagementPage = () => {
  const { showSuccess, showError } = useNotification();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchFilters, setSearchFilters] = useState({});

  const filters = {
    ...(searchFilters.status && { status: searchFilters.status }),
    ...(searchFilters.campus && { campus: searchFilters.campus }),
    ...(searchFilters.category && { category: searchFilters.category })
  };

  const { data, loading, error, refetch } = useFetch(
    () => lostItemService.getAllReports(page, 20, filters),
    [page, searchFilters]
  );

  // Fetch all items for statistics
  const { data: allData } = useFetch(
    () => lostItemService.getAllReports(1, 1000, {}),
    []
  );

  // Calculate statistics
  const calculateStats = () => {
    const items = allData?.data || [];
    const total = items.length;
    const pending = items.filter(item => item.status === 'pending').length;
    const verified = items.filter(item => item.status === 'verified').length;
    const rejected = items.filter(item => item.status === 'rejected').length;
    
    return { total, pending, verified, rejected };
  };

  const stats = calculateStats();

  // Apply filters to items
  const getFilteredItems = () => {
    let items = data?.data || [];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.itemName?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.reportId?.toLowerCase().includes(query)
        );
      }

    // Apply sorting
    if (sortBy) {
      items.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'createdAt':
            aVal = new Date(a.createdAt);
            bVal = new Date(b.createdAt);
            break;
          case 'dateLost':
            aVal = new Date(a.dateLost || a.createdAt);
            bVal = new Date(b.dateLost || b.createdAt);
            break;
          case 'itemName':
            aVal = a.itemName?.toLowerCase() || '';
            bVal = b.itemName?.toLowerCase() || '';
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

  const handleVerify = async (reportId) => {
    if (!window.confirm('Xác nhận xác minh báo cáo này?')) return;

    try {
      const result = await lostItemService.verifyReport(reportId, {});
      if (result.success) {
        showSuccess('Đã xác minh báo cáo thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xác minh thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xác minh');
    }
  };

  const handleReject = async (reportId) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason || reason.trim() === '') return;

    try {
      const result = await lostItemService.rejectReport(reportId, reason.trim());
      if (result?.success) {
        showSuccess('Đã từ chối báo cáo!');
        refetch();
      } else {
        showError(result?.error?.message || result?.error || 'Từ chối thất bại');
      }
    } catch (error) {
      showError(error?.message || 'Có lỗi xảy ra khi từ chối');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return;

    try {
      const result = await lostItemService.deleteReport(reportId);
      if (result.success) {
        showSuccess('Đã xóa báo cáo thành công!');
        refetch();
      } else {
        showError(result.error?.message || 'Xóa thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi xóa');
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
            <FiPackage size={28} color="#333333" />
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#333333',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Quản Lý Báo Mất
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
            placeholder="🔍 Tìm kiếm báo cáo theo tên, mô tả..."
            showFilter={true}
            showSort={true}
            filterOptions={{
              status: true,
              category: true,
              campus: true,
            }}
            activeFilters={searchFilters}
            onFilterChange={(newFilters) => {
              setSearchFilters(newFilters);
              setPage(1);
            }}
            onRemoveFilter={(filterKey) => {
              const newFilters = { ...searchFilters };
              delete newFilters[filterKey];
              setSearchFilters(newFilters);
              setPage(1);
            }}
            sortOptions={[
              { value: 'createdAt', label: 'Ngày tạo (Mới nhất)', order: 'desc' },
              { value: 'createdAt', label: 'Ngày tạo (Cũ nhất)', order: 'asc' },
              { value: 'dateLost', label: 'Ngày mất (Mới nhất)', order: 'desc' },
              { value: 'dateLost', label: 'Ngày mất (Cũ nhất)', order: 'asc' },
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
                        background: '#E3F2FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1976D2',
                      }}
                    >
                      <FiPackage size={20} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>
                      Tất Cả
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                    {stats.total}
                  </div>
                </div>
            </div>

              {/* Pending Card */}
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
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>
                      Chờ Xác Minh
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                    {stats.pending}
                  </div>
                </div>
            </div>

              {/* Verified Card */}
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
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>
                      Đã Xác Minh
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                    {stats.verified}
                  </div>
                </div>
            </div>

              {/* Rejected Card */}
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
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>
                      Đã Từ Chối
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>
                    {stats.rejected}
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
                <p style={{ color: '#FF0000', fontSize: '14px' }}>{typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}</p>
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
                <FiPackage size={48} style={{ color: '#999999', marginBottom: '16px' }} />
                <h3 style={{ color: '#333333', marginBottom: '8px' }}>Không có báo cáo nào</h3>
                <p style={{ color: '#666666' }}>Danh sách trống hoặc không tìm thấy kết quả phù hợp</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                  }}
                >
                  {filteredItems.map((report, index) => {
                    const statusColors = getStatusColor(report.status);
                    return (
                      <div
                        key={report._id}
                        style={{
                          padding: '20px',
                          borderBottom: index < filteredItems.length - 1 ? '1px solid #E0E0E0' : 'none',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                          {/* Left Section */}
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333333', margin: 0 }}>
                                {report.itemName}
                              </h3>
                              <span
                            style={{
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                              backgroundColor: statusColors.bg,
                              color: statusColors.color,
                                  border: `1px solid ${statusColors.border}`,
                            }}
                          >
                            {getStatusLabel(report.status)}
                              </span>
                          </div>
                            <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                              {report.description?.substring(0, 100)}...
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#999999' }}>
                              <span>ID: {report.reportId}</span>
                              <span>📦 {report.category}</span>
                              <span>📍 {report.campus}</span>
                              <span>📅 {formatDate(report.dateLost)}</span>
                          </div>
                        </div>

                          {/* Right Section - Actions */}
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <Link
                            to={`/lost-items/${report._id}`}
                            state={{ from: '/lost-items/management' }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                background: '#000000',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => (e.target.style.background = '#333333')}
                              onMouseLeave={(e) => (e.target.style.background = '#000000')}
                          >
                              <FiEye size={14} />
                              Xem
                          </Link>
                          
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerify(report._id)}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: '#E8F5E9',
                                    color: '#388E3C',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    border: '1px solid #C8E6C9',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#C8E6C9';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = '#E8F5E9';
                                  }}
                              >
                                  <FiCheckCircle size={14} />
                                Xác minh
                              </button>
                              <button
                                onClick={() => handleReject(report._id)}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: '#FFF3E0',
                                    color: '#F57C00',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    border: '1px solid #FFE0B2',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#FFE0B2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = '#FFF3E0';
                                  }}
                              >
                                  <FiXCircle size={14} />
                                Từ chối
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(report._id)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                background: '#FFEBEE',
                                color: '#D32F2F',
                                fontSize: '13px',
                                fontWeight: 500,
                                border: '1px solid #FFCDD2',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#FFCDD2';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#FFEBEE';
                              }}
                          >
                              <FiTrash2 size={14} />
                            Xóa
                          </button>
                          </div>
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
                      Trang {page} / {data.pagination.pages}
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

export default LostItemsManagementPage;
