import { Order } from '@/types/order';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'CPR-20482',
    date: 'Aug 8, 2026',
    status: 'delivered',
    estimatedDelivery: 'Aug 9, 2026',
    items: [
      { name: 'Strawberry Velvet Cake Pop', qty: 2, price: 149, image: '/images/Products/mini valentine cake.jpeg', category: 'Classic Cake Pops' },
      { name: 'Chocolate Truffle Delight', qty: 1, price: 189, image: '/images/Products/Dark choclate cakepops.jpeg', category: 'Premium Cake Pops' },
    ],
    total: 487,
  },
  {
    id: 'CPR-20391',
    date: 'Aug 6, 2026',
    status: 'shipped',
    estimatedDelivery: 'Aug 10, 2026',
    items: [
      { name: 'Rainbow Sprinkle Pop', qty: 3, price: 129, image: '/images/Products/White choclate cakepops.jpeg', category: 'Classic Cake Pops' },
    ],
    total: 387,
  },
  {
    id: 'CPR-20210',
    date: 'Aug 3, 2026',
    status: 'confirmed',
    estimatedDelivery: 'Aug 12, 2026',
    items: [
      { name: 'Caramel Drizzle Pop', qty: 2, price: 159, image: '/images/Products/Milk choclate cakepops.jpeg', category: 'Premium Cake Pops' },
      { name: 'Birthday Bliss Cake Pop', qty: 2, price: 179, image: '/images/Products/asorted flavours of cookies.jpeg', category: 'Specialty Cake Pops' },
    ],
    total: 676,
  },
  {
    id: 'CPR-20105',
    date: 'Jul 28, 2026',
    status: 'pending',
    items: [
      { name: 'Matcha Zen Pop', qty: 4, price: 139, image: '/images/Products/pista flavoured rainbow chips.jpeg', category: 'Premium Cake Pops' },
    ],
    total: 556,
  },
];
