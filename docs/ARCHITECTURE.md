# Architecture & Implementation Guidelines

This project uses a modern React architecture focusing on standard tooling, semantic CSS, and clear abstraction boundaries.

## Tech Stack
- **Framework:** React 19 + Vite 8
- **Language:** TypeScript 7
- **Routing:** React Router v6
- **Server State:** TanStack React Query v5
- **Styling:** CSS Modules with CSS Variables (Tokens)
- **Icons:** Lucide React

## Abstraction Boundaries

- **`components/ui/`**: 
  - Pure, generic primitives (`Button`, `Input`, `Skeleton`).
  - No domain logic. Highly reusable.
  - Consumes design tokens.

- **`components/layout/`**:
  - Structural components (`Header`, `Footer`, `Container`).
  - Manages page-level organization but not business logic.

- **`components/commerce/`**:
  - E-commerce specific primitives (`ProductCard`, `Price`, `QuantitySelector`).
  - Expects domain-specific props (e.g., `amountInPaise`, `Product` type).

- **`components/decorative/`**:
  - Brand-specific visual elements (`Balloon`, `WavyDivider`, `ConfettiDots`).
  - Must remain lightweight (prefer SVG/CSS over JS).

- **`features/`**:
  - Distinct business domains (`cart/`, `checkout/`, `products/`).
  - Contains domain-specific components, hooks, and logic.

- **`lib/`**:
  - Reusable utility functions (`formatters/currency.ts`).
  - Independent of React components.

- **`styles/`**:
  - Global CSS setup and foundational design tokens (`tokens.css`).
  - Resets, typography, and global animations.
