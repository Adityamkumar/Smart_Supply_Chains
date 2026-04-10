import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const MyAssignmentsPage = lazy(() => import('./pages/MyAssignmentsPage'));
const AdminAssignmentPage = lazy(() => import('./pages/AdminAssignmentPage'));
const HelpRequestPage = lazy(() => import('./pages/HelpRequestPage'));
const AdminHelpRequestsPage = lazy(() => import('./pages/AdminHelpRequestsPage'));
const MainLayout = lazy(() => import('./components/MainLayout'));

const App: React.FC = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const ProtectedRoute = ({ children, adminOnly = false, volunteerOnly = false }: { children: React.ReactNode; adminOnly?: boolean; volunteerOnly?: boolean }) => {
    if (!user) return <Navigate to="/login" replace />;
    
    if (adminOnly && user.role !== 'admin') {
      toast.error("You don't have permission to access the administration zone");
      return <Navigate to="/dashboard" replace />;
    }
    
    if (volunteerOnly && user.role === 'admin') {
      toast.error("This section is only for volunteers");
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
          },
        }} 
      />
      <BrowserRouter>
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
            
            <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="my-assignments" element={<ProtectedRoute volunteerOnly><MyAssignmentsPage /></ProtectedRoute>} />
              <Route path="admin-assignment" element={<ProtectedRoute adminOnly><AdminAssignmentPage /></ProtectedRoute>} />
              <Route path="admin-help-requests" element={<ProtectedRoute adminOnly><AdminHelpRequestsPage /></ProtectedRoute>} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/request-help" element={<HelpRequestPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
