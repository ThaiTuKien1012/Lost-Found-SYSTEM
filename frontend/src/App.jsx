import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LostItemsPage from './pages/LostItemsPage';
import LostItemDetailPage from './pages/LostItemDetailPage';
import FoundItemsPage from './pages/FoundItemsPage';
import SearchFoundItemsPage from './pages/SearchFoundItemsPage';
import MatchingPage from './pages/MatchingPage';
import MyTransactionsPage from './pages/MyTransactionsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

import './styles/index.css';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app">
      {!isAuthPage ? (
        <div className="app-container">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/lost-items"
                element={
                  <ProtectedRoute>
                    <LostItemsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/lost-items/:id"
                element={
                  <ProtectedRoute>
                    <LostItemDetailPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/found-items"
                element={
                  <ProtectedRoute>
                    <FoundItemsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/found-items/search"
                element={
                  <ProtectedRoute>
                    <SearchFoundItemsPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/matching"
                element={
                  <ProtectedRoute>
                    <MatchingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/returns/my-transactions"
                element={
                  <ProtectedRoute>
                    <MyTransactionsPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      )}
      {!isAuthPage && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

