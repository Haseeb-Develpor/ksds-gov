# KSA Skilled Development — Project Status

**Last updated:** June 29, 2026
**State:** Rebuilt from scratch per `md.plan`. Frontend builds clean; backend boots and serves the API (with graceful mock-mode fallback when MongoDB is offline).

---

## Architecture

```
saudi/
├── frontend/   ← React 18 + Vite + TS + Tailwind + Redux Toolkit + i18n (USE THIS)
├── backend/    ← Express + Mongoose + JWT + OTP REST API (USE THIS)
├── docs/        ← Documentation
├── .backup_old/ ← Previous build, preserved (safe to delete)
└── md.plan      ← Original specification
```

## Frontend (`frontend/`)
- Saudi green / gold luxury UI, glass morphism, soft shadows, dark/light mode
- i18n EN/AR with automatic RTL/LTR switching
- Home page: hero, animated stat counters, services, why-choose, leadership, testimonials, partners, newsletter CTA
- **52 services** (listing + filterable + detail pages with request form)
- **~32 content pages** (about, vision, mission, news, gallery, FAQ, legal, etc.) — data-driven
- **Hajj (14) + Umrah (14) + Visa (10) + Training (10)** module hubs + detail pages
- Auth: login, register, OTP login, forgot password
- **User dashboard** (14 sections) + **Admin panel** (21 sections)
- SEO component (meta, OG, Twitter, Schema.org, canonical), PWA manifest, robots.txt
- Live chat widget, scroll-to-top, framer-motion reveal animations
- **165+ routes** wired in `src/App.tsx`

## Backend (`backend/`)
- Express 4 + Helmet + CORS + compression + rate limiting
- Mongoose models: User, Otp, Application, Document, News, Blog, Contact, Newsletter, Notification, AuditLog
- JWT auth + OTP send/verify flow (dev returns code; Twilio-ready)
- REST routes: `/api/auth`, `/api/news`, `/api/contact`, `/api/newsletter`, `/api/applications`, `/api/admin/*`
- Optional Socket.io live chat (loads if `socket.io` installed)
- **Mock-mode fallback**: API stays fully functional even without MongoDB (great for previews)
- Seed script creates admin + sample news

---

## Run it

```bash
# Backend (terminal 1)
cd backend
cp .env.example .env        # already created
# (optional) start MongoDB, then: npm run seed
npm run dev                 # http://localhost:5000/api

# Frontend (terminal 2)
cd frontend
npm run dev                 # http://localhost:5173
```

Or from the repo root: `npm run dev` (runs both via concurrently).

**Demo admin:** `admin@ksaskilled.sa` / `Admin@123456`
(works in mock mode without a database; with MongoDB run `npm run seed` first)

## Build

```bash
cd frontend && npm run build   # ✓ verified clean
```

## Pending / optional integrations
| Item | How |
|------|-----|
| MongoDB persistence | Install/run MongoDB; set `MONGO_URI`; `npm run seed` |
| Twilio SMS OTP | Set `TWILIO_*` in `backend/.env` |
| Socket.io live chat | `npm i socket.io` in backend (client fallback works without it) |
| Cloudinary / SMTP | Set respective `.env` vars |
