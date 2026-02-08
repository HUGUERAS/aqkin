from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

from db import supabase
from auth import get_perfil, require_topografo, get_current_user_required
from routers.contracts import router as contracts_router
from routers.ai import router as ai_router
from routers.documents import router as documents_router
from routers.intake import router as intake_router

load_dotenv()

app = FastAPI(title="Ativo Real API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schemas
class ProjetoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: str = "INDIVIDUAL"


class ProjetoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    status: Optional[str] = None  # RASCUNHO, EM_ANDAMENTO, CONCLUIDO, ARQUIVADO


class LoteCreate(BaseModel):
    projeto_id: int
    nome_cliente: str
    email_cliente: Optional[str] = None
    telefone_cliente: Optional[str] = None
    cpf_cnpj_cliente: Optional[str] = None
    geom_wkt: Optional[str] = None


class VizinhoInput(BaseModel):
    lote_id: int
    nome_vizinho: str
    lado: str  # NORTE, SUL, LESTE, OESTE


class GeometriaInput(BaseModel):
    geom_wkt: str


class ValidarTopologiaInput(BaseModel):
    geom_wkt: Optional[str] = None


class StatusLoteInput(BaseModel):
    status: str  # DESENHO, VALIDACAO_SIGEF, PENDENTE, etc.


class PerfilSetInput(BaseModel):
    role: str  # topografo | proprietario (só no primeiro acesso)


# Schemas Financeiro
class OrcamentoCreate(BaseModel):
    projeto_id: Optional[int] = None
    lote_id: Optional[int] = None
    valor: float
    status: str = "RASCUNHO"  # RASCUNHO, ENVIADO, APROVADO, REJEITADO, CANCELADO
    observacoes: Optional[str] = None


class OrcamentoUpdate(BaseModel):
    valor: Optional[float] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None


class DespesaCreate(BaseModel):
    projeto_id: int
    descricao: str
    valor: float
    data: Optional[str] = None  # ISO date string
    categoria: Optional[str] = None  # MATERIAL, SERVICO, TRANSPORTE, OUTROS
    observacoes: Optional[str] = None


class DespesaUpdate(BaseModel):
    descricao: Optional[str] = None
    valor: Optional[float] = None
    data: Optional[str] = None
    categoria: Optional[str] = None
    observacoes: Optional[str] = None


# Health Check
@app.get("/")
def health_check():
    return {"status": "online", "service": "Ativo Real API"}


# Perfil (RBAC)
@app.get("/api/perfis/me")
def perfil_me(perfil: dict = Depends(get_perfil)):
    return {
        "user_id": perfil["user_id"],
        "email": perfil.get("email"),
        "role": perfil["role"],
    }


@app.post("/api/perfis/set-role")
def set_role(body: PerfilSetInput, perfil: dict = Depends(get_current_user_required)):
    """Define role no primeiro acesso (proprietario ou topografo)."""
    try:
        role = (
            body.role if body.role in ("topografo", "proprietario") else "proprietario"
        )
        r = (
            supabase.table("perfis")
            .select("id")
            .eq("user_id", perfil["user_id"])
            .execute()
        )
        if r.data and len(r.data) > 0:
            supabase.table("perfis").update({"role": role}).eq(
                "user_id", perfil["user_id"]
            ).execute()
        else:
            supabase.table("perfis").insert(
                {"user_id": perfil["user_id"], "role": role}
            ).execute()
        return {"role": role}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Projetos (Multitenant: só do tenant do topógrafo)
@app.get("/api/projetos")
def listar_projetos(perfil: dict = Depends(get_perfil)):
    try:
        query = supabase.table("projetos").select("*")
        if perfil and perfil.get("role") == "topografo" and perfil.get("tenant_id"):
            query = query.eq("tenant_id", perfil["tenant_id"])
        elif perfil and perfil.get("role") == "proprietario":
            return []  # Proprietário não vê lista de projetos
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projetos")
def criar_projeto(projeto: ProjetoCreate, perfil: dict = Depends(require_topografo)):
    try:
        data = {
            "nome": projeto.nome,
            "descricao": projeto.descricao,
            "tipo": projeto.tipo,
            "status": "RASCUNHO",
            "tenant_id": perfil["tenant_id"],
        }
        response = supabase.table("projetos").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/projetos/{projeto_id}")
def atualizar_projeto(
    projeto_id: int, projeto: ProjetoUpdate, perfil: dict = Depends(require_topografo)
):
    try:
        # Verificar se projeto pertence ao tenant
        _projeto_autorizado(projeto_id, perfil)

        # Preparar dados para atualização (apenas campos fornecidos)
        data = {}
        if projeto.nome is not None:
            data["nome"] = projeto.nome
        if projeto.descricao is not None:
            data["descricao"] = projeto.descricao
        if projeto.tipo is not None:
            data["tipo"] = projeto.tipo
        if projeto.status is not None:
            data["status"] = projeto.status

        if not data:
            raise HTTPException(
                status_code=400, detail="Nenhum campo fornecido para atualização"
            )

        response = (
            supabase.table("projetos").update(data).eq("id", projeto_id).execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projetos/{projeto_id}")
def deletar_projeto(projeto_id: int, perfil: dict = Depends(require_topografo)):
    try:
        # Verificar se projeto pertence ao tenant
        _projeto_autorizado(projeto_id, perfil)

        response = supabase.table("projetos").delete().eq("id", projeto_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        return {"ok": True, "message": "Projeto deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Lotes (Multitenant + RBAC)
@app.get("/api/lotes")
def listar_lotes(projeto_id: Optional[int] = None, perfil: dict = Depends(get_perfil)):
    try:
        if perfil.get("role") == "proprietario":
            query = (
                supabase.table("lotes")
                .select("*")
                .eq("email_cliente", perfil.get("email", ""))
            )
        else:
            query = supabase.table("lotes").select("*")
            if projeto_id:
                query = query.eq("projeto_id", projeto_id)
            if perfil.get("role") == "topografo" and perfil.get("tenant_id"):
                projs = (
                    supabase.table("projetos")
                    .select("id")
                    .eq("tenant_id", perfil["tenant_id"])
                    .execute()
                )
                ids = [p["id"] for p in (projs.data or [])]
                if ids:
                    query = query.in_("projeto_id", ids)
                else:
                    return []
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/lotes")
def criar_lote(lote: LoteCreate, perfil: dict = Depends(require_topografo)):
    try:
        # Verificar se projeto pertence ao tenant
        r = (
            supabase.table("projetos")
            .select("tenant_id")
            .eq("id", lote.projeto_id)
            .execute()
        )
        if not r.data or r.data[0].get("tenant_id") != perfil["tenant_id"]:
            raise HTTPException(
                status_code=403, detail="Projeto não pertence ao seu tenant"
            )
        token = str(uuid.uuid4())
        data = {
            "projeto_id": lote.projeto_id,
            "nome_cliente": lote.nome_cliente,
            "email_cliente": lote.email_cliente,
            "telefone_cliente": lote.telefone_cliente,
            "cpf_cnpj_cliente": lote.cpf_cnpj_cliente,
            "token_acesso": token,
            "link_expira_em": (datetime.now() + timedelta(days=7)).isoformat(),
            "status": "PENDENTE",
        }

        # Adiciona geometria se fornecida (WKT)
        if lote.geom_wkt:
            # Converte WKT para geometria PostGIS
            data["geom"] = f"SRID=4674;{lote.geom_wkt}"

        response = supabase.table("lotes").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/acesso-lote")
def obter_lote_por_token(token: str):
    """Magic Link: cliente acessa lote pelo token. Usado em /cliente/desenhar?token=xxx"""
    try:
        response = (
            supabase.table("lotes").select("*").eq("token_acesso", token).execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Link inválido ou expirado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _lote_autorizado(lote_id: int, perfil: dict, escrita: bool = False) -> dict:
    """Verifica se usuário pode acessar lote. Retorna o lote ou levanta 403/404."""
    r = supabase.table("lotes").select("*").eq("id", lote_id).execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    lote = r.data[0]
    if perfil.get("role") == "topografo":
        proj = (
            supabase.table("projetos")
            .select("tenant_id")
            .eq("id", lote["projeto_id"])
            .execute()
        )
        tenant = proj.data[0].get("tenant_id") if proj.data else None
        if tenant != perfil.get("tenant_id"):
            raise HTTPException(
                status_code=403, detail="Lote não pertence ao seu tenant"
            )
    elif perfil.get("role") == "proprietario":
        if lote.get("email_cliente") != perfil.get("email"):
            raise HTTPException(status_code=403, detail="Lote não pertence a você")
        if escrita:
            raise HTTPException(
                status_code=403, detail="Proprietário tem acesso apenas visual"
            )
    return lote


@app.get("/api/lotes/{lote_id}")
def obter_lote(lote_id: int, perfil: dict = Depends(get_perfil)):
    try:
        return _lote_autorizado(lote_id, perfil, escrita=False)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/lotes/{lote_id}/geometria")
def atualizar_geometria(
    lote_id: int, body: GeometriaInput, perfil: dict = Depends(require_topografo)
):
    try:
        _lote_autorizado(lote_id, perfil, escrita=True)
        data = {"geom": f"SRID=4674;{body.geom_wkt}", "status": "DESENHO"}
        response = supabase.table("lotes").update(data).eq("id", lote_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Lote não encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Vizinhos (Confrontantes) - Topógrafo CRUD; Proprietário só leitura
@app.post("/api/vizinhos")
def adicionar_vizinho(vizinho: VizinhoInput, perfil: dict = Depends(require_topografo)):
    try:
        _lote_autorizado(vizinho.lote_id, perfil, escrita=True)
        data = {
            "lote_id": vizinho.lote_id,
            "nome_vizinho": vizinho.nome_vizinho,
            "lado": vizinho.lado,
        }
        response = supabase.table("vizinhos").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/lotes/{lote_id}/vizinhos")
def listar_vizinhos(lote_id: int, perfil: dict = Depends(get_perfil)):
    try:
        _lote_autorizado(lote_id, perfil, escrita=False)
        response = (
            supabase.table("vizinhos").select("*").eq("lote_id", lote_id).execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/vizinhos/{vizinho_id}")
def remover_vizinho(vizinho_id: int, perfil: dict = Depends(require_topografo)):
    try:
        r = supabase.table("vizinhos").select("lote_id").eq("id", vizinho_id).execute()
        if r.data:
            _lote_autorizado(r.data[0]["lote_id"], perfil, escrita=True)
        response = supabase.table("vizinhos").delete().eq("id", vizinho_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Vizinho não encontrado")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Projetos - obter por ID
@app.get("/api/projetos/{projeto_id}")
def obter_projeto(projeto_id: int, perfil: dict = Depends(get_perfil)):
    try:
        query = supabase.table("projetos").select("*").eq("id", projeto_id)
        if perfil and perfil.get("role") == "topografo" and perfil.get("tenant_id"):
            query = query.eq("tenant_id", perfil["tenant_id"])
        elif perfil and perfil.get("role") == "proprietario":
            raise HTTPException(
                status_code=403, detail="Proprietário não tem acesso a projetos"
            )
        response = query.execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Sobreposições por projeto (Dashboard)
def _projeto_autorizado(projeto_id: int, perfil: dict) -> None:
    """Levanta 403 se projeto não pertence ao tenant do topógrafo."""
    if perfil.get("role") == "proprietario":
        raise HTTPException(
            status_code=403, detail="Proprietário não tem acesso a projetos"
        )
    r = supabase.table("projetos").select("tenant_id").eq("id", projeto_id).execute()
    if not r.data or r.data[0].get("tenant_id") != perfil.get("tenant_id"):
        raise HTTPException(
            status_code=403, detail="Projeto não pertence ao seu tenant"
        )


@app.get("/api/projetos/{projeto_id}/sobreposicoes")
def sobreposicoes_projeto(projeto_id: int, perfil: dict = Depends(get_perfil)):
    try:
        _projeto_autorizado(projeto_id, perfil)
        response = supabase.rpc(
            "detectar_sobreposicoes_projeto", {"p_projeto_id": projeto_id}
        ).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Detecção de Sobreposição por lote (PostGIS)
@app.get("/api/lotes/{lote_id}/sobreposicoes")
def detectar_sobreposicoes(lote_id: int, perfil: dict = Depends(get_perfil)):
    try:
        _lote_autorizado(lote_id, perfil, escrita=False)
        response = supabase.rpc(
            "detectar_sobreposicoes", {"p_lote_id": lote_id}
        ).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Validação de Topologia
@app.post("/api/lotes/{lote_id}/validar-topologia")
def validar_topologia(
    lote_id: int,
    body: Optional[ValidarTopologiaInput] = None,
    perfil: dict = Depends(get_perfil),
):
    try:
        _lote_autorizado(lote_id, perfil, escrita=False)
        geom_wkt = body.geom_wkt if body and body.geom_wkt else None
        response = supabase.rpc(
            "validar_topologia_sql", {"p_lote_id": lote_id, "p_geom_wkt": geom_wkt}
        ).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Erro ao validar topologia")
        return response.data[0] if isinstance(response.data, list) else response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Atualizar status do lote (aprovar/rejeitar)
@app.patch("/api/lotes/{lote_id}/status")
def atualizar_status(
    lote_id: int, body: StatusLoteInput, perfil: dict = Depends(require_topografo)
):
    try:
        _lote_autorizado(lote_id, perfil, escrita=True)
        response = (
            supabase.table("lotes")
            .update({"status": body.status})
            .eq("id", lote_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Lote não encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ORÇAMENTOS ====================
@app.get("/api/orcamentos")
def listar_orcamentos(
    projeto_id: Optional[int] = None,
    lote_id: Optional[int] = None,
    perfil: dict = Depends(get_perfil),
):
    """Lista orçamentos. Topógrafo vê do seu tenant. Proprietário vê dos seus lotes."""
    try:
        query = supabase.table("orcamentos").select("*")

        if perfil.get("role") == "topografo" and perfil.get("tenant_id"):
            # Topógrafo: filtrar por projetos do tenant
            if projeto_id:
                _projeto_autorizado(projeto_id, perfil)
                query = query.eq("projeto_id", projeto_id)
            elif lote_id:
                _lote_autorizado(lote_id, perfil, escrita=False)
                query = query.eq("lote_id", lote_id)
            else:
                # Listar todos os orçamentos dos projetos do tenant
                projs = (
                    supabase.table("projetos")
                    .select("id")
                    .eq("tenant_id", perfil["tenant_id"])
                    .execute()
                )
                ids = [p["id"] for p in (projs.data or [])]
                if ids:
                    query = query.in_("projeto_id", ids)
                else:
                    return []
        elif perfil.get("role") == "proprietario":
            # Proprietário: apenas dos seus lotes
            if lote_id:
                _lote_autorizado(lote_id, perfil, escrita=False)
                query = query.eq("lote_id", lote_id)
            else:
                # Listar orçamentos de todos os lotes do proprietário
                lotes = (
                    supabase.table("lotes")
                    .select("id")
                    .eq("email_cliente", perfil.get("email", ""))
                    .execute()
                )
                ids = [lote["id"] for lote in (lotes.data or [])]
                if ids:
                    query = query.in_("lote_id", ids)
                else:
                    return []
        else:
            return []

        response = query.execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/orcamentos/{orcamento_id}")
def obter_orcamento(orcamento_id: int, perfil: dict = Depends(get_perfil)):
    """Obtém um orçamento específico."""
    try:
        r = supabase.table("orcamentos").select("*").eq("id", orcamento_id).execute()
        if not r.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        orcamento = r.data[0]

        # Verificar permissão
        if orcamento.get("projeto_id"):
            _projeto_autorizado(orcamento["projeto_id"], perfil)
        elif orcamento.get("lote_id"):
            _lote_autorizado(orcamento["lote_id"], perfil, escrita=False)

        return orcamento
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/orcamentos")
def criar_orcamento(
    orcamento: OrcamentoCreate, perfil: dict = Depends(require_topografo)
):
    """Cria um novo orçamento. Apenas topógrafo."""
    try:
        # Validar que projeto ou lote pertence ao tenant
        if orcamento.projeto_id:
            _projeto_autorizado(orcamento.projeto_id, perfil)
        elif orcamento.lote_id:
            lote = _lote_autorizado(orcamento.lote_id, perfil, escrita=True)
            if not orcamento.projeto_id:
                orcamento.projeto_id = lote["projeto_id"]
        else:
            raise HTTPException(
                status_code=400, detail="projeto_id ou lote_id é obrigatório"
            )

        data = {
            "projeto_id": orcamento.projeto_id,
            "lote_id": orcamento.lote_id,
            "valor": orcamento.valor,
            "status": orcamento.status,
            "observacoes": orcamento.observacoes,
        }
        response = supabase.table("orcamentos").insert(data).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/orcamentos/{orcamento_id}")
def atualizar_orcamento(
    orcamento_id: int,
    orcamento: OrcamentoUpdate,
    perfil: dict = Depends(require_topografo),
):
    """Atualiza um orçamento. Apenas topógrafo."""
    try:
        # Verificar permissão
        r = (
            supabase.table("orcamentos")
            .select("projeto_id, lote_id")
            .eq("id", orcamento_id)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")

        if r.data[0].get("projeto_id"):
            _projeto_autorizado(r.data[0]["projeto_id"], perfil)
        elif r.data[0].get("lote_id"):
            _lote_autorizado(r.data[0]["lote_id"], perfil, escrita=True)

        # Preparar dados para atualização
        data = {}
        if orcamento.valor is not None:
            data["valor"] = orcamento.valor
        if orcamento.status is not None:
            data["status"] = orcamento.status
        if orcamento.observacoes is not None:
            data["observacoes"] = orcamento.observacoes

        if not data:
            raise HTTPException(
                status_code=400, detail="Nenhum campo fornecido para atualização"
            )

        response = (
            supabase.table("orcamentos").update(data).eq("id", orcamento_id).execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/orcamentos/{orcamento_id}")
def deletar_orcamento(orcamento_id: int, perfil: dict = Depends(require_topografo)):
    """Deleta um orçamento. Apenas topógrafo."""
    try:
        # Verificar permissão
        r = (
            supabase.table("orcamentos")
            .select("projeto_id, lote_id")
            .eq("id", orcamento_id)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")

        if r.data[0].get("projeto_id"):
            _projeto_autorizado(r.data[0]["projeto_id"], perfil)
        elif r.data[0].get("lote_id"):
            _lote_autorizado(r.data[0]["lote_id"], perfil, escrita=True)

        response = (
            supabase.table("orcamentos").delete().eq("id", orcamento_id).execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Orçamento não encontrado")
        return {"ok": True, "message": "Orçamento deletado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DESPESAS ====================
@app.get("/api/despesas")
def listar_despesas(
    projeto_id: Optional[int] = None, perfil: dict = Depends(get_perfil)
):
    """Lista despesas. Apenas topógrafo."""
    try:
        if perfil.get("role") != "topografo":
            raise HTTPException(status_code=403, detail="Acesso restrito a Topógrafo")

        query = supabase.table("despesas").select("*")

        if projeto_id:
            _projeto_autorizado(projeto_id, perfil)
            query = query.eq("projeto_id", projeto_id)
        else:
            # Listar todas as despesas dos projetos do tenant
            projs = (
                supabase.table("projetos")
                .select("id")
                .eq("tenant_id", perfil["tenant_id"])
                .execute()
            )
            ids = [p["id"] for p in (projs.data or [])]
            if ids:
                query = query.in_("projeto_id", ids)
            else:
                return []

        response = query.execute()
        # Ordenar manualmente: mais recente primeiro
        data = sorted(
            response.data or [],
            key=lambda x: (x.get("data", ""), x.get("criado_em", "")),
            reverse=True,
        )
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/despesas/{despesa_id}")
def obter_despesa(despesa_id: int, perfil: dict = Depends(require_topografo)):
    """Obtém uma despesa específica."""
    try:
        r = supabase.table("despesas").select("*").eq("id", despesa_id).execute()
        if not r.data:
            raise HTTPException(status_code=404, detail="Despesa não encontrada")
        despesa = r.data[0]

        # Verificar permissão
        _projeto_autorizado(despesa["projeto_id"], perfil)

        return despesa
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/despesas")
def criar_despesa(despesa: DespesaCreate, perfil: dict = Depends(require_topografo)):
    """Cria uma nova despesa. Apenas topógrafo."""
    try:
        # Verificar que projeto pertence ao tenant
        _projeto_autorizado(despesa.projeto_id, perfil)

        data = {
            "projeto_id": despesa.projeto_id,
            "descricao": despesa.descricao,
            "valor": despesa.valor,
            "data": despesa.data if despesa.data else datetime.now().date().isoformat(),
            "categoria": despesa.categoria or "OUTROS",
            "observacoes": despesa.observacoes,
        }
        response = supabase.table("despesas").insert(data).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/despesas/{despesa_id}")
def atualizar_despesa(
    despesa_id: int, despesa: DespesaUpdate, perfil: dict = Depends(require_topografo)
):
    """Atualiza uma despesa. Apenas topógrafo."""
    try:
        # Verificar permissão
        r = (
            supabase.table("despesas")
            .select("projeto_id")
            .eq("id", despesa_id)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=404, detail="Despesa não encontrada")

        _projeto_autorizado(r.data[0]["projeto_id"], perfil)

        # Preparar dados para atualização
        data = {}
        if despesa.descricao is not None:
            data["descricao"] = despesa.descricao
        if despesa.valor is not None:
            data["valor"] = despesa.valor
        if despesa.data is not None:
            data["data"] = despesa.data
        if despesa.categoria is not None:
            data["categoria"] = despesa.categoria
        if despesa.observacoes is not None:
            data["observacoes"] = despesa.observacoes

        if not data:
            raise HTTPException(
                status_code=400, detail="Nenhum campo fornecido para atualização"
            )

        response = (
            supabase.table("despesas").update(data).eq("id", despesa_id).execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Despesa não encontrada")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/despesas/{despesa_id}")
def deletar_despesa(despesa_id: int, perfil: dict = Depends(require_topografo)):
    """Deleta uma despesa. Apenas topógrafo."""
    try:
        # Verificar permissão
        r = (
            supabase.table("despesas")
            .select("projeto_id")
            .eq("id", despesa_id)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=404, detail="Despesa não encontrada")

        _projeto_autorizado(r.data[0]["projeto_id"], perfil)

        response = supabase.table("despesas").delete().eq("id", despesa_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Despesa não encontrada")
        return {"ok": True, "message": "Despesa deletada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PAGAMENTOS (Listagem) ====================
@app.get("/api/pagamentos")
def listar_pagamentos(
    projeto_id: Optional[int] = None,
    lote_id: Optional[int] = None,
    perfil: dict = Depends(get_perfil),
):
    """Lista pagamentos recebidos. Topógrafo vê do seu tenant. Proprietário vê dos seus lotes."""
    try:
        query = supabase.table("pagamentos").select("*")

        if perfil.get("role") == "topografo" and perfil.get("tenant_id"):
            # Topógrafo: filtrar por projetos do tenant
            if projeto_id:
                _projeto_autorizado(projeto_id, perfil)
                # Buscar lotes do projeto e filtrar pagamentos
                lotes = (
                    supabase.table("lotes")
                    .select("id")
                    .eq("projeto_id", projeto_id)
                    .execute()
                )
                ids = [lote["id"] for lote in (lotes.data or [])]
                if ids:
                    query = query.in_("lote_id", ids)
                else:
                    return []
            elif lote_id:
                _lote_autorizado(lote_id, perfil, escrita=False)
                query = query.eq("lote_id", lote_id)
            else:
                # Listar todos os pagamentos dos projetos do tenant
                projs = (
                    supabase.table("projetos")
                    .select("id")
                    .eq("tenant_id", perfil["tenant_id"])
                    .execute()
                )
                ids = [p["id"] for p in (projs.data or [])]
                if ids:
                    lotes = (
                        supabase.table("lotes")
                        .select("id")
                        .in_("projeto_id", ids)
                        .execute()
                    )
                    lote_ids = [lote["id"] for lote in (lotes.data or [])]
                    if lote_ids:
                        query = query.in_("lote_id", lote_ids)
                    else:
                        return []
                else:
                    return []
        elif perfil.get("role") == "proprietario":
            # Proprietário: apenas dos seus lotes
            if lote_id:
                _lote_autorizado(lote_id, perfil, escrita=False)
                query = query.eq("lote_id", lote_id)
            else:
                # Listar pagamentos de todos os lotes do proprietário
                lotes = (
                    supabase.table("lotes")
                    .select("id")
                    .eq("email_cliente", perfil.get("email", ""))
                    .execute()
                )
                ids = [lote["id"] for lote in (lotes.data or [])]
                if ids:
                    query = query.in_("lote_id", ids)
                else:
                    return []
        else:
            return []

        response = query.execute()
        # Ordenar manualmente: mais recente primeiro
        data = sorted(
            response.data or [],
            key=lambda x: (x.get("data_pagamento", ""), x.get("criado_em", "")),
            reverse=True,
        )
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Register routers
app.include_router(contracts_router)
app.include_router(ai_router)
app.include_router(documents_router)
app.include_router(intake_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
