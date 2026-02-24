# CodeSpheres Website - Full Project README

CodeSpheres is a full-stack coding learning platform with notes, interview preparation, handwritten PDF notes, AI doubt solving, roadmap management, and subscription features.

## Project Structure

```
Coding Notes Platform/
  backend/    # Node.js + Express + MongoDB API
  frontend/   # React + Vite web application
```

## Documentation Index

- Backend API docs: `backend/reademe.md`
- Frontend docs: `frontend/reademe.md`
- Existing backend guide: `backend/README.md`

## Core Features

- Email + OTP authentication
- Google OAuth login
- Notes browsing with chapter/topic structure
- Interview question practice (filter by topic/role/company/difficulty)
- Roadmap exploration and admin roadmap builder
- Handwritten PDF notes with preview/download tracking
- Paid subscription workflow (Razorpay)
- AI doubt assistant for paid users
- Admin dashboard for users, notes, interview questions, PDFs, and roadmaps

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT auth
- Passport Google OAuth
- ImageKit (file hosting)
- Nodemailer (email)
- Razorpay (payments)
- Gemini API (AI responses)

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)

## Local Setup

## 1) Clone and open project
```bash
git clone <your-repo-url>
cd "Coding Notes Platform"
```

## 2) Setup backend
```bash
cd backend
npm install
```

Create `backend/.env` with required keys (example):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
EMAIL_USER=...
EMAIL_PASSWORD=...
ADMIN_EMAIL=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GEMINI_API_KEY=...
WEBSITE_NAME=CodeSpheres
```

Run backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

## 3) Setup frontend
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## NPM Scripts

### Backend (`backend/package.json`)
- `npm run dev` -> start with nodemon
- `npm start` -> start server
- `npm run seed:mern` -> seed MERN notes

### Frontend (`frontend/package.json`)
- `npm run dev` -> start Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview built app
- `npm run lint` -> run ESLint

## Environment & Security Notes

- Never commit real secrets in `.env` files.
- Keep JWT, payment keys, email app-passwords, and API keys private.
- Use separate keys and DB for production.
- Restrict CORS origin to the deployed frontend domain.

## Deployment Overview

- Deploy backend and frontend separately (both have `vercel.json` files).
- Set all environment variables in your hosting dashboard.
- Update frontend `VITE_API_BASE_URL` to deployed backend API URL.
- Ensure backend `FRONTEND_URL` matches deployed frontend URL.

## API Coverage

All backend endpoint details (inputs + responses) are documented in:
- `backend/reademe.md`

Frontend architecture and API integration details are documented in:
- `frontend/reademe.md`

## Quick Sanity Check

1. Start backend (`npm run dev` in `backend`).
2. Start frontend (`npm run dev` in `frontend`).
3. Open `http://localhost:5173`.
4. Test login, notes, interview pages, and dashboard flow.
5. For paid features, complete subscription setup and test status refresh.
