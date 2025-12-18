import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await login(data);
      if (result.success) {
        showSuccess('Đăng nhập thành công!');
        navigate('/');
      } else {
        showError(result.error?.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      showError('Có lỗi xảy ra khi đăng nhập');
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
      {/* Main Login Container */}
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

        {/* Right Side - Login Form */}
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
                Đăng nhập vào tài khoản
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#666666',
                  lineHeight: 1.5,
                }}
              >
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#4285F4',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#1a73e8')}
                  onMouseLeave={(e) => (e.target.style.color = '#4285F4')}
                >
                  Đăng ký
                </Link>
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Email Input */}
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
                  Email
                </label>
                <input
                  type="email"
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

              {/* Password Input */}
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
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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

              {/* Remember Me */}
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    accentColor: '#4285F4',
                  }}
                />
                <label
                  htmlFor="remember"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#333333',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Remember me
                </label>
              </motion.div>

              {/* Login Button */}
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
                }}
                whileHover={!isSubmitting ? { background: '#333333' } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </motion.button>

              {/* Divider */}
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  margin: '8px 0',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div style={{ flex: 1, height: '1px', background: '#E0E0E0' }} />
                <span style={{ fontSize: '14px', color: '#999999', fontWeight: 400 }}>
                  hoặc đăng nhập với
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E0E0E0' }} />
              </motion.div>

              {/* Google Login Button */}
              <motion.button
                type="button"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: '#333333',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid #E0E0E0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
                whileHover={{ borderColor: '#4285F4', background: '#FAFAFA' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập với Google
              </motion.button>
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
          .login-container {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
