import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SuspenseFallback } from '@/components/ui/SuspenseFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthInitialized, loading, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthInitialized && !loading && !isAuthenticated) {
      openAuthModal();
    }
  }, [isAuthInitialized, loading, isAuthenticated, openAuthModal]);

  if (!isAuthInitialized || loading) {
    return <SuspenseFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
