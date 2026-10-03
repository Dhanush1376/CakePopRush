import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SuspenseFallback } from '@/components/ui/SuspenseFallback';
import { useToast } from '@/components/ui/ToastContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const ADMIN_ALLOWED_ROLES = [
  'owner',
  'super_admin',
  'main_admin',
  'admin',
  'editor',
  'viewer',
];

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isAuthInitialized, loading, openAuthModal } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthInitialized && !loading) {
      if (!isAuthenticated) {
        openAuthModal();
      } else if (user?.role === 'delivery_agent' || user?.role === 'DELIVERY_AGENT') {
        showToast('Redirecting to Delivery Partner Portal', 'info');
      } else if (!ADMIN_ALLOWED_ROLES.includes(user?.role || '')) {
        showToast('Administrative access required. Access denied.', 'error');
      }
    }
  }, [isAuthInitialized, loading, isAuthenticated, user, openAuthModal, showToast]);

  if (!isAuthInitialized || loading) {
    return <SuspenseFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role === 'delivery_agent' || user?.role === 'DELIVERY_AGENT') {
    return <Navigate to="/delivery" replace />;
  }

  if (!ADMIN_ALLOWED_ROLES.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
