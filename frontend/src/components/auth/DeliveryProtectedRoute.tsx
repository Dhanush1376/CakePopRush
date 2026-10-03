import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SuspenseFallback } from '@/components/ui/SuspenseFallback';
import { useToast } from '@/components/ui/ToastContext';

interface DeliveryProtectedRouteProps {
  children: React.ReactNode;
}

const ALLOWED_DELIVERY_ROLES = [
  'delivery_agent',
  'DELIVERY_AGENT',
  'delivery',
  'DELIVERY',
];

const ADMIN_ROLES = [
  'owner',
  'super_admin',
  'main_admin',
  'admin',
  'editor',
  'viewer',
];

export const DeliveryProtectedRoute: React.FC<DeliveryProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isAuthInitialized, loading, openAuthModal } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  const userRole = user?.role?.toLowerCase() || '';
  const isDeliveryRole = ALLOWED_DELIVERY_ROLES.map((r) => r.toLowerCase()).includes(userRole);
  const isAdminRole = ADMIN_ROLES.includes(userRole);

  useEffect(() => {
    if (isAuthInitialized && !loading) {
      if (!isAuthenticated) {
        openAuthModal();
      } else if (!isDeliveryRole) {
        showToast('Delivery Portal access restricted to registered delivery agents. Access denied.', 'error');
      }
    }
  }, [isAuthInitialized, loading, isAuthenticated, isDeliveryRole, openAuthModal, showToast]);

  if (!isAuthInitialized || loading) {
    return <SuspenseFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isDeliveryRole) {
    // If the user is an admin, redirect them back to the Admin dashboard, otherwise to Storefront home
    if (isAdminRole) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DeliveryProtectedRoute;
