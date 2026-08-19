# Server State & API Architecture Audit

This document outlines the current data architecture and maps the future transition to a server-state model for CakePopRush.

## 1. Current Data Sources & Classification

| Domain | Current Source | State Type | Current Owner | Future API Owner | React Query Candidate |
|---|---|---|---|---|---|
| **Products** | `mockProductDataProvider` | Server | `features/products` | Products API | Yes |
| **Reviews** | `mockReviewDataProvider` | Server | `features/reviews` | Reviews API | Yes |
| **Orders** (storefront) | `MOCK_ORDERS` (raw) | Server | `features/orders/data` | Orders API | Yes |
| **Cart** | `CartProvider` (Context) | Client | `features/cart` | Cart feature | No |
| **Wishlist** | `WishlistProvider` (Context) | Client | `features/wishlist` | Wishlist feature | No |
| **Search** | `productData.searchProducts()` | Derived | `features/search` | Products API | No (derived) |
| **Admin Analytics** | `mockAdminDataProvider` | Server | `features/admin/api` | Admin API | Yes |
| **Admin Dashboard**| `@/mocks/adminData` (raw) | Server | Unowned | Admin API | Yes |
| **Form state** | `useState` / hook | Client | Components | Component | No |
| **Invoice Data** | `mapOrderToInvoiceData()` | Derived | `src/lib/invoiceMapper`| Derived | No |

---

## 2. Existing Provider Inventory

- `ProductDataProvider`: Exists and correctly isolates mock vs API behavior. Interface is synchronous.
- `ReviewDataProvider`: Exists and follows the same pattern. Interface is synchronous.
- `mockAdminDataProvider`: Exists as a collection of exports, currently synchronous. Used by Admin listing pages.

## 3. Missing Providers (Architectural Gaps)

- **Orders**: No provider exists. `MOCK_ORDERS` and `MOCK_ORDER_DETAILS` are imported directly by `OrdersPage`, `OrderTrackingPage`, and `OrderSuccessPage`.
- **Admin Dashboard**: Dashboard components (`StatsGrid`, `RecentOrders`, etc.) bypass the `mockAdminDataProvider` and import raw data directly from `src/mocks/adminData.ts`.

## 4. API Client Inventory

- **Direct Fetch Usage:** ZERO occurrences of `fetch()`, `axios`, or `XMLHttpRequest` in the codebase.
- **Shared Client:** None exists yet.

## 5. React Query Configuration

- **Location**: `src/app/providers.tsx`
- **Config**: 
  - `QueryClientProvider` wraps the app correctly.
  - `staleTime: 60s`
  - `refetchOnWindowFocus: false`
- **Usage**: ZERO `useQuery` or `useMutation` calls. Configuration is ready, but hooks should not be implemented until real API integration begins.

## 6. Provider Strategy

1. **Keep Mock Flow Intact**: The mock-driven frontend will be preserved using the existing synchronous data provider interfaces.
2. **Abstract Orders**: Extract `MOCK_ORDERS` behind a new `OrderDataProvider` (synchronous) so that the order UI doesn't need refactoring when switching to a real API provider.
3. **Consolidate Admin Mock Usage**: Update admin dashboard components to consume data via `mockAdminDataProvider` rather than raw mock imports.
4. **Defer Async Flow**: Do NOT convert provider interfaces to return `Promise<T>` yet, as this forces artificial `useEffect` logic throughout the app before a real API exists.

## 7. API Boundary Strategy

The future backend API integration will use this shared foundation:
- `src/lib/api/client.ts`: The central HTTP abstraction.
- `src/lib/api/errors.ts`: Central error normalization.
- **React Query Hooks**: Will wrap feature-specific API providers, mapped to deterministic query keys defined in each feature.

## 8. Query-Key Strategy

Each feature that interacts with server-state will own its query keys, such as `features/products/api/queryKeys.ts`.

Example format:
- `['products', 'list']`
- `['products', 'detail', id]`
- `['reviews', 'product', id]`

## 9. Future Integration Requirements (Deferred Work)

The following must be deferred to future phases:
- **Real API Endpoints**: Do not guess at API contracts.
- **Async Providers**: Adding `Promise<T>` responses to `DataProvider` interfaces and handling loading states in the UI.
- **Authentication**: JWT, token rotation, and login flow.
- **React Query Usage**: Writing actual `useQuery` and `useMutation` hooks.
- **Persistence**: Remote cart or wishlist syncing.
- **Caching Strategy**: Fine-tuning staleTime or retry counts based on actual API performance.
