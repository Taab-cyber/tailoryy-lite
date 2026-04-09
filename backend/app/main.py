# main.py — FastAPI app entry point with CORS, rate limiting, and all routers
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import create_tables

# ── Rate limiter ──────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── App ───────────────────────────────────────────────────────────
app = FastAPI(
    title="Tailoryy API",
    description="Backend API for Tailoryy — premium custom stitching fashion house",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────
allowed_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
]
if settings.ENVIRONMENT == "production":
    allowed_origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    create_tables()
    print("Tailoryy API started — tables ready")


# ── Health check ──────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": "Tailoryy API", "version": "1.0.0"}


# ── Routers ───────────────────────────────────────────────────────
from app.routers import auth, orders, portfolio, fabrics, reviews  # noqa: E402
from app.routers import payments, messages, wishlist, users         # noqa: E402
from app.routers import notifications, contact, uploads, promos     # noqa: E402

app.include_router(auth.router,          prefix="/auth",          tags=["Auth"])
app.include_router(users.router,         prefix="/users",         tags=["Users"])
app.include_router(orders.router,        prefix="/orders",        tags=["Orders"])
app.include_router(portfolio.router,     prefix="/portfolio",     tags=["Portfolio"])
app.include_router(fabrics.router,       prefix="/fabrics",       tags=["Fabrics"])
app.include_router(reviews.router,       prefix="/reviews",       tags=["Reviews"])
app.include_router(payments.router,      prefix="/payments",      tags=["Payments"])
app.include_router(messages.router,      prefix="/messages",      tags=["Messages"])
app.include_router(wishlist.router,      prefix="/wishlist",      tags=["Wishlist"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(contact.router,       prefix="/contact",       tags=["Contact"])
app.include_router(uploads.router,       prefix="/uploads",       tags=["Uploads"])
app.include_router(promos.router,        prefix="/promos",        tags=["Promos"])
