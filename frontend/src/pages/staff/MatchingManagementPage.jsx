import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import matchingService from '../../api/matchingService';
import lostItemService from '../../api/lostItemService';
import foundItemService from '../../api/foundItemService';
import { 
  FiPackage, 
  FiSearch, 
  FiCheckCircle,
  FiX,
  FiXCircle,
  FiPlus,
  FiTrendingUp,
  FiClock,
  FiTag,
  FiImage,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiArrowRight,
  FiUser,
  FiAlertCircle
} from 'react-icons/fi';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { CATEGORIES, CAMPUSES } from '../../utils/constants';

const MatchingManagementPage = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [activeTab, setActiveTab] = useState('create');
  const [keywordLost, setKeywordLost] = useState('');
  const [keywordFound, setKeywordFound] = useState('');
  const [campusFilter, setCampusFilter] = useState('');
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);
  const [matchReason, setMatchReason] = useState('');
  const [notes, setNotes] = useState('');
  const [studentId, setStudentId] = useState('');
  const [creating, setCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSelectFoundModal, setShowSelectFoundModal] = useState(false);
  const [matchToConfirm, setMatchToConfirm] = useState(null); // dùng cho staff resolve match

  // Fetch Lost Items (verified only)
  const { data: lostItemsData, loading: loadingLost, refetch: refetchLost } = useFetch(
    () => lostItemService.getAllReports(1, 50, { status: 'verified', ...(campusFilter && { campus: campusFilter }) }),
    [campusFilter]
  );

  // Fetch Found Items (unclaimed only)
  const { data: foundItemsData, loading: loadingFound, refetch: refetchFound } = useFetch(
    () => foundItemService.getFoundItems(1, 50, { status: 'unclaimed', ...(campusFilter && { campus: campusFilter }) }),
    [campusFilter]
  );

  // Fetch all matches for stats
  const { data: matchesData, refetch: refetchMatches } = useFetch(
    () => matchingService.getMatches(1, 100),
    []
  );

  // Fetch matches by status
  const { data: pendingMatchesData, loading: loadingPending, refetch: refetchPending } = useFetch(
    () => matchingService.getMatches(1, 50, 'pending'),
    []
  );

  const { data: confirmedMatchesData, loading: loadingConfirmed } = useFetch(
    () => matchingService.getMatches(1, 50, 'confirmed'),
    []
  );

  const { data: rejectedMatchesData, loading: loadingRejected } = useFetch(
    () => matchingService.getMatches(1, 50, 'rejected'),
    []
  );

  const { data: completedMatchesData, loading: loadingCompleted } = useFetch(
    () => matchingService.getMatches(1, 50, 'completed'),
    []
  );

  // Calculate stats
  const calculateStats = () => {
    if (!matchesData?.data) return { total: 0, pending: 0, confirmed: 0, rejected: 0, completed: 0 };
    const matches = matchesData.data;
    return {
      total: matches.length,
      pending: matches.filter(m => m.status === 'pending').length,
      confirmed: matches.filter(m => m.status === 'confirmed').length,
      rejected: matches.filter(m => m.status === 'rejected').length,
      completed: matches.filter(m => m.status === 'completed').length
    };
  };
  const stats = calculateStats();

  // Filter items by search
  const filteredLostItems = lostItemsData?.data?.filter(item => {
    if (!keywordLost) return true;
    const q = keywordLost.toLowerCase();
    return item.itemName?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.reportId?.toLowerCase().includes(q);
  }) || [];

  const filteredFoundItems = foundItemsData?.data?.filter(item => {
    if (!keywordFound) return true;
    const q = keywordFound.toLowerCase();
    return item.itemName?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.foundId?.toLowerCase().includes(q);
  }) || [];

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  // Handle create match (từ confirm modal)
  const handleCreateMatch = async () => {
    if (!selectedFoundItem) {
      showError('Vui lòng chọn đồ tìm thấy');
      return;
    }
    if (!selectedLostItem && !studentId) {
      showError('Vui lòng chọn đồ báo mất hoặc nhập Student ID');
      return;
    }

    setCreating(true);
    try {
      const result = await matchingService.createManualMatch(
        selectedLostItem?.reportId || null,
        selectedFoundItem.foundId,
        matchReason || 'Staff manually matched items',
        notes,
        studentId || null
      );

      if (result.success) {
        showSuccess('🎉 Tạo match thành công! Match đang chờ sinh viên xác nhận.');
        setShowConfirmModal(false);
        setSelectedLostItem(null);
        setSelectedFoundItem(null);
        setMatchReason('');
        setNotes('');
        setStudentId('');
        refetchMatches();
        refetchPending();
        refetchLost();
        refetchFound();
        setActiveTab('pending');
      } else {
        showError(result.error?.message || 'Tạo match thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi tạo match');
    } finally {
      setCreating(false);
    }
  };

  // Open confirm modal when both items selected
  const openConfirmModal = () => {
    if (!selectedFoundItem) {
      showError('Vui lòng chọn đồ tìm thấy');
      return;
    }
    if (!selectedLostItem && !studentId) {
      showError('Vui lòng chọn đồ báo mất hoặc nhập Student ID');
      return;
    }
    setShowConfirmModal(true);
  };

  // Tab styles
  const getTabStyle = (tabName) => ({
    padding: '14px 24px',
    border: 'none',
    background: activeTab === tabName ? '#000000' : 'transparent',
    color: activeTab === tabName ? '#FFFFFF' : '#666666',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontWeight: activeTab === tabName ? 600 : 400,
    fontSize: '14px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  // Staff xác nhận / từ chối match
  const handleResolveMatch = async (matchId, action) => {
    const isConfirm = action === 'confirm';
    if (
      !window.confirm(
        isConfirm
          ? 'Xác nhận match này là chính xác và tiếp tục quy trình trả đồ?'
          : 'Bạn chắc chắn TỪ CHỐI match này?'
      )
    ) {
      return;
    }

    try {
      const result = await matchingService.resolveMatch(
        matchId,
        isConfirm ? 'resolved' : 'rejected',
        isConfirm ? 'Staff confirmed match' : 'Staff rejected match'
      );
      if (result.success) {
        showSuccess(isConfirm ? 'Đã xác nhận match!' : 'Đã từ chối match!');
        refetchMatches();
        refetchPending();
      } else {
        showError(result.error?.message || 'Cập nhật match thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi cập nhật match');
    }
  };

  // Render match card cho các tab & overview
  const renderMatchCard = (match, showActions = false) => (
    <div
      key={match._id || match.requestId}
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E0E0E0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Match Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #E0E0E0', background: '#F8F9FA' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>
            Match ID: {match.requestId || match._id?.slice(-8)}
          </span>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: match.status === 'pending' ? '#FFF3E0' : match.status === 'confirmed' ? '#E8F5E9' : match.status === 'rejected' ? '#FFEBEE' : '#E3F2FD',
              color: match.status === 'pending' ? '#F57C00' : match.status === 'confirmed' ? '#388E3C' : match.status === 'rejected' ? '#D32F2F' : '#1976D2',
            }}
          >
            {match.status === 'pending' ? '⏳ Đang chờ' : match.status === 'confirmed' ? '✅ Đã xác nhận' : match.status === 'rejected' ? '❌ Từ chối' : '✔️ Hoàn thành'}
          </span>
            </div>
          </div>

      {/* Match Content - Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0' }}>
        {/* Lost Item */}
        <div style={{ padding: '16px', borderRight: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#D32F2F' }}>
            <FiPackage size={16} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>ĐỒ BÁO MẤT</span>
            </div>
          {match.lostItem ? (
            <>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '0 0 8px 0' }}>{match.lostItem.itemName}</h4>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p style={{ margin: '4px 0' }}>📦 {getCategoryLabel(match.lostItem.category)}</p>
                <p style={{ margin: '4px 0' }}>📍 {match.lostItem.locationLost || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📅 {formatDate(match.lostItem.dateLost)}</p>
            </div>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#999' }}>Không có báo cáo mất</p>
          )}
          </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: '#F8F9FA' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiArrowRight size={20} color="#FFF" />
            </div>
          </div>

        {/* Found Item */}
        <div style={{ padding: '16px', borderLeft: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#388E3C' }}>
            <FiCheckCircle size={16} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>ĐỒ TÌM THẤY</span>
            </div>
          {match.foundItem ? (
            <>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: '0 0 8px 0' }}>{match.foundItem.itemName}</h4>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p style={{ margin: '4px 0' }}>📦 {getCategoryLabel(match.foundItem.category)}</p>
                <p style={{ margin: '4px 0' }}>📍 {match.foundItem.locationFound || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📅 {formatDate(match.foundItem.dateFound)}</p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: '13px', color: '#999' }}>N/A</p>
          )}
            </div>
          </div>

      {/* Student Info */}
      {match.student && (
        <div style={{ padding: '12px 16px', background: '#F0F7FF', borderTop: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUser size={16} color="#1976D2" />
            <span style={{ fontSize: '13px', color: '#333' }}>
              <strong>Sinh viên:</strong> {match.student.name || match.student.email}
            </span>
            </div>
            </div>
      )}

      {/* Match Reason */}
      {match.matchReason && (
        <div style={{ padding: '12px 16px', background: '#FFFDE7', borderTop: '1px solid #E0E0E0' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            💡 <strong>Lý do match:</strong> {match.matchReason}
          </p>
          </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          background: '#F8F9FA',
          borderTop: '1px solid #E0E0E0',
          fontSize: '12px',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        <div>
          <FiClock size={12} style={{ marginRight: '4px' }} />
          Tạo lúc: {formatDate(match.createdAt)}
          {match.confirmedAt && (
            <span style={{ marginLeft: '16px' }}>✅ Xác nhận: {formatDate(match.confirmedAt)}</span>
          )}
        </div>

        {showActions && match.status === 'pending' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleResolveMatch(match._id || match.requestId, 'reject')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #FCA5A5',
                background: '#FEE2E2',
                fontSize: '12px',
                fontWeight: 500,
                color: '#DC2626',
                cursor: 'pointer'
              }}
            >
              Từ chối
            </button>
            <button
              type="button"
              onClick={() => handleResolveMatch(match._id || match.requestId, 'confirm')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: '#16A34A',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FiCheck size={12} /> Xác Nhận
            </button>
          </div>
        )}
      </div>
            </div>
  );

  return (
    <div
            style={{
        minHeight: '100vh',
        padding: '40px',
        background: '#F5F5F5',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiTrendingUp size={28} color="#333333" />
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#333333', letterSpacing: '-0.02em', margin: 0 }}>
              Quản Lý Khớp Đồ
            </h1>
          </div>
          {activeTab === 'create' && (selectedLostItem || selectedFoundItem) && (
          <button
              onClick={openConfirmModal}
            style={{
              padding: '12px 24px',
                borderRadius: '8px',
                background: '#22C55E',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.background = '#16A34A')}
              onMouseLeave={(e) => (e.target.style.background = '#22C55E')}
            >
              <FiPlus size={18} />
              Tạo Match ({selectedLostItem ? 1 : 0} + {selectedFoundItem ? 1 : 0})
          </button>
          )}
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Tổng Matches', value: stats.total, icon: FiTrendingUp, bg: '#E3F2FD', color: '#1976D2' },
            { label: 'Đang Chờ', value: stats.pending, icon: FiClock, bg: '#FFF3E0', color: '#F57C00' },
            { label: 'Đã Xác Nhận', value: stats.confirmed, icon: FiCheckCircle, bg: '#E8F5E9', color: '#388E3C' },
            { label: 'Bị Từ Chối', value: stats.rejected, icon: FiXCircle, bg: '#FFEBEE', color: '#D32F2F' },
            { label: 'Hoàn Thành', value: stats.completed, icon: FiCheck, bg: '#E0F2F1', color: '#00796B' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                    <stat.icon size={20} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#999999' }}>{stat.label}</div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '0', background: '#E0E0E0', borderRadius: '12px 12px 0 0', padding: '4px 4px 0 4px' }}>
          <button onClick={() => setActiveTab('create')} style={getTabStyle('create')}>
            <FiPlus size={16} /> Tạo Match
          </button>
          <button onClick={() => setActiveTab('matchesOverview')} style={getTabStyle('matchesOverview')}>
            <FiTrendingUp size={16} /> Match Đã Tạo
          </button>
          <button onClick={() => setActiveTab('pending')} style={getTabStyle('pending')}>
            <FiClock size={16} /> Đang Chờ ({stats.pending})
          </button>
          <button onClick={() => setActiveTab('confirmed')} style={getTabStyle('confirmed')}>
            <FiCheckCircle size={16} /> Đã Xác Nhận ({stats.confirmed})
          </button>
          <button onClick={() => setActiveTab('rejected')} style={getTabStyle('rejected')}>
            <FiXCircle size={16} /> Bị Từ Chối ({stats.rejected})
          </button>
          <button onClick={() => setActiveTab('completed')} style={getTabStyle('completed')}>
            <FiCheck size={16} /> Hoàn Thành ({stats.completed})
            </button>
        </div>

        {/* Tab Content Container */}
        <div style={{ background: '#FFFFFF', borderRadius: '0 0 12px 12px', border: '1px solid #E0E0E0', borderTop: 'none', minHeight: '500px' }}>
          
          {/* CREATE TAB - Two Column Layout */}
        {activeTab === 'create' && (
            <div style={{ padding: '24px' }}>
              {/* Campus Filter */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>Lọc theo Campus:</label>
                <select
                  value={campusFilter}
                  onChange={(e) => setCampusFilter(e.target.value)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Tất cả</option>
                  {CAMPUSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Selection Summary */}
              {(selectedLostItem || selectedFoundItem) && (
                <div style={{ marginBottom: '20px', padding: '16px', background: '#F0F7FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <FiAlertCircle size={18} color="#1976D2" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1976D2' }}>Đã chọn để ghép:</span>
            </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {selectedLostItem && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFEBEE', borderRadius: '8px' }}>
                        <FiPackage size={16} color="#D32F2F" />
                        <span style={{ fontSize: '13px', color: '#333' }}>{selectedLostItem.itemName}</span>
                        <button onClick={() => setSelectedLostItem(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <FiX size={14} color="#D32F2F" />
                        </button>
                      </div>
                    )}
                    {selectedLostItem && selectedFoundItem && <FiArrowRight size={20} color="#666" />}
                    {selectedFoundItem && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#E8F5E9', borderRadius: '8px' }}>
                        <FiCheckCircle size={16} color="#388E3C" />
                        <span style={{ fontSize: '13px', color: '#333' }}>{selectedFoundItem.itemName}</span>
                        <button onClick={() => setSelectedFoundItem(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <FiX size={14} color="#388E3C" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Three Columns: Lost | Pending Matches | Found */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.9fr 1.05fr', gap: '24px' }}>
                {/* LEFT - Lost Items */}
                <div style={{ background: '#FFF5F5', borderRadius: '12px', border: '1px solid #FFCDD2', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #FFCDD2', background: '#FFEBEE' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FiPackage size={20} color="#D32F2F" />
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#D32F2F', margin: 0 }}>Đồ Bị Mất (Verified)</h3>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999', background: '#FFF', padding: '2px 8px', borderRadius: '10px' }}>{filteredLostItems.length}</span>
              </div>
                    <div style={{ position: 'relative' }}>
                      <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                        placeholder="Tìm kiếm đồ báo mất..."
                  value={keywordLost}
                  onChange={(e) => setKeywordLost(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #FFCDD2', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
                  <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {loadingLost ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải...</div>
              ) : filteredLostItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <FiPackage size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Không có đồ báo mất nào</p>
              </div>
            ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredLostItems.map((item) => (
                      <div
                      key={item._id}
                      onClick={() => {
                        setSelectedLostItem(item);
                              showInfo(`Đã chọn "${item.itemName}" làm Đồ Báo Mất. Bấm "Ghép với" để chọn đồ tìm thấy tương ứng.`);
                            }}
                            style={{
                              background: selectedLostItem?._id === item._id ? '#FFF' : '#FFFFFF',
                              borderRadius: '10px',
                              border: selectedLostItem?._id === item._id ? '2px solid #D32F2F' : '1px solid #E0E0E0',
                              padding: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: selectedLostItem?._id === item._id ? '0 4px 12px rgba(211, 47, 47, 0.2)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
                      {item.images?.[0] ? (
                                  <img src={getImageUrl(item.images[0])} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    <FiImage size={24} />
                          </div>
                      )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Tên + trạng thái chọn */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <h4
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: '#333',
                                      margin: 0,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.itemName}
                                  </h4>
                                  {selectedLostItem?._id === item._id && <FiCheck size={16} color="#D32F2F" />}
                                </div>

                                {/* Dòng thông tin chi tiết giống card mẫu trong yêu cầu */}
                                <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                  <FiTag size={12} style={{ marginRight: 4 }} />
                                  {getCategoryLabel(item.category)}
                                </div>
                                {item.color && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    🎨 <span>Màu: {item.color}</span>
                          </div>
                        )}
                                {item.features && item.features.length > 0 && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    🧩 <span>Đặc điểm: {item.features.join(', ')}</span>
                        </div>
                                )}
                                {(item.locationLost || item.campus) && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    <FiMapPin size={12} style={{ marginRight: 4 }} />
                                    {item.locationLost || item.campus}
                                  </div>
                                )}
                                {(() => {
                                  const reporterName =
                                    (item.student && (item.student.name || item.student.fullName)) ||
                                    item.reporterName ||
                                    item.studentName ||
                                    '';
                                  return reporterName ? (
                                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                      👤 {reporterName}
                                    </div>
                                  ) : null;
                                })()}
                                <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                                  <div style={{ marginBottom: '2px' }}>
                                    <FiCalendar size={11} style={{ marginRight: 4 }} />
                                    {formatDate(item.dateLost)}
                                  </div>
                                  <div>🏷️ {item.reportId}</div>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons: Chi tiết + Ghép với */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid #F5C6CB',
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/lost-items/${item._id}`, '_blank');
                                }}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #E0E0E0',
                                  background: '#FFFFFF',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#333333',
                                  cursor: 'pointer',
                                }}
                              >
                                Chi tiết
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLostItem(item);
                                  setShowSelectFoundModal(true);
                                  showInfo('Chọn 1 đồ Tìm Thấy để ghép với báo mất này.');
                                }}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#000000',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                Ghép với
                                <FiArrowRight size={12} />
                              </button>
                              </div>
                            </div>
                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                {/* CENTER - Pending / Verified Matches Preview */}
                <div style={{ background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E0E0E0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #E0E0E0', background: '#F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiTrendingUp size={18} color="#111827" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Match Đang Chờ / Đã Xác Nhận</h3>
              </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#6B7280' }}>
                      Xem nhanh các match đã tạo để dễ đối chiếu khi ghép đồ mới.
                    </p>
                  </div>
                  <div style={{ padding: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                    {loadingPending && !pendingMatchesData?.data ? (
                      <div style={{ textAlign: 'center', padding: '32px 8px', fontSize: '13px', color: '#6B7280' }}>
                        Đang tải danh sách match...
                      </div>
                    ) : (!pendingMatchesData?.data || pendingMatchesData.data.length === 0) &&
                      (!confirmedMatchesData?.data || confirmedMatchesData.data.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '32px 8px', fontSize: '13px', color: '#9CA3AF' }}>
                        Chưa có match nào được tạo
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Pending Matches */}
                        {pendingMatchesData?.data && pendingMatchesData.data.length > 0 && (
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#92400E', marginBottom: '6px' }}>
                              ⏳ Đang Chờ ({pendingMatchesData.data.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {pendingMatchesData.data.map((match) => (
                                <div
                                  key={match._id || match.requestId}
                                  style={{
                                    background: '#FEF3C7',
                                    borderRadius: '8px',
                                    padding: '8px 10px',
                                    border: '1px solid #FCD34D',
                                    fontSize: '11px',
                                    color: '#78350F',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600 }}>Match: {match.requestId || match._id?.slice(-6)}</span>
                                    <span style={{ opacity: 0.8 }}>{formatDate(match.createdAt)}</span>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div>
                                      <span style={{ fontWeight: 600 }}>Mất:</span>{' '}
                                      {match.lostItem?.itemName || 'N/A'}
                                    </div>
                                    <div>
                                      <span style={{ fontWeight: 600 }}>Tìm:</span>{' '}
                                      {match.foundItem?.itemName || 'N/A'}
                                    </div>
                                    {match.student?.name && (
                                      <div>
                                        <span style={{ fontWeight: 600 }}>SV:</span> {match.student.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Confirmed Matches */}
                        {confirmedMatchesData?.data && confirmedMatchesData.data.length > 0 && (
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#065F46', margin: '10px 0 6px' }}>
                              ✅ Đã Xác Nhận ({confirmedMatchesData.data.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {confirmedMatchesData.data.map((match) => (
                                <div
                                  key={match._id || match.requestId}
                                  style={{
                                    background: '#ECFDF3',
                                    borderRadius: '8px',
                                    padding: '8px 10px',
                                    border: '1px solid #6EE7B7',
                                    fontSize: '11px',
                                    color: '#064E3B',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600 }}>Match: {match.requestId || match._id?.slice(-6)}</span>
                                    <span style={{ opacity: 0.8 }}>{formatDate(match.confirmedAt || match.updatedAt)}</span>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div>
                                      <span style={{ fontWeight: 600 }}>Mất:</span>{' '}
                                      {match.lostItem?.itemName || 'N/A'}
                                    </div>
                                    <div>
                                      <span style={{ fontWeight: 600 }}>Tìm:</span>{' '}
                                      {match.foundItem?.itemName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT - Found Items */}
                <div style={{ background: '#F0FFF4', borderRadius: '12px', border: '1px solid #C8E6C9', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #C8E6C9', background: '#E8F5E9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FiCheckCircle size={20} color="#388E3C" />
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#388E3C', margin: 0 }}>Đồ Tìm Thấy (Unclaimed)</h3>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999', background: '#FFF', padding: '2px 8px', borderRadius: '10px' }}>{filteredFoundItems.length}</span>
              </div>
                    <div style={{ position: 'relative' }}>
                      <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                        placeholder="Tìm kiếm đồ tìm thấy..."
                  value={keywordFound}
                  onChange={(e) => setKeywordFound(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #C8E6C9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
                  <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {loadingFound ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải...</div>
              ) : filteredFoundItems.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <FiCheckCircle size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Không có đồ tìm thấy nào</p>
                            </div>
              ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredFoundItems.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        setSelectedFoundItem(item);
                              showInfo(`Đã chọn "${item.itemName}" làm Đồ Tìm Thấy.`);
                            }}
                            style={{
                              background: selectedFoundItem?._id === item._id ? '#FFF' : '#FFFFFF',
                              borderRadius: '10px',
                              border: selectedFoundItem?._id === item._id ? '2px solid #388E3C' : '1px solid #E0E0E0',
                              padding: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: selectedFoundItem?._id === item._id ? '0 4px 12px rgba(56, 142, 60, 0.2)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
                      {item.images?.[0] ? (
                                  <img src={getImageUrl(item.images[0])} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    <FiImage size={24} />
                        </div>
                      )}
                          </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Tên + trạng thái chọn */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <h4
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: '#333',
                                      margin: 0,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.itemName}
                                  </h4>
                                  {selectedFoundItem?._id === item._id && <FiCheck size={16} color="#388E3C" />}
                                </div>

                                {/* Dòng thông tin chi tiết */}
                                <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                  <FiTag size={12} style={{ marginRight: 4 }} />
                                  {getCategoryLabel(item.category)}
                                </div>
                                {item.color && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    🎨 <span>Màu: {item.color}</span>
                          </div>
                        )}
                                {item.condition && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    🛠️{' '}
                                    <span>
                                      Tình trạng:{' '}
                                      {item.condition === 'excellent'
                                        ? 'Như mới'
                                        : item.condition === 'good'
                                        ? 'Tốt'
                                        : item.condition === 'slightly_damaged'
                                        ? 'Trầy xước nhẹ'
                                        : item.condition === 'damaged'
                                        ? 'Hư hỏng'
                                        : item.condition}
                          </span>
                        </div>
                                )}
                                {item.locationFound && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    <FiMapPin size={12} style={{ marginRight: 4 }} />
                                    {item.locationFound}
                      </div>
                                )}
                                {item.discoveredBy && (
                                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>
                                    👤 {item.discoveredBy}
                </div>
              )}
                                <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                                  <div style={{ marginBottom: '2px' }}>
                                    <FiCalendar size={11} style={{ marginRight: 4 }} />
                                    {formatDate(item.dateFound)}
            </div>
                                  <div>🏷️ {item.foundId}</div>
          </div>
                  </div>
              </div>

                            {/* Action buttons: Chi tiết + Ghép với */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid #C8E6C9',
                              }}
                            >
              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/found-items/${item._id}`, '_blank');
                                }}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #E0E0E0',
                                  background: '#FFFFFF',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#333333',
                                  cursor: 'pointer',
                                }}
                              >
                                Chi tiết
              </button>
                      <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFoundItem(item);
                                  showInfo('Đã chọn đồ tìm thấy này. Ghép bằng cách chọn báo mất ở cột bên trái hoặc dùng popup từ card báo mất.');
                                }}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#000000',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                Ghép với
                                <FiArrowRight size={12} />
                      </button>
                    </div>
              </div>
                        ))}
                      </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}

          {/* MATCHES OVERVIEW TAB - full page tổng hợp match đã tạo */}
          {activeTab === 'matchesOverview' && (
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                🔗 Match Đã Tạo (Đang Chờ & Đã Xác Nhận)
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
                Xem tổng quan tất cả match đang chờ sinh viên xác nhận và những match đã được xác nhận.
              </p>

              {loadingPending && !pendingMatchesData?.data ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Đang tải match...</div>
              ) : (!pendingMatchesData?.data || pendingMatchesData.data.length === 0) &&
                (!confirmedMatchesData?.data || confirmedMatchesData.data.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
                  Chưa có match nào được tạo
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>
                  {pendingMatchesData?.data?.map((match) => (
                    <div key={match._id || match.requestId}>
                      {renderMatchCard({ ...match, status: 'pending' })}
                    </div>
                  ))}
                  {confirmedMatchesData?.data?.map((match) => (
                    <div key={match._id || match.requestId}>
                      {renderMatchCard({ ...match, status: 'confirmed' })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PENDING TAB */}
        {activeTab === 'pending' && (
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
                ⏳ Đang Chờ Xác Nhận ({pendingMatchesData?.data?.length || 0})
              </h3>
              {loadingPending ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Đang tải...</div>
              ) : !pendingMatchesData?.data?.length ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                  <FiClock size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Chưa có match nào đang chờ xác nhận</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
                  {pendingMatchesData.data.map((match) => renderMatchCard(match))}
                </div>
              )}
          </div>
        )}

          {/* CONFIRMED TAB */}
        {activeTab === 'confirmed' && (
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
                ✅ Đã Xác Nhận ({confirmedMatchesData?.data?.length || 0})
              </h3>
              {loadingConfirmed ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Đang tải...</div>
              ) : !confirmedMatchesData?.data?.length ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                  <FiCheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Chưa có match nào đã xác nhận</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
                  {confirmedMatchesData.data.map((match) => renderMatchCard(match))}
                </div>
              )}
              </div>
        )}

          {/* REJECTED TAB */}
        {activeTab === 'rejected' && (
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
                ❌ Bị Từ Chối ({rejectedMatchesData?.data?.length || 0})
              </h3>
              {loadingRejected ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Đang tải...</div>
              ) : !rejectedMatchesData?.data?.length ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                  <FiXCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Chưa có match nào bị từ chối</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
                  {rejectedMatchesData.data.map((match) => renderMatchCard(match))}
                    </div>
              )}
              </div>
              )}

          {/* COMPLETED TAB */}
          {activeTab === 'completed' && (
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
                ✔️ Đã Hoàn Thành ({completedMatchesData?.data?.length || 0})
              </h3>
              {loadingCompleted ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Đang tải...</div>
              ) : !completedMatchesData?.data?.length ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                  <FiCheck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Chưa có match nào hoàn thành</p>
            </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
                  {completedMatchesData.data.map((match) => renderMatchCard(match))}
          </div>
        )}
                </div>
          )}
                </div>

        {/* Confirm Match Modal */}
        {showConfirmModal && selectedFoundItem && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowConfirmModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#333', margin: 0 }}>🔗 Xác Nhận Tạo Match</h2>
                <button onClick={() => setShowConfirmModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                  <FiX size={24} color="#666" />
                </button>
                </div>

              {/* Modal Body */}
              <div style={{ padding: '24px' }}>
                {/* Match Preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', marginBottom: '24px', padding: '16px', background: '#F8F9FA', borderRadius: '12px' }}>
                  {/* Lost Item */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#D32F2F', marginBottom: '8px' }}>ĐỒ BÁO MẤT</div>
                    {selectedLostItem ? (
                      <>
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#F5F5F5', margin: '0 auto 8px' }}>
                          {selectedLostItem.images?.[0] ? (
                            <img src={getImageUrl(selectedLostItem.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}><FiImage size={32} /></div>
                          )}
                    </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{selectedLostItem.itemName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{getCategoryLabel(selectedLostItem.category)}</div>
                      </>
                    ) : (
                      <div style={{ color: '#999', fontSize: '13px' }}>Không chọn (dùng Student ID)</div>
                    )}
                </div>

                  {/* Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiArrowRight size={24} color="#FFF" />
                    </div>
                  </div>

                  {/* Found Item */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#388E3C', marginBottom: '8px' }}>ĐỒ TÌM THẤY</div>
                    {selectedFoundItem && (
                      <>
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#F5F5F5', margin: '0 auto 8px' }}>
                          {selectedFoundItem.images?.[0] ? (
                            <img src={getImageUrl(selectedFoundItem.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}><FiImage size={32} /></div>
              )}
            </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>{selectedFoundItem.itemName}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{getCategoryLabel(selectedFoundItem.category)}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Student ID (if no lost item) */}
                {!selectedLostItem && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>Student ID *</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Nhập Student ID"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
          </div>
        )}

        {/* Select Found Item Modal - mở khi bấm Ghép với trên card LOST */}
        {showSelectFoundModal && selectedLostItem && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowSelectFoundModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                width: '95%',
                maxWidth: '720px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Chọn đồ Tìm Thấy để ghép</h2>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Đang ghép với: <strong>{selectedLostItem.itemName}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowSelectFoundModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
                >
                  <FiX size={20} color="#6B7280" />
                </button>
              </div>

              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ position: 'relative', maxWidth: '360px' }}>
                  <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Lọc theo tên, màu, vị trí..."
                    value={keywordFound}
                    onChange={(e) => setKeywordFound(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
                {loadingFound ? (
                  <div style={{ textAlign: 'center', padding: '40px 8px', fontSize: '13px', color: '#6B7280' }}>
                    Đang tải danh sách đồ tìm thấy...
                  </div>
                ) : filteredFoundItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 8px', fontSize: '13px', color: '#9CA3AF' }}>
                    Không có đồ tìm thấy phù hợp
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredFoundItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          setSelectedFoundItem(item);
                          setShowSelectFoundModal(false);
                          setShowConfirmModal(true);
                        }}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          padding: '10px',
                          borderRadius: '10px',
                          border: selectedFoundItem?._id === item._id ? '2px solid #22C55E' : '1px solid #E5E7EB',
                          cursor: 'pointer',
                          background: selectedFoundItem?._id === item._id ? '#ECFDF3' : '#FFFFFF'
                        }}
                      >
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
                          {item.images?.[0] ? (
                            <img src={getImageUrl(item.images[0])} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                              <FiImage size={22} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.itemName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: 2 }}>
                            <FiTag size={11} style={{ marginRight: 4 }} />
                            {getCategoryLabel(item.category)} • 🎨 {item.color}
                          </div>
                          <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: 2 }}>
                            <FiMapPin size={11} style={{ marginRight: 4 }} />
                            {item.locationFound}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>
                            <FiCalendar size={11} style={{ marginRight: 4 }} />
                            {formatDate(item.dateFound)} • 🏷️ {item.foundId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', textAlign: 'right' }}>
                <button
                  onClick={() => setShowSelectFoundModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

                {/* Match Reason */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>Lý do Match</label>
                  <textarea
                    value={matchReason}
                    onChange={(e) => setMatchReason(e.target.value)}
                    placeholder="Ví dụ: Cùng loại iPhone, màu đen, có bao da..."
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }}>Ghi chú (tùy chọn)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú thêm..."
                    rows={2}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={creating}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: '#F5F5F5',
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: 500,
                    border: '1px solid #E0E0E0',
                    cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateMatch}
                  disabled={creating || (!selectedLostItem && !studentId)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: creating || (!selectedLostItem && !studentId) ? '#9CA3AF' : '#22C55E',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: creating || (!selectedLostItem && !studentId) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {creating ? 'Đang tạo...' : '✅ Xác Nhận Tạo Match'}
                </button>
                    </div>
          </div>
        </div>
      )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MatchingManagementPage;
