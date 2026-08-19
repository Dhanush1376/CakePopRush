# CakePopRush — Architecture Contract

This document defines the architectural rules, layered structure, folder ownership, dependency direction, and coding guidelines for the CakePopRush frontend application.

This is a **living document**. It is updated as the architecture evolves.

---

## Tech Stack

| Concern          | Technology                                  |
|------------------|---------------------------------------------|
| Framework        | React 19 + Vite 8                           |
| Language         | TypeScript 6                                |
| Routing          | React Router v7                             |
| Server State     | TanStack React Query v5 (installed, unused) |
| Client State     | React Context + useReducer                  |
| Styling          | CSS Modules + CSS Custom Properties         |
| Animation        | Framer Motion + GSAP-style manual anims     |
| Icons            | Lucide React                                |
| PDF              | @react-pdf/renderer                         |
| Maps             | Leaflet + React-Leaflet                     |

---

## Architectural Layers

The project follows a strict top-down dependency model. Each layer may only import from layers at the same level or below — never upward.

```text
APP  (src/app, src/main.tsx, src/App.tsx)
│
├── Routing (router.tsx)
├── Providers (providers.tsx)
└── Global configuration
        │
        ▼
PAGES  (src/pages)
│
├── Route-level composition
└── Page orchestration (composes features + components)
        │
        ▼
FEATURES  (src/features)
│
├── Business/domain functionality
├── Feature components
├── Feature hooks
├── Feature state
├── Feature API
├── Feature types
└── Feature utilities
        │
        ▼
SHARED COMPONENTS  (src/components)
│
├── UI primitives (ui/)
├── Layout components (layout/)
├── Commerce primitives (commerce/)
├── Decorative elements (decorative/)
├── Mascot subsystem (mascot/)
├── Auth UI (auth/)
├── Invoice rendering (invoice/)
├── Error handling (error/)
└── Icon definitions (icons/)
        │
        ▼
FOUNDATION  (src/lib, src/types, src/styles, src/mocks)
│
├── API client (lib/api/)
├── Utilities (lib/utils/)
├── Formatters (lib/formatters/)
├── Shared types (types/)
├── Design tokens (styles/)
├── Mock data (mocks/) — temporary data provider
└── Constants (constants/)
```

### Import Direction Rule

```text
app  →  pages  →  features  →  shared components / lib
```

- A lower-level module must **never** depend on a higher-level module.
- Shared components must **not** import from pages.
- Generic UI must **not** import from features.
- Foundation must **not** import from components, features, or pages.
- Circular dependencies are prohibited.

---

## Folder Ownership

### `src/app`

Only application bootstrap and configuration.

**Allowed contents:**
- `router.tsx` — route definitions
- `providers.tsx` — global React providers (QueryClient, Toast, Cart, Wishlist)
- Global app configuration files

**Not allowed:** Business logic, domain components, data transformations.

---

### `src/pages`

Pages are **route-level composition**. A page answers: *"What does this route render?"*

A page may:
- Import and compose feature components
- Import shared UI components
- Contain page-specific layout logic
- Contain page-specific CSS Modules

A page should **not** become the place for:
- Reusable domain logic
- API implementation
- Giant state machines
- Large data transformations
- Reusable UI sections

The current page organization:
```text
pages/
├── admin/           # Admin panel pages
├── error/           # Error pages (404, 500, network)
└── storefront/      # Customer-facing pages
    ├── cart/
    ├── checkout/
    ├── custom-orders/
    ├── home/
    ├── info/
    ├── legal/
    ├── orders/
    ├── product/
    ├── profile/
    ├── shop/
    └── wishlist/
```

---

### `src/features`

The primary home for domain/business functionality.

**Target feature structure:**
```text
src/features/<feature>/
├── api/           # Data fetching, API calls
├── components/    # Feature-specific UI
├── hooks/         # Feature-specific hooks
├── state/         # Feature state management
├── types/         # Feature-specific types
├── utils/         # Feature-specific utilities
└── index.ts       # Public API (optional)
```

Not every feature requires every subdirectory. Only create directories when actual code is migrated.

**Current features:**
```text
features/
├── products/       # Product domain UI logic and state
├── reviews/        # Review presentation and logic
├── cart/           # Cart-domain UI components
├── wishlist/       # Wishlist-domain UI components
└── orders/         # Order data types and definitions
```

**Important:** Do not create empty feature directories. The architecture must represent reality, not aspiration.

---

### `src/components/ui`

Only reusable, **domain-neutral** UI primitives.

Examples: Button, Input, Badge, Modal, Skeleton, Pagination, Toast, Spinner, Accordion, IconButton, ImageModal, ValidationBubble.

A UI primitive must **not** contain knowledge about orders, products, customers, coupons, admin, checkout, or wishlist. If a component contains business/domain knowledge, it does not belong in generic UI.

---

### `src/components/layout`

Only reusable application layout components.

Examples: Header, Footer, DesktopNav, MobileNav, BottomNavigation, Container, SideDrawer.

---

