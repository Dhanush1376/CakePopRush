# CakePopRush — CSS Architecture Audit (Phase 8)

> **Audit Date**: 2026-08-17
> **Auditor**: Phase 8 CSS Architecture Refactor
> **Status**: INITIAL AUDIT — No CSS changes made yet

---

## 1. Current CSS Inventory

| Metric | Value |
|--------|------:|
| Total CSS files | 154 |
| Total CSS LOC | 31,257 |
| Files > 500 LOC | 17 |
| Files > 700 LOC | 8 |
| Global foundation files | 5 |
| CSS Module files | 149 |
| Design token variables | ~75 |

### Files > 700 LOC (Critical)

| File | LOC | Owner |
|------|----:|-------|
| `pages/storefront/home/HomePage.module.css` | 975 | HomePage + HeroSection + HomeSections |
| `components/commerce/SearchBar.module.css` | 931 | SearchBar |
| `pages/admin/pages/AdminNewOrder.module.css` | 910 | AdminNewOrder + 6 sub-components |
| `pages/storefront/orders/OrderSuccessPage.module.css` | 792 | OrderSuccessPage + 3 sub-components |
| `pages/admin/pages/AdminCustomOrders.module.css` | 781 | AdminCustomOrders |
| `pages/admin/pages/AdminAddCoupon.module.css` | 746 | AdminAddCoupon + 8 sub-components |
| `pages/admin/pages/AdminOrders.module.css` | 733 | AdminOrders |
| `pages/admin/pages/AdminUsers.module.css` | 714 | AdminUsers |

### Files 500–700 LOC

| File | LOC | Owner |
|------|----:|-------|
| `pages/admin/pages/AdminCustomers.module.css` | 683 | AdminCustomers |
| `pages/admin/pages/AdminReviews.module.css` | 651 | AdminReviews |
| `pages/admin/pages/AdminCoupons.module.css` | 638 | AdminCoupons |
| `pages/storefront/orders/OrderTrackingPage.module.css` | 629 | OrderTrackingPage |
| `pages/admin/pages/AdminProducts.module.css` | 593 | AdminProducts |
| `pages/admin/pages/AdminAddProduct.module.css` | 589 | AdminAddProduct |
| `pages/admin/pages/AdminNotifications.module.css` | 582 | AdminNotifications |
| `pages/admin/pages/AdminCategories.module.css` | 536 | AdminCategories |
| `pages/admin/pages/AdminSettings.module.css` | 535 | AdminSettings + 13 sub-components |

---

## 2. Ownership Classification

### GLOBAL FOUNDATION (5 files, 280 LOC)

| File | LOC | Status |
|------|----:|--------|
| `styles/tokens.css` | 111 | ✅ CLEAN |
| `styles/globals.css` | 73 | ⚠️ Contains `global-delete-btn` (see §9) |
| `styles/reset.css` | 38 | ✅ CLEAN |
| `styles/typography.css` | 33 | ✅ CLEAN |
| `styles/animations.css` | 25 | ✅ CLEAN |

### SHARED COMPONENTS — UI (`components/ui/`, 16 files)

| File | LOC | Status |
|------|----:|--------|
| `ImageModal.module.css` | 139 | ✅ Correct ownership |
| `Button.module.css` | 114 | ✅ Correct ownership |
| `ResponsiveModal.module.css` | 101 | ✅ Correct ownership |
| `Toast.module.css` | 97 | ✅ Correct ownership |
| `ErrorCard.module.css` | 96 | ✅ Correct ownership |
| `IconButton.module.css` | 93 | ✅ Correct ownership |
| `Input.module.css` | 79 | ✅ Correct ownership |
| `WhatsAppButton.module.css` | 70 | ✅ Correct ownership |
| `CircularRingSpinner.module.css` | 66 | ✅ Correct ownership |
| `Pagination.module.css` | 59 | ✅ Correct ownership |
| `Skeleton.module.css` | 56 | ✅ Correct ownership |
| `Accordion.module.css` | 53 | ✅ Correct ownership |
| `EmptyState.module.css` | 42 | ✅ Correct ownership |
| `ValidationBubble.module.css` | 39 | ✅ Correct ownership |
| `Badge.module.css` | 32 | ✅ Correct ownership |
| `SplashScreen.module.css` | 18 | ✅ Correct ownership |
| `ScrollToTopButton.module.css` | 26 | ✅ Correct ownership |

