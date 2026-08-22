import { Order } from '@/types/order';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

import ordersJson from '@/mocks/seed/storefront/orders.json';

export const MOCK_ORDERS: Order[] = ordersJson as Order[];
