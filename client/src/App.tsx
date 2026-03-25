import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';



import DashboardLayout from './components/layout/DashboardLayout';
import ProfilePage from './pages/user/ProfilePage';
import UserListPage from './pages/admin/UserListPage';
import RoleMatrixPage from './pages/admin/RoleMatrixPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ActiveSessionsPage from './pages/admin/ActiveSessionsPage';



const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRoles = Array.isArray(user?.roles) ? user.roles.map(r => typeof r === 'object' ? r.name : r) : [];
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('admin') || user?.role === 'admin';

  if (adminOnly && !isAdmin) return <Navigate to="/profile" replace />;


  return <>{children}</>;
};

const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRoles = Array.isArray(user?.roles) ? user.roles.map(r => typeof r === 'object' ? r.name : r) : [];
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('admin') || user?.role === 'admin' || user?.role === 'Admin';

  if (isAdmin) {
    return <Navigate to="/admin/analytics" replace />;
  }
  return <Navigate to="/profile" replace />;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />


          {/* Protected Dashboard Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<HomeRedirect />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route path="admin/sessions" element={
              <ProtectedRoute adminOnly>
                <ActiveSessionsPage />
              </ProtectedRoute>
            } />

            {/* Admin Only Routes */}
            <Route path="admin/users" element={
              <ProtectedRoute adminOnly>
                <UserListPage />
              </ProtectedRoute>
            } />
            <Route path="admin/rbac" element={
              <ProtectedRoute adminOnly>
                <RoleMatrixPage />
              </ProtectedRoute>
            } />
            <Route path="admin/audit" element={
              <ProtectedRoute adminOnly>
                <AuditLogPage />
              </ProtectedRoute>
            } />
            <Route path="admin/analytics" element={
              <ProtectedRoute adminOnly>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;