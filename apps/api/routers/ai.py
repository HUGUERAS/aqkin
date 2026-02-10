"""AI Chat endpoint using Claude API."""

import json
import os
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_perfil

# Import anthropic at module scope to avoid NameError in exception handling
try:
    import anthropic
except ImportError:
    anthropic = None

router = APIRouter(tags=["AI"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# In-memory rate limiting: user_id -> list of timestamps
_rate_limits: dict[str, list[float]] = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 10  # requests per window


class ChatRequest(BaseModel):
    messages: list[dict]
    user_role: Optional[str] = None
    model: str = "claude-sonnet-4-20250514"


class ChatResponse(BaseModel):
    response: str
    mood: str = "helpful"
    suggested_questions: list[str] = []


SYSTEM_PROMPT_TOPOGRAFO = """Você é o assistente AI da plataforma AtivoReal, especializado em ajudar topógrafos com georreferenciamento de imóveis rurais no Brasil.

Você tem conhecimento sobre:
- Normas do INCRA para georreferenciamento (Lei 10.267/2001, Decreto 4.449/2002)
- Sistema SIGEF (Sistema de Gestão Fundiária)
- Topologia de parcelas e validação geométrica
- Memorial descritivo e peças técnicas
- Precisão posicional e tolerâncias
- Sobreposições e confrontações
- Certificação de imóveis rurais
- Fluxo de trabalho de projetos de georreferenciamento

Responda sempre em português brasileiro. Seja técnico quando necessário, mas acessível.
Formate suas respostas em Markdown quando útil (listas, negrito, código).

Ao final de cada resposta, retorne um JSON com a seguinte estrutura:
```json
{
  "response": "sua resposta em markdown",
  "mood": "helpful",
  "suggested_questions": ["pergunta sugerida 1", "pergunta sugerida 2"]
}
```
As perguntas sugeridas devem ser relevantes ao contexto da conversa."""

SYSTEM_PROMPT_PROPRIETARIO = """Você é o assistente AI da plataforma AtivoReal, especializado em ajudar proprietários rurais com regularização fundiária e georreferenciamento no Brasil.

Você tem conhecimento sobre:
- O que é georreferenciamento e por que é necessário
- Documentação necessária para regularização
- Processo de certificação de imóveis rurais
- Como funciona o desenho de área na plataforma
- Vizinhos confrontantes e documentação
- Prazos e custos envolvidos
- Lei 10.267/2001 em linguagem acessível

Responda sempre em português brasileiro de forma clara e acessível, evitando jargão técnico excessivo.
Formate suas respostas em Markdown quando útil (listas, negrito).

Ao final de cada resposta, retorne um JSON com a seguinte estrutura:
```json
{
  "response": "sua resposta em markdown",
  "mood": "helpful",
  "suggested_questions": ["pergunta sugerida 1", "pergunta sugerida 2"]
}
```
As perguntas sugeridas devem ser relevantes ao contexto e em linguagem simples."""


def _check_rate_limit(user_id: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = time.time()
    if user_id not in _rate_limits:
        _rate_limits[user_id] = []

    # Clean old entries
    _rate_limits[user_id] = [
        t for t in _rate_limits[user_id] if now - t < RATE_LIMIT_WINDOW
    ]

    if len(_rate_limits[user_id]) >= RATE_LIMIT_MAX:
        return False

    _rate_limits[user_id].append(now)
    return True


def _parse_ai_response(text: str) -> dict:
    """Try to parse structured JSON from Claude's response, fallback to raw text."""
    # Try to find JSON block in the response
    try:
        # Look for ```json ... ``` block
        if "```json" in text:
            start = text.index("```json") + 7
            end = text.index("```", start)
            json_str = text[start:end].strip()
            parsed = json.loads(json_str)
            return {
                "response": parsed.get("response", text),
                "mood": parsed.get("mood", "helpful"),
                "suggested_questions": parsed.get("suggested_questions", []),
            }
    except (ValueError, json.JSONDecodeError):
        pass

    # Try to parse the entire text as JSON
    try:
        parsed = json.loads(text)
        return {
            "response": parsed.get("response", text),
            "mood": parsed.get("mood", "helpful"),
            "suggested_questions": parsed.get("suggested_questions", []),
        }
    except (ValueError, json.JSONDecodeError):
        pass

    # Fallback: return raw text
    return {
        "response": text,
        "mood": "helpful",
        "suggested_questions": [],
    }


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, perfil: dict = Depends(get_perfil)):
    """Send a message to Claude and get a response."""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chave da API de AI não configurada. Contate o administrador.",
        )

    user_id = perfil.get("user_id", "anonymous")

    if not _check_rate_limit(user_id):
        raise HTTPException(
            status_code=429,
            detail="Limite de requisições excedido. Aguarde um minuto.",
        )

    # Determine system prompt based on role
    role = request.user_role or perfil.get("role", "proprietario")
    system_prompt = (
        SYSTEM_PROMPT_TOPOGRAFO if role == "topografo" else SYSTEM_PROMPT_PROPRIETARIO
    )

    # Check if anthropic is available
    if anthropic is None:
        raise HTTPException(
            status_code=503,
            detail="Pacote anthropic não instalado no servidor.",
        )

    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        # Filter and validate messages
        api_messages = []
        for msg in request.messages:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                api_messages.append(
                    {"role": msg["role"], "content": msg["content"]}
                )

        if not api_messages:
            raise HTTPException(status_code=400, detail="Nenhuma mensagem válida.")

        response = client.messages.create(
            model=request.model,
            max_tokens=1024,
            system=system_prompt,
            messages=api_messages,
        )

        raw_text = response.content[0].text
        parsed = _parse_ai_response(raw_text)

        return ChatResponse(**parsed)

    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Erro na API de AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
