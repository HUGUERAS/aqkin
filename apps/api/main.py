from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

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

# Supabase Client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# Schemas
class ProjetoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: str = "INDIVIDUAL"

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

# Health Check
@app.get("/")
def health_check():
    return {"status": "online", "service": "Ativo Real API"}

# Projetos
@app.get("/api/projetos")
def listar_projetos():
    try:
        response = supabase.table("projetos").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/projetos")
def criar_projeto(projeto: ProjetoCreate):
    try:
        data = {
            "nome": projeto.nome,
            "descricao": projeto.descricao,
            "tipo": projeto.tipo,
            "status": "RASCUNHO"
        }
        response = supabase.table("projetos").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Lotes
@app.get("/api/lotes")
def listar_lotes(projeto_id: Optional[int] = None):
    try:
        query = supabase.table("lotes").select("*")
        if projeto_id:
            query = query.eq("projeto_id", projeto_id)
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lotes")
def criar_lote(lote: LoteCreate):
    try:
        token = str(uuid.uuid4())
        data = {
            "projeto_id": lote.projeto_id,
            "nome_cliente": lote.nome_cliente,
            "email_cliente": lote.email_cliente,
            "telefone_cliente": lote.telefone_cliente,
            "cpf_cnpj_cliente": lote.cpf_cnpj_cliente,
            "token_acesso": token,
            "link_expira_em": (datetime.now() + timedelta(days=7)).isoformat(),
            "status": "PENDENTE"
        }
        
        # Adiciona geometria se fornecida (WKT)
        if lote.geom_wkt:
            # Converte WKT para geometria PostGIS
            data["geom"] = f"SRID=4674;{lote.geom_wkt}"
        
        response = supabase.table("lotes").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lotes/{lote_id}")
def obter_lote(lote_id: int):
    try:
        response = supabase.table("lotes").select("*").eq("id", lote_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Lote não encontrado")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/lotes/{lote_id}/geometria")
def atualizar_geometria(lote_id: int, geom_wkt: str):
    try:
        data = {"geom": f"SRID=4674;{geom_wkt}"}
        response = supabase.table("lotes").update(data).eq("id", lote_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vizinhos (Confrontantes)
@app.post("/api/vizinhos")
def adicionar_vizinho(vizinho: VizinhoInput):
    try:
        data = {
            "lote_id": vizinho.lote_id,
            "nome_vizinho": vizinho.nome_vizinho,
            "lado": vizinho.lado
        }
        response = supabase.table("vizinhos").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lotes/{lote_id}/vizinhos")
def listar_vizinhos(lote_id: int):
    try:
        response = supabase.table("vizinhos").select("*").eq("lote_id", lote_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Detecção de Sobreposição (PostGIS)
@app.get("/api/lotes/{lote_id}/sobreposicoes")
def detectar_sobreposicoes(lote_id: int):
    try:
        # Busca geometria do lote atual
        lote_response = supabase.table("lotes").select("geom, projeto_id").eq("id", lote_id).execute()
        if not lote_response.data:
            raise HTTPException(status_code=404, detail="Lote não encontrado")
        
        lote = lote_response.data[0]
        projeto_id = lote["projeto_id"]
        
        # Query PostGIS para detectar sobreposições
        query = f"""
        SELECT l.id, l.nome_cliente, 
               ST_Area(ST_Intersection(l.geom, ref.geom)::geography) / 10000.0 as area_sobreposta_ha
        FROM lotes l, 
             (SELECT geom FROM lotes WHERE id = {lote_id}) ref
        WHERE l.projeto_id = {projeto_id}
          AND l.id != {lote_id}
          AND ST_Intersects(l.geom, ref.geom)
          AND l.geom IS NOT NULL
        """
        
        response = supabase.rpc("exec_sql", {"query": query}).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
