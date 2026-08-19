// API
export type { OrderDataProvider } from './api/orderDataProvider';
import { mockOrderDataProvider } from './api/mockOrderDataProvider';
export const orderData = mockOrderDataProvider;

// Types
export * from './types';

// Data (Legacy exports for now, ideally components should use orderData instead)
export { MOCK_ORDERS } from './data/mockOrders';
export { MOCK_ORDER_DETAILS } from './data/mockOrderDetails';
