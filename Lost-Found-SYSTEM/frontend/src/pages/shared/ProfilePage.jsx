import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { useNotification } from '../../hooks/useNotification';
import { motion } from 'framer-motion';
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

  // Get user initials from fullName
  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  };

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
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || ''
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
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber
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
      value: profile.fullName || 'Chưa cập nhật'
    },
    { 
      icon: FiMail, 
      label: 'Email', 
      value: profile.email || 'Chưa có'
    },
    { 
      icon: FiShield, 
      label: 'Vai trò', 
      value: getRoleLabel(profile.role?.toLowerCase())
    },
    ...(profile.phoneNumber ? [{
      icon: FiPhone,
      label: 'Số điện thoại',
      value: profile.phoneNumber
    }] : [])
  ] : [];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
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
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      }}>
        <div style={{
          background: '#FFFFFF',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}>
          <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <motion.div
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FiUser style={{ fontSize: '24px', color: '#1A1A1A' }} />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Hồ Sơ Cá Nhân
          </h1>
        </motion.div>

        {profile && (
          <motion.div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              padding: '40px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Avatar Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1A1A1A',
                fontSize: '48px',
                fontWeight: 600,
                marginBottom: '24px',
              }}>
                {getUserInitials(profile.fullName)}
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
              }}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#000000',
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
                  <FiEdit />
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#1A1A1A',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  <FiLock />
                  Đổi mật khẩu
                </button>
              </div>
            </div>

            {!isEditing ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                {profileInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={info.label}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#F5F5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon style={{ fontSize: '20px', color: '#666666' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#666666',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {info.label}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#1A1A1A',
                        }}>
                          {info.value}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '8px',
                    }}>
                      Họ tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        fontSize: '14px',
                        color: '#1A1A1A',
                        background: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '8px',
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        fontSize: '14px',
                        color: '#666666',
                        background: '#F5F5F5',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                      }}
                      placeholder="Email không thể thay đổi"
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '8px',
                    }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        fontSize: '14px',
                        color: '#1A1A1A',
                        background: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '8px',
                  }}>
                    <button
                      onClick={handleUpdateProfile}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#000000',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                      <FiSave />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        flex: 1,
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        color: '#1A1A1A',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F5F5F5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      <FiX />
                      Hủy
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
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
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  margin: 0,
                }}>
                  Đổi Mật Khẩu
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666666',
                    fontSize: '20px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiX />
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '24px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '8px',
                  }}>
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
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '8px',
                  }}>
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
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '8px',
                  }}>
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
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#1A1A1A',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
              }}>
                <button
                  onClick={handleChangePassword}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#000000',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#1A1A1A',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  Hủy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

