import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';
import { gsap } from 'gsap';
import userService from '../api/userService';
import AnimatedBackground from '../components/common/AnimatedBackground';
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

  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const infoItemsRef = useRef([]);
  const editFormRef = useRef(null);

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

  // GSAP animations
  useEffect(() => {
    if (profile && !loading) {
      const tl = gsap.timeline();
      
      tl.fromTo(titleRef.current,
        { opacity: 0, y: -30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
      )
      .fromTo(cardRef.current,
        { opacity: 0, y: 50, rotationX: -15 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
      
      if (!isEditing && infoItemsRef.current.length > 0) {
        gsap.fromTo(infoItemsRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          '-=0.4'
        );
      }
    }
  }, [profile, loading, isEditing]);

  useEffect(() => {
    if (isEditing && editFormRef.current) {
      gsap.fromTo(editFormRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isEditing]);

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
      <div className="profile-page-enhanced">
        <AnimatedBackground intensity={0.1} />
        <div className="loading-enhanced">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-enhanced">
        <AnimatedBackground intensity={0.1} />
        <div className="error-enhanced">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="profile-page-enhanced">
      <AnimatedBackground intensity={0.1} />
      
      <div className="page-header-enhanced">
        <div className="title-wrapper">
          <FiUser className="title-icon" />
          <h1 ref={titleRef} className="page-title">Hồ Sơ Cá Nhân</h1>
        </div>
      </div>

      {profile && (
        <div ref={cardRef} className="profile-card-enhanced">
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                {(profile.firstName?.[0] || '').toUpperCase()}
                {(profile.lastName?.[0] || '').toUpperCase()}
              </div>
            </div>
            <div className="profile-actions">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="btn-edit-profile"
              >
                <FiEdit />
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="btn-change-password"
              >
                <FiLock />
                Đổi mật khẩu
              </button>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-info-section">
              {profileInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={info.label}
                    ref={el => {
                      if (el) infoItemsRef.current[index] = el;
                    }}
                    className="info-item-enhanced"
                  >
                    <div className="info-icon-wrapper">
                      <Icon className="info-icon" />
                    </div>
                    <div className="info-content">
                      <span className="info-label">{info.label}</span>
                      <span className="info-value">{info.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div ref={editFormRef} className="profile-edit-section">
              <div className="edit-form">
                <div className="form-group">
                  <label>Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập họ"
                  />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập tên"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="form-input disabled"
                    placeholder="Email không thể thay đổi"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-actions">
                  <button
                    onClick={handleUpdateProfile}
                    className="btn-save"
                  >
                    <FiSave />
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-cancel"
                  >
                    <FiX />
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đổi Mật Khẩu</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="form-input"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="form-input"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleChangePassword}
                className="btn-primary"
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

