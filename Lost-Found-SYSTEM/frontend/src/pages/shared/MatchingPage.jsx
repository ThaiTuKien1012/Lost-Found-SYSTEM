import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StudentMatchingView from '../../components/matching/StudentMatchingView';
import MatchingManagementPage from '../staff/MatchingManagementPage';

const MatchingPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on role
  if (user.role === 'student') {
    return <StudentMatchingView />;
  }

  if (user.role === 'staff') {
    return <Navigate to="/matching/management" replace />;
  }

  if (user.role === 'security') {
    return <Navigate to="/security/ready-to-return" replace />;
  }

  return <Navigate to="/" replace />;
};

export default MatchingPage;

