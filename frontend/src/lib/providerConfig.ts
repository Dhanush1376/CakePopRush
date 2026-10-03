export type DataSource = 'mock' | 'api';

/**
 * Centralized provider configuration.
 * Reads the environment to determine if the application should use
 * mock providers (JSON seed data) or API providers (HTTP backend).
 */
export const getProviderMode = (): DataSource => {
  // Prefer the explicit VITE_DATA_SOURCE if provided
  if (import.meta.env.VITE_DATA_SOURCE === 'api' || import.meta.env.VITE_DATA_SOURCE === 'mock') {
    return import.meta.env.VITE_DATA_SOURCE;
  }
  
  // Fallback to legacy VITE_MOCK_MODE
  if (import.meta.env.VITE_MOCK_MODE === 'false') {
    return 'api';
  }
  
  // Default to mock to preserve the frozen frontend contract
  return 'mock';
};
