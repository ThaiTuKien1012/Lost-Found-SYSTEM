import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiBook } from 'react-icons/fi';

const registerSchema = z.object({
  userId: z.string().min(1, 'Mã số sinh viên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu là bắt buộc'),
  firstName: z.string().min(1, 'Họ là bắt buộc'),
  lastName: z.string().min(1, 'Tên là bắt buộc'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  campus: z.string().min(1, 'Campus là bắt buộc'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
      campus: 'NVH',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);
      if (result.success) {
        showSuccess('Đăng ký thành công!');
        navigate('/');
      } else {
        showError(result.error?.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Main Register Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left Side - Branding Section with Yellow Gradient */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE5B4 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
            color: '#333333',
          }}
        >
          {/* Lion Emoji - Large 3D Style */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              fontSize: '120px',
              marginBottom: '32px',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))',
            }}
          >
            🦁
          </motion.div>

          {/* System Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#333333',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            FPTU Lost & Found System
          </motion.h1>
        </div>

        {/* Right Side - Register Form */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 80px',
            overflowY: 'auto',
            justifyContent: 'center',
          }}
        >
          {/* Form Container */}
          <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: '40px' }}
            >
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#333333',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                }}
              >
                Tạo tài khoản mới
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: 1.5,
                }}
              >
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#4285F4',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#1a73e8')}
                  onMouseLeave={(e) => (e.target.style.color = '#4285F4')}
                >
                  Đăng nhập
                </Link>
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* User ID Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Mã số sinh viên
                </label>
                <input
                  type="text"
                  autoComplete="off"
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
                  placeholder="Nhập mã số sinh viên"
                  {...register('userId')}
                />
                {errors.userId && (
                  <motion.p
                    style={{
                      fontSize: '12px',
                      color: '#FF0000',
                      marginTop: '6px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.userId.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Name Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* First Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
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
                    autoComplete="given-name"
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
                    placeholder="Họ"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <motion.p
                      style={{
                        fontSize: '12px',
                        color: '#FF0000',
                        marginTop: '6px',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.firstName.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Last Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
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
                    autoComplete="family-name"
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
                    placeholder="Tên"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <motion.p
                      style={{
                        fontSize: '12px',
                        color: '#FF0000',
                        marginTop: '6px',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.lastName.message}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
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
                  autoComplete="email"
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
                  placeholder="yourname@mail.com"
                  {...register('email')}
                />
                {errors.email && (
                  <motion.p
                    style={{
                      fontSize: '12px',
                      color: '#FF0000',
                      marginTop: '6px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Phone Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
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
                  autoComplete="tel"
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
                  placeholder="0123456789"
                  {...register('phone')}
                />
                {errors.phone && (
                  <motion.p
                    style={{
                      fontSize: '12px',
                      color: '#FF0000',
                      marginTop: '6px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.phone.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Campus Select */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Campus
                </label>
                <select
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
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4285F4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E0E0E0';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('campus')}
                >
                  <option value="NVH">Nam Sài Gòn</option>
                  <option value="SHTP">Saigon Hi-Tech Park</option>
                </select>
                {errors.campus && (
                  <motion.p
                    style={{
                      fontSize: '12px',
                      color: '#FF0000',
                      marginTop: '6px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.campus.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '12px 44px 12px 16px',
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
                    placeholder="Enter your password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#999999',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#333333')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    style={{
                      fontSize: '12px',
                      color: '#FF0000',
                      marginTop: '6px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#333333',
                    marginBottom: '8px',
                  }}
                >
                  Xác nhận mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '12px 44px 12px 16px',
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
                    placeholder="Enter your password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#999999',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#333333')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    style={{
                      fontSize: '12px',
                      color: '#FF0000',
                      marginTop: '6px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Register Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: '#000000',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
                whileHover={!isSubmitting ? { background: '#333333' } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </motion.button>

              {/* Login Link */}
              <motion.p
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666666',
                  textAlign: 'center',
                  marginTop: '8px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#4285F4',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#1a73e8')}
                  onMouseLeave={(e) => (e.target.style.color = '#4285F4')}
                >
                  Đăng nhập
                </Link>
              </motion.p>
            </form>
          </div>
        </div>
      </motion.div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .register-container {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
