"""Authentication & JWT services."""
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models import User, InviteLink
from config import settings
from schemas import TokenResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict,
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, datetime]:
    """Create JWT access token.
    
    Args:
        data: Claims to include (e.g., { tenant_id, user_id, role, project_id, parcel_id })
        expires_delta: Custom expiration time
        
    Returns:
        (token, expires_at)
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_SECONDS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4()),  # Token ID for revocation
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    
    return encoded_jwt, expire


def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token and return claims.
    
    Returns:
        Claims dict if valid, None if invalid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def is_token_revoked(jti: str, db: Session) -> bool:
    """Check if token is revoked."""
    revoked = db.query(InviteLink).filter(
        InviteLink.jti == jti,
        InviteLink.revoked_at.isnot(None),
    ).first()
    return revoked is not None


def revoke_token(jti: str, db: Session) -> bool:
    """Revoke a token."""
    link = db.query(InviteLink).filter(InviteLink.jti == jti).first()
    if link:
        link.revoked_at = datetime.utcnow()
        db.commit()
        return True
    return False
