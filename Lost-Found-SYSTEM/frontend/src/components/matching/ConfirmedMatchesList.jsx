import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import matchingService from '../../api/matchingService';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { FiCheckCircle, FiUser, FiPackage, FiClock, FiMapPin } from 'react-icons/fi';

const ConfirmedMatchesList = () => {
  const { showSuccess, showError } = useNotification();
  const [resolving, setResolving] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => matchingService.getConfirmedMatches(1, 50),
    []
  );

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

  if (loading) return <div className="loading-spinner">Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data?.data?.length) return <div className="empty-state">Chưa có đồ sẵn sàng trả</div>;

  return (
    <div className="confirmed-matches-list">
      {data.data.map((match) => (
        <div key={match.requestId} className="match-card">
          <div className="match-card-header">
            <div className="match-id">Match ID: {match.requestId}</div>
            <div className="match-date">
              <FiClock /> {formatDate(match.confirmedAt)}
            </div>
          </div>

          <div className="match-card-body">
            {/* Found Item Info */}
            {match.foundItem && (
              <div className="match-item-section">
                <h3><FiPackage /> Đồ Tìm Thấy</h3>
                <div className="item-details">
                  {match.foundItem.images?.[0] && (
                    <img
                      src={getImageUrl(match.foundItem.images[0])}
                      alt={match.foundItem.itemName}
                      className="item-image-small"
                    />
                  )}
                  <div className="item-info">
                    <div className="item-name">{match.foundItem.itemName}</div>
                    <div className="item-meta">
                      <span>{match.foundItem.category}</span>
                      <span>{match.foundItem.color}</span>
                    </div>
                    <div className="item-location">
                      <FiMapPin /> {match.foundItem.locationFound}
                    </div>
                    {match.foundItem.warehouseLocation && (
                      <div className="item-warehouse">
                        Kho: {match.foundItem.warehouseLocation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Student Info */}
            {match.student && (
              <div className="match-student-section">
                <h3><FiUser /> Sinh Viên</h3>
                <div className="student-info">
                  <div className="student-name">{match.student.name}</div>
                  <div className="student-email">{match.student.email}</div>
                  {match.student.phone && (
                    <div className="student-phone">ĐT: {match.student.phone}</div>
                  )}
                </div>
              </div>
            )}

            {/* Match Reason */}
            {match.matchReason && (
              <div className="match-reason">
                <strong>Lý do match:</strong> {match.matchReason}
              </div>
            )}
          </div>

          <div className="match-card-footer">
            <button
              className="btn btn-primary"
              onClick={() => handleConfirmReturn(match.requestId)}
              disabled={resolving === match.requestId}
            >
              <FiCheckCircle /> 
              {resolving === match.requestId ? 'Đang xử lý...' : '✅ Xác Nhận Trả Đồ'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfirmedMatchesList;

