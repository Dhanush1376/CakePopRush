import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface ProvidersProps {
  children: ReactNode
}

import { ToastProvider } from '@/components/ui/ToastContext'
import { WishlistProvider } from '@/features/wishlist'
import { CartProvider } from '@/features/cart'
import { productData } from '@/features/products'
import type { CartItem } from '@/features/cart'

const products = productData.getProducts();

const MOCK_INITIAL_CART: CartItem[] = [
  {
    id: `cart-item-${Math.random().toString(36).substring(2, 9)}`,
    product: products[0], // Chocolate Chip Cookies
    quantity: 1,
  }
];

const MOCK_INITIAL_WISHLIST = [
  products[0],
  products[2],
  products[4]
];

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CartProvider initialItems={MOCK_INITIAL_CART}>
          <WishlistProvider initialItems={MOCK_INITIAL_WISHLIST}>
            {children}
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
