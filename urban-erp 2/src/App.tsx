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
import AccountantDashboard from './pages/dashboard/AccountantDashboard';
import ContactsPage from './pages/dashboard/ContactsPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import AccountsPage from './pages/dashboard/AccountsPage';
import JournalsPage from './pages/dashboard/JournalsPage';
import { SalesPage } from './pages/dashboard/SalesPage';
import { PurchasesPage } from './pages/dashboard/PurchasesPage';
import { InvoicesPage } from './pages/dashboard/InvoicesPage';
import { BillsPage } from './pages/dashboard/BillsPage';
import { PaymentsPage } from './pages/dashboard/PaymentsPage';
import { BudgetsPage } from './pages/dashboard/BudgetsPage';
import { AnalyticAccountsPage } from './pages/dashboard/AnalyticAccountsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { BalanceSheetPage } from './pages/dashboard/BalanceSheetPage';
import { ProfitLossPage } from './pages/dashboard/ProfitLossPage';
import { BudgetReportPage } from './pages/dashboard/BudgetReportPage';
import ContactDashboard from './pages/dashboard/ContactDashboard';
import ModulePlaceholder from './pages/dashboard/ModulePlaceholder';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  Users, 
  Package, 
  FileText, 
  BookOpen, 
  ShoppingCart, 
  CreditCard, 
  FileSpreadsheet, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  BarChart 
} from 'lucide-react';

function RoleDashboardRouter() {
  const { profile } = useAuth();
  if (profile?.role === 'ACCOUNTANT') {
    return <AccountantDashboard />;
  }
  return <AdminDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & Website Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="auth-states" element={<AuthStatesPage />} />
            <Route path="workspace" element={<WorkspaceSelectionPage />} />
          </Route>
          
          {/* Main ERP Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <RoleDashboardRouter />
            </ProtectedRoute>
          } />

          {/* Master Data Routes */}
          <Route path="/contacts" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <ContactsPage />
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <ProductsPage />
            </ProtectedRoute>
          } />

          <Route path="/accounts" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <AccountsPage />
            </ProtectedRoute>
          } />

          <Route path="/journals" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <JournalsPage />
            </ProtectedRoute>
          } />

          {/* Transactions Routes */}
          <Route path="/sales" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <SalesPage />
            </ProtectedRoute>
          } />

          <Route path="/purchases" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <PurchasesPage />
            </ProtectedRoute>
          } />

          <Route path="/invoices" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'CONTACT']}>
              <InvoicesPage />
            </ProtectedRoute>
          } />

          <Route path="/bills" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'CONTACT']}>
              <BillsPage />
            </ProtectedRoute>
          } />

          <Route path="/payments" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT', 'CONTACT']}>
              <PaymentsPage />
            </ProtectedRoute>
          } />

          {/* Budget & Analytic Accounts */}
          <Route path="/budget" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <BudgetsPage />
            </ProtectedRoute>
          } />

          <Route path="/budget/analytic-accounts" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <AnalyticAccountsPage />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/reports/balance-sheet" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <BalanceSheetPage />
            </ProtectedRoute>
          } />

          <Route path="/reports/profit-loss" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <ProfitLossPage />
            </ProtectedRoute>
          } />

          <Route path="/reports/budget" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <BudgetReportPage />
            </ProtectedRoute>
          } />

          {/* Contact Role Routes */}
          <Route path="/contact/dashboard" element={
            <ProtectedRoute allowedRoles={['CONTACT']}>
              <ContactDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/contact/invoices" element={
            <ProtectedRoute allowedRoles={['CONTACT']}>
              <InvoicesPage />
            </ProtectedRoute>
          } />

          <Route path="/contact/bills" element={
            <ProtectedRoute allowedRoles={['CONTACT']}>
              <BillsPage />
            </ProtectedRoute>
          } />

          <Route path="/contact/payments" element={
            <ProtectedRoute allowedRoles={['CONTACT']}>
              <PaymentsPage />
            </ProtectedRoute>
          } />

          {/* Route Aliases for legacy /dashboard/* URLs */}
          <Route path="/dashboard/contacts" element={<Navigate to="/contacts" replace />} />
          <Route path="/dashboard/products" element={<Navigate to="/products" replace />} />
          <Route path="/dashboard/accounts" element={<Navigate to="/accounts" replace />} />
          <Route path="/dashboard/journals" element={<Navigate to="/journals" replace />} />
          <Route path="/dashboard/sales" element={<Navigate to="/sales" replace />} />
          <Route path="/dashboard/purchases" element={<Navigate to="/purchases" replace />} />
          <Route path="/dashboard/invoices" element={<Navigate to="/invoices" replace />} />
          <Route path="/dashboard/bills" element={<Navigate to="/bills" replace />} />
          <Route path="/dashboard/payments" element={<Navigate to="/payments" replace />} />
          <Route path="/dashboard/budget" element={<Navigate to="/budget" replace />} />
          <Route path="/dashboard/reports" element={<Navigate to="/reports" replace />} />
          <Route path="/dashboard/balance-sheet" element={<Navigate to="/reports" replace />} />
          <Route path="/dashboard/profit-loss" element={<Navigate to="/reports" replace />} />
          <Route path="/dashboard/budget-report" element={<Navigate to="/reports" replace />} />
          <Route path="/dashboard/journal-entries" element={<Navigate to="/journals" replace />} />
          <Route path="/dashboard/ledger" element={<Navigate to="/accounts" replace />} />

          {/* Catch-all 404 Route - NEVER redirect unknown routes to "/" */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
