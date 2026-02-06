"""Contract endpoints for generating and signing contracts"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid
import hashlib
from typing import Optional

from db import supabase
from auth import get_current_user_required, require_topografo
from models import ContractTemplate, ContractAcceptance
from schemas import (
    ContractAcceptRequest,
    ContractAcceptResponse,
    ContractTemplateResponse,
    OrcamentoCreate,
    ProjetoCreate,
)

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


def _load_template(template_path: str = "apps/api/templates/contract_base_pt_BR.html") -> str:
    """Load contract template from file"""
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Contract template not found")


def _format_currency(value: float) -> str:
    """Format value as Brazilian currency"""
    return f"R$ {value:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _extend_number(value: float) -> str:
    """Convert number to extended text (for legal documents)"""
    from num2words import num2words
    
    try:
        return num2words(value, lang="pt_BR", to="cardinal")
    except:
        return str(value)


def _get_current_date_extended() -> str:
    """Get current date in extended format (e.g., 5 de fevereiro de 2025)"""
    months_pt = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ]
    now = datetime.utcnow()
    month = months_pt[now.month - 1]
    return f"{now.day} de {month} de {now.year}"


def _substitute_placeholders(template: str, data: dict) -> str:
    """Substitute placeholders in template with actual values"""
    result = template
    
    for key, value in data.items():
        placeholder = f"{{{{{key}}}}}"
        if isinstance(value, float) and "valor" in key:
            value = _format_currency(value)
        elif isinstance(value, float) and "extenso" in key:
            value = _extend_number(value)
        
        result = result.replace(placeholder, str(value or ""))
    
    return result


def _generate_contract_hash(content: str) -> str:
    """Generate SHA-256 hash of contract content"""
    return hashlib.sha256(content.encode()).hexdigest()


@router.post("/generate")
async def generate_contract(
    orcamento_id: int,
    projeto_id: int,
    lote_id: Optional[int] = None,
    valor: Optional[float] = None,
    current_user = Depends(get_current_user_required),
) -> JSONResponse:
    """
    Generate contract from template using data from orcamento/projeto/lote
    
    Returns:
        - contract_id (UUID)
        - html_content (rendered contract HTML)
        - preview_url (data URI for preview)
        - template_version (version string)
        - created_at (ISO datetime)
    """
    
    try:
        # Get user's tenant_id from auth
        tenant_id = current_user.get("tenant_id")
        user_id = current_user.get("sub")
        
        # Fetch projeto data
        projeto_response = supabase.table("projeto").select("*").eq("id", projeto_id).single().execute()
        if not projeto_response.data:
            raise HTTPException(status_code=404, detail="Projeto not found")
        
        projeto = projeto_response.data
        
        # Fetch lote data if provided
        lote = None
        if lote_id:
            lote_response = supabase.table("lote").select("*").eq("id", lote_id).single().execute()
            if lote_response.data:
                lote = lote_response.data
        
        # Fetch orcamento data
        orcamento_response = supabase.table("orcamento").select("*").eq("id", orcamento_id).single().execute()
        if not orcamento_response.data:
            raise HTTPException(status_code=404, detail="Orcamento not found")
        
        orcamento = orcamento_response.data
        
        # Prepare data for template replacement
        now = datetime.utcnow()
        template_data = {
            # Data de geração
            "data_geracao": now.isoformat(),
            "data_geracao_extenso": _get_current_date_extended(),
            
            # Cliente (from lote if available, otherwise from projeto)
            "nome_cliente": lote.get("nome_cliente", projeto.get("nome", "Cliente")) if lote else projeto.get("nome", "Cliente"),
            "cpf_cnpj_cliente": lote.get("cpf_cnpj_cliente", "") if lote else "",
            "email_cliente": lote.get("email_cliente", "") if lote else "",
            "telefone_cliente": lote.get("telefone_cliente", "") if lote else "",
            "endereco_cliente": lote.get("endereco", "") if lote else "",
            
            # Projeto
            "nome_projeto": projeto.get("nome", ""),
            "descricao_projeto": projeto.get("descricao", ""),
            "municipio": projeto.get("municipio", ""),
            "estado": projeto.get("estado", ""),
            
            # Lote
            "nome_lote": lote.get("nome_cliente", "") if lote else "(Não especificado)",
            
            # Topografo (current user)
            "nome_topografo": current_user.get("name", "Topógrafo"),
            "email_topografo": current_user.get("email", ""),
            "telefone_topografo": "",
            
            # Orçamento
            "observacoes_orcamento": orcamento.get("observacoes", ""),
            "valor_formatado": _format_currency(valor or orcamento.get("valor", 0)),
            "valor_extenso": _extend_number(valor or orcamento.get("valor", 0)),
            "status_orcamento": orcamento.get("status", "RASCUNHO"),
            
            # Termos
            "termos_pagamento": "À vista ou parcelado em 2x, conforme acordo entre as partes.",
            "data_entrega_estimada": (now + timedelta(days=15)).strftime("%d/%m/%Y"),
            
            # Template info
            "template_version": "1.0",
            "contract_hash": "",  # Will be calculated after content generation
        }
        
        # Load and process template
        template = _load_template()
        contract_html = _substitute_placeholders(template, template_data)
        contract_hash = _generate_contract_hash(contract_html)
        template_data["contract_hash"] = contract_hash
        
        # Regenerate with hash
        contract_html = _substitute_placeholders(template, template_data)
        
        # Save to database
        contract_id = uuid.uuid4()
        
        # Insert into supabase contract_template table
        contract_insert = supabase.table("contract_template").insert({
            "id": str(contract_id),
            "tenant_id": tenant_id,
            "version": "1.0",
            "hash": contract_hash,
            "body": contract_html,
            "created_at": now.isoformat(),
        }).execute()
        
        if not contract_insert.data:
            raise HTTPException(status_code=500, detail="Failed to save contract")
        
        # Update orcamento to link contract
        supabase.table("orcamento").update({
            "contract_id": str(contract_id),
            "status": "CONTRATO_GERADO"
        }).eq("id", orcamento_id).execute()
        
        # Return response
        return JSONResponse({
            "contract_id": str(contract_id),
            "orcamento_id": orcamento_id,
            "html_content": contract_html,
            "preview_url": f"data:text/html;charset=utf-8;base64,{_encode_base64(contract_html)}",
            "template_version": "1.0",
            "created_at": now.isoformat(),
            "contract_hash": contract_hash,
        }, status_code=201)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating contract: {str(e)}")


@router.post("/sign")
async def sign_contract(
    request: ContractAcceptRequest,
    current_user = Depends(get_current_user_required),
) -> JSONResponse:
    """
    Sign a contract - record acceptance evidence
    
    Request:
        - contract_id (UUID)
        - orcamento_id (int)
        - signature_hash (str)
    
    Returns:
        - acceptance_id (UUID)
        - status (str): "ASSINADO"
        - accepted_at (ISO datetime)
        - contract_hash (str)
        - signature_hash (str)
    """
    
    try:
        # Validate contract exists
        contract_response = supabase.table("contract_template").select("*").eq(
            "id", request.contract_id
        ).single().execute()
        
        if not contract_response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        contract = contract_response.data
        
        # Get projeto from orcamento
        orcamento_response = supabase.table("orcamento").select("*").eq(
            "id", request.orcamento_id
        ).single().execute()
        
        if not orcamento_response.data:
            raise HTTPException(status_code=404, detail="Orcamento not found")
        
        orcamento = orcamento_response.data
        projeto_id = orcamento.get("projeto_id")
        lote_id = orcamento.get("lote_id")
        
        # Record acceptance evidence
        now = datetime.utcnow()
        acceptance_id = uuid.uuid4()
        
        acceptance_insert = supabase.table("contract_acceptance").insert({
            "id": str(acceptance_id),
            "project_id": str(projeto_id),
            "parcel_id": str(lote_id) if lote_id else str(projeto_id),
            "user_id": current_user.get("sub"),
            "template_version": contract.get("version", "1.0"),
            "accepted_at": now.isoformat(),
            "ip": request.ip_address or "",
            "signature_hash": request.signature_hash,
        }).execute()
        
        if not acceptance_insert.data:
            raise HTTPException(status_code=500, detail="Failed to record acceptance")
        
        # Update orcamento status
        supabase.table("orcamento").update({
            "status": "CONTRATO_ASSINADO",
            "contract_id": request.contract_id,
        }).eq("id", request.orcamento_id).execute()
        
        return JSONResponse({
            "acceptance_id": str(acceptance_id),
            "contract_id": request.contract_id,
            "orcamento_id": request.orcamento_id,
            "status": "ASSINADO",
            "accepted_at": now.isoformat(),
            "contract_hash": contract.get("hash"),
            "signature_hash": request.signature_hash,
        }, status_code=201)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error signing contract: {str(e)}")


@router.get("/{contract_id}")
async def get_contract(
    contract_id: str,
    current_user = Depends(get_current_user_required),
) -> ContractTemplateResponse:
    """Get contract details"""
    
    try:
        contract_response = supabase.table("contract_template").select("*").eq(
            "id", contract_id
        ).single().execute()
        
        if not contract_response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        contract = contract_response.data
        
        # Get acceptance records
        acceptances = supabase.table("contract_acceptance").select("*").eq(
            "id", contract_id
        ).execute().data or []
        
        return ContractTemplateResponse(
            id=contract.get("id"),
            tenant_id=contract.get("tenant_id"),
            version=contract.get("version"),
            hash=contract.get("hash"),
            body=contract.get("body"),
            created_at=contract.get("created_at"),
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contract: {str(e)}")


@router.get("/orcamento/{orcamento_id}")
async def get_contract_by_orcamento(
    orcamento_id: int,
    current_user = Depends(get_current_user_required),
) -> JSONResponse:
    """Get contract associated with an orcamento"""
    
    try:
        # Fetch orcamento
        orcamento_response = supabase.table("orcamento").select("*").eq(
            "id", orcamento_id
        ).single().execute()
        
        if not orcamento_response.data:
            raise HTTPException(status_code=404, detail="Orcamento not found")
        
        orcamento = orcamento_response.data
        contract_id = orcamento.get("contract_id")
        
        if not contract_id:
            raise HTTPException(status_code=404, detail="No contract associated with this orcamento")
        
        # Fetch contract
        contract_response = supabase.table("contract_template").select("*").eq(
            "id", contract_id
        ).single().execute()
        
        if not contract_response.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        contract = contract_response.data
        
        # Fetch acceptances
        acceptances = supabase.table("contract_acceptance").select("*").eq(
            "parcel_id", orcamento.get("lote_id") or orcamento.get("projeto_id")
        ).execute().data or []
        
        return JSONResponse({
            "contract_id": contract.get("id"),
            "orcamento_id": orcamento_id,
            "html_content": contract.get("body"),
            "template_version": contract.get("version"),
            "created_at": contract.get("created_at"),
            "is_signed": len(acceptances) > 0,
            "acceptances": [
                {
                    "id": acc.get("id"),
                    "accepted_at": acc.get("accepted_at"),
                    "ip": acc.get("ip"),
                    "signature_hash": acc.get("signature_hash"),
                } for acc in acceptances
            ]
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contract: {str(e)}")


# Helper function for encoding
def _encode_base64(text: str) -> str:
    """Encode text to base64"""
    import base64
    return base64.b64encode(text.encode()).decode()

