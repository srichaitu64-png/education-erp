import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './modules/auth/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { InstitutionDashboard } from './modules/dashboard/InstitutionDashboard';
import { SuperAdminDashboard } from './modules/dashboard/SuperAdminDashboard';
import { EntitlementsManager } from './modules/entitlements/EntitlementsManager';
import { useAuthStore } from './store/authStore';

// Public Marketing & Demo Pages
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { ModulesPage } from './pages/public/ModulesPage';
import { PricingPage } from './pages/public/PricingPage';
import { SubscriptionComparisonPage } from './pages/public/SubscriptionComparisonPage';
import { TestimonialsPage } from './pages/public/TestimonialsPage';
import { FaqPage } from './pages/public/FaqPage';
import { BookDemoPage } from './pages/public/BookDemoPage';
import { RegisterInstitutionPage } from './pages/public/RegisterInstitutionPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { InteractiveDemoPage } from './pages/demo/InteractiveDemoPage';

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
          {/* Public Marketing Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/pricing/compare" element={<SubscriptionComparisonPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/book-demo" element={<BookDemoPage />} />
          <Route path="/register" element={<RegisterInstitutionPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Interactive In-Browser Demo Sandbox */}
          <Route path="/demo" element={<InteractiveDemoPage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Institution ERP Dashboard */}
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

          {/* Super Admin Control Center */}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
