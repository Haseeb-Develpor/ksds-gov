# KSA Skilled Development

Enterprise web portal for skilled workforce development in Saudi Arabia.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Redux Toolkit, React Query
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Socket.io
- **Features:** 160+ pages, 52 services, Hajj/Umrah/Visa modules, User & Admin dashboards

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB running locally or Atlas connection string

### Installation

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Default Admin

- Email: `admin@ksaskilled.sa`
- Password: `Admin@123456`

### URLs

- Frontend: http://localhost:5173
- API: http://localhost:5000/api
- API Docs: http://localhost:5000/api/docs

## Project Structure

```
saudi/
├── frontend/          # React Vite app
│   └── src/
│       ├── app/       # Router, store, providers
│       ├── components/# UI, layout, shared
│       ├── data/      # Services, pages, content
│       └── features/  # Home, auth, dashboard, admin
├── backend/           # Express API
│   └── src/
│       ├── models/    # MongoDB schemas
│       ├── routes/    # REST endpoints
│       ├── services/  # Business logic
│       └── sockets/   # Socket.io chat
└── docs/              # Documentation
```

## Environment Variables

See `backend/.env.example` for Twilio, Cloudinary, SMTP configuration.

## License

Proprietary - KSA Skilled Development
