// API
export type { OrderDataProvider } from './api/orderDataProvider';
import { mockOrderDataProvider } from './api/mockOrderDataProvider';
import { apiOrderDataProvider } from './api/apiOrderDataProvider';
import { getProviderMode } from '@/lib/providerConfig';

export const orderData = getProviderMode() === 'api' ? apiOrderDataProvider : mockOrderDataProvider;

// Types
export * from './types';