### SHARED COMPONENTS — Layout (`components/layout/`, 7 files)

| File | LOC | Status |
|------|----:|--------|
| `SideDrawer.module.css` | 377 | ✅ Correct ownership |
| `Footer.module.css` | 218 | ✅ Correct ownership |
| `Header.module.css` | 164 | ✅ Correct ownership |
| `BottomNavigation.module.css` | 72 | ✅ Correct ownership |
| `DesktopNav.module.css` | 60 | ✅ Correct ownership |
| `MobileNav.module.css` | 36 | ✅ Correct ownership |
| `Container.module.css` | 23 | ✅ Correct ownership |

### SHARED COMPONENTS — Commerce (`components/commerce/`, 6 files)

| File | LOC | Status |
|------|----:|--------|
| `SearchBar.module.css` | 931 | ⚠️ Very large, but single owner |
| `SideCart.module.css` | 387 | ✅ Correct ownership |
| `ProductCard.module.css` | 283 | ✅ Correct ownership |
| `ProductImage.module.css` | 58 | ✅ Correct ownership |
| `QuantitySelector.module.css` | 52 | ✅ Correct ownership |
| `ProductCardSkeleton.module.css` | 47 | ✅ Correct ownership |
| `CategoryChip.module.css` | 36 | ✅ Correct ownership |
| `Price.module.css` | 27 | ✅ Correct ownership |

### SHARED COMPONENTS — Other (`components/auth/`, `components/invoice/`, `components/mascot/`)

| File | LOC | Status |
|------|----:|--------|
| `AuthModal.module.css` | 368 | ✅ Correct ownership |
| `InvoiceDocument.module.css` | 268 | ✅ Correct ownership |
| `InvoiceViewer.module.css` | 164 | ✅ Correct ownership |
| `MascotEmptyState.module.css` | 139 | ✅ Correct ownership |
| `CakePopMascot.module.css` | 30 | ✅ Correct ownership |

### FEATURE — Products (`features/products/components/`, 23 files)

| File | LOC | Status |
|------|----:|--------|
| `ProductInfo.module.css` | 278 | ✅ Correct ownership |
| `ProductGallery.module.css` | 266 | ✅ Correct ownership |
| `CouponsSection.module.css` | 162 | ✅ Correct ownership |
| `IngredientsAndNutrition.module.css` | 122 | ✅ Correct ownership |
| `FlavourSelector.module.css` | 102 | ✅ Correct ownership |
| `DeliverySection.module.css` | 91 | ✅ Correct ownership |
| `AddOnSelector.module.css` | 90 | ✅ Correct ownership |
| `IngredientsAllergens.module.css` | 89 | ✅ Correct ownership |
| `PDPSkeleton.module.css` | 86 | ✅ Correct ownership |
| `CustomThemeCTA.module.css` | 85 | ✅ Correct ownership |
| `QuantitySelector.module.css` | 82 | ✅ Correct ownership |
| `NutritionCard.module.css` | 66 | ✅ Correct ownership |
| `OccasionSelector.module.css` | 64 | ✅ Correct ownership |
| `BundleSection.module.css` | 63 | ✅ Correct ownership |
| `StickyMobileCTA.module.css` | 62 | ✅ Correct ownership |
| `FAQSection.module.css` | 61 | ✅ Correct ownership |
| `PurchaseActions.module.css` | 59 | ✅ Correct ownership |
| `OrderSummary.module.css` | 54 | ✅ Correct ownership |
| `PersonalizationSection.module.css` | 53 | ✅ Correct ownership |
| `RelatedProducts.module.css` | 51 | ✅ Correct ownership |
| `RecentlyViewed.module.css` | 50 | ✅ Correct ownership |
| `FreshnessInfo.module.css` | 44 | ✅ Correct ownership |
| `MascotAssistant.module.css` | 41 | ✅ Correct ownership |

