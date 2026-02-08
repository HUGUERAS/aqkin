"""Document upload and management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import hashlib

from db import supabase
from auth import get_perfil, get_perfil_optional

router = APIRouter(tags=["documents"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB
STORAGE_BUCKET = "documentos"


@router.post("/api/lotes/{lote_id}/documentos")
async def upload_document(
    lote_id: int,
    tipo: str = Form(...),
    file: UploadFile = File(...),
    perfil: dict = Depends(get_perfil_optional),
):
    """Upload a document to Supabase Storage and record metadata."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Tipo de arquivo nao permitido. Use JPG, PNG ou PDF.")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "Arquivo excede 10MB.")

    # Verify lote exists
    lote = supabase.table("lotes").select("id,projeto_id").eq("id", lote_id).execute()
    if not lote.data:
        raise HTTPException(404, "Lote nao encontrado")

    # Generate unique path
    file_hash = hashlib.sha256(content).hexdigest()[:16]
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "bin"
    storage_path = f"lotes/{lote_id}/{tipo}/{file_hash}.{ext}"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            storage_path,
            content,
            {"content-type": file.content_type},
        )
    except Exception as e:
        # If file already exists, that's ok (same hash = same file)
        if "Duplicate" not in str(e) and "already exists" not in str(e):
            raise HTTPException(500, f"Erro ao enviar arquivo: {str(e)}")

    # Get public URL
    public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(storage_path)

    # Save document record
    doc_data = {
        "lote_id": lote_id,
        "projeto_id": lote.data[0].get("projeto_id"),
        "tipo": tipo,
        "url": public_url,
        "nome_arquivo": file.filename,
        "tamanho_bytes": len(content),
        "hash": hashlib.sha256(content).hexdigest(),
    }
    if perfil:
        doc_data["uploaded_by"] = perfil.get("user_id")

    doc = supabase.table("documentos").insert(doc_data).execute()
    return doc.data[0] if doc.data else doc_data


@router.get("/api/lotes/{lote_id}/documentos")
async def list_documents(
    lote_id: int,
    perfil: dict = Depends(get_perfil_optional),
):
    """List all documents for a lote."""
    docs = (
        supabase.table("documentos")
        .select("*")
        .eq("lote_id", lote_id)
        .order("criado_em", desc=True)
        .execute()
    )
    return docs.data or []


@router.delete("/api/documentos/{documento_id}")
async def delete_document(
    documento_id: int,
    perfil: dict = Depends(get_perfil),
):
    """Delete a document."""
    doc = supabase.table("documentos").select("*").eq("id", documento_id).execute()
    if not doc.data:
        raise HTTPException(404, "Documento nao encontrado")

    # Try to delete from storage
    try:
        url = doc.data[0].get("url", "")
        if STORAGE_BUCKET in url:
            storage_path = url.split(STORAGE_BUCKET + "/")[-1]
            if storage_path:
                supabase.storage.from_(STORAGE_BUCKET).remove([storage_path])
    except Exception:
        pass  # Continue even if storage delete fails

    supabase.table("documentos").delete().eq("id", documento_id).execute()
    return {"ok": True}
