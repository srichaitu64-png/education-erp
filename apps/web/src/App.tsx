import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './modules/auth/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { InstitutionDashboard } from './modules/dashboard/InstitutionDashboard';
import { SuperAdminDashboard } from './modules/dashboard/SuperAdminDashboard';
import { EntitlementsManager } from './modules/entitlements/EntitlementsManager';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireSuperAdmin?: boolean }> = ({
  children,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !user?.is_superadmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Institution Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/entitlements"
            element={
              <ProtectedRoute requireSuperAdmin>
                <EntitlementsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/*"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