### FEATURE — Cart (`features/cart/components/`, 11 files + 1 shared)

| File | LOC | Status |
|------|----:|--------|
| `CouponSection.module.css` | 159 | ✅ Correct ownership |
| `CheckoutProgress.module.css` | 137 | ✅ Correct ownership |
| `CartItemCard.module.css` | 122 | ✅ Correct ownership |
| `OrderSummary.module.css` | 104 | ✅ Correct ownership |
| `MobileCheckoutBar.module.css` | 101 | ✅ Correct ownership |
| `CartPageSkeleton.module.css` | 75 | ✅ Correct ownership |
| `DeliveryAddressBar.module.css` | 64 | ✅ Correct ownership |
| `EmptyCart.module.css` | 60 | ✅ Correct ownership |
| `PriceDetails.module.css` | 49 | ✅ Correct ownership |
| `CartComponents.module.css` | 48 | ⚠️ Shared by 4 components (intentional) |
| `TrustBadges.module.css` | 41 | ✅ Correct ownership |
| `CartRecommendations.module.css` | 38 | ✅ Correct ownership |

### FEATURE — Wishlist (`features/wishlist/components/`, 7 files)

| File | LOC | Status |
|------|----:|--------|
| `WishlistMascot.module.css` | 130 | ✅ Correct ownership |
| `WishlistHeader.module.css` | 89 | ✅ Correct ownership |
| `WishlistEmptyState.module.css` | 85 | ✅ Correct ownership |
| `WishlistRecommendations.module.css` | 57 | ✅ Correct ownership |
| `WishlistSkeleton.module.css` | 47 | ✅ Correct ownership |
| `WishlistGrid.module.css` | 42 | ✅ Correct ownership |

### FEATURE — Reviews (`features/reviews/components/`, 1 file)

| File | LOC | Status |
|------|----:|--------|
| `ReviewsSection.module.css` | 142 | ✅ Correct ownership |

### FEATURE — Admin (`features/admin/components/`, 24 files)

| File | LOC | Status |
|------|----:|--------|
| `AdminHeader.module.css` | 416 | ✅ Correct ownership |
| `AdminSidebar.module.css` | 286 | ✅ Correct ownership |
| `AdminComponents.module.css` | 228 | ⚠️ Shared by 8 dashboard components |
| `AdminAddCategoryModal.module.css` | 212 | ✅ Correct ownership |
| `AdminOrdersSkeleton.module.css` | 207 | ✅ Correct ownership |
| `AdminProductsSkeleton.module.css` | 205 | ✅ Correct ownership |
| `AdminCustomersSkeleton.module.css` | 204 | ✅ Correct ownership |
| `AdminSearchPalette.module.css` | 196 | ✅ Correct ownership |
| `AdminUsersSkeleton.module.css` | 193 | ✅ Correct ownership |
| `AdminStorefrontCMS.module.css` | 186 | ✅ Correct ownership (from pages, but used by ErrorTrackingPanel?) |
| `AdminCustomOrdersSkeleton.module.css` | 182 | ✅ Correct ownership |
| `AdminCouponsSkeleton.module.css` | 182 | ✅ Correct ownership |
| `AdminReviewsSkeleton.module.css` | 182 | ✅ Correct ownership |
| `AdminNotificationsSkeleton.module.css` | 180 | ✅ Correct ownership |
| `AdminErrorBoundary.module.css` | 178 | ✅ Correct ownership |
| `AdminAddProductSkeleton.module.css` | 172 | ✅ Correct ownership |
| `AdminNewOrderSkeleton.module.css` | 171 | ✅ Correct ownership |
| `CustomerDetailsModal.module.css` | 182 | ✅ Correct ownership |
| `AdminCategoriesSkeleton.module.css` | 154 | ✅ Correct ownership |
| `AdminAnalyticsSkeleton.module.css` | 143 | ✅ Correct ownership |
| `AdminDashboardSkeleton.module.css` | 140 | ✅ Correct ownership |
| `CustomSelect.module.css` | 131 | ✅ Correct ownership |
| `AdminSettingsSkeleton.module.css` | 96 | ✅ Correct ownership |
| `AdminBottomNav.module.css` | 62 | ✅ Correct ownership |
| `ViewToggle.module.css` | 29 | ✅ Correct ownership |