### `src/components/commerce`

Only genuinely **reusable** commerce components that are used across multiple pages/features.

Examples: ProductCard, Price, QuantitySelector, ProductImage, CategoryChip, SearchBar, SideCart, WishlistButton.

Do not place page-specific product UI here.

---

### `src/components/mascot`

The mascot system is a **specialized subsystem** and must remain independently maintainable.

```text
mascot/
├── animations/      # Animation definitions + timelines
├── config/          # Mascot configuration + constants
├── effects/         # Particle effects
├── hooks/           # Mascot-specific hooks
├── orchestration/   # Emotion controller + event mapping
├── parts/           # SVG body parts (eyes, mouth, body, etc.)
├── poses/           # Named pose definitions
├── primitives/      # Low-level animation primitives
└── reactions/       # Named reaction sequences
```

Do **not** flatten, merge, or simplify the mascot architecture. It is designed for extensibility and independent iteration.

---

### `src/components/decorative`

Brand-specific visual elements: Balloon, WavyDivider, ConfettiDots, Bunting.

Must remain lightweight (prefer SVG/CSS over JS).

---

### `src/components/auth`

Authentication-related UI: AuthModal.

---

### `src/components/invoice`

Invoice rendering: InvoiceDocument, InvoicePDF, InvoiceViewer.

---

### `src/components/error`

Error boundary components.

---

### `src/lib`

Only application infrastructure and generic utilities.

```text
lib/
├── api/           # Shared API client (future)
├── formatters/    # Generic formatters (currency.ts)
├── utils/         # Generic utilities (future)
├── cartStore.tsx  # Cart state (→ migrate to features/cart/state/)
└── wishlistStore.tsx  # Wishlist state (→ migrate to features/wishlist/state/)
```

Do not use `lib/` as a dumping ground. State stores currently here should migrate to their respective features in a future phase.

---

### `src/mocks`

Mock data is allowed and **must remain available** during client approval.

```text
mocks/
├── products.ts    # Product catalog + selector functions
├── reviews.ts     # Review data
└── adminData.ts   # Admin dashboard mock data
```

**Mock data rule:** Mock data is a temporary implementation of a data source and must never become the permanent business logic layer.

**Current state (acceptable for now):**
```text
UI → import mockProducts directly
```

**Target state (future phases):**
```text
UI → Feature hook → Data provider → Mock provider OR API provider
```

Do not remove, reduce, or alter mock data for architectural cleanliness.

---

### `src/types`

Only shared types that genuinely cross multiple features.

Currently contains:
- `product.ts` — Product type hierarchy (used by mocks, stores, pages, components)
- `invoice.ts` — Invoice types + `mapOrderToInvoiceData()` function

Feature-specific types should eventually live inside their feature.

---

### `src/styles`

Only truly global styles:
- `tokens.css` — Design tokens (colors, spacing, typography, radii, shadows, motion, z-index)
- `reset.css` — CSS reset
- `typography.css` — Font definitions
- `animations.css` — Global keyframe animations
- `globals.css` — Root import + global rules

Do not move page-specific or component-specific CSS here.

---

## API Boundary Rules

The desired data-access direction:

```text
Component
   ↓
Feature Hook
   ↓
Feature API
   ↓
Shared API Client (src/lib/api/)
   ↓
Backend
```

Avoid:
```text
Component → fetch(...)
Component → axios(...)
```

The UI should not know how the backend is implemented.

**Current state:** No direct `fetch()`, `axios()`, or `XMLHttpRequest` calls exist. All data comes from mock imports. TanStack React Query is installed and configured but not yet used for data fetching.

---

## State Ownership

### Local UI State

Examples: modal open/close, dropdown visibility, selected tab, temporary input values, hover state.

Keep inside the component. Do not lift to global state unless multiple components need it.

### Feature State Ownership

Examples: cart contents, wishlist items, checkout flow, authentication status, product configuration.

Belongs in the appropriate feature module:
- **Cart**: `src/features/cart/state/`
- **Wishlist**: `src/features/wishlist/state/`

**State initialization**: `src/app/providers.tsx` is responsible for injecting initial data (derived from data providers) into feature state providers.
**Data source**: `features/products/api/` (via provider boundary). Feature state modules must NEVER import raw mocks directly.

#### API Integration Note
The current state architecture is:
```text
Product provider → App initialization → Feature state
```
Future server synchronization may become:
```text
Feature state ↔ Server/API state
```

### State vs Server State
This distinction must remain explicit:
- **Client state**: Currently cart and wishlist. Belongs to feature state.
- **Server/domain data**: Currently products and reviews. Belongs behind data providers.

Eventually belongs behind API/data-access boundaries, managed by TanStack React Query or equivalent. Do not introduce a new server-state library unless the existing project requires it.

---

## Component Size Guidelines

These are guidelines, not hard rules. Large files are **not** automatically bad.

