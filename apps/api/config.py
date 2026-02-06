"""Configuration for Bem Real API."""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """App settings."""
    
    # Environment
    ENV = os.getenv("ENV", "development")
    SQL_ECHO = os.getenv("SQL_ECHO", "False").lower() == "true"
    
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost/bem_real_db"
    )
    
    # JWT
    JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_SECONDS = int(os.getenv("JWT_EXPIRATION_SECONDS", 900))  # 15 min
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # AWS/S3 (for documents)
    S3_BUCKET = os.getenv("S3_BUCKET", "bem-real-docs")
    S3_REGION = os.getenv("S3_REGION", "us-east-1")
    AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY", "")
    AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY", "")
    
    # Payments
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "stripe")  # stripe, pagseguro, iugu
    
    # Environment
    DEBUG = os.getenv("DEBUG", "False") == "True"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # Geo validation
    AREA_MIN_M2 = float(os.getenv("AREA_MIN_M2", 100))  # Minimum area in m²
    SIGEF_OVERLAP_TOLERANCE_M2 = float(os.getenv("SIGEF_OVERLAP_TOLERANCE_M2", 0))  # Any overlap = alert
    GAP_TOLERANCE_M2 = float(os.getenv("GAP_TOLERANCE_M2", 1))  # Gap tolerance in m²
    

settings = Settings()
