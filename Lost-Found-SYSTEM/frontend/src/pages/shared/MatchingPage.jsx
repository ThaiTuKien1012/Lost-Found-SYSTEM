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

  // Normalize role to lowercase for comparison
  const userRole = user.role?.toLowerCase();

  // Route based on role
  if (userRole === 'student') {
    return <StudentMatchingView />;
  }

  if (userRole === 'staff') {
    return <Navigate to="/matching/management" replace />;
  }

  if (userRole === 'security') {
    return <Navigate to="/security/ready-to-return" replace />;
  }

  return <Navigate to="/" replace />;
};

export default MatchingPage;

