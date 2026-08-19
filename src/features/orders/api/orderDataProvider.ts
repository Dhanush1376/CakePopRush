import { Order } from '@/types/order';
import { OrderDetail } from '../types';

export interface OrderDataProvider {
  getOrders(): Order[];
  getOrderById(id: string): OrderDetail | undefined;
}
