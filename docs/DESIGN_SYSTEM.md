# Design System Guidelines

CakePopRush uses a semantic token-based design system ensuring consistency across the application. 
Tokens are defined in `src/styles/tokens.css`.

## Color Philosophy

The brand identity relies on three equally important colors, balanced by generous use of warm neutrals.
Do **not** default to pink for everything.

- **Yellow (`--color-brand-yellow`)**: Warmth, highlight, secondary actions, badges.
- **Pink (`--color-brand-pink`)**: Primary actions, pricing, active states, wishlist.
- **Turquoise (`--color-brand-turquoise`)**: Accents, specific product categories, decorative elements.
- **Chocolate (`--color-chocolate`)**: Primary text, headings, strong contrast elements.

## Typography

- **Display (`--font-family-display`)**: Fredoka (or fallback system UI) - used for headings (`h1` - `h6`).
- **Body (`--font-family-body`)**: Nunito (or fallback system UI) - used for standard text, buttons, inputs.

## Component Rules

- **Buttons**: Use explicit variants (`primary`, `secondary`, `outline`, `ghost`).
- **Responsive**: Components must fluidly adapt. Layouts use CSS Grid/Flexbox.
- **Accessibility**: 
  - Focus outlines are required (using `focus-visible`).
  - ARIA attributes should be used when native HTML semantics are insufficient.
  - Decorative elements should have `aria-hidden="true"`.
