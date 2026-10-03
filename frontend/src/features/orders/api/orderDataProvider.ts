import { Order } from '@/types/order';
import { OrderDetail } from '../types';

export interface OrderDataProvider {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<OrderDetail | undefined>;
}
