# database.py — SQLAlchemy engine, session, and base model setup
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# SQLite needs check_same_thread=False; Postgres does not need it
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=(settings.ENVIRONMENT == "development"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables from models. Call at startup."""
    # Import all models so SQLAlchemy registers them before create_all
    from app.models import user, order, portfolio_item, fabric, review  # noqa: F401
    from app.models import wishlist_item, message, conversation, notification  # noqa: F401
    Base.metadata.create_all(bind=engine)
