# Validation Architecture Audit (Phase 10)

This document audits the current state of form validation in CakePopRush and outlines the future migration path for schema-based validation.

## 1. Current State of Validation

Forms across the application rely heavily on manual `useState` logic or bypass validation entirely.

- **CheckoutDeliveryPage & AddressModal**: Manual tracking of inputs. `AddressDrawer` only validates whether a step is complete based on simple string checks. There is no validation for phone number formats or pincode formats.
- **AdminAddProduct**: Uses raw `useState` for all fields (name, price, stock, category). Employs very basic required checks on submit but lacks strict numerical boundary checks or image type validation.
- **AdminUsers**: Contains inline JSX validation logic:
  ```ts
  if (!newUser.email) setAddError('Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(newUser.email)) setAddError('Please enter a valid email');
  ```

## 2. Issues Identified
- **Duplicated Logic**: Email regex and required field checks are repeated across multiple components (e.g. `AdminUsers`, `ContactPage`).
- **Business Logic in JSX**: Validation constraints (like checking if price > 0) are living inside component submit handlers rather than reusable domains.
- **Lack of Schema**: Since there is no schema definition, it is impossible to share validation logic between the frontend and the future backend.

## 3. Pure Validation Utilities Extracted

To begin standardizing validation without prematurely installing form libraries, we should extract common rules into pure functions. 

*(Note: In the future, these pure utilities will be replaced by Zod schemas.)*

```typescript
// Example: src/lib/validation/validation.ts (Future foundation)
export const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
export const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);
export const isValidPincode = (pincode: string) => /^\d{6}$/.test(pincode);
```

## 4. Future Migration Path (Post-Phase 10)

When API integration begins, we will migrate to a schema-driven approach to ensure data integrity before it reaches the backend.

### Proposed Stack
- **Zod**: For defining single-source-of-truth schemas.
- **React Hook Form**: For performant, uncontrolled form state management.
- **@hookform/resolvers**: To bridge Zod schemas directly into React Hook Form.

### Migration Strategy
1. Create domain schemas (`src/lib/validations/address.schema.ts`, `product.schema.ts`).
2. Wrap `AddressModal` and `AdminAddProduct` with `useForm({ resolver: zodResolver(schema) })`.
3. Use the same Zod schemas to parse and validate incoming API data to protect against invalid backend responses.
