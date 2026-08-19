import { ApiError } from './errors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: { 
      'Content-Type': 'application/json',
      ...options?.headers 
    },
    ...options,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    
    throw new ApiError(
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.message || 'An error occurred during the API request',
      errorData.details
    );
  }
  
  return response.json();
}