### PAGES — Storefront

| File | LOC | Type | Status |
|------|----:|------|--------|
| `home/HomePage.module.css` | 975 | PAGE | 🔴 Shared by 3 components (ownership violation) |
| `orders/OrderSuccessPage.module.css` | 792 | PAGE | 🔴 Shared by 4 components (ownership violation) |
| `orders/OrderTrackingPage.module.css` | 629 | PAGE | ✅ Single owner |
| `profile/ProfilePage.module.css` | 478 | PAGE | ✅ Single owner |
| `checkout/CheckoutPaymentPage.module.css` | 452 | PAGE | ✅ Single owner |
| `shop/ShopHero.module.css` | 426 | PAGE-COMPONENT | ✅ Correct ownership |
| `checkout/components/AddressModal.module.css` | 313 | PAGE-COMPONENT | ✅ Correct ownership |
| `orders/OrdersPage.module.css` | 322 | PAGE | ✅ Single owner |
| `checkout/CheckoutDeliveryPage.module.css` | 276 | PAGE | ✅ Single owner |
| `profile/components/AddressDrawer.module.css` | 258 | PAGE-COMPONENT | ✅ Correct ownership |
| `custom-orders/components/CustomOrderSteps.module.css` | 247 | PAGE-COMPONENT | ✅ Correct ownership |
| `custom-orders/CustomOrdersPage.module.css` | 246 | PAGE | ✅ Single owner |
| `shop/FilterDrawer.module.css` | 244 | PAGE-COMPONENT | ✅ Correct ownership |
| `info/ContactPage.module.css` | 224 | PAGE | ✅ Single owner |
| `profile/NotificationsPage.module.css` | 189 | PAGE | ✅ Single owner |
| `cart/CartPage.module.css` | 184 | PAGE | ✅ Single owner |
| `profile/MyDetailsPage.module.css` | 182 | PAGE | ✅ Single owner |
| `profile/AddressesPage.module.css` | 182 | PAGE | ✅ Single owner |
| `ShopPage.module.css` | 179 | PAGE | ✅ Single owner |
| `product/ProductDetailPage.module.css` | 157 | PAGE | ✅ Single owner |
| `product/ProductReviewsPage.module.css` | 156 | PAGE | ✅ Single owner |
| `shop/ShopToolbar.module.css` | 146 | PAGE-COMPONENT | ✅ Correct ownership |
| `shop/ShopCategories.module.css` | 112 | PAGE-COMPONENT | ✅ Correct ownership |
| `checkout/components/CheckoutSkeleton.module.css` | 67 | PAGE-COMPONENT | ✅ Correct ownership |
| `legal/LegalPage.module.css` | 69 | PAGE | ✅ Single owner |
| `wishlist/WishlistPage.module.css` | 59 | PAGE | ✅ Single owner |

### PAGES — Admin

| File | LOC | Type | Status |
|------|----:|------|--------|
| `AdminNewOrder.module.css` | 910 | PAGE | 🔴 Shared by 7 components (ownership violation) |
| `AdminCustomOrders.module.css` | 781 | PAGE | ✅ Single owner |
| `AdminAddCoupon.module.css` | 746 | PAGE | 🔴 Shared by 9 components (ownership violation) |
| `AdminOrders.module.css` | 733 | PAGE | ✅ Single owner |
| `AdminUsers.module.css` | 714 | PAGE | ✅ Single owner |
| `AdminCustomers.module.css` | 683 | PAGE | ✅ Single owner |
| `AdminReviews.module.css` | 651 | PAGE | ✅ Single owner |
| `AdminCoupons.module.css` | 638 | PAGE | ✅ Single owner |
| `AdminProducts.module.css` | 593 | PAGE | ✅ Single owner |
| `AdminAddProduct.module.css` | 589 | PAGE | ✅ Single owner |
| `AdminNotifications.module.css` | 582 | PAGE | ✅ Single owner |
| `AdminCategories.module.css` | 536 | PAGE | ✅ Single owner |
| `AdminSettings.module.css` | 535 | PAGE | 🔴 Shared by 14 components (ownership violation) |
| `AdminAnalytics.module.css` | 462 | PAGE | ✅ Single owner |
| `AdminMascotPlayground.module.css` | 442 | PAGE | ✅ Single owner |
| `AdminAddCustomOrder.module.css` | 402 | PAGE | ✅ Single owner |
| `AdminStorefrontCMS.module.css` | 186 | PAGE | ✅ Single owner |
| `ErrorTrackingPanel.module.css` | 178 | PAGE-COMPONENT | ✅ Correct ownership |
| `AdminLayout.module.css` | 46 | LAYOUT | ✅ Correct ownership |
| `AdminDashboard.module.css` | 44 | PAGE | ✅ Single owner |

