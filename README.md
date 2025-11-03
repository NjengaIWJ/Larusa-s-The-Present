# The Present — Virtual Gift Shop

This workspace contains a full-stack scaffold for "The Present" — a virtual gift shop (frontend + backend).

This scaffold includes:
- Backend: Express + TypeScript, JWT auth, Mongoose models, product and order endpoints, Multer + Cloudinary upload route, and a seed script.
- Frontend: Vite + React + TypeScript, basic pages for login/register/product listing, and Zustand stores for auth/cart.

See `/backend` and `/frontend` for details.

Next steps:
1. Fill in real Cloudinary credentials in `backend/.env` (see `.env.example`).
2. Run `npm install` in both `backend` and `frontend`.
3. Run backend in dev: `npm run dev` (from `/backend`).
4. Run frontend dev: `npm run dev` (from `/frontend`).

I'll scaffold more features (admin panel, full frontend wiring, tests) next if you'd like.
