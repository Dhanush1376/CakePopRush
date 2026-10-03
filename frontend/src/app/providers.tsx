import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface ProvidersProps {
  children: ReactNode
}

import { ToastProvider } from '@/components/ui/ToastContext'
import { AuthProvider } from '@/context/AuthProvider'
import { WishlistProvider } from '@/features/wishlist'
import { CartProvider } from '@/features/cart'
import { productData } from '@/features/products'
import type { CartItem } from '@/features/cart'

import { mockProducts } from '@/mocks/products'

const INITIAL_EMPTY_CART: CartItem[] = [];
const MOCK_INITIAL_WISHLIST: any[] = [];

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
        <AuthProvider>
          <WishlistProvider initialItems={MOCK_INITIAL_WISHLIST}>
            <CartProvider initialItems={INITIAL_EMPTY_CART}>
              {children}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
