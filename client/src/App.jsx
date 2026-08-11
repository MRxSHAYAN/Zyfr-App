import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PusherProvider } from './context/PusherContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import { Zap } from 'lucide-react';

/* ── Shared full-screen loader ─────────────────────────── */
const AppLoader = () => (
  <div className="h-screen w-screen bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center gap-4 transition-colors duration-200">
    <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-glow animate-pulse-soft">
      <Zap className="w-7 h-7 fill-current" />
    </div>
    <div className="flex items-center gap-2 text-surface-400 dark:text-surface-500 text-sm">
      <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      Verifying session…
    </div>
  </div>
);

/* ── Route guards ──────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuth();
  if (isCheckingAuth) return <AppLoader />;
  if (!authUser) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuth();
  if (isCheckingAuth) return <AppLoader />;
  if (authUser) return <Navigate to="/" replace />;
  return children;
};

/* ── Routes ────────────────────────────────────────────── */
const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/* ── Root ──────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PusherProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
            </Router>
          </PusherProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
