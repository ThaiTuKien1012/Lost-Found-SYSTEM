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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F5F5',
      padding: '20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    }}>
      {/* Main Container - White Rounded Card with Shadow */}
      <motion.div
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left Panel - Visual/Illustration Section */}
        <motion.div
          style={{
            background: '#FFF8E7',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Decorative Background Elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 235, 59, 0.1)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255, 193, 7, 0.1)',
            filter: 'blur(30px)',
          }} />

          {/* Illustration Placeholder - Lion Character */}
          <motion.div
            style={{
              fontSize: '120px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            🦁
          </motion.div>

          {/* Optional: Add text or illustration description */}
          <div style={{
            textAlign: 'center',
            color: '#8B6914',
            fontSize: '14px',
            fontWeight: 500,
            opacity: 0.7,
            position: 'relative',
            zIndex: 1,
          }}>
            FPTU Lost & Found System
          </div>
        </motion.div>

        {/* Right Panel - Login Form Section */}
        <motion.div
          style={{
            background: '#FFFFFF',
            padding: '60px 50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Login to your account
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666666',
              fontWeight: 400,
            }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Email Input */}
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
                {...register('email')}
                placeholder="yourname@mail.com"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  fontSize: '15px',
                  color: '#1A1A1A',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <motion.p
                  style={{
                    fontSize: '12px',
                    color: '#EF4444',
                    marginTop: '6px',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 48px 0 16px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    fontSize: '15px',
                    color: '#1A1A1A',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  style={{
                    fontSize: '12px',
                    color: '#EF4444',
                    marginTop: '6px',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Remember Me */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <input
                type="checkbox"
                id="remember"
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  accentColor: '#1A1A1A',
                }}
              />
              <label
                htmlFor="remember"
                style={{
                  fontSize: '14px',
                  color: '#4B5563',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: 400,
                }}
              >
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                background: '#000000',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              whileHover={!isSubmitting ? { scale: 1.01 } : {}}
              whileTap={!isSubmitting ? { scale: 0.99 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginRight: '8px',
                  }} />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </motion.button>

            {/* Separator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '8px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{
                fontSize: '14px',
                color: '#6B7280',
                fontWeight: 400,
              }}>
                or login with
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Google Login Button */}
            <motion.button
              type="button"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#1A1A1A',
                fontSize: '15px',
                fontWeight: 500,
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              whileHover={{ borderColor: '#D1D5DB', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
              whileTap={{ scale: 0.98 }}
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
              Login with Google
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="background: #FFF8E7"] {
            display: none !important;
          }
        }
        
        input::placeholder {
          color: #9CA3AF !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
