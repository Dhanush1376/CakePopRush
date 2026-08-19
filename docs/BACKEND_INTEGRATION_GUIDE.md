# Backend Integration Guide

This guide outlines the process for connecting the frozen CakePopRush frontend to a live backend.

## 1. The `VITE_MOCK_MODE` Flag

The application relies on an environment variable defined in `.env`:

```env
VITE_MOCK_MODE=true
```

Currently, the frontend completely ignores this flag because it only has mock providers. When you begin integration, you will use this flag to toggle between mock data and real API calls.

## 2. Implementing API Data Providers

To connect a feature (e.g., Products) to the backend:

1. Look at the interface in `src/features/products/api/productDataProvider.ts`.
2. Create a new implementation file: `src/features/products/api/apiProductDataProvider.ts`.
3. In this file, implement the interface methods using the fetch client provided in `src/lib/api/client.ts`.

Example `apiProductDataProvider.ts`:
```typescript
import { ProductDataProvider } from './productDataProvider';
import { request } from '@/lib/api/client';

export const apiProductDataProvider: ProductDataProvider = {
  getProducts: async () => {
    return await request<Product[]>('/api/products');
  },
  // ... implement other methods
};
```

## 3. Swapping Providers in the Barrel

Once your API provider is ready, update the feature's `index.ts` file to use the `VITE_MOCK_MODE` flag:

**Before:**
```typescript
import { mockProductDataProvider } from './api/mockProductDataProvider';
export const productData = mockProductDataProvider;
```

**After:**
```typescript
import { mockProductDataProvider } from './api/mockProductDataProvider';
import { apiProductDataProvider } from './api/apiProductDataProvider';

const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';
export const productData = isMockMode ? mockProductDataProvider : apiProductDataProvider;
```

This pattern ensures that:
- The UI components (`ProductGallery`, `ProductCard`, etc.) don't need to change.
- You can develop the backend feature-by-feature while keeping the rest of the app functioning in mock mode.

## 4. React Query Integration

React Query is already installed and configured in `src/app/providers.tsx`. 

Query keys are pre-defined in `queryKeys.ts` files inside each feature's `api/` directory (e.g., `src/features/products/api/queryKeys.ts`).

When you transition components to use the real API, you will wrap the `productData` method calls in `useQuery` hooks.

Example:
```typescript
import { useQuery } from '@tanstack/react-query';
import { productData } from '@/features/products';
import { productKeys } from '@/features/products/api/queryKeys';

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => productData.getProducts(),
  });
}
```

## 5. Architectural Rule

**Backend implementations must conform to the frontend domain contracts rather than forcing presentation-layer rewrites.**

If the backend database schema differs from the frontend `Product` interface, you must map/transform the response data inside `apiProductDataProvider.ts` before returning it to the components. The frontend components should not be rewritten to accommodate the backend JSON structure.
