// frontend/src/layouts/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <Outlet />
    </div>
  );
};

export default AuthLayout;