import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { useForm } from '../../hooks/useForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError, showSuccess } = useNotification();

  const { values, handleChange, handleSubmit, isSubmitting } = useForm(
    {
      userId: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'student',
      campus: 'NVH'
    },
    async (formData) => {
      const result = await register(formData);
      if (result.success) {
        showSuccess('Đăng ký thành công!');
        navigate('/');
      } else {
        showError(result.error?.message || 'Đăng ký thất bại');
      }
    }
  );

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Đăng Ký</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã số sinh viên</label>
            <input
              type="text"
              name="userId"
              value={values.userId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              required
              placeholder="email@fptu.edu.vn"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Họ</label>
              <input
                type="text"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tên</label>
              <input
                type="text"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Campus</label>
            <select
              name="campus"
              value={values.campus}
              onChange={handleChange}
              required
            >
              <option value="NVH">Nam Sài Gòn</option>
              <option value="SHTP">Saigon Hi-Tech Park</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center mt-4">
          Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

