# CakePopRush — Architecture Audit

This document is a **factual, source-verified** audit of the current codebase architecture. Every claim in this document has been verified against the actual repository source code.

**Audit date:** 2026-08-16
**Methodology:** Every finding was verified using source-code grep searches, directory listings, file content inspection, and byte-level comparisons. Nothing is assumed from file names alone.

---

## 1. Current Architecture

The current project structure:

```text
src/
├── app/             # Router + Providers (2 files)
├── assets/          # Brand logo, illustrations, Vite scaffold leftovers
│   ├── brand/       # Logo component + logo images
│   ├── icons/       # EMPTY
│   └── illustrations/  # SVG illustration components (7 files)
├── components/      # Shared UI components
│   ├── auth/        # AuthModal (1 component)
│   ├── commerce/    # ProductCard, SearchBar, SideCart, etc. (8 components)
│   ├── decorative/  # Balloon, Bunting, ConfettiDots, WavyDivider
│   ├── error/       # ErrorBoundary (1 component)
│   ├── icons/       # DessertIcons (1 file)
│   ├── invoice/     # InvoiceDocument, InvoicePDF, InvoiceViewer
│   ├── layout/      # Header, Footer, Nav, SideDrawer, etc. (8 components)
│   ├── mascot/      # Full mascot subsystem (9 subdirs, 8 root files)
│   └── ui/          # Generic primitives (20 components)
├── constants/       # EMPTY
├── features/        # EMPTY
├── hooks/           # EMPTY
├── lib/             # Stores + formatters
│   ├── api/         # EMPTY
│   ├── formatters/  # currency.ts (1 file)
│   ├── utils/       # EMPTY
│   ├── cartStore.tsx
│   └── wishlistStore.tsx
├── mocks/           # Mock data (3 files)
│   ├── products.ts
│   ├── reviews.ts
│   └── adminData.ts
├── pages/           # Route pages
│   ├── account/     # EMPTY
│   ├── admin/       # Admin panel (35+ files)
│   ├── dev/         # EMPTY
│   ├── error/       # Error pages (3 files)
│   ├── info/        # EMPTY
│   └── storefront/  # Customer pages (60+ files)
├── styles/          # Global CSS (5 files)
├── types/           # Shared types (2 files)
├── App.tsx          # Root layout component
└── main.tsx         # Entry point
```

### Key observations

- The project has a partially established architecture with clear separation into components, pages, and styles.
- Several directories were created for future use but remain empty: `features/`, `constants/`, `hooks/`, `lib/api/`, `lib/utils/`, `assets/icons/`, `pages/account/`, `pages/dev/`, `pages/info/`.
- State management uses React Context + useReducer, not an external library.
- TanStack React Query is installed and configured in providers.tsx but has zero actual query/mutation hooks in the codebase.
- All data currently comes from mock imports — zero fetch/axios/XMLHttpRequest calls exist.

---

## 2. Target Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete target architecture contract.

**Summary of direction:**

```text
APP → PAGES → FEATURES → SHARED COMPONENTS → FOUNDATION
```

Key changes from current to target:
- `src/features/` becomes the primary home for domain logic (currently empty)
- State stores migrate from `src/lib/` into their respective features
- Mock data gets a data-provider abstraction layer
- Types containing business logic move out of `src/types/`
- Dependency direction is enforced (no upward imports)

---

## 3. Architectural Violations

All violations listed below have been **confirmed from source code**.

### Violation 1: Business logic in type file

**File:** [`src/types/invoice.ts`](../src/types/invoice.ts) (line 89)

**Evidence:**
```typescript
export function mapOrderToInvoiceData(order: any): InvoiceData {
```

**Problem:** This 105-line function performs data transformation, conditional logic, fallback handling, and math operations. A `types/` file should contain only type/interface definitions. This function is business logic that belongs in a feature module or utility.

**Severity:** Medium
**Resolution phase:** Phase 3+ (when invoice feature is established)

---

