export const SESSION_MARKER_KEY = 'cpr_session_active';
export const REFRESH_TOKEN_KEY = 'cpr_refresh_token_fallback';
export const ACCESS_TOKEN_KEY = 'cpr_access_token';

export const hasSessionMarker = (): boolean => {
  try {
    const val = localStorage.getItem(SESSION_MARKER_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

export const setSessionMarker = (): void => {
  try {
    localStorage.setItem(SESSION_MARKER_KEY, 'true');
  } catch {
    // Ignore storage quota/permission errors
  }
};

export const clearSessionMarker = (): void => {
  try {
    localStorage.removeItem(SESSION_MARKER_KEY);
  } catch {
    // Ignore
  }
};

export const setStoredAccessToken = (token?: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Ignore
  }
};

export const getStoredAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearStoredAccessToken = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Ignore
  }
};

export const setFallbackRefreshToken = (token?: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // Ignore
  }
};

export const getFallbackRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearFallbackRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore
  }
};

export const clearAuthStorage = (): void => {
  clearSessionMarker();
  clearFallbackRefreshToken();
  clearStoredAccessToken();
};
