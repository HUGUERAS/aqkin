"""Client intake and progress tracking endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from db import supabase
from auth import get_perfil, get_perfil_optional

router = APIRouter(tags=["intake"])


class IntakeData(BaseModel):
    nome_cliente: Optional[str] = None
    cpf_cnpj_cliente: Optional[str] = None
    rg_cliente: Optional[str] = None
    telefone_cliente: Optional[str] = None
    email_cliente: Optional[str] = None
    endereco_cliente: Optional[str] = None
    estado_civil: Optional[str] = None
    nacionalidade: Optional[str] = None
    profissao: Optional[str] = None


def _calculate_progress(lote_id: int, lote_data: dict) -> dict:
    """Calculate cadastro progress for a lote."""
    # Count documents
    docs = (
        supabase.table("documentos")
        .select("id,tipo")
        .eq("lote_id", lote_id)
        .execute()
    )
    doc_types = set(d.get("tipo") for d in (docs.data or []))

    # Check vizinhos
    vizinhos = (
        supabase.table("vizinhos")
        .select("id")
        .eq("lote_id", lote_id)
        .execute()
    )

    steps = [
        {
            "id": "dados_pessoais",
            "label": "Dados Pessoais",
            "completed": bool(
                lote_data.get("nome_cliente")
                and lote_data.get("cpf_cnpj_cliente")
                and lote_data.get("telefone_cliente")
            ),
        },
        {
            "id": "desenho_area",
            "label": "Desenho da Area",
            "completed": lote_data.get("status") not in ("PENDENTE", None, ""),
        },
        {
            "id": "vizinhos",
            "label": "Vizinhos Confrontantes",
            "completed": len(vizinhos.data or []) >= 1,
        },
        {
            "id": "documentos",
            "label": "Documentos",
            "completed": len(doc_types) >= 2,
        },
    ]

    completed = sum(1 for s in steps if s["completed"])
    total = len(steps)

    return {
        "lote_id": lote_id,
        "steps": steps,
        "completed": completed,
        "total": total,
        "percentage": round((completed / total) * 100) if total > 0 else 0,
        "status": lote_data.get("status", "PENDENTE"),
    }


@router.put("/api/lotes/{lote_id}/intake")
async def save_intake(
    lote_id: int,
    body: IntakeData,
    perfil: dict = Depends(get_perfil_optional),
):
    """Save/update client intake form data."""
    lote = supabase.table("lotes").select("id").eq("id", lote_id).execute()
    if not lote.data:
        raise HTTPException(404, "Lote nao encontrado")

    update_data = {k: v for k, v in body.dict().items() if v is not None}
    if update_data:
        update_data["intake_completed_at"] = datetime.utcnow().isoformat()
        supabase.table("lotes").update(update_data).eq("id", lote_id).execute()

    result = supabase.table("lotes").select("*").eq("id", lote_id).execute()
    return result.data[0] if result.data else {}


@router.get("/api/lotes/{lote_id}/progresso")
async def get_progress(
    lote_id: int,
    perfil: Optional[dict] = Depends(get_perfil_optional),
):
    """Get cadastro progress for a lote."""
    lote = supabase.table("lotes").select("*").eq("id", lote_id).execute()
    if not lote.data:
        raise HTTPException(404, "Lote nao encontrado")

    return _calculate_progress(lote_id, lote.data[0])


@router.get("/api/acesso-lote/progresso")
async def get_progress_by_token(token: str):
    """Get progress for a lote accessed via magic link token."""
    response = supabase.table("lotes").select("*").eq("token_acesso", token).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Link invalido ou expirado")

    lote = response.data[0]
    return _calculate_progress(lote["id"], lote)
