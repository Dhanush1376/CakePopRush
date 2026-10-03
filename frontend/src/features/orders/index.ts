// API
export type { OrderDataProvider } from './api/orderDataProvider';
export { mockOrderDataProvider } from './api/mockOrderDataProvider';
export { apiOrderDataProvider } from './api/apiOrderDataProvider';

// Storefront Orders are live backed by MongoDB Orders API
import { apiOrderDataProvider } from './api/apiOrderDataProvider';
export const orderData = apiOrderDataProvider;

// Types
export * from './types';
