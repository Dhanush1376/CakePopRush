# Business Rules & Constants Audit (Phase 10)

This document audits magic values and business rules currently hardcoded in the frontend, establishing clear ownership for the upcoming API migration.

## 1. Constants Ownership

We have intentionally avoided creating a centralized `src/config/constants.ts` dumping ground. Genuine global constants live in `src/constants/`, while feature-specific constants live near their features.

## 2. Business Rules (To be migrated to API)

The following values are currently hardcoded for mock purposes but must be migrated to the backend or configuration endpoints.

### Delivery & Shipping
- **Current Assumption**: Flat delivery fee (e.g. ₹40 or calculated as `order.orderType === 'Delivery' ? 40 : 0` in `invoiceMapper.ts`).
- **Future Source**: Backend checkout API response should return the exact shipping fee. The frontend should never calculate shipping.

### Tax Rates
- **Current Assumption**: 5% mock tax (`Math.round(subtotal * 0.05)`).
- **Future Source**: Backend must provide exact tax breakdown (CGST/SGST/IGST). Frontend calculation should be removed.

### Pricing Logic
- **Current Assumption**: Subtotal, discount, shipping, and total are computed manually in the frontend `CartProvider`.
- **Future Source**: Backend cart/checkout API. The frontend will only display the backend-provided totals to prevent discrepancies.

### Discount & Coupons
- **Current Assumption**: Fake coupon codes apply hardcoded logic (e.g., ₹100 off).
- **Future Source**: `/api/v1/coupons/apply` endpoint.

## 3. UI Constants (To remain in Frontend)

These values belong to the UI and should remain in the frontend:

- **Debounce Timeouts**: Search input delays (`const delay = 300`).
- **Mock Loaders**: `setTimeout(() => setIsLoading(false), 800)` — These will be replaced naturally by React Query.
- **Pagination Defaults**: Initial items per page (e.g., `limit = 8`).
- **Currency Symbol**: `₹` (could be localized, but safely lives in `formatCurrency` utility for now).

## 4. Action Plan for API Integration

1. Do not rewrite `CartProvider` pricing logic right now.
2. During API integration, replace `useCart`'s internal arithmetic with direct values from the API response payload.
3. Ensure no tax or delivery rules remain hardcoded in `invoiceMapper.ts`.
