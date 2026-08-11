# 🚀 CakePopRush

CakePopRush is a modern, responsive, frontend-only e-commerce application for premium handcrafted desserts. Built with React 19 and Vite 8, it showcases a fully functional storefront, shopping cart, user profile, and an extensive admin dashboard.

## 🛠️ Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Language**: TypeScript
- **Routing**: React Router v7
- **Styling**: Vanilla CSS Modules (Token-based Design System)
- **State Management**: React Context / Zustand / React Query
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📂 Project Structure

- `/src/components` - Reusable UI, Layout, and Commerce components
- `/src/pages/storefront` - Customer-facing e-commerce pages
- `/src/pages/admin` - Administrative dashboard and management tools
- `/src/components/mascot` - Interactive SVG mascot system
- `/src/lib` - State stores, API utilities, and formatting helpers
- `/src/styles` - Global CSS tokens, reset, and typography

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Dhanush1376/CakePopRush.git
cd CakePopRush

# Install dependencies
npm install
```

### Development

```bash
# Start the Vite development server
npm run dev
```

### Production Build

```bash
# Build the application for production
npm run build

# Preview the production build locally
npm run preview
```

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel as a Single Page Application (SPA).
A `vercel.json` file is included to handle client-side routing fallback automatically.

1. Import the repository in your Vercel dashboard.
2. The default build settings (`npm run build` and `dist` directory) will be auto-detected.
3. Deploy!

## 🔐 Environment Variables

This is a mock-driven frontend application. No real backend API exists. However, if connecting to a real backend in the future, configure your `.env` based on the `.env.example`:

```env
VITE_API_BASE_URL=
VITE_STOREFRONT_URL=
```

*(Do not commit secrets to `.env` or the repository.)*
