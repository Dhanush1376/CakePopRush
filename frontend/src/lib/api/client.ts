import { ApiError, NetworkError } from './errors';
import {
  hasSessionMarker,
  setSessionMarker,
  clearAuthStorage,
  getFallbackRefreshToken,
  setFallbackRefreshToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '@/utils/auth/authStorage';
import { clearCachedProfile } from '@/utils/auth/authSessionCache';

const rawBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
const BASE_HOST = rawBase.replace(/\/api\/v1\/?$/i, '');

export function buildApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Deduplicate any repeated /api/v1 prefixes (e.g. /api/v1/api/v1/...)
  const deduplicated = cleanEndpoint.replace(/^(\/api\/v1)+/i, '/api/v1');
  
  // If endpoint doesn't start with /api/v1, prefix it with /api/v1
  const finalEndpoint = deduplicated.startsWith('/api/v1') ? deduplicated : `/api/v1${deduplicated}`;
  return `${BASE_HOST}${finalEndpoint}`;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  textResponse?: boolean;
  _skipAuthRetry?: boolean;
}

let accessToken: string | null = getStoredAccessToken();
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  setStoredAccessToken(token);
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = getStoredAccessToken();
  }
  return accessToken;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (!hasSessionMarker() && !getStoredAccessToken() && !getFallbackRefreshToken()) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshAbort = new AbortController();
      const refreshTimeoutId = setTimeout(() => refreshAbort.abort(), 8000);
      try {
        const fallback = getFallbackRefreshToken();
        const body = fallback ? JSON.stringify({ refreshToken: fallback }) : undefined;
        const res = await fetch(buildApiUrl('/api/v1/auth/refresh'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: refreshAbort.signal,
          body,
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setAccessToken(null);
            clearAuthStorage();
            clearCachedProfile();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cpr:session-invalidated'));
            }
          }
          throw new Error(`Refresh failed with status ${res.status}`);
        }

        const data = await res.json();
        const payload = data.data || data;
        const newToken = payload.accessToken || payload.token;

        if (newToken) {
          setAccessToken(newToken);
          setSessionMarker();
          if (payload.refreshToken) {
            setFallbackRefreshToken(payload.refreshToken);
          }
          return newToken;
        }
        return null;
      } finally {
        clearTimeout(refreshTimeoutId);
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

export async function request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = buildApiUrl(endpoint);
  const timeoutMs = options?.timeoutMs || 20000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOptions: RequestInit = {
    credentials: 'include',
    signal: controller.signal,
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new NetworkError(`Request timed out after ${timeoutMs}ms`);
    }
    throw new NetworkError(`Network request failed: ${error.message}`);
  }

  clearTimeout(id);

  // 401 Unauthorized handling (token expired)
  if (response.status === 401 && !options?._skipAuthRetry && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/logout')) {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with refreshed token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        return request<T>(endpoint, {
          ...options,
          headers: retryHeaders,
          _skipAuthRetry: true,
        });
      }
    } catch {
      // Refresh failed, proceed to error throw below
    }
  }

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    throw new ApiError(
      response.status,
      errorData?.code || 'UNKNOWN_ERROR',
      errorData?.message || 'An error occurred during the API request',
      errorData?.details
    );
  }

  if (options?.textResponse) {
    return (await response.text()) as unknown as T;
  }

  try {
    const data = await response.json();
    return data as T;
  } catch {
    throw new ApiError(200, 'MALFORMED_RESPONSE', 'Received an invalid JSON response from the server');
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
