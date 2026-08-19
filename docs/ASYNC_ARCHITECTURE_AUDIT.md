# Async & Loading Architecture Audit (Phase 10)

This document outlines the current state of async behavior, loading states, and data assumptions across CakePopRush. It serves as the baseline for the upcoming backend API integration.

## 1. Lazy Loading & Suspense

### Current State
- **React.lazy**: Not currently used for route-level splitting. All pages are imported synchronously in `src/app/router.tsx`.
- **Suspense**: No `<Suspense>` boundaries exist in the application.

### Future API Pattern
- **Do not introduce `Suspense` everywhere prematurely.** 
- When React Query is integrated, we will evaluate whether to use `useQuery` (which handles `isLoading` internally and maps perfectly to our existing manual skeletons) or `useSuspenseQuery` (which throws promises and requires `<Suspense>`).
- Given our extensive bespoke Skeleton components (e.g. `PDPSkeleton`, `OrderTrackingSkeleton`), **the standard `useQuery` with manual `isLoading` checks is the recommended path forward** to preserve current UI transitions without rewriting to use `<Suspense>`.

## 2. Loading States & Skeletons

### Current State
The application has a robust, manual skeleton architecture. Pages track an `isLoading` boolean and render a dedicated skeleton component before data arrives.

- `ShopPage` ➔ `ProductCardSkeleton`
- `ProductDetailPage` ➔ `PDPSkeleton`
- `OrderTrackingPage` ➔ `OrderTrackingSkeleton`
- `CheckoutDeliveryPage` ➔ `CheckoutDeliverySkeleton`
- `WishlistPage` ➔ `WishlistSkeleton`

### Future API Pattern
When the mock providers are replaced with React Query, replace `const [isLoading, setIsLoading] = useState(true)` with `const { isLoading } = useQuery(...)`. **The skeletons themselves will remain unchanged.**

## 3. Empty & Error States

### Current State
- **Empty States**: The application consistently uses `<EmptyState>` and `<MascotEmptyState>` when arrays are empty (e.g., empty cart, zero orders).
- **Error States**: Handled at the boundary level via `StorefrontErrorBoundary` and `AdminErrorBoundary`, which render `<ServerErrorPage>` or inline error cards.

## 4. Invalid-Data Assumptions (DANGER)

When moving from trustworthy mock data to an unpredictable real API, the frontend is currently vulnerable to crashes due to unsafe property access.

**Critical Areas to Harden Before API:**
1. **Images Array**: `product.images[0]` is frequently assumed to exist. If a product has `images: []` or `images: undefined`, the page will crash.
2. **Order Details**: `order.items.length` or `order.customer.name`.
3. **Review Data**: `review.user.avatar` or `review.rating`.
4. **Calculations**: `discount.value` or `coupon.discountValue` being `null`.

**Future Pattern:**
- Use optional chaining extensively: `product.images?.[0]?.url || FALLBACK_IMAGE`.
- Fallback UI components (e.g., `AvatarFallback`, `PlaceholderImage`).
- Zod schema parsing at the API boundary (`src/lib/api/client.ts`) to strip invalid data or provide default values *before* it reaches the UI.
