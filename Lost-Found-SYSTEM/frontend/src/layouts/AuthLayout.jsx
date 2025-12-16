/**
 * Auth Layout Component
 * Layout for authentication pages (login, register)
 */

import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      {children}
    </div>
  );
};

export default AuthLayout;

