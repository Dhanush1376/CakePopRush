import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { UserProfile, authService } from '@/services/api/authService';
import {
  setAccessToken,
  getAccessToken,
  refreshAccessToken,
} from '@/lib/api/client';
import {
  hasSessionMarker,
  setSessionMarker,
  clearAuthStorage,
  setFallbackRefreshToken,
  getStoredAccessToken,
} from '@/utils/auth/authStorage';
import {
  loadCachedProfile,
  saveCachedProfile,
  clearCachedProfile,
} from '@/utils/auth/authSessionCache';
import { useToast } from '@/components/ui/ToastContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { showToast } = useToast();

  const getInitialState = () => {
    try {
      const cp = loadCachedProfile();
      const hs = hasSessionMarker();
      const token = getStoredAccessToken();
      const active = hs || !!token || !!cp;
      return { cachedProfile: cp, hasStoredSession: active };
    } catch {
      return { cachedProfile: null, hasStoredSession: false };
    }
  };

  const [initialState] = useState(getInitialState);
  const { cachedProfile, hasStoredSession } = initialState;

  const [user, setUser] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!cachedProfile || hasStoredSession);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [intendedAction, setIntendedAction] = useState<(() => void) | null>(null);

  const initStarted = useRef(false);

  const logout = useCallback(async () => {
    try {
      await authService.logout().catch(() => {});
    } catch {
      // Ignore network failures on logout
    }

    setAccessToken(null);
    clearAuthStorage();
    clearCachedProfile();
    setUser(null);
    setIsAuthenticated(false);
    setIntendedAction(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      if (!getAccessToken()) {
        await refreshAccessToken();
      }

      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        saveCachedProfile(response.data);
        setSessionMarker();
        return true;
      }
      return false;
    } catch (err: any) {
      const isAuthErr =
        err?.status === 401 ||
        err?.status === 403 ||
        err?.code === 'UNAUTHORIZED' ||
        err?.message?.includes('401') ||
        err?.message?.includes('Unauthorized') ||
        err?.message?.includes('session invalid') ||
        err?.message?.includes('account locked') ||
        err?.message?.includes('Not authenticated') ||
        err?.message?.includes('Refresh failed');

      if (isAuthErr) {
        setAccessToken(null);
        clearAuthStorage();
        clearCachedProfile();
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      // Offline / network fallback: keep cached profile if available for offline viewing
      return !!(cachedProfile || user || hasSessionMarker() || getStoredAccessToken());
    }
  }, [cachedProfile, user]);

  useEffect(() => {
    const handleInvalidated = () => {
      setUser(null);
      setIsAuthenticated(false);
      clearAuthStorage();
      clearCachedProfile();
    };

    window.addEventListener('cpr:session-invalidated', handleInvalidated);
    return () => {
      window.removeEventListener('cpr:session-invalidated', handleInvalidated);
    };
  }, []);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    if (!hasStoredSession && !cachedProfile) {
      setLoading(false);
      setIsAuthInitialized(true);
      return;
    }

    if (cachedProfile) {
      setUser(cachedProfile);
      setIsAuthenticated(true);
    }

    (async () => {
      try {
        await restoreSession();
      } catch {
        // Handled: keep persistent user session intact
      } finally {
        setLoading(false);
        setIsAuthInitialized(true);
      }
    })();
  }, [restoreSession, cachedProfile, hasStoredSession]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setIntendedAction(null);
  }, []);

  const runProtectedAction = useCallback(
    (actionCallback: () => void): boolean => {
      if (isAuthenticated) {
        actionCallback();
        return true;
      }
      setIntendedAction(() => actionCallback);
      setIsAuthModalOpen(true);
      showToast('Please sign in to continue', 'info');
      return false;
    },
    [isAuthenticated, showToast]
  );

  const loginSuccess = useCallback(
    async (
      userData: UserProfile,
      token: string,
      refreshToken?: string,
      options?: { keepModalOpen?: boolean }
    ) => {
      if (!token) return;

      setAccessToken(token);
      setSessionMarker();
      if (refreshToken) {
        setFallbackRefreshToken(refreshToken);
      }

      setUser(userData);
      setIsAuthenticated(true);
      saveCachedProfile(userData);
      setLoading(false);

      if (!options?.keepModalOpen) {
        setIsAuthModalOpen(false);
      }

      if (intendedAction) {
        try {
          intendedAction();
        } catch {
          // Ignore
        }
        setIntendedAction(null);
      }
    },
    [intendedAction]
  );

  const updateUser = useCallback(
    (userData: Partial<UserProfile> | ((prev: UserProfile | null) => UserProfile | null)) => {
      setUser((prev) => {
        const next = typeof userData === 'function' ? userData(prev) : prev ? { ...prev, ...userData } : null;
        if (next) saveCachedProfile(next);
        return next;
      });
    },
    []
  );

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      isAuthInitialized,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      loginSuccess,
      logout,
      restoreSession,
      updateUser,
      runProtectedAction,
    }),
    [
      user,
      isAuthenticated,
      loading,
      isAuthInitialized,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      loginSuccess,
      logout,
      restoreSession,
      updateUser,
      runProtectedAction,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
