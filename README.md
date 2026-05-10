# Tailoryy Lite -- Premium Custom-Stitching Fashion Platform

A full-stack made-to-order fashion e-commerce platform for the Indian market. Customers can order custom-tailored garments by providing inspiration images, measurements, and fabric preferences. Tailoryy's artisans stitch the garment from scratch and ship it home.

**Tagline:** *Your Dream Outfit, Stitched to Perfection.*

## Features

### Customer-Facing
- **Three service models:** Custom Stitch (design from scratch), Upcycle It (transform old garments), Bring Your Fabric (send personal fabric)
- **Multi-step order wizard** with progress tracking
- **Full order lifecycle tracking:** pending > confirmed > cutting > stitching > quality check > shipped > delivered
- **Razorpay payment integration** with 50% advance + 50% before dispatch model (demo mode when keys not set)
- **Portfolio/lookbook** with category filtering (Lehenga, Saree, Kurta, Indo-Western, Upcycled, Western)
- **Fabric catalogue** with type and color family filtering, per-metre pricing
- **Wishlist** for saving portfolio items
- **In-app messaging** between customer and admin/tailor
- **Customer reviews** with star ratings
- **Promo/discount codes** at checkout (percentage or flat, with min order, max uses, expiry)
- **PDF order receipts** generated client-side
- **Tawk.to live chat** and **WhatsApp** integration

### Admin Panel
- **Dashboard** with order stats, revenue overview, and charts
- **Order management** with status updates, artisan assignment, tracking numbers, pricing
- **Portfolio CRUD** management
- **Fabric catalogue CRUD** management
- **Customer list** and **conversation management** with reply
- **Review approval/rejection** workflow
- **Promo code CRUD** management

### Technical
- **JWT + bcrypt authentication** with optional **Google OAuth** (Firebase)
- **Cloudinary image uploads** (placeholder fallback in dev)
- **Transactional email notifications** via Resend (welcome, order confirmation, status updates)
- **Rate limiting** via slowapi
- **Responsive design** with mobile drawer navigation
- **Custom design system:** Ivory/Terracotta/Espresso palette, Playfair Display + Inter typography
- **Lazy-loaded routes** with code splitting and error boundaries
- **Health-check warmup** for serverless cold starts

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.11 | Runtime |
| FastAPI | Web framework |
| SQLAlchemy 2.0 + Alembic | ORM + migrations |
| SQLite / PostgreSQL (Neon) | Database |
| JWT (python-jose) | Authentication |
| Razorpay | Payment processing |
| Cloudinary | Image uploads |
| Resend | Transactional emails |
| slowapi | Rate limiting |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool |
| Tailwind CSS 3.4 | Styling |
| React Router v6 | Routing |
| TanStack React Query v5 | Server state |
| Zustand | Client state |
| Framer Motion | Animations |
| Recharts | Admin dashboard charts |
| Axios | HTTP client |

## Project Structure

```
tailoryy-lite/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── seed.py              # Database seeding
│   │   ├── models/              # SQLAlchemy models (10 models)
│   │   ├── routers/             # API routes (13 modules)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Email service
│   │   ├── middleware/          # Auth middleware
│   │   └── utils/               # Utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component with routes
│   │   ├── pages/               # 18 page components
│   │   ├── components/          # Reusable UI components (11)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API and auth services
│   │   ├── store/               # Zustand stores
│   │   └── styles/              # Global CSS with design tokens
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── render.yaml                  # Render deployment config
└── PROGRESS.md                  # Build progress tracker
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Edit with your values (optional for dev)
uvicorn app.main:app --reload --port 8000
```

The backend runs with **zero required configuration** for local development -- SQLite database, placeholder images, demo payments, and console-logged emails are used by default.

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env        # Edit with your values (optional for dev)
npm run dev
```

The app will be available at `http://localhost:5173`.

### Optional Environment Variables

**Backend** (all have graceful fallbacks for development):
| Variable | Purpose | Required? |
|----------|---------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | No (defaults to SQLite) |
| `SECRET_KEY` | JWT signing secret | No (has default) |
| `CLOUDINARY_*` | Image uploads | No (placeholder images in dev) |
| `RAZORPAY_*` | Payment processing | No (demo mode in dev) |
| `RESEND_API_KEY` | Email notifications | No (console log in dev) |
| `FIREBASE_*` | Google OAuth | No (disabled if not set) |

### Database Seeding
```bash
cd backend
python -m app.seed
```
Creates sample admin, customers, portfolio items, fabrics, orders, and more.

## Screenshots

*Screenshots coming soon*

## License

MIT