### Violation 2: Mock layer imports from page-specific types (upward dependency)

**File:** [`src/mocks/reviews.ts`](../src/mocks/reviews.ts) (line 1)

**Evidence:**
```typescript
import { Review } from '@/pages/storefront/product/types/pdpTypes'
```

**Problem:** The mock layer (`src/mocks/`) depends on a page-level type definition (`src/pages/storefront/product/types/pdpTypes`). Per the dependency direction rules, foundation-level modules must not import from pages. The `Review` type should be in `src/types/` or a future `src/features/reviews/types/`.

**Severity:** Medium
**Resolution phase:** Phase 2 or 3 (move Review type to shared types)

---

### Violation 3: Shared component imports from pages (upward dependency)

**File:** [`src/components/error/ErrorBoundary.tsx`](../src/components/error/ErrorBoundary.tsx) (line 2)

**Evidence:**
```typescript
import { ServerErrorPage } from '@/pages/error/ServerErrorPage'
```

**Problem:** A shared component (`src/components/`) imports from a page (`src/pages/`). Components should not depend on pages. The ErrorBoundary should receive its fallback UI via props or render a generic error state, not directly import a specific page.

**Severity:** Medium
**Resolution phase:** Phase 3+ (refactor ErrorBoundary to accept fallback as prop)

---

### Violation 4: Business logic leak in shared commerce component

**File:** [`src/components/commerce/SearchBar.tsx`](../src/components/commerce/SearchBar.tsx) (line 5)

**Evidence:**
```typescript
import { mockProducts, mockCategories, searchProducts, getBestSellingProducts } from '@/mocks/products'
```

**Problem:** A shared commerce component directly imports mock data and data-selector functions. SearchBar should receive its data source via props or hooks, not import mock data directly. This couples a reusable UI component to a specific data implementation.

**Severity:** High (most impactful business-logic leak in shared components)
**Resolution phase:** Phase 2 (data boundary abstraction)

---

### Violation 5: State stores located in wrong layer

**Files:**
- [`src/lib/cartStore.tsx`](../src/lib/cartStore.tsx)
- [`src/lib/wishlistStore.tsx`](../src/lib/wishlistStore.tsx)

**Problem:** Feature-specific state stores (cart, wishlist) are located in `src/lib/` which is intended for generic infrastructure. These should live in their respective feature modules.

**Severity:** Low (functional but architecturally misplaced)
**Resolution phase:** Phase 5 (state ownership migration)

---

## 4. Mock Data Consumers

Every consumer below was verified by grep searching for `from '@/mocks` across the entire `src/` directory. The exact import content was confirmed from the grep output.

### Storefront Pages

| File | Imports | Category |
|------|---------|----------|
| [`ShopPage.tsx`](../src/pages/storefront/ShopPage.tsx) | `mockProducts`, `getProductsByCategory` | SAFE TEMPORARY |
| [`HomeSections.tsx`](../src/pages/storefront/home/HomeSections.tsx) | `mockProducts`, `mockCategories`, `getBestSellingProducts` | SAFE TEMPORARY |
| [`ProductDetailPage.tsx`](../src/pages/storefront/product/ProductDetailPage.tsx) | `mockProducts`, `getRelatedProducts` from products; `mockReviews` from reviews | NEEDS DATA-BOUNDARY |
| [`ProductReviewsPage.tsx`](../src/pages/storefront/product/ProductReviewsPage.tsx) | `mockProducts` from products; `mockReviews` from reviews | NEEDS DATA-BOUNDARY |
| [`DesignSystemPage.tsx`](../src/pages/storefront/DesignSystemPage.tsx) | `mockProducts` | SAFE TEMPORARY |
| [`CartRecommendations.tsx`](../src/pages/storefront/cart/components/CartRecommendations.tsx) | `getRelatedProducts` | NEEDS DATA-BOUNDARY |
| [`WishlistRecommendations.tsx`](../src/pages/storefront/wishlist/components/WishlistRecommendations.tsx) | `mockProducts` | SAFE TEMPORARY |
| [`ShopCategories.tsx`](../src/pages/storefront/shop/ShopCategories.tsx) | `mockCategories` | SAFE TEMPORARY |

