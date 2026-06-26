import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditorPage from './pages/EditorPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import AdminPage from './pages/AdminPage';
import SharedReviewPage from './pages/SharedReviewPage';
import LandingPage from './pages/LandingPage';
import { useAuth } from './hooks/useAuth';
import './index.css';

// Helper component to conditionally render Navbar
function LayoutWrapper({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  
  // List of paths where we do NOT want the main app navbar
  const noNavbarPaths = ['/', '/login', '/register'];
  const showNavbar = !noNavbarPaths.includes(location.pathname) || user;

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <LayoutWrapper>
      <Routes>
        {/* Root Route: Show Landing Page for guests */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/editor" replace /> : <LandingPage />} 
        />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/editor" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <RegisterPage /> : <Navigate to="/editor" replace />} 
        />
        
        {/* Protected Routes */}
        <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/review/:id" element={<ProtectedRoute><ReviewDetailPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        
        {/* Public Shared Review */}
        <Route path="/shared/:shareToken" element={<SharedReviewPage />} />
      </Routes>
    </LayoutWrapper>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);