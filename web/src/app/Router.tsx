import React, { memo, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { MainLayout } from '@/shared/components/Layout/MainLayout';
import { ProtectedRoute } from '@/shared/components/common/ProtectedRoute';
import { ErrorBoundary } from '@/shared/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { webPerformanceMonitor } from '@/utils/performanceMonitor';

// Optimized lazy loading with preloading and error handling
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return React.lazy(async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      // Track component load time
      if (loadTime > 1000) {
        webPerformanceMonitor.trackAPICall(`component-${componentName}`, loadTime, true);
      }
      
      return module;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      
      // Return error fallback component
      return {
        default: () => (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Failed to load {componentName}</h2>
            <p>Please refresh the page to try again.</p>
            <button onClick={() => window.location.reload()}>Refresh</button>
          </div>
        )
      };
    }
  });
};

// Core application pages with optimized lazy loading
const LoginPage = createLazyComponent(
  () => import('@/features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })),
  'LoginPage'
);

const DashboardPage = createLazyComponent(
  () => import('@/features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })),
  'DashboardPage'
);

const InventoryPage = createLazyComponent(
  () => import('@/features/inventory/pages/InventoryPage').then(module => ({ default: module.InventoryPage })),
  'InventoryPage'
);

const CRMPage = createLazyComponent(
  () => import('@/features/crm/pages/CRMPage').then(module => ({ default: module.CRMPage })),
  'CRMPage'
);

const MessagingPage = createLazyComponent(
  () => import('@/features/messaging/pages/MessagingPage').then(module => ({ default: module.MessagingPage })),
  'MessagingPage'
);

// Secondary pages with lower priority loading
const AnalyticsPage = createLazyComponent(
  () => Promise.resolve({
    default: () => (
      <div>
        <h1>Analytics</h1>
        <p>Analytics dashboard coming soon...</p>
      </div>
    )
  }),
  'AnalyticsPage'
);

const SettingsPage = createLazyComponent(
  () => Promise.resolve({
    default: () => (
      <div>
        <h1>Settings</h1>
        <p>Settings page coming soon...</p>
      </div>
    )
  }),
  'SettingsPage'
);

// Static error pages (no lazy loading needed)
const NotFoundPage = memo(() => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <button onClick={() => window.history.back()}>Go Back</button>
  </div>
));

const UnauthorizedPage = memo(() => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>401 - Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
    <button onClick={() => window.location.href = '/login'}>Login</button>
  </div>
));

// Enhanced Suspense wrapper with performance monitoring
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = memo(({ children }) => (
  <React.Suspense 
    fallback={
      <LoadingSpinner 
        fullScreen 
        message="Loading..." 
        timeout={10000} // 10 second timeout
        onTimeout={() => {
          console.error('Component loading timeout');
          webPerformanceMonitor.reportIssue?.('component_load_timeout', {
            timestamp: Date.now(),
          });
        }}
      />
    }
  >
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </React.Suspense>
));

// Route preloading hook
const useRoutePreloading = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Preload likely next routes based on current location
    const preloadRoutes = async () => {
      const currentPath = location.pathname;
      
      // Define preload strategy based on user navigation patterns
      const preloadMap: Record<string, () => Promise<any>[]> = {
        '/dashboard': () => [
          // Users often navigate to inventory and CRM from dashboard
          import('@/features/inventory/pages/InventoryPage'),
          import('@/features/crm/pages/CRMPage'),
        ],
        '/inventory': () => [
          // From inventory, users often check CRM or go back to dashboard
          import('@/features/crm/pages/CRMPage'),
          import('@/features/dashboard/pages/DashboardPage'),
        ],
        '/crm': () => [
          // From CRM, users often check messaging or inventory
          import('@/features/messaging/pages/MessagingPage'),
          import('@/features/inventory/pages/InventoryPage'),
        ],
      };
      
      const preloadFns = preloadMap[currentPath];
      if (preloadFns) {
        try {
          await Promise.all(preloadFns());
        } catch (error) {
          console.warn('Route preloading failed:', error);
        }
      }
    };
    
    // Preload with a delay to avoid blocking current page
    const timeoutId = setTimeout(preloadRoutes, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

// Performance monitoring wrapper for route changes
const RouteTracker: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    // Track route navigation performance
    webPerformanceMonitor.markPerformance(`route-${location.pathname}-start`);
    
    const timeoutId = setTimeout(() => {
      webPerformanceMonitor.markPerformance(`route-${location.pathname}-end`);
      webPerformanceMonitor.measurePerformance(
        `route-navigation-${location.pathname}`,
        `route-${location.pathname}-start`,
        `route-${location.pathname}-end`
      );
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
  
  return <>{children}</>;
});

// Inner router component that uses hooks
const InnerRouter: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Enable route preloading
  useRoutePreloading();
  
  return (
    <RouteTracker>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <SuspenseWrapper>
              <LoginPage />
            </SuspenseWrapper>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SuspenseWrapper>
                  <Routes>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="crm" element={<CRMPage />} />
                    <Route path="messaging" element={<MessagingPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </SuspenseWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect based on auth status */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </RouteTracker>
  );
};

export const AppRouter: React.FC = memo(() => {
  return (
    <BrowserRouter>
      <InnerRouter />
    </BrowserRouter>
  );
});