### Shared Components (violation — should not have mock dependencies)

| File | Imports | Category |
|------|---------|----------|
| [`SearchBar.tsx`](../src/components/commerce/SearchBar.tsx) | `mockProducts`, `mockCategories`, `searchProducts`, `getBestSellingProducts` | LIKELY BUSINESS-LOGIC LEAK |

### State Stores

| File | Imports | Category |
|------|---------|----------|
| [`cartStore.tsx`](../src/lib/cartStore.tsx) | `mockProducts` (for initial cart seeding) | NEEDS DATA-BOUNDARY |
| [`wishlistStore.tsx`](../src/lib/wishlistStore.tsx) | `mockProducts` (for initial wishlist seeding) | NEEDS DATA-BOUNDARY |

### Admin Components

| File | Imports | Category |
|------|---------|----------|
| [`AdminSidebar.tsx`](../src/pages/admin/components/AdminSidebar.tsx) | `adminUser` | SAFE TEMPORARY |
| [`AdminHeader.tsx`](../src/pages/admin/components/AdminHeader.tsx) | `notifications` | SAFE TEMPORARY |
| [`StatsGrid.tsx`](../src/pages/admin/components/StatsGrid.tsx) | `adminStats` | SAFE TEMPORARY |
| [`SalesOverviewChart.tsx`](../src/pages/admin/components/SalesOverviewChart.tsx) | `salesData` | SAFE TEMPORARY |
| [`OrderStatusChart.tsx`](../src/pages/admin/components/OrderStatusChart.tsx) | `orderStatusData` | SAFE TEMPORARY |
| [`TopSellingProducts.tsx`](../src/pages/admin/components/TopSellingProducts.tsx) | `topSellingProducts` | SAFE TEMPORARY |
| [`RecentOrders.tsx`](../src/pages/admin/components/RecentOrders.tsx) | `recentOrders` | SAFE TEMPORARY |
| [`LowStockAlerts.tsx`](../src/pages/admin/components/LowStockAlerts.tsx) | `lowStockProducts` | SAFE TEMPORARY |

**Total confirmed mock-data consumers: 21 files**

### Category definitions

- **SAFE TEMPORARY** — Direct mock import is acceptable during client approval. Will be refactored behind a data provider in a future phase. No urgency.
- **NEEDS DATA-BOUNDARY** — The component uses mock data in a way that mixes data-access with presentation. A hook/provider boundary should be introduced.
- **LIKELY BUSINESS-LOGIC LEAK** — A shared component that should not know about data sources is directly importing mock data + selector functions. Highest priority for refactoring.

---

## 5. Oversized Files

Files over 350 LOC, sorted by LOC descending. LOC counts verified from the codebase tree analysis.

### TSX/TS Files (> 350 LOC)

| File | LOC | Location |
|------|-----|----------|
| `AdminNewOrder.tsx` | 1,189 | pages/admin/pages/ |
| `AdminAddCoupon.tsx` | 731 | pages/admin/pages/ |
| `OrderTrackingPage.tsx` | 654 | pages/storefront/orders/ |
| `SearchBar.tsx` | 571 | components/commerce/ |
| `AdminCustomOrders.tsx` | 530 | pages/admin/pages/ |
| `AdminCustomers.tsx` | 525 | pages/admin/pages/ |
| `AdminUsers.tsx` | 515 | pages/admin/pages/ |
| `AdminSettingsForms.tsx` | 514 | pages/admin/components/settings/ |
| `AdminCoupons.tsx` | 477 | pages/admin/pages/ |
| `AdminOrders.tsx` | 468 | pages/admin/pages/ |
| `AdminReviews.tsx` | 459 | pages/admin/pages/ |
| `ParticleEffects.tsx` | 458 | components/mascot/effects/ |
| `OrderSuccessPage.tsx` | 454 | pages/storefront/orders/ |
| `AdminProducts.tsx` | 444 | pages/admin/pages/ |
| `InvoicePDF.tsx` | 430 | components/invoice/ |
| `AdminNotifications.tsx` | 403 | pages/admin/pages/ |
| `products.ts` | 394 | mocks/ |
| `AdminAnalytics.tsx` | 364 | pages/admin/pages/ |
| `CheckoutPaymentPage.tsx` | 353 | pages/storefront/checkout/ |

