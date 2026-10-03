import { createContext, useContext } from 'react';
import { UserProfile } from '@/services/api/authService';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAuthInitialized: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginSuccess: (
    user: UserProfile,
    accessToken: string,
    refreshToken?: string,
    options?: { keepModalOpen?: boolean }
  ) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  updateUser: (userData: Partial<UserProfile> | ((prev: UserProfile | null) => UserProfile | null)) => void;
  runProtectedAction: (callback: () => void) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
