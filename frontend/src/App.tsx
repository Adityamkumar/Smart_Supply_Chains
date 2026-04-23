import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});


const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const MyAssignmentsPage = lazy(() => import('./pages/MyAssignmentsPage'));
const AdminAssignmentPage = lazy(() => import('./pages/AdminAssignmentPage'));
const HelpRequestPage = lazy(() => import('./pages/HelpRequestPage'));
const AdminHelpRequestsPage = lazy(() => import('./pages/AdminHelpRequestsPage'));
const TrackRequestPage = lazy(() => import('./pages/TrackRequestPage'));
const MainLayout = lazy(() => import('./components/MainLayout'));

const ProtectedRoute = ({ children, adminOnly = false, volunteerOnly = false }: { children: React.ReactNode; adminOnly?: boolean; volunteerOnly?: boolean }) => {
  const user = useAuthStore((state) => state.user);
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

  const [isInitializing, setIsInitializing] = React.useState(true);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      const persistedUser = useAuthStore.getState().user;
      if (!persistedUser) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await api.get('/user/refresh');
        const tokenData = response.data.data;
        if (tokenData && tokenData.accessToken) {
          useAuthStore.getState().setToken(tokenData.accessToken);
        }
      } catch (error) {
        console.log("Guest mode active.");
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-zinc-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-white/5 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 animate-pulse">Syncing Tactical Status...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark:bg-[#121212] dark:text-zinc-100 dark:border dark:border-white/10 font-sans text-sm',
          duration: 3000,
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
            <Route path="/track" element={<TrackRequestPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
