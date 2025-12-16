import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { motion } from 'framer-motion';
import lostItemService from '../../api/lostItemService';
import LostItemForm from '../../components/lost-items/LostItemForm';
import LostItemList from '../../components/lost-items/LostItemList';
import { FiPlus, FiX, FiPackage } from 'react-icons/fi';

const LostItemsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useFetch(
    () => lostItemService.getMyReports(page, 100),
    [page]
  );

  const handleCreateReport = async (formData) => {
    const result = await lostItemService.createReport(formData);
    if (result.success) {
      showSuccess('Báo cáo đã được tạo thành công!');
      
      // Show warning if exists (e.g., date > 90 days)
      if (result.warning) {
        showWarning(result.warning);
      }
      
      refetch();
      return result; // Return để form biết đã thành công
    } else {
      showError(result.error?.message || result.error || 'Tạo báo cáo thất bại');
      return result; // Return để form biết đã thất bại
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <FiPackage style={{ fontSize: '24px', color: '#1A1A1A' }} />
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1A1A1A',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Báo Cáo Đồ Thất Lạc
            </h1>
          </div>
          <button
            onClick={toggleForm}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: showForm ? '#EF4444' : '#000000',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {showForm ? (
              <>
                <FiX />
                <span>Hủy</span>
              </>
            ) : (
              <>
                <FiPlus />
                <span>Tạo Báo Cáo Mới</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Modal Form */}
        {showForm && (
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
              padding: '20px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowForm(false);
              }
            }}
          >
            <motion.div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
                padding: '32px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E5E7EB',
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  margin: 0,
                }}>
                  Tạo Báo Cáo Mới
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666666',
                    fontSize: '24px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5F5F5';
                    e.currentTarget.style.color = '#1A1A1A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                >
                  <FiX />
                </button>
              </div>

              {/* Form Content */}
              <div style={{
                maxHeight: 'calc(90vh - 120px)',
                overflowY: 'auto',
                paddingRight: '8px',
              }}>
                <LostItemForm 
                  onSubmit={async (formData) => {
                    return await handleCreateReport(formData);
                  }}
                  onCancel={() => setShowForm(false)}
                  onSuccess={() => setShowForm(false)}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '60px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E5E7EB',
              borderTop: '4px solid #1A1A1A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}></div>
            <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải...</p>
          </div>
        ) : error ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '40px',
            textAlign: 'center',
          }}>
            <p style={{
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              {error?.error || error?.message || 'Failed to fetch reports'}
            </p>
          </div>
        ) : (
          <LostItemList
            items={data?.data || []}
            pagination={data?.pagination}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default LostItemsPage;

