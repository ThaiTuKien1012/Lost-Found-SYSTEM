import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import userService from '../../api/userService';
import { FiUser, FiMail, FiShield, FiMapPin, FiEdit, FiSave, FiX, FiLock, FiPhone } from 'react-icons/fi';

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile từ API
  const { data, loading, error, refetch } = useFetch(
    () => userService.getProfile(),
    []
  );

  const profile = data?.data || authUser;

  // Initialize form data khi vào edit mode
  useEffect(() => {
    if (isEditing && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || ''
      });
    }
  }, [isEditing, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const result = await userService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });

      if (result.success) {
        showSuccess('Cập nhật profile thành công!');
        setIsEditing(false);
        
        // Update AuthContext
        if (result.data && updateUser) {
          updateUser(result.data);
        }
        
        refetch(); // Fetch lại profile mới
      } else {
        showError(result.error?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const result = await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        showSuccess('Đổi mật khẩu thành công!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showError(result.error?.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      student: 'Sinh viên',
      staff: 'Nhân viên',
      security: 'Bảo vệ',
      admin: 'Quản trị viên'
    };
    return labels[role] || role;
  };

  const profileInfo = profile ? [
    { 
      icon: FiUser, 
      label: 'Họ tên', 
      value: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Chưa cập nhật'
    },
    { 
      icon: FiMail, 
      label: 'Email', 
      value: profile.email || 'Chưa có'
    },
    { 
      icon: FiShield, 
      label: 'Vai trò', 
      value: getRoleLabel(profile.role)
    },
    { 
      icon: FiMapPin, 
      label: 'Campus', 
      value: profile.campus || 'Chưa có'
    },
    ...(profile.phone ? [{
      icon: FiPhone,
      label: 'Số điện thoại',
      value: profile.phone
    }] : [])
  ] : [];

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E0E0E0',
              borderTopColor: '#333333',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#666666', fontSize: '14px' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <p style={{ color: '#FF0000', fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px',
        background: '#F5F5F5',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FiUser size={24} color="#333333" />
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#333333',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Hồ Sơ Cá Nhân
            </h1>
          </div>
        </div>

        {profile && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              padding: '40px',
            }}
          >
            {/* Avatar Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: '#333333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '36px',
                  fontWeight: 600,
                  marginBottom: '24px',
                }}
              >
                {(profile.firstName?.[0] || '').toUpperCase()}
                {(profile.lastName?.[0] || '').toUpperCase()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    background: isEditing ? '#333333' : '#FFFFFF',
                    color: isEditing ? '#FFFFFF' : '#333333',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditing) {
                      e.target.style.background = '#F5F5F5';
                      e.target.style.borderColor = '#D1D5DB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEditing) {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#E0E0E0';
                    }
                  }}
                >
                  <FiEdit size={16} />
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    background: '#FFFFFF',
                    color: '#333333',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
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
                  <FiLock size={16} />
                  Đổi mật khẩu
                </button>
              </div>
            </div>

            {/* Profile Info Section */}
            {!isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {profileInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={info.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        background: '#FFFFFF',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#F5F5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666666',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#999999',
                            marginBottom: '4px',
                          }}
                        >
                          {info.label}
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#333333',
                          }}
                        >
                          {info.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                        marginBottom: '8px',
                      }}
                    >
                      Họ
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        background: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#333333',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4285F4';
                        e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E0E0E0';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Nhập họ"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                        marginBottom: '8px',
                      }}
                    >
                      Tên
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        background: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#333333',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4285F4';
                        e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E0E0E0';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Nhập tên"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                        marginBottom: '8px',
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      disabled
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        background: '#F5F5F5',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#999999',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                      }}
                      placeholder="Email không thể thay đổi"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333333',
                        marginBottom: '8px',
                      }}
                    >
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        background: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#333333',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4285F4';
                        e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E0E0E0';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={handleUpdateProfile}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        background: '#000000',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.background = '#333333')}
                      onMouseLeave={(e) => (e.target.style.background = '#000000')}
                    >
                      <FiSave size={16} />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        flex: 1,
                        height: '48px',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: '1px solid #E0E0E0',
                        background: '#FFFFFF',
                        color: '#333333',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
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
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
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
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: '480px',
              padding: '32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#333333',
                  margin: 0,
                }}
              >
                Đổi Mật Khẩu
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
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
                <FiX size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#333333',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4285F4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E0E0E0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#333333',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4285F4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E0E0E0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#333333',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4285F4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E0E0E0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleChangePassword}
                style={{
                  flex: 1,
                  height: '48px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: '#000000',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.background = '#333333')}
                onMouseLeave={(e) => (e.target.style.background = '#000000')}
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  height: '48px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  background: '#FFFFFF',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
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
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