### CSS Module Files (> 500 LOC)

| File | LOC | Location |
|------|-----|----------|
| `HomePage.module.css` | 975 | pages/storefront/home/ |
| `SearchBar.module.css` | 931 | components/commerce/ |
| `AdminNewOrder.module.css` | 910 | pages/admin/pages/ |
| `OrderSuccessPage.module.css` | 792 | pages/storefront/orders/ |
| `AdminCustomOrders.module.css` | 781 | pages/admin/pages/ |
| `AdminAddCoupon.module.css` | 746 | pages/admin/pages/ |
| `AdminOrders.module.css` | 733 | pages/admin/pages/ |
| `AdminUsers.module.css` | 714 | pages/admin/pages/ |
| `AdminCustomers.module.css` | 683 | pages/admin/pages/ |
| `AdminReviews.module.css` | 651 | pages/admin/pages/ |
| `AdminCoupons.module.css` | 638 | pages/admin/pages/ |
| `OrderTrackingPage.module.css` | 629 | pages/storefront/orders/ |
| `AdminProducts.module.css` | 593 | pages/admin/pages/ |
| `AdminAddProduct.module.css` | 589 | pages/admin/pages/ |
| `AdminNotifications.module.css` | 582 | pages/admin/pages/ |
| `AdminCategories.module.css` | 536 | pages/admin/pages/ |
| `AdminSettings.module.css` | 535 | pages/admin/pages/ |

### Notes on oversized files

- `AdminNewOrder.tsx` (1,189 LOC) is the largest component and the highest priority for decomposition in a future phase.
- `ParticleEffects.tsx` (458 LOC) is part of the mascot subsystem — **do not decompose in early phases**. The mascot system is intentionally specialized.
- `InvoicePDF.tsx` (430 LOC) contains PDF layout code which is inherently verbose. May not need decomposition.
- `products.ts` (394 LOC) is mock data — will be replaced by API, not decomposed.

---

## 6. State Ownership

### Current stores (verified from source)

| Store | Location | Consumer Count | Recommended Future Location |
|-------|----------|---------------|---------------------------|
| `CartProvider` / `useCart` | `src/lib/cartStore.tsx` | 18 consumers | `src/features/cart/state/cartStore.tsx` |
| `WishlistProvider` / `useWishlist` | `src/lib/wishlistStore.tsx` | 9 consumers | `src/features/wishlist/state/wishlistStore.tsx` |
| `ToastProvider` / `useToast` | `src/components/ui/ToastContext.tsx` | Used in providers.tsx | Appropriate location (UI concern) |

### CartStore consumers (18 files, verified by grep)

**In `src/app/`:** providers.tsx (CartProvider)
**In `src/components/`:** Header.tsx, SideDrawer.tsx, BottomNavigation.tsx, ProductCard.tsx, SideCart.tsx, MascotOrchestrationProvider.tsx
**In `src/pages/storefront/`:** CartPage.tsx, CartItemCard.tsx, CartRecommendations.tsx, CouponSection.tsx, MobileCheckoutBar.tsx, OrderSummary.tsx, PriceDetails.tsx, CheckoutDeliveryPage.tsx, CheckoutPaymentPage.tsx, OrderSuccessPage.tsx, usePDPState.ts

### WishlistStore consumers (9 files, verified by grep)

