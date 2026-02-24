# Frontend Documentation (`reademe`)

This document explains the frontend architecture, routing, auth flow, environment configuration, and API integration for the CodeSpheres website.

## 1. Tech Stack

- React 19 + TypeScript
- Vite 7
- React Router DOM 7
- Tailwind CSS
- Radix UI primitives
- `react-hot-toast` for notifications
- `@dnd-kit/*` for drag/drop (admin roadmap workflows)

## 2. Project Structure

```
frontend/
  src/
    App.tsx               # Route map + global wrappers
    main.tsx              # React entry
    contexts/
      AuthContext.tsx     # Auth/session state
    lib/
      api.ts              # All backend API wrappers
    components/           # Reusable UI and feature components
    pages/                # Route-level page components
    styles/               # Global and module styles
```

## 3. Environment Variables

Frontend reads backend URL from:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If missing, the app defaults to: `http://localhost:5000/api`.

## 4. Run & Build

### Install dependencies
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

### Production build
```bash
npm run build
npm run preview
```

## 5. App Boot Flow

- `src/main.tsx` mounts `App`.
- `App.tsx` wraps routes with:
  - `BrowserRouter`
  - `AuthProvider`
  - `SmoothScroll`
  - `Toaster`
- `AppRoutes` waits for auth state unless on `/auth/callback`.

## 6. Authentication System

`AuthContext` stores:

- `user`
- `token`
- `isLoading`
- `isAdmin`
- `isPaid`
- `login()` / `logout()` / `refreshSubscriptionStatus()`

Behavior:

1. Reads token + user from `localStorage` on app start.
2. Restores session if data is valid.
3. Automatically checks subscription expiry (immediate + periodic).
4. Maintains role-based guards via `ProtectedRoute`.

`localStorage` keys used:
- `token`
- `user`
- `isAdmin`

## 7. Route Map (from `App.tsx`)

### Public Routes
- `/`
- `/interview`
- `/interview/:roleId` (redirects to role question page)
- `/interview/question/:id`
- `/interview-questions/company/:companySlug`
- `/interview-questions/role/:roleSlug`
- `/interview-questions/difficulty/:difficultySlug`
- `/interview-questions/:topicSlug`
- `/roadmap`
- `/roadmap/:id`
- `/subscribe`
- `/contact`
- `/about`
- `/login`
- `/auth/callback`
- `/privacy`
- `/terms`
- `/feedback`
- `/admin/login`

### Protected User Routes
- `/notes`
- `/notes/:chapterId`
- `/notes/:chapterId/:topicSlug`
- `/profile`
- `/dashboard`
- `/handwritten-notes`
- `/handwritten-notes/:id`
- `/premium-handwritten-notes`

### Protected Admin Routes
- `/admin/dashboard`
- `/admin/users`
- `/admin/notes`
- `/admin/notes/new`
- `/admin/notes/:id/edit`
- `/admin/topics`
- `/admin/interviews`
- `/admin/interviews/new`
- `/admin/interviews/:id/edit`
- `/admin/pdfs`
- `/admin/roadmaps`
- `/admin/pages`
- `/admin/settings`

## 8. Frontend API Layer (`src/lib/api.ts`)

`API_BASE_URL` is derived from env and all modules call backend using `fetch`.

### Exported API modules

- `authAPI`
- `notesAPI`
- `chaptersAPI`
- `interviewAPI`
- `pdfsAPI`
- `usersAPI`
- `contactAPI`
- `roadmapsAPI`
- `subscriptionAPI`
- `aiAPI`

### Utility exports

- `getPDFViewUrl(pdfUrl)`
- `getPDFEmbedUrl(pdfUrl)`
- `getPDFStreamUrl(id)`
- `getPDFDirectUrl(id)`

These helpers normalize ImageKit/Cloudinary URLs and support in-app PDF embedding through `public/pdfjs/embedded.html`.

## 9. API Usage Patterns

### Protected requests
Send token in header:

```ts
headers: { Authorization: `Bearer ${token}` }
```

### JSON requests
Use:

```ts
headers: { "Content-Type": "application/json" }
```

### File uploads
Use `FormData` for:
- PDF upload (`pdfsAPI.upload`)
- Avatar upload (`usersAPI.uploadAvatar`)

### Binary downloads
PDF endpoints return `Blob` and should be handled as downloadable files or object URLs.

## 10. Feature-to-API Mapping

- Login / OTP / profile → `authAPI`
- Notes listing/detail/admin CRUD → `notesAPI`
- Chapter listing/admin management → `chaptersAPI`
- Interview filters/detail/admin + PDF export → `interviewAPI`
- Handwritten notes PDFs + admin upload → `pdfsAPI`
- Dashboard + save/unsave + profile → `usersAPI`
- Contact & feedback forms → `contactAPI`
- Roadmap list/detail/admin tree operations → `roadmapsAPI`
- Payments/subscription status → `subscriptionAPI`
- AI doubt resolution (paid users) → `aiAPI`

## 11. Styling & UI Notes

- Tailwind theme is token-based (HSL CSS variables).
- Dark mode strategy: class-based (`darkMode: ["class"]`).
- UI uses reusable components in `src/components` and pages in `src/pages`.

## 12. Deployment Notes

- Build output is Vite standard (`dist/`).
- Ensure `VITE_API_BASE_URL` points to deployed backend (for production).
- Verify backend CORS allows deployed frontend domain.

## 13. Troubleshooting

### Frontend cannot call backend
- Check `VITE_API_BASE_URL`.
- Ensure backend is running and reachable.
- Verify CORS origin in backend `.env` (`FRONTEND_URL`).

### Protected routes redirect unexpectedly
- Check `token` and `user` in `localStorage`.
- Confirm JWT is valid and not expired.

### Paid-only features blocked
- Verify `isPaid` from backend subscription status.
- Refresh session after payment verification.
