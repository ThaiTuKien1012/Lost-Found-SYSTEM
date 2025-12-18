/**
 * Main Routes Configuration
 * Centralized route definitions
 */

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { MainLayout } from '../../layouts';
import { ROUTES } from '../config/routes';

// Pages - Auth
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';

// Pages - Shared
import HomePage from '../../pages/shared/HomePage';
import ProfilePage from '../../pages/shared/ProfilePage';
import NotFoundPage from '../../pages/shared/NotFoundPage';
import MatchingPage from '../../pages/shared/MatchingPage';

// Pages - Student
import LostItemsPage from '../../pages/student/LostItemsPage';
import LostItemDetailPage from '../../pages/student/LostItemDetailPage';
import FoundItemsPage from '../../pages/student/FoundItemsPage';
import FoundItemDetailPage from '../../pages/student/FoundItemDetailPage';
import MyTransactionsPage from '../../pages/student/MyTransactionsPage';

// Pages - Staff
import LostItemsManagementPage from '../../pages/staff/LostItemsManagementPage';
import ReturnsManagementPage from '../../pages/staff/ReturnsManagementPage';
import ReturnDetailPage from '../../pages/staff/ReturnDetailPage';
import ReportsPage from '../../pages/staff/ReportsPage';
import FoundItemsManagementPage from '../../pages/staff/FoundItemsManagementPage';
import MatchingManagementPage from '../../pages/staff/MatchingManagementPage';

// Pages - Security
import SecurityFoundItemsListPage from '../../pages/security/SecurityFoundItemsListPage';
import SecurityReadyToReturnPage from '../../pages/security/SecurityReadyToReturnPage';
import SecurityReturnHistoryPage from '../../pages/security/SecurityReturnHistoryPage';

const AppRoutes = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!isAuthPage ? (
        <Routes>
      {/* Protected Routes - Main Layout */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Lost Items Routes */}
      <Route
        path={ROUTES.LOST_ITEMS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <LostItemsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-items/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <LostItemDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LOST_ITEMS_MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <LostItemsManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Found Items Routes */}
      <Route
        path={ROUTES.FOUND_ITEMS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <FoundItemsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/found-items/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FoundItemDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.FOUND_ITEMS_MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <FoundItemsManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Matching Routes */}
      <Route
        path={ROUTES.MATCHING}
        element={
          <ProtectedRoute>
            <MainLayout>
              <MatchingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MATCHING_MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <MatchingManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Security Routes */}
      <Route
        path={ROUTES.SECURITY_FOUND_ITEMS}
        element={
          <ProtectedRoute requiredRole="security">
            <MainLayout>
              <SecurityFoundItemsListPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SECURITY_READY_TO_RETURN}
        element={
          <ProtectedRoute requiredRole="security">
            <MainLayout>
              <SecurityReadyToReturnPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SECURITY_RETURN_HISTORY}
        element={
          <ProtectedRoute requiredRole="security">
            <MainLayout>
              <SecurityReturnHistoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Returns Routes */}
      <Route
        path={ROUTES.RETURNS_MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReturnsManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RETURNS_MY_TRANSACTIONS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyTransactionsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns/:transactionId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReturnDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports Routes */}
      <Route
        path={ROUTES.REPORTS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile Route */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

          {/* 404 Route */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
      ) : (
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Routes>
      )}
    </>
  );
};

export default AppRoutes;

