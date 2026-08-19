# Foundation Audit (Phase 3)

## A. Type Inventory

| Type | Current Location | Consumers | Recommended Ownership | Action Taken |
|------|------------------|-----------|-----------------------|--------------|
| `Product` & derivatives | `src/types/product.ts` | 21+ across Storefront, Admin, Stores, Mocks | Foundation (Shared) | Left as-is |
| `Review` | `src/types/review.ts` | Storefront PDP, Admin, Mocks | Foundation (Shared) | Left as-is |
| `InvoiceData` & derivatives | `src/types/invoice.ts` | InvoiceDocument, InvoiceViewer, OrderTracking, AdminOrders | Foundation (Shared) | Removed runtime function, left as-is |
| `Order` | `src/types/order.ts` | invoiceMapper | Foundation (Shared) | Created canonical type |

## B. Runtime Logic Found in Type Files

| File | Function | Current Responsibility | New Location | Reason |
|------|----------|------------------------|--------------|--------|
| `src/types/invoice.ts` | `mapOrderToInvoiceData()` | Transforms raw mock orders into structured InvoiceData | `src/lib/invoiceMapper.ts` | Types files must not contain runtime business logic. Relocated to temporary domain location. |

## C. Constants Inventory

| Constant Type | Description | Status |
|---------------|-------------|--------|
| Global | Application-wide settings | Directory `src/constants/` exists but is empty |
| Domain-specific | Component-local values | Currently living inside components |
| Component-specific | Styles, hardcoded data | Currently living inside components |

**Action Taken:** Left empty. Did not artificially populate the constants directory.

## D. Utility/Formatter Inventory

| Utility | Current Location | Consumers | Domain-neutral? | Action Taken |
|---------|------------------|-----------|-----------------|--------------|
| `formatCurrency` (rupees) | `src/lib/formatters/currency.ts` | 16 storefront components | Yes | Left as-is (canonical) |
| `formatCurrency` (invoice PDF) | `src/components/invoice/InvoicePDF.tsx` | Local | No (PDF-specific format) | Left as-is (intentional difference) |
| `formatCurrency` (invoice doc) | `src/components/invoice/InvoiceDocument.tsx` | Local | No (Doc-specific format) | Left as-is (intentional difference) |

## E. Foundation Dependency Violations

Searched for upward dependencies from foundation to feature/UI layers (`@/pages`, `@/features`, `@/components`, `@/app`, `../../pages`, etc.).

**Status:** Zero violations found. The foundation safely rests at the bottom of the dependency graph.

## F. Dead/Legacy Candidates

| Candidate | Evidence | Confidence | Action Taken |
|-----------|----------|------------|--------------|
| `src/pages/storefront/product/types/pdpTypes.ts` | Zero consumers after Phase 2 | 100% | Deleted |
| `src/lib/api/` | Empty directory | 100% | Deleted |
| `src/lib/utils/` | Empty directory | 100% | Deleted |
