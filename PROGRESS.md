# Tailoryy Build Progress

- [x] Phase 1  — Project setup & design system
- [x] Phase 2  — Database models & migrations
- [x] Phase 3  — Authentication (backend + frontend)
- [x] Phase 4  — Public pages
- [x] Phase 5  — Live chat & DM system
- [x] Phase 6  — Order placement wizard
- [x] Phase 7  — Customer dashboard
- [x] Phase 8  — Admin panel
- [x] Phase 9  — Backend routes (complete)
- [x] Phase 10 — Email notifications
- [x] Phase 11 — Seed data
- [x] Phase 12 — Polish & production readiness

---

## What's Built

### Backend (FastAPI + SQLite)
- Full REST API at `http://localhost:8000`
- Auth: JWT + bcrypt password hashing + Firebase Google OAuth
- Models: User, Order, Portfolio, Fabric, Review, WishlistItem, Message, Conversation, Notification, PromoCode
- All CRUD routers: auth, orders, portfolio, fabrics, reviews, payments, messages, wishlist, users, notifications, contact, uploads
- Email service via Resend (graceful fallback in dev)
- Razorpay payment integration (demo mode when keys not set)
- Cloudinary image uploads (placeholder in dev)
- Rate limiting via slowapi
- Seed data: admin user, 5 customers, 20 portfolio items, 15 fabrics, 12 orders, reviews, promo codes

### Frontend (React + Vite + Tailwind)
- Design system: CSS variables + Tailwind tokens (ivory/terracotta/espresso palette)
- UI components: Button, Input, Textarea, Select, Modal, Badge, Spinner, Card, Divider, Avatar, Skeleton
- Navbar (sticky, blur, mobile drawer), Footer
- Auth: Login + Register with Google OAuth (Firebase)
- Public pages: Home (all sections), Portfolio, How It Works, Services, Fabric Catalogue, Contact, FAQ
- Customer: Dashboard, Orders, Order Detail, Order Form (7-step wizard), Profile, Wishlist, Messages
- Admin: Dashboard, Orders, Order Detail, Messages, Portfolio, Fabrics, Customers, Reviews, Promo Codes
- Tawk.to live chat integration + custom ChatFAB
- React Query for data fetching + caching
- Zustand for auth + notification state

---

## Running Locally

### Backend
```bash
cd backend
venv/Scripts/activate      # Windows
# or: source venv/bin/activate  (Mac/Linux)
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

### Seed Database
```bash
cd backend
venv/Scripts/python -m app.seed
# Admin: admin@tailoryy.com / Admin@123
# Customer: priya.sharma@gmail.com / Customer@123
```

### API Docs
Visit `http://localhost:8000/docs` for the interactive Swagger UI.
