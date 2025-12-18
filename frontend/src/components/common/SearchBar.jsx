import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';

/**
 * SearchBar Component
 * 搜索栏组件，包含搜索、过滤和排序功能
 */
const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Tìm kiếm theo tên, mô tả...',
  showFilter = true,
  showSort = true,
  filterOptions = {},
  sortOptions = [],
  onFilterChange,
  onSortChange,
  currentSort,
  activeFilters = {},
  onRemoveFilter,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const getSortLabel = () => {
    if (!currentSort) return 'Sắp xếp';
    const option = sortOptions.find(opt => 
      opt.value === currentSort.field && opt.order === currentSort.order
    );
    return option ? option.label : 'Sắp xếp';
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== '').length;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #E0E0E0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px',
      }}
    >
      {/* Search Input Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            minWidth: '300px',
          }}
        >
          <FiSearch
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
              fontSize: '20px',
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
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
          {value && (
            <button
              onClick={onClear}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <FiX size={18} style={{ color: '#6B7280' }} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        {showFilter && filterOptions && (
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: activeFilterCount > 0 ? '2px solid #000000' : '1px solid #E0E0E0',
                borderRadius: '8px',
                background: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#333333',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFFFFF';
              }}
            >
              <FiFilter size={18} />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginLeft: '4px',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  padding: '16px',
                  minWidth: '240px',
                  zIndex: 1000,
                }}
              >
                {filterOptions.status && (
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Trạng thái
                    </label>
                    <select
                      value={activeFilters.status || ''}
                      onChange={(e) => onFilterChange?.({ ...activeFilters, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="">Tất cả</option>
                      <option value="pending">Chờ xác minh</option>
                      <option value="verified">Đã xác minh</option>
                      <option value="rejected">Đã từ chối</option>
                      <option value="returned">Đã trả</option>
                    </select>
                  </div>
                )}

                {filterOptions.category && (
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Danh mục
                    </label>
                    <select
                      value={activeFilters.category || ''}
                      onChange={(e) => onFilterChange?.({ ...activeFilters, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="">Tất cả</option>
                      <option value="PHONE">Điện thoại</option>
                      <option value="WALLET">Ví</option>
                      <option value="BAG">Túi</option>
                      <option value="LAPTOP">Laptop</option>
                      <option value="WATCH">Đồng hồ</option>
                      <option value="BOOK">Sách</option>
                      <option value="KEYS">Chìa khóa</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                )}

                {filterOptions.campus && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#666666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Cơ sở
                    </label>
                    <select
                      value={activeFilters.campus || ''}
                      onChange={(e) => onFilterChange?.({ ...activeFilters, campus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="">Tất cả</option>
                      <option value="NVH">NVH</option>
                      <option value="SHTP">SHTP</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sort Button */}
        {showSort && sortOptions.length > 0 && (
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                background: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#333333',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFFFFF';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <FiArrowUp size={10} style={{ color: '#6B7280' }} />
                <FiArrowDown size={10} style={{ color: '#6B7280' }} />
              </div>
              <span>{getSortLabel()}</span>
            </button>

            {/* Sort Dropdown */}
            {showSortDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  minWidth: '220px',
                  zIndex: 1000,
                }}
              >
                {sortOptions.map((option, index) => {
                  const isActive = currentSort && 
                    currentSort.field === option.value && 
                    currentSort.order === option.order;
                  
                  return (
                    <button
                      key={`${option.value}-${option.order}-${index}`}
                      onClick={() => {
                        onSortChange?.(option.value, option.order);
                        setShowSortDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isActive ? '#EFF6FF' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: isActive ? '#1D4ED8' : '#333333',
                        fontWeight: isActive ? 500 : 400,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.background = '#F3F4F6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Tags */}
      {activeFilterCount > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          {activeFilters.status && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#1D4ED8',
                fontWeight: 500,
              }}
            >
              Trạng thái: {activeFilters.status === 'pending' ? 'Chờ xác minh' : 
                           activeFilters.status === 'verified' ? 'Đã xác minh' :
                           activeFilters.status === 'rejected' ? 'Đã từ chối' : activeFilters.status}
              <button
                onClick={() => onRemoveFilter?.('status')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FiX size={14} />
              </button>
            </span>
          )}
          {activeFilters.category && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#1D4ED8',
                fontWeight: 500,
              }}
            >
              Danh mục: {activeFilters.category}
              <button
                onClick={() => onRemoveFilter?.('category')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FiX size={14} />
              </button>
            </span>
          )}
          {activeFilters.campus && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#1D4ED8',
                fontWeight: 500,
              }}
            >
              Cơ sở: {activeFilters.campus}
              <button
                onClick={() => onRemoveFilter?.('campus')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FiX size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

