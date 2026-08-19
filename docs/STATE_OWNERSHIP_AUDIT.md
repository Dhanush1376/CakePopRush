# State Ownership Audit

This document tracks the feature state migration completed in Phase 5.

## Cart State

| Aspect | Details |
|--------|---------|
| **Current Location** | `src/features/cart/state/cartStore.tsx` (Migrated from `src/lib/cartStore.tsx`) |
| **Provider** | `CartProvider` (Exported from `features/cart/index.ts`) |
| **Hook** | `useCart` (Exported from `features/cart/index.ts`) |
| **Consumers** | ProductCard, SideCart, BottomNavigation, Header, SideDrawer, MascotOrchestrationProvider, CartItemCard, CartRecommendations, CouponSection, MobileCheckoutBar, OrderSummary, PriceDetails, usePDPState, CartPage, CheckoutDeliveryPage, CheckoutPaymentPage, OrderSuccessPage |
| **Initialization** | Driven by `app/providers.tsx` which injects `initialItems` derived from `productData.getProducts()`. The Cart feature state remains data-source agnostic. |
| **Persistence** | None currently implemented. Uses memory only (`useReducer`). |
| **Future Owner** | N/A (Successfully migrated to `features/cart/state`) |
| **Dependencies** | Depends on `Product` and `CartItem` types. Does not import from `pages`, `mocks`, or other features. |

### Derived State / Reducer Audit
- **Actions**: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`, `APPLY_COUPON`, `REMOVE_COUPON`, `SET_COUPON_STATE`, `SET_LOADING`, `SET_CART_OPEN`.
- **Derived totals**: `totalItems`, `subtotal`, `itemDiscounts`, `shippingFee`, `total`.
- **Note**: These calculations currently live inside the `useMemo` of the `CartProvider`. For now, they are considered state responsibility. In future phases, complex pricing logic could be abstracted into domain services.

## Wishlist State

| Aspect | Details |
|--------|---------|
| **Current Location** | `src/features/wishlist/state/wishlistStore.tsx` (Migrated from `src/lib/wishlistStore.tsx`) |
| **Provider** | `WishlistProvider` (Exported from `features/wishlist/index.ts`) |
| **Hook** | `useWishlist` (Exported from `features/wishlist/index.ts`) |
| **Consumers** | MascotOrchestrationProvider, CartItemCard, usePDPState, WishlistGrid, WishlistMascot, WishlistRecommendations, WishlistPage, ShopPage |
| **Initialization** | Driven by `app/providers.tsx` which injects `initialItems` derived from `productData.getProducts()`. |
| **Persistence** | None currently implemented. Uses memory only (`useReducer`). |
| **Future Owner** | N/A (Successfully migrated to `features/wishlist/state`) |
| **Dependencies** | Depends on `Product` type. Does not import from `pages`, `mocks`, or other features. |

### Derived State / Reducer Audit
- **Actions**: `ADD_ITEM`, `REMOVE_ITEM`, `UNDO_REMOVE`, `CLEAR_WISHLIST`, `SET_SORT_BY`, `SET_VIEW_MODE`, `SET_LOADING`, `SET_ERROR`.
- **Helper methods**: `isInWishlist`, `refresh`.

## State Dependency Graph

### Initialization Flow
```text
App
 ↓
providers.tsx
 │
 ├── productData.getProducts() (Data Source)
 │
 ├── CartProvider (Injected initialItems)
 │    └── features/cart/state
 │
 └── WishlistProvider (Injected initialItems)
      └── features/wishlist/state
```

### Feature Dependencies
```text
features/cart/state → types/product
features/wishlist/state → types/product
```

No state module directly imports from `mocks`, `pages`, or `admin`. Data ownership and state ownership are strictly separated.
