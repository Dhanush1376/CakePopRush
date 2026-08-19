# Storefront Architecture Audit

## Domain Migration Audit

### `features/products/`
We extracted 23 components from `pages/storefront/product/components/` that hold product-domain UI logic.
- **Moved**: `PDPSkeleton`, `ProductGallery`, `ProductInfo`, `FlavourSelector`, `QuantitySelector`, `AddOnSelector`, `PersonalizationSection`, `DeliverySection`, `CouponsSection`, `OrderSummary`, `PurchaseActions`, `CustomThemeCTA`, `StickyMobileCTA`, `IngredientsAndNutrition`, `RelatedProducts`, `FAQSection`, `FreshnessInfo`, `NutritionCard`, `MascotAssistant`, `BundleSection`, `OccasionSelector`, `RecentlyViewed`.
- **Reason**: These hold product-specific mock/domain properties and are scoped to the product browsing experience.
- **Public API**: `features/products/index.ts` exposes exactly what `ProductDetailPage.tsx` needs to compose the view.

### `features/reviews/`
- **Moved**: `ReviewsSection` (from `product/components/`).
- **Reason**: Genuinely review-domain UI logic. Although consumed by the PDP, its primary responsibility is formatting and displaying reviews and ratings.

### `features/cart/`
- **Moved**: 11 components from `pages/storefront/cart/components/` (e.g. `CartItemCard`, `CartRecommendations`, `OrderSummary`, `MobileCheckoutBar`).
- **Reason**: These are cart-domain UI presentation logic, completely separate from the page structure.

### `features/wishlist/`
- **Moved**: 7 components from `pages/storefront/wishlist/components/`.
- **Reason**: Represents wishlist-domain UI presentation logic.

### `features/orders/`
- **Updates**: Extracted `MOCK_ORDERS` from `OrdersPage.tsx` into `features/orders/data/mockOrders.ts`. Extended canonical `Order` type in `src/types/order.ts` to include list-view properties.
- **Reason**: Resolves page-to-page dependency where `OrderTrackingPage` and `OrderSuccessPage` were importing directly from `OrdersPage`.

## Pages Kept Intact (Not Extracted)

1. **Home (`pages/storefront/home/`)**:
   - `HomePage.tsx` (187 LOC). Retained as a pure composition layer.

2. **Shop (`pages/storefront/shop/`)**:
   - `ShopPage.tsx` (252 LOC). Existing structure is reasonable. Page-specific layout components remain under the page.

3. **Checkout (`pages/storefront/checkout/`)**:
   - Self-contained and has no reusable domain behavior across other pages. Creating a feature would be purely aesthetic file-moving.

4. **Custom Orders & Profile**:
   - Both remain intact under `pages/storefront/`.

## Shared Components Verification

- **`ProductCard`**: Verified to have 8+ consumers, remains in `components/commerce/`.
- **`SearchBar`**: Remains in `components/commerce/`. To be evaluated during Component Decomposition.
- **`SideCart`**: Remains in `components/commerce/` for layout coupling.

## Dependency Rules Validated
- `pages` → `features`
- `features` → `components/commerce`
- No circular feature-to-feature dependencies introduced. `CartRecommendations` properly imports from `components/commerce`, not `features/products`.