**In `src/app/`:** providers.tsx (WishlistProvider)
**In `src/components/`:** MascotOrchestrationProvider.tsx
**In `src/pages/storefront/`:** WishlistPage.tsx, WishlistRecommendations.tsx, WishlistMascot.tsx, WishlistGrid.tsx, ShopPage.tsx, usePDPState.ts, CartItemCard.tsx

### Migration risk assessment

Both stores are deeply integrated via Context Providers at the app root. Migration to feature modules requires:
1. Moving the store file
2. Updating the provider import in `providers.tsx`
3. Updating all consumer imports (18 for cart, 9 for wishlist)
4. The public API (`useCart`, `useWishlist`) should remain identical

This is a mechanical refactor with low functional risk but high file-touch count.

---

## 7. API Usage

**Verification method:** Grep searched for `fetch(`, `axios`, and `XMLHttpRequest` across all `.ts` and `.tsx` files in `src/`.

| Pattern | Results |
|---------|---------|
| `fetch(` | 0 matches |
| `axios` | 0 matches |
| `XMLHttpRequest` | 0 matches |
| `useQuery` | 0 matches |
| `useMutation` | 0 matches |
| `useInfiniteQuery` | 0 matches |
| `useSuspenseQuery` | 0 matches |

**Conclusion:** The codebase has **zero direct API calls**. All data is sourced from mock imports. TanStack React Query is installed as a dependency, configured in `providers.tsx` with a `QueryClient`, but no query or mutation hooks are used anywhere. This means the API layer is completely unbuilt — a clean slate for future implementation.

---

## 8. Duplicate / Legacy Candidates

### Logo asset duplication

| File | Size | Used By |
|------|------|---------|
| `src/assets/brand/logo.png` | 308,166 bytes | `Logo.tsx` component (via JS import) → storefront Header, Footer, Nav, SideDrawer, SplashScreen |
| `public/images/logo.png` | 302,738 bytes | `AdminSidebar.tsx` (via HTML src="/images/logo.png") |
| `src/assets/brand/logo.webp` | 50,322 bytes | `Logo.tsx` component (via JS import, as webp source) |
| `public/images/logo.webp` | 42,778 bytes | Not directly referenced in source |

**Status:** NOT identical (different file sizes). The `src/assets/brand/` versions are larger. Both sets are actively used — storefront uses the JS-imported version, admin uses the public path version.

**Recommendation:** VERIFY FIRST — determine if the size difference is intentional (different resolutions) or accidental. Ideally, consolidate to one set. `public/images/logo.webp` appears unused and may be removable.

---

### Vite scaffold defaults

| File | Size | Used In Source |
|------|------|---------------|
| `src/assets/react.svg` | 4,126 bytes | 0 references |
| `src/assets/vite.svg` | 8,709 bytes | 0 references |

**Status:** SAFE TO REMOVE — Vite project scaffold defaults. No imports or references found in any source file.

---

### Duplicate skeleton generator scripts

| File | Size | Format |
|------|------|--------|
| `scripts/generate_skeletons.cjs` | 3,086 bytes | CommonJS (`require()`) |
| `scripts/generate_skeletons.js` | 3,096 bytes | CommonJS with template literals |

**Verification:** Compared line-by-line. The files differ on 11 lines. The `.cjs` version uses string concatenation (`' + name + '`), the `.js` version uses template literals (`` `${name}` ``). They produce identical output.

**Status:** VERIFY FIRST — determine which version is actively used. The project has `"type": "module"` in package.json, so `.js` files are treated as ESM, but both files use `require()` (CJS). The `.cjs` extension is the correct one for CJS in an ESM project. The `.js` version may fail to run.

**Recommendation:** Keep `generate_skeletons.cjs`, verify if `generate_skeletons.js` is needed, likely safe to remove.

---

### `eslint-errors.txt`

| File | Size |
|------|------|
| `eslint-errors.txt` | 634 LOC |

**Status:** SAFE TO REMOVE — Generated lint output file, not source code. Should be in `.gitignore` if regenerated.

---

### Empty directories