| Type                | Recommended Range | Split Rule                      |
|---------------------|-------------------|---------------------------------|
| UI primitive        | 20–150 LOC        | Split by responsibility         |
| Reusable component  | 50–250 LOC        | Split by responsibility         |
| Feature component   | 50–300 LOC        | Split by responsibility         |
| Page component      | 50–250 LOC        | Split by responsibility         |

> If a file contains multiple independent responsibilities, split it.
> Do not split a component merely to make the LOC number smaller.

---

## 3. Mock Data Rules

1. **Phase 2 Status:** The UI layer no longer imports mock data directly.
2. **Provider Interfaces:** Data access is abstracted via provider interfaces (e.g. `ProductDataProvider`) located in `src/features/<domain>/api/`.
3. **Data Access:** Features expose a stable data-access object (e.g. `productData`, `reviewData`) which implements the provider interface. UI components import this object, not the mocks.
4. **Thin Adapters:** Mock providers (e.g. `mockProductDataProvider`) are thin adapters that wrap the underlying mock files in `src/mocks/`. They do not duplicate data.
5. **Admin Exception:** The 8 admin dashboard components intentionally bypass this rule and import mocks directly. They are safe temporary consumers awaiting the Admin Feature Architecture phase.
6. **Design System Exception:** `DesignSystemPage` imports mocks directly for component previews.

## 4. Shared Foundation Architecture

- **`src/types/`**: Shared cross-domain types only (e.g., `Product`, `Review`, `InvoiceData`, `Order`).
- **`src/lib/`**: Infrastructure, generic formatters, and temporary feature state waiting for migration.
- **`src/lib/invoiceMapper.ts`**: **Temporary domain location** for invoice transformation. Awaits Invoice Feature Architecture phase.
- **`src/lib/formatters/`**: Generic formatters (currently: `formatCurrency`).
- **`src/constants/`**: Cross-application constants (currently empty, reserved for future use).
- **`src/styles/`**: Global design system foundation (tokens, reset, typography, animations, globals).

## 5. API Boundaries.
- Global CSS stays in `src/styles/`.
- Avoid giant unrelated CSS files.
- Avoid duplicated design tokens — reuse `src/styles/tokens.css` variables.
- Do not introduce arbitrary color values when a design token already exists.

---

## CSS Rules

- **Keep CSS Modules.** Do not migrate to Tailwind or another framework.
- Component-specific CSS stays with the component.
- Feature-specific CSS stays with the feature.
- Global CSS stays in `src/styles/`.
- Avoid giant unrelated CSS files.
- Avoid duplicated design tokens — reuse `src/styles/tokens.css` variables.
- Do not introduce arbitrary color values when a design token already exists.

---

## Barrel File Policy

Use `index.ts` only where it provides a **real public boundary**.

**Appropriate:**
- `features/products/index.ts` — public API for the products feature
- `components/mascot/index.ts` — public API for the mascot subsystem

**Not appropriate:**
- `index.ts` inside every directory automatically
- Deep import chains that obscure dependency tracing

---

## Dependency Direction (Enforced)

```text
src/app/
  → may import: pages, features, components, lib, types, styles
  → must not import: mocks (except indirectly via stores)

src/pages/
  → may import: features, components, lib, types, mocks, styles
  → must not import: app

src/features/
  → may import: components, lib, types, mocks, styles
  → must not import: app, pages

src/components/
  → may import: lib, types, styles, other components
  → must not import: app, pages, features

src/lib/
  → may import: types
  → must not import: app, pages, features, components

src/mocks/
  → may import: types
  → must not import: app, pages, features, components, lib

src/types/
  → may import: nothing (pure type definitions)
  → must not import: anything
```

## Server State & API Architecture (Phase 9)

The application maintains a strict separation between client state (Cart, Wishlist) and server state (Products, Orders, Admin).
Currently, the frontend is powered by a synchronous mock provider architecture. In the future, this will transition seamlessly to real API calls without requiring UI refactoring.

```text
                  APP
                   │
                 PAGES
                   │
                FEATURES
                   │
          ┌────────┴────────┐
          │                 │
     Client State       Server State
          │                 │
    Cart / Wishlist     Future RQ
                            │
                       Data Provider
                       /           \
                    Mock           API
                   (Current)     (Future)
                                    │
                               API Client
```

### Key Principles

1. **Mock Preservation**: The mock providers (`mockProductDataProvider`, `mockOrderDataProvider`, etc.) are fully synchronous and preserved. The application remains functional without a backend.
2. **Provider Boundary**: No component should import raw mock data (e.g., `import { mockProducts } from '@/mocks'`). All data must flow through feature-level Data Provider interfaces.
3. **React Query Deferral**: React Query is installed but intentionally unused for mock data. `useQuery` hooks will only be introduced during the actual API integration phase to avoid unnecessary async complexity.
4. **Shared API Foundation**: The core HTTP abstractions (`src/lib/api/client.ts` and `src/lib/api/errors.ts`) provide the foundation for future real API providers.
5. **Query Key Conventions**: Feature-specific API keys (`queryKeys.ts`) define deterministic caching boundaries for future React Query usage.
