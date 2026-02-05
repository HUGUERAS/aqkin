"""Database session management."""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool if settings.ENV == "test" else None,
    echo=settings.SQL_ECHO,
    connect_args={
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
    } if "postgresql" in settings.DATABASE_URL else {},
)

# Configure PostGIS for geography queries
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Load PostGIS geometry/geography types."""
    if "postgresql" in settings.DATABASE_URL:
        try:
            dbapi_conn.enable_load_extension('postgis')
        except Exception:
            # PostGIS may be loaded at server level; not an error
            pass

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Session:
    """Dependency for FastAPI to provide DB session.
    
    Usage:
        @app.get("/projects")
        def list_projects(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables (for development).
    
    Note: In production, use Alembic migrations.
    """
    from models import Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized")


def close_db():
    """Close database engine (for shutdown hooks)."""
    engine.dispose()
    logger.info("Database engine closed")