---

## 3. Critical Issue: Cross-Boundary CSS Imports

### 🔴 ISSUE: Feature components importing page-level CSS

This is the **primary architectural debt** identified in this audit.

**27 feature-level components** import CSS from page-level stylesheets, violating the architectural layer rule:

```
features/ → MUST NOT import from → pages/
```

#### AdminNewOrder (6 sub-components → `pages/admin/pages/AdminNewOrder.module.css`)
- `features/admin/components/new-order/CustomerStep.tsx`
- `features/admin/components/new-order/DeliveryStep.tsx`
- `features/admin/components/new-order/ItemsStep.tsx`
- `features/admin/components/new-order/OrderSummaryPanel.tsx`
- `features/admin/components/new-order/PaymentStep.tsx`
- `features/admin/components/new-order/ReviewStep.tsx`

#### AdminAddCoupon (8 sub-components → `pages/admin/pages/AdminAddCoupon.module.css`)
- `features/admin/components/add-coupon/AdminAddCouponSkeleton.tsx`
- `features/admin/components/add-coupon/CouponConditionsStep.tsx`
- `features/admin/components/add-coupon/CouponDetailsStep.tsx`
- `features/admin/components/add-coupon/CouponDiscountStep.tsx`
- `features/admin/components/add-coupon/CouponEligibilityStep.tsx`
- `features/admin/components/add-coupon/CouponPreviewPanel.tsx`
- `features/admin/components/add-coupon/CouponUsageLimitsStep.tsx`
- `features/admin/components/add-coupon/CouponValidityStep.tsx`

#### AdminSettings (13 sub-components → `pages/admin/pages/AdminSettings.module.css`)
- `features/admin/components/settings/forms/AdminProfileForm.tsx`
- `features/admin/components/settings/forms/APISettingsForm.tsx`
- `features/admin/components/settings/forms/BackupRestoreForm.tsx`
- `features/admin/components/settings/forms/EmailSettingsForm.tsx`
- `features/admin/components/settings/forms/GeneralSettingsForm.tsx`
- `features/admin/components/settings/forms/MaintenanceModeForm.tsx`
- `features/admin/components/settings/forms/NotificationSettingsForm.tsx`
- `features/admin/components/settings/forms/PaymentSettingsForm.tsx`
- `features/admin/components/settings/forms/SecuritySettingsForm.tsx`
- `features/admin/components/settings/forms/ShippingSettingsForm.tsx`
- `features/admin/components/settings/forms/SMSSettingsForm.tsx`
- `features/admin/components/settings/forms/StoreInformationForm.tsx`
- `features/admin/components/settings/forms/TaxSettingsForm.tsx`

### ⚠️ ISSUE: Page sub-components importing parent page CSS

This is a **secondary** concern — acceptable when within the same page boundary, but creates tight coupling:

#### OrderSuccessPage (3 sub-components → `pages/storefront/orders/OrderSuccessPage.module.css`)
- `pages/storefront/orders/components/DeliveryCard.tsx`
- `pages/storefront/orders/components/OrderTimeline.tsx`
- `pages/storefront/orders/components/PaymentSummaryCard.tsx`

#### HomePage (2 sub-components → `pages/storefront/home/HomePage.module.css`)
- `pages/storefront/home/HomeSections.tsx`
- `pages/storefront/home/HeroSection.tsx`

---

## 4. Token Inventory

Tokens in `src/styles/tokens.css` (111 LOC):

