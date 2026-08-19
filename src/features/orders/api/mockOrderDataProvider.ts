import { OrderDataProvider } from './orderDataProvider';
import { MOCK_ORDERS } from '../data/mockOrders';
import { MOCK_ORDER_DETAILS } from '../data/mockOrderDetails';

export const mockOrderDataProvider: OrderDataProvider = {
  getOrders: () => MOCK_ORDERS,
  getOrderById: (id: string) => MOCK_ORDER_DETAILS[id],
};
