import React, { useEffect, useRef, useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { gsap } from 'gsap';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginForm = ({ onSubmit }) => {
  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    {
      email: '',
      password: ''
    },
    onSubmit
  );

  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Animate form entrance
    gsap.fromTo(
      formRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out'
      }
    );

    // Animate input fields
    gsap.fromTo(
      [emailRef.current, passwordRef.current],
      {
        opacity: 0,
        x: -30
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.2,
        delay: 0.3,
        ease: 'power2.out'
      }
    );

    // Animate button
    gsap.fromTo(
      buttonRef.current,
      {
        opacity: 0,
        scale: 0.8
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        delay: 0.7,
        ease: 'back.out(1.7)'
      }
    );
  }, []);

  const handleInputFocus = (ref) => {
    gsap.to(ref.current, {
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleInputBlur = (ref) => {
    gsap.to(ref.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleButtonHover = (isHover) => {
    gsap.to(buttonRef.current, {
      scale: isHover ? 1.05 : 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="login-form-enhanced">
      <div className="form-group-enhanced" ref={emailRef}>
        <label className="form-label-animated">
          <FiMail className="label-icon" />
          Email
        </label>
        <div className="input-wrapper">
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onFocus={() => handleInputFocus(emailRef)}
            onBlur={() => handleInputBlur(emailRef)}
            required
            placeholder="email@fptu.edu.vn"
            className="input-enhanced"
          />
          <div className="input-underline"></div>
        </div>
      </div>

      <div className="form-group-enhanced" ref={passwordRef}>
        <label className="form-label-animated">
          <FiLock className="label-icon" />
          Mật khẩu
        </label>
        <div className="input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={values.password}
            onChange={handleChange}
            onFocus={() => handleInputFocus(passwordRef)}
            onBlur={() => handleInputBlur(passwordRef)}
            required
            placeholder="Nhập mật khẩu"
            className="input-enhanced"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
          <div className="input-underline"></div>
        </div>
      </div>

      <button
        ref={buttonRef}
        type="submit"
        className="btn btn-primary-enhanced"
        disabled={isSubmitting}
        onMouseEnter={() => handleButtonHover(true)}
        onMouseLeave={() => handleButtonHover(false)}
      >
        <span className="btn-text">
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </span>
        <span className="btn-shine"></span>
      </button>
    </form>
  );
};

export default LoginForm;
