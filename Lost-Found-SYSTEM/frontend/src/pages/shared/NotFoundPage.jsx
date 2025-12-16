import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Trang không tìm thấy</p>
      <Link to="/" className="btn btn-primary">
        Về Trang Chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;

