import { ApiError, NetworkError } from './errors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  // If true, we won't throw an error if the response isn't JSON.
  textResponse?: boolean;
}

export async function request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const timeoutMs = options?.timeoutMs || 30000; // Default 30s timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions: RequestInit = {
    headers: { 
      'Content-Type': 'application/json',
      ...options?.headers 
    },
    signal: controller.signal,
    ...options,
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new NetworkError(`Request timed out after ${timeoutMs}ms`);
    }
    // E.g. CORS failure, DNS failure, server unreachable
    throw new NetworkError(`Network request failed: ${error.message}`);
  }
  
  clearTimeout(id);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    
    throw new ApiError(
      response.status,
      errorData?.error?.code || errorData?.code || 'UNKNOWN_ERROR',
      errorData?.error?.message || errorData?.message || 'An error occurred during the API request',
      errorData?.details
    );
  }
  
  if (options?.textResponse) {
    return response.text() as unknown as T;
  }

  // Protect against malformed JSON responses
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new ApiError(
      200, 
      'MALFORMED_RESPONSE', 
      'Received an invalid JSON response from the server'
    );
  }
}

// Convenience methods
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { method: 'GET', ...options }),
    
  post: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
    
  patch: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
