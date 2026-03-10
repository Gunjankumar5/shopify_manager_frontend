# Shopify Manager Frontend

Frontend application for managing Shopify products, collections, inventory, and bulk uploads.

## Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- Tailwind CSS 3
- PostCSS + Autoprefixer

## Features

- Product management
  - List, search, create, edit, and sync products
  - Support for multiple product images (file upload and URL)
- Collections management
  - List, create, edit, and delete custom collections
  - Collection image upload support
- Inventory management
  - View locations and inventory levels
  - Update inventory quantity by location
- Bulk upload workflow
  - Preview CSV/Excel data
  - Parse and validate products before upload
  - Push validated products to Shopify with duplicate handling

## Project Structure

```
frontend/
  src/
    api/
      config.js
    pages/
      ProductsPage.jsx
      CollectionsPage.jsx
      InventoryPage.jsx
      UploadPage.jsx
    App.jsx
    main.jsx
```

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended
- Backend API running locally

## Environment and API

The frontend currently uses this API base URL:

- `http://localhost:8000/api`

Defined in `src/api/config.js`.

If your backend URL changes, update that file.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the app in your browser:

- Vite usually serves at `http://localhost:5173`

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run start` - alias for Vite dev server

## Build for Production

```bash
npm run build
npm run preview
```

## Notes

- This repository contains the frontend only.
- Ensure the backend routes used by pages are available under `/api`.
- If CORS errors occur, allow requests from your Vite origin (for example, `http://localhost:5173`) on the backend.

## Troubleshooting

- Dev server fails to start:
  - Run `npm install` again and retry `npm run dev`
  - Check Node.js version (`node -v`)
- API requests fail:
  - Verify backend is running on `http://localhost:8000`
  - Confirm routes exist and return valid JSON
