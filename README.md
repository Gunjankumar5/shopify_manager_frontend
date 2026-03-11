# Shopify Manager Frontend

Frontend application for managing Shopify products, collections, inventory, and bulk uploads.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- PostCSS + Autoprefixer

## Features

- **Product management** — List, search, create, edit, delete, and sync products from Shopify. Bulk price adjustment and duplicate removal.
- **Collections management** — CRUD for custom collections with image upload support.
- **Inventory management** — View locations and inventory levels, update quantities by location.
- **Bulk upload** — Import CSV/Excel files, preview & edit data, then push to Shopify with duplicate handling.

## Project Structure

```
src/
  api/
    api.js            # Centralized fetch helpers (get, post, put, delete, upload)
    config.js         # API origin & endpoint configuration
  components/
    GlobalStyles.jsx  # CSS variables & global styles
    Icons.jsx         # SVG icon set & Ico/Spin components
    Modals.jsx        # EditModal, PriceModal
    ProductCard.jsx   # Product card component
    Sidebar.jsx       # Navigation sidebar
    Toast.jsx         # Toast notification system
    UI.jsx            # Badge, Modal, Field components
  pages/
    ProductsPage.jsx
    CollectionsPage.jsx
    InventoryPage.jsx
    UploadPage.jsx
  App.jsx             # Root layout (sidebar + page switcher)
  main.jsx            # Entry point
  index.css           # Tailwind directives
```

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Setup

API configuration is controlled via a single `.env` file in the project root.

Switch between dev and prod by commenting/uncommenting:

```env
# Dev (local backend)
VITE_API_ORIGIN=http://127.0.0.1:8000

# Prod (Railway backend)
# VITE_API_ORIGIN=https://shopifymanagerbackend-production-b50f.up.railway.app
```

If `VITE_API_ORIGIN` is not set, it defaults to `http://127.0.0.1:8000`.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure the API origin in `.env` (see above).

3. Start development server:

```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Available Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server         |
| `npm run build`   | Create production build          |
| `npm run preview` | Preview production build locally |
| `npm start`       | Alias for Vite dev server        |

## Notes

- This repository contains the frontend only.
- Ensure the backend is running at the origin specified in `.env`.
- If CORS errors occur, allow requests from your Vite origin on the backend.

- Dev server fails to start:
  - Run `npm install` again and retry `npm run dev`
  - Check Node.js version (`node -v`)
- API requests fail:
  - Verify backend is running on `http://localhost:8000`
  - Confirm routes exist and return valid JSON
