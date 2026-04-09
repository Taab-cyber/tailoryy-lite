# database.py — SQLAlchemy engine, session, and base model setup
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

connect_args = {"check_same_thread": False} if is_sqlite else {}

# Serverless-friendly pool settings for Neon PostgreSQL
engine_kwargs = dict(
    connect_args=connect_args,
    echo=(settings.ENVIRONMENT == "development"),
)
if not is_sqlite:
    engine_kwargs.update(
        pool_pre_ping=True,   # verify connections before use
        pool_size=1,          # minimal pool for serverless
        max_overflow=2,
        pool_recycle=300,     # recycle connections every 5 min
    )

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

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
    from app.models import user, order, portfolio_item, fabric, review  # noqa: F401
    from app.models import wishlist_item, message, conversation, notification  # noqa: F401
    Base.metadata.create_all(bind=engine)
