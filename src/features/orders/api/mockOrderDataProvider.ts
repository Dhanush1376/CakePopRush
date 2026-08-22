import { OrderDataProvider } from './orderDataProvider';
import { MOCK_ORDERS } from '../data/mockOrders';
import { MOCK_ORDER_DETAILS } from '../data/mockOrderDetails';

import { simulateAsync } from '@/lib/simulateAsync';

export const mockOrderDataProvider: OrderDataProvider = {
  getOrders: () => simulateAsync(MOCK_ORDERS),
  getOrderById: (id: string) => simulateAsync(MOCK_ORDER_DETAILS[id]),
};
