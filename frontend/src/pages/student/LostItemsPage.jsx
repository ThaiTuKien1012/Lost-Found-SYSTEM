import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import lostItemService from '../../api/lostItemService';
import LostItemForm from '../../components/lost-items/LostItemForm';
import LostItemList from '../../components/lost-items/LostItemList';
import SearchBar from '../../components/common/SearchBar';
import { FiX, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

const LostItemsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchFilters, setSearchFilters] = useState({});

  const { data, loading, error, refetch } = useFetch(
    () => lostItemService.getMyReports(page),
    [page]
  );

  // Fetch all items for statistics and filtering
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: allData } = useFetch(
    () => lostItemService.getMyReports(1, 1000),
    [refreshKey]
  );

  // Calculate statistics
  const calculateStats = () => {
    const items = allData?.data || [];
    const total = items.length;
    const pending = items.filter(item => item.status === 'pending').length;
    const verified = items.filter(item => item.status === 'verified').length;
    const rejected = items.filter(item => item.status === 'rejected').length;
    const returned = items.filter(item => item.status === 'returned').length;
    
    const recoveryRate = verified > 0 ? ((returned / verified) * 100).toFixed(1) : 0;
    
    let avgResponseTime = 0;
    const verifiedItems = items.filter(item => item.status === 'verified' && item.verifiedAt);
    if (verifiedItems.length > 0) {
      const totalTime = verifiedItems.reduce((sum, item) => {
        const created = new Date(item.createdAt);
        const verified = new Date(item.verifiedAt);
        return sum + (verified - created);
      }, 0);
      avgResponseTime = Math.round(totalTime / verifiedItems.length / (1000 * 60 * 60 * 24));
    }

    return {
      total,
      pending,
      verified,
      rejected,
      returned,
      recoveryRate,
      avgResponseTime
    };
  };

  // Calculate category counts
  const getCategoryCounts = () => {
    const items = allData?.data || [];
    const categories = {
      phone: items.filter(item => item.category === 'phone' || item.category === 'Điện thoại').length,
      laptop: items.filter(item => item.category === 'laptop' || item.category === 'Laptop').length,
      wallet: items.filter(item => item.category === 'wallet' || item.category === 'Ví').length,
      other: items.filter(item => {
        const cat = item.category?.toLowerCase() || '';
        return !['phone', 'điện thoại', 'laptop', 'wallet', 'ví'].includes(cat);
      }).length,
    };
    return categories;
  };

  const stats = calculateStats();
  const categoryCounts = getCategoryCounts();

  // Apply filters to items
  const getFilteredItems = () => {
    let items = allData?.data || [];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.itemName?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.reportId?.toLowerCase().includes(query)
      );
    }

    // Apply search bar filters
    if (searchFilters.status) {
      items = items.filter(item => item.status === searchFilters.status);
    }
    if (searchFilters.category) {
      items = items.filter(item => item.category === searchFilters.category);
    }
    if (searchFilters.campus) {
      items = items.filter(item => item.campus === searchFilters.campus);
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
          case 'status':
            aVal = a.status || '';
            bVal = b.status || '';
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
  const displayedItems = filteredItems.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filteredItems.length / 10);

  const handleItemDeleted = (itemId) => {
    refetch();
    // Trigger refresh of all data for stats
    setRefreshKey(prev => prev + 1);
  };

  const handleItemUpdated = (itemId) => {
    refetch();
    // Trigger refresh of all data for stats
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateReport = async (formData) => {
    const result = await lostItemService.createReport(formData);
    if (result.success) {
      showSuccess('Báo cáo đã được tạo thành công!');
      if (result.warning) {
        showWarning(result.warning);
      }
      setShowForm(false);
      // Jump to page 1 to show the newly created report (which will be at the top due to desc sort)
      setPage(1);
      refetch();
      // Trigger refresh of all data for stats
      setRefreshKey(prev => prev + 1);
    } else {
      showError(result.error?.message || result.error || 'Tạo báo cáo thất bại');
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleCampusChange = (campus) => {
    setFilters(prev => ({
      ...prev,
      campus
    }));
  };

  const handleApplyFilters = () => {
    setPage(1); // Reset to first page
    setShowFilter(false); // Close filter on mobile
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      categories: [],
      campus: 'all',
      dateFrom: '',
      dateTo: '',
    });
    setPage(1);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px',
        background: '#F5F5F5',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiPackage size={24} color="#333333" />
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#333333',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Báo Cáo Đồ Thất Lạc
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleForm}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: showForm ? '#666666' : '#000000',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.background = showForm ? '#555555' : '#333333')}
              onMouseLeave={(e) => (e.target.style.background = showForm ? '#666666' : '#000000')}
          >
            {showForm ? (
              <>
                <FiX size={16} />
                <span>Hủy</span>
              </>
            ) : (
              <span>Tạo Báo Cáo Mới</span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar - Search, Filter and Sort */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto' }}>
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

      {/* Main Content - No Sidebar */}
          <div>
            {/* Statistics Cards */}
            {!loading && !error && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {/* Total Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                          background: '#E3F2FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          color: '#1976D2',
                      }}
                    >
                      <FiPackage size={18} />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#999999',
                      }}
                    >
                      Tất Cả
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#000000',
                      lineHeight: 1,
                    }}
                  >
                    {stats.total}
                    </div>
                  </div>
                </div>

                {/* Pending Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                          background: '#FFF3E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          color: '#F57C00',
                      }}
                    >
                      <FiClock size={18} />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#999999',
                      }}
                    >
                      Đang Chờ
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#000000',
                      lineHeight: 1,
                    }}
                  >
                    {stats.pending}
                    </div>
                  </div>
                </div>

                {/* Verified Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                          background: '#E8F5E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          color: '#388E3C',
                      }}
                    >
                      <FiCheckCircle size={18} />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#999999',
                      }}
                    >
                      Xác Nhận
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#000000',
                      lineHeight: 1,
                    }}
                  >
                    {stats.verified}
                    </div>
                  </div>
                </div>

                {/* Rejected Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                          background: '#FFEBEE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                          color: '#D32F2F',
                      }}
                    >
                      <FiXCircle size={18} />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#999999',
                      }}
                    >
                      Từ Chối
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#000000',
                      lineHeight: 1,
                    }}
                  >
                    {stats.rejected}
                    </div>
                  </div>
                </div>

                {/* Recovery Rate Card */}
                {stats.recoveryRate > 0 && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #E0E0E0',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            background: '#E0F2F1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                            color: '#00796B',
                        }}
                      >
                          <FiTrendingUp size={18} />
                      </div>
                      <div
                        style={{
                            fontSize: '11px',
                          fontWeight: 500,
                          color: '#999999',
                        }}
                      >
                        Tỷ Lệ Tìm Lại
                      </div>
                    </div>
                    <div
                      style={{
                          fontSize: '28px',
                        fontWeight: 700,
                        color: '#000000',
                        lineHeight: 1,
                      }}
                    >
                      {stats.recoveryRate}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Average Response Time Card */}
                {stats.avgResponseTime > 0 && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #E0E0E0',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                            background: '#F3E5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                            color: '#7B1FA2',
                        }}
                      >
                        <FiClock size={18} />
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#999999',
                        }}
                      >
                        Thời Gian Phản Hồi TB
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#000000',
                        lineHeight: 1,
                      }}
                    >
                      {stats.avgResponseTime} ngày
                      </div>
                    </div>
                  </div>
                )}
        </div>
      )}

        {/* Form Modal */}
        {showForm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => setShowForm(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderBottom: '1px solid #E0E0E0',
                }}
              >
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#000000',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                >
                  Tạo Báo Cáo Mới
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: '1px solid #E0E0E0',
                    background: '#FFFFFF',
                    color: '#333333',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.borderColor = '#D1D5DB';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.borderColor = '#E0E0E0';
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1,
                }}
              >
                <LostItemForm onSubmit={handleCreateReport} />
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
        ) : (
          <LostItemList
                  items={displayedItems}
                  pagination={{
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: filteredItems.length,
                    itemsPerPage: 10,
                  }}
            onPageChange={setPage}
                  onItemDeleted={handleItemDeleted}
                  onItemUpdated={handleItemUpdated}
          />
        )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          .filter-sidebar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
            border-radius: 16px 16px 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LostItemsPage;
