import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

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
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Full-screen Background Image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/anh-nen-may-tinh-4k-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* Subtle overlay for better readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 1,
        }}
      />

      {/* Glass Morphism Form Section */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo & Header */}
        <motion.div
          style={{ marginBottom: '32px' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4A3F7F 0%, #2C2C2C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(74, 63, 127, 0.3)',
              }}
            >
              <FiShield size={24} />
            </div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              FPTU Lost & Found
            </span>
          </div>

            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#FFFFFF',
                marginBottom: '8px',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 5px rgba(0,0,0,0.2)',
              }}
            >
              Đăng nhập để tiếp tục truy cập hệ thống
            </p>
        </motion.div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Email Input */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'rgba(255,255,255,0.95)',
                marginBottom: '4px',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <FiMail size={20} />
              </span>
              <input
                type="email"
                autoComplete="off"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '12px 16px 12px 44px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#FFFFFF',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="email@fptu.edu.vn"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <motion.p
                style={{
                  fontSize: '12px',
                  color: '#FF0000',
                  marginTop: '4px',
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
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                Mật khẩu
              </label>
              <button
                type="button"
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'none',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                  e.target.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                  e.target.style.color = 'rgba(255,255,255,0.9)';
                }}
              >
                Quên mật khẩu?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <FiLock size={20} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '12px 44px 12px 44px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#FFFFFF',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Nhập mật khẩu"
                {...register('password')}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                style={{
                  fontSize: '12px',
                  color: '#FF0000',
                  marginTop: '4px',
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
            transition={{ delay: 0.5 }}
          >
            <input
              type="checkbox"
              id="remember"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: '1px solid #DDDDDD',
                cursor: 'pointer',
                accentColor: '#4A3F7F',
              }}
            />
            <label
              htmlFor="remember"
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                userSelect: 'none',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              Ghi nhớ đăng nhập
            </label>
          </motion.div>

          {/* Sign In Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '44px',
              padding: '12px 20px',
              borderRadius: '8px',
              background: '#000000',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            whileHover={!isSubmitting ? { background: '#222222' } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
                    marginRight: '8px',
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
              gap: '12px',
              margin: '8px 0',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>hoặc</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }} />
          </motion.div>

          {/* Google OAuth Button */}
          <motion.button
            type="button"
            style={{
              width: '100%',
              height: '44px',
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
            Continue with Google
          </motion.button>

          {/* Register Link */}
          <motion.p
            style={{
              fontSize: '12px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              marginTop: '8px',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              style={{
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 600,
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
                e.target.style.color = '#FFFFFF';
              }}
            >
              Đăng ký ngay
            </Link>
          </motion.p>
        </form>
      </motion.div>

      {/* Right: Visual Section with Background Image */}
      <motion.div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      >
        {/* Background Image - Fantasy Landscape */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/anh-nen-may-tinh-4k-1.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />

        {/* Overlay để đảm bảo form readable - Subtle overlay for fantasy landscape */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(135,206,235,0.12) 0%, rgba(212,165,255,0.08) 50%, rgba(255,107,185,0.05) 100%)',
            zIndex: 1,
          }}
        />
        
        {/* Additional dark overlay for better contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
            zIndex: 1,
          }}
        />

        {/* Animated gradient overlay */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,107,185,0.2) 0%, rgba(135,206,235,0.2) 50%, rgba(212,165,255,0.2) 100%)',
            zIndex: 2,
          }}
          animate={{
            background: [
              'linear-gradient(135deg, rgba(255,107,185,0.2) 0%, rgba(135,206,235,0.2) 50%, rgba(212,165,255,0.2) 100%)',
              'linear-gradient(135deg, rgba(212,165,255,0.2) 0%, rgba(255,107,185,0.2) 50%, rgba(135,206,235,0.2) 100%)',
              'linear-gradient(135deg, rgba(255,107,185,0.2) 0%, rgba(135,206,235,0.2) 50%, rgba(212,165,255,0.2) 100%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Decorative circles - Subtle for fantasy landscape */}
        <motion.div
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            filter: 'blur(30px)',
            zIndex: 3,
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            filter: 'blur(40px)',
            zIndex: 3,
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </motion.div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr !important;
          }
          .visual-section {
            display: none !important;
          }
          .form-section {
            max-width: 100% !important;
            padding: 32px 24px !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1199px) {
          .login-container {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
