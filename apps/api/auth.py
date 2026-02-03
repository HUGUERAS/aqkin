"""RBAC e Multitenant: validação JWT e filtros por tenant."""

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

# Fail fast if JWT_SECRET is not configured
JWT_SECRET = os.getenv("JWT_SECRET") or os.getenv("SUPABASE_JWT_SECRET")
if not JWT_SECRET:
    error_msg = "CRITICAL: JWT_SECRET or SUPABASE_JWT_SECRET environment variable must be set for authentication to work"
    logger.critical(error_msg)
    raise RuntimeError(error_msg)

ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


async def get_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[str]:
    """Extrai o token Bearer do header."""
    if credentials:
        return credentials.credentials
    return None


async def get_current_user(token: Optional[str] = Depends(get_token)):
    """Decodifica o JWT e retorna user_id e email. Retorna None se não autenticado."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id:
            return None
        return {"user_id": user_id, "email": email}
    except JWTError:
        return None


async def get_current_user_required(user: Optional[dict] = Depends(get_current_user)):
    """Exige autenticação. Levanta 401 se não autenticado."""
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido ou ausente")
    return user


async def get_perfil(
    user: dict = Depends(get_current_user_required), request: Request = None
):
    """Obtém perfil (role) do usuário no banco. Requer auth."""
    from db import supabase

    try:
        r = (
            supabase.table("perfis")
            .select("role")
            .eq("user_id", user["user_id"])
            .execute()
        )
        if r.data and len(r.data) > 0:
            role = r.data[0].get("role", "proprietario")
        else:
            role = "proprietario"
        return {
            **user,
            "role": role,
            "tenant_id": user["user_id"] if role == "topografo" else None,
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao obter perfil")


async def require_topografo(perfil: dict = Depends(get_perfil)):
    """Exige perfil Topógrafo. Levanta 403 para Proprietário."""
    if perfil.get("role") != "topografo":
        raise HTTPException(status_code=403, detail="Acesso restrito a Topógrafo")
    return perfil


async def get_perfil_optional(user: Optional[dict] = Depends(get_current_user)):
    """Perfil opcional: retorna None se não autenticado."""
    if not user:
        return None
    try:
        from db import supabase

        r = (
            supabase.table("perfis")
            .select("role")
            .eq("user_id", user["user_id"])
            .execute()
        )
        role = r.data[0].get("role", "proprietario") if r.data else "proprietario"
        return {
            **user,
            "role": role,
            "tenant_id": user["user_id"] if role == "topografo" else None,
        }
    except Exception:
        return {**user, "role": "proprietario", "tenant_id": None}
