import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './modules/auth/LoginPage';
import { PlatformLoginPage } from './modules/auth/PlatformLoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { InstitutionDashboard } from './modules/dashboard/InstitutionDashboard';
import { SuperAdminDashboard } from './modules/dashboard/SuperAdminDashboard';
import { EntitlementsManager } from './modules/entitlements/EntitlementsManager';
import { useAuthStore } from './store/authStore';
import {
  ExperienceProvider,
  AmbientCanvasRenderer,
  NaturalSuccessCelebration,
  NaturalErrorExpression,
  ExperienceSettingsModal,
} from './components/experience';

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
import { PlatformAccessDeniedPage } from './pages/public/PlatformAccessDeniedPage';
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
    return <PlatformAccessDeniedPage />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ExperienceProvider>
        <AmbientCanvasRenderer />
        <NaturalSuccessCelebration />
        <NaturalErrorExpression />
        <ExperienceSettingsModal />
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

          {/* Authentication — Single Universal Login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform/login" element={<Navigate to="/login" replace />} />

          {/* Dedicated /platform/* Private SaaS Platform Owner Route Group */}
          <Route
            path="/platform"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform/entitlements"
            element={
              <ProtectedRoute requireSuperAdmin>
                <EntitlementsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform/*"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dedicated /app/* & /dashboard/* Authenticated Institution ERP Route Groups */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <InstitutionDashboard />
              </ProtectedRoute>
            }
          />
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
          <Route path="/superadmin" element={<Navigate to="/platform" replace />} />
          <Route path="/superadmin/*" element={<Navigate to="/platform" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ExperienceProvider>
    </QueryClientProvider>
  );
};

export default App;
