# CakePopRush — Frontend Data Contracts

*Note: These are frontend integration requirements, not confirmed backend endpoints. The backend should be designed to satisfy these data structures and access patterns.*

## Overview

The CakePopRush frontend is currently running in a pure mock mode (`VITE_MOCK_MODE=true`). Data access is decoupled from UI components via "Data Providers". Each feature exports a data provider interface that dictates the data shape and operations the frontend needs.

To integrate the backend, you will implement these interfaces to wrap `fetch`/`axios` calls to your real APIs, then swap the exported implementation in the feature's `index.ts`.

---

## 1. Product Data Provider

The core domain for products, variants, and categories.

**Interface Location:** `src/features/products/api/productDataProvider.ts`

### Required Methods

```typescript
interface ProductDataProvider {
  getProducts(): Product[];
  getCategories(): Category[];
  getProductById(id: string): Product | undefined;
  getProductBySlug(slug: string): Product | undefined;
  getProductsByCategory(category: string): Product[];
  getFeaturedProducts(limit?: number): Product[];
  getBestSellingProducts(limit?: number): Product[];
  getNewArrivals(limit?: number): Product[];
  getRelatedProducts(productId: string, limit?: number): Product[];
  searchProducts(query: string): Product[];
}
```

### Key Type Structures

**`Product`**
```typescript
interface Product {
  id: string
  slug: string
  name: string
  categoryName: string
  images: ProductImage[]
  basePrice: number          // All prices are in paise (cents). e.g., ₹50 = 5000
  compareAtPrice?: number
  isBestSeller?: boolean
  description?: string
  nutrition?: NutritionInfo
  flavours?: Flavour[]
  quantities?: QuantityOption[]
  addOns?: AddOn[]
  // ... see src/types/product.ts for full fields
}
```

---

## 2. Order Data Provider

Handles retrieving order history and specific order tracking details.

**Interface Location:** `src/features/orders/api/orderDataProvider.ts`

### Required Methods

```typescript
interface OrderDataProvider {
  getOrders(): Order[];
  getOrderById(id: string): OrderDetail | undefined;
}
```

### Key Type Structures

**`Order`** (List View)
```typescript
interface Order {
  id?: string;
  date?: string;
  status?: string; 
  total?: number;
  items?: OrderItem[];
  // ... see src/types/order.ts
}
```

**`OrderDetail`** (Tracking / Success View)
```typescript
interface OrderDetail {
  id: string
  date: string
  status: string
  orderType: 'Delivery' | 'Pickup'
  items: OrderItemDetail[]
  address: DeliveryAddress
  price: PriceBreakdown
  payment: PaymentInfo
  // ... see src/features/orders/types.ts
}
```

---

## 3. Review Data Provider

Handles product reviews and ratings.

**Interface Location:** `src/features/reviews/api/reviewDataProvider.ts`

### Required Methods

```typescript
interface ReviewDataProvider {
  getAllReviews(): Review[];
  getReviewsByProductId(productId: string): Review[];
}
```

### Key Type Structures

**`Review`**
```typescript
interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  date: string
  text: string
  isVerified: boolean
  photoUrl?: string
}
```

---

## 4. Admin Data Providers

The admin panel requires aggregated stats and complex management views.

**Interface Location:** `src/features/admin/api/mockAdminDataProvider.ts`

*(Admin providers currently export grouped objects rather than formal interfaces. Backend integration should formalize these into interfaces).*

### Required Operations

- `adminProductData`: `getStats()`, `getProducts()`
- `adminOrderData`: `getStats()`, `getOrders()`
- `adminCategoryData`: `getStats()`, `getCategories()`
- `adminCustomerData`: `getStats()`, `getCustomers()`
- `adminAnalyticsData`: `getKpiStats()`, `getRevenueData()`, `getSalesData()`, `getOrdersOverview()`, etc.

---

## Client-Side Contexts (No Direct API Contract)

The following domains are managed purely client-side via React Context + `useReducer`. The backend does not need to serve these via direct GET endpoints; rather, the frontend will manage them in local storage/memory and submit them as part of a `Checkout` or `Sync` mutation.

1. **CartProvider** (`src/features/cart/state/cartStore.tsx`)
2. **WishlistProvider** (`src/features/wishlist/state/wishlistStore.tsx`)