| Category | Count | Status |
|----------|------:|--------|
| Brand colors | 3 | ✅ Clean |
| Neutral colors | 8 | ✅ Clean |
| Semantic colors | 6 | ✅ Clean |
| Hero-specific colors | 5 | ✅ Acceptable |
| Admin-specific colors/vars | 13 | ✅ Acceptable |
| Spacing scale | 12 | ✅ Clean |
| Font families | 4 | ✅ Clean |
| Font sizes | 9 | ✅ Clean |
| Font weights | 4 | ✅ Clean |
| Line heights | 5 | ✅ Clean |
| Border radii | 6 | ✅ Clean |
| Shadows | 3 | ✅ Clean |
| Motion/timing | 5 | ✅ Clean |
| Layout | 3 | ✅ Clean |
| Z-index scale | 6 | ✅ Clean |

**Assessment**: Token system is well-structured. No duplicate tokens. No missing semantic categories.

---

## 5. `!important` Usage

| Location | Count | Risk |
|----------|------:|------|
| `styles/globals.css` — reduced motion | 4 | ✅ Intentional (accessibility) |
| `styles/globals.css` — `global-delete-btn` | 8 | ⚠️ Admin-specific, in global scope |
| `CheckoutPaymentPage.module.css` | 17 | ⚠️ May override third-party form |
| `AdminAnalytics.module.css` | 7+ | ⚠️ Likely chart library overrides |
| `HomePage.module.css` | 2 | ⚠️ Color overrides within hero |
| Various (mascot SVG, profile avatars) | ~8 | ⚠️ SVG part sizing overrides |
| `ContactPage.module.css` | 3 | ⚠️ Submit button overrides |
| `AddressDrawer.module.css` | 1 | ✅ Font override |
| `AddressModal.module.css` | 1 | ✅ Font override |
| `ShopHero.module.css` | 3 | ⚠️ Mobile mascot/SVG overrides |
| `OrderSuccessPage.module.css` | 3 | ⚠️ Mascot SVG overrides |
| `AdminLayout.module.css` | 1 | ✅ Background image removal |

**Assessment**: ~50 total `!important` usages. Most are intentional (third-party overrides, SVG parts, accessibility). None should be removed in Phase 8. Document and preserve.

---

## 6. `:global()` Selectors

| Pattern | Files | Purpose |
|---------|------:|---------|
| `:global(#arms)`, `:global(#front-arms)`, etc. | 6 | Mascot SVG part styling |
| `:global(.product-img)` | 1 | ProductCard hover effect |
| `:global(button)` | 1 | ProductCard quick-add styling |
| `:global(.leaflet-container)` | 1 | Map library styling |

**Assessment**: All `:global()` usages are intentional and necessary. Do not remove.

---

## 7. Positioning Risk Hotspots

### `position: fixed` (37 instances across 18 files)
- Modals: AuthModal, ImageModal, ResponsiveModal, SideDrawer, SideCart, InvoiceViewer, AddressModal, FilterDrawer
- Overlays: SplashScreen, CircularRingSpinner, OrderSuccessPage confetti
- Floating elements: Toast, WhatsAppButton, ScrollToTopButton, MobileCheckoutBar, StickyMobileCTA, AdminBottomNav, AdminSearchPalette
- Navigation: AdminSidebar (mobile), BottomNavigation

### `position: sticky` (26 instances across 20 files)
- Headers: Header, AdminHeader, AdminSidebar
- Shop: ShopHero, ShopPage sidebar
- Tables: Admin table headers (Admin{Orders,Users,Products,Reviews,Coupons,Customers,CustomOrders,Notifications,Categories})
- Page elements: OrderTrackingPage, CartPage sidebar, CheckoutPaymentPage, OrderSuccessPage, ProductDetailPage sidebar, ProductGallery, AdminMascotPlayground

**Assessment**: HIGH RISK. Do not alter any positioning or z-index values during CSS migration.

---

## 8. Responsive Architecture

### Breakpoint Inventory