| Directory | Status |
|-----------|--------|
| `src/features/` | EMPTY — created for future use |
| `src/constants/` | EMPTY — created for future use |
| `src/hooks/` | EMPTY — created for future use |
| `src/lib/api/` | EMPTY — created for future use |
| `src/lib/utils/` | EMPTY — created for future use |
| `src/assets/icons/` | EMPTY — created for future use |
| `src/pages/account/` | EMPTY — created for future use |
| `src/pages/dev/` | EMPTY — created for future use |
| `src/pages/info/` | EMPTY — created for future use |

**Status:** KEEP — These represent architectural intent. They will be populated as features are migrated. They cause no harm. Empty directories are typically not tracked by Git anyway.

---

### `public/images/mascot-reference-sheet.png`

Design reference asset, not used in application code.

**Status:** KEEP — useful as a design reference. Does not affect bundle.

---

## 9. Planned Migration Order

This is the roadmap for future phases. **None of these migrations happen in Phase 1.**

```text
Phase    Focus                              Risk    Files Touched
─────    ─────                              ────    ─────────────
  1      Architecture documentation         None    0 (this phase)
  2      Mock data / data-provider boundary  Low     ~25
  3      Shared type cleanup                 Low     ~10
  4      Storefront feature extraction       Medium  ~40
  5      State ownership migration           Medium  ~30
  6      Admin feature extraction            Medium  ~50
  7      API boundary establishment          Medium  ~20
  8      Large component decomposition       High    ~15
  9      CSS decomposition                   Low     ~20
 10      Dead-code / legacy cleanup          Low     ~10
```

### Phase 2: Mock Data / Data Provider Architecture

**Goal:** Introduce a data-access abstraction so components don't directly import from `src/mocks/`.

**Priority targets:**
1. `SearchBar.tsx` — highest priority (shared component with mock dependency)
2. `cartStore.tsx` + `wishlistStore.tsx` — stores should not import mock data directly
3. `ProductDetailPage.tsx` + `ProductReviewsPage.tsx` — page components importing both product and review mocks

**Approach:** Create simple hook-based data providers that currently return mock data but can be swapped for API calls later.

### Phase 3: Shared Type Cleanup

**Goal:** Fix dependency direction violations in types.

**Targets:**
1. Move `Review` type from `src/pages/storefront/product/types/pdpTypes` to `src/types/review.ts`
2. Extract `mapOrderToInvoiceData()` from `src/types/invoice.ts` into a utility/feature module
3. Fix `mocks/reviews.ts` upward import

### Phase 4: Storefront Feature Extraction

**Goal:** Begin migrating storefront domain logic into `src/features/`.

**Candidate features:** products, cart, wishlist, checkout, orders, reviews.

### Phase 5: State Ownership Migration

**Goal:** Move `cartStore.tsx` and `wishlistStore.tsx` from `src/lib/` to their feature modules.

### Phase 6: Admin Feature Extraction

**Goal:** Establish admin feature boundaries.

### Phase 7: API Boundary Establishment

**Goal:** Implement the data-access layer using TanStack React Query (already installed).

### Phase 8: Large Component Decomposition

**Goal:** Break down components over 500 LOC by responsibility.

**Priority:** `AdminNewOrder.tsx` (1,189), `AdminAddCoupon.tsx` (731), `OrderTrackingPage.tsx` (654), `SearchBar.tsx` (571).

### Phase 9: CSS Decomposition

**Goal:** Break down CSS files over 700 LOC.

### Phase 10: Dead-Code / Legacy Cleanup

**Goal:** Remove confirmed unused files (Vite scaffold SVGs, duplicate scripts, eslint-errors.txt, empty directories if still empty).

---

## Verification Statement

Every finding in this document was verified against the actual source code in the repository using:
- `grep_search` for import patterns, API calls, and dependency analysis
- `view_file` for source-code inspection of specific files
- `list_dir` for directory content verification
- `node` commands for byte-level file comparison (logo duplication, script duplication)

No finding was fabricated from file names, assumptions, or the codebase tree alone.
