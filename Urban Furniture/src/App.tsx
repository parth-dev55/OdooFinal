/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AuthStatesPage from './pages/auth/AuthStatesPage';
import WorkspaceSelectionPage from './pages/auth/WorkspaceSelectionPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ContactDashboard from './pages/dashboard/ContactDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="auth-states" element={<AuthStatesPage />} />
            <Route path="workspace" element={<WorkspaceSelectionPage />} />
          </Route>
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/contact/dashboard" element={
            <ProtectedRoute allowedRoles={['CONTACT']}>
              <ContactDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