| Breakpoint | Direction | Usage Count |
|------------|-----------|------------:|
| `480px` | max-width | ~3 |
| `600px` | min-width / max-width | ~4 |
| `640px` | min-width | ~2 |
| `650px` | min-width | ~1 |
| `768px` | min-width | ~40+ |
| `900px` | max-width | ~2 |
| `1024px` | min-width / max-width | ~50+ |
| `1280px` | min-width | ~5 |

**Primary breakpoints**: 768px (tablet) and 1024px (desktop)
**Strategy**: Mixed — mostly mobile-first (`min-width`) with some desktop-first (`max-width`)

**Assessment**: Do NOT normalize breakpoints or convert between strategies. Preserve all media queries exactly as-is.

---

## 9. Issues for Phase 8 Resolution

### 🔴 P0 — Cross-Boundary CSS Imports (27 files)
Feature components import CSS from page-level modules. This must be resolved by moving relevant CSS selectors to feature-owned stylesheets.

### ⚠️ P1 — Page Sub-Component CSS Sharing (5 files)
Page sub-components share parent page CSS. Lower priority than feature→page violations.

### ⚠️ P1 — `global-delete-btn` in globals.css
Admin-specific styling lives in global scope. Should be moved to admin feature CSS. Used by 5 admin page components.

### ℹ️ P2 — Shared CSS Modules (2 intentional cases)
- `AdminComponents.module.css`: shared by 8 admin dashboard components
- `CartComponents.module.css`: shared by 4 cart components
These are **intentional** shared modules — acceptable if they remain contained.

### ℹ️ P2 — Large Single-Owner Files
Many admin pages have 500-780 LOC CSS files. These are large but have correct single-component ownership. They do NOT need splitting just for LOC reduction.

---

## 10. CSS Dependency Graph

```
Foundation Layer
├── tokens.css  (imported by globals.css)
├── reset.css   (imported by globals.css)
├── typography.css (imported by globals.css)
└── animations.css (imported by globals.css)
        ↓
globals.css  (imported by main.tsx)
        ↓
All CSS Modules (via Vite CSS Module resolution)
├── components/**/*.module.css
├── features/**/*.module.css
└── pages/**/*.module.css
```

**Current violations**:
```
features/admin/components/new-order/*.tsx  →  pages/admin/pages/AdminNewOrder.module.css  🔴
features/admin/components/add-coupon/*.tsx →  pages/admin/pages/AdminAddCoupon.module.css  🔴
features/admin/components/settings/*.tsx  →  pages/admin/pages/AdminSettings.module.css   🔴
pages/.../orders/components/*.tsx          →  pages/.../orders/OrderSuccessPage.module.css ⚠️
pages/.../home/H*.tsx                      →  pages/.../home/HomePage.module.css           ⚠️
```

---

## 11. Dead CSS Candidates

> To be identified during Batch 5 execution.
> Not safe to determine before ownership migration is complete.

---

## 12. Deferred Cleanup

| Item | Reason |
|------|--------|
| Token migration of literal color values | Requires careful visual verification per instance |
| `!important` cleanup | Most are intentional; cleanup requires design review |
| SearchBar.module.css splitting | 931 LOC but single owner; splitting requires component decomposition |
| Large admin page CSS files | Single-owner files; splitting requires page decomposition |
| Dark mode preparation | No dark mode exists; out of scope |
| Accessibility CSS audit | Out of scope for Phase 8 |

---

## 13. Summary

| Classification | Files | LOC | % of Total |
|----------------|------:|----:|------------|
| Global Foundation | 5 | 280 | 0.9% |
| Shared Components | 32 | 3,329 | 10.6% |
| Feature Components | 55 | 6,064 | 19.4% |
| Page Components | 46 | 21,584 | 69.1% |
| **Total** | **154** | **31,257** | **100%** |

### Key Findings
1. **27 feature components** have cross-boundary CSS imports (feature → page) — this is the primary issue
2. **5 page sub-components** share parent page CSS — secondary concern
3. **Global foundation is clean** — tokens, reset, typography, animations are well-structured
4. **`global-delete-btn`** is admin-specific but lives in global CSS
5. **Most files have correct ownership** — the codebase is in better shape than expected post-Phase 7
6. **Large files are mostly single-owner** — they don't need splitting just for LOC
