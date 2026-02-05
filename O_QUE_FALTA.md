# 📋 O que ainda precisa ser feito

## ✅ IMPLEMENTADO NESTA SESSÃO (2025-02-05)

### Frontend
- [x] LayerControl component (visibilidade + opacidade)
- [x] DrawMapValidation component (mapa com 4 layers + ferramentas)
- [x] ValidarDesenhos página (grid 3-colunas integrado)
- [x] 4 polígonos de exemplo (cliente, oficial, sobreposições, limites)
- [x] Ferramentas: Snap, Edit, Measure, Area
- [x] Cálculos: Haversine (distância), planarArea (área)
- [x] Feedback visual (medições em tempo real)
- [x] Responsividade (3 breakpoints)
- [x] CSS completo (~600 linhas)

### Documentação
- [x] FLUXO_LAYER_CONTROL.md
- [x] MAPA_INTEGRACACAO_COMPLETA.md
- [x] ARQUITETURA_FINAL_MAPA.md
- [x] STATUS_MAPA_INTEGRADO.md

---

## ⚠️ CRÍTICO - HOJE (2025-02-05)

### 1. Testar Mapa no Browser
```bash
npm run dev
# Abrir: http://localhost:4200/topografo/validar-desenhos
```

**Checklist:**
- [ ] Mapa carrega
- [ ] 4 layers renderizam
- [ ] LayerControl responde
- [ ] Checkboxes funcionam
- [ ] Sliders manipulam opacidade
- [ ] Nenhum erro no console F12

**Se não funcionar:**
```bash
# Verificar imports
npm run typecheck

# Ver erros em detalhes
npm run build

# Procurar: "cannot find @arcgis/core"
# Solução: npm install @arcgis/core
```

---

## 🟡 IMPORTANTE - PRÓXIMAS 48 HORAS

### 2. Backend - GET /api/lotes/{id}/layers
**File:** `apps/api/routers/lotes.py`

**Adicionar endpoint:**
```python
@router.get("/api/lotes/{lote_id}/layers")
async def get_lote_layers(lote_id: str, db: Session):
    """
    Retorna as 4 layers de validação
    
    Response:
    {
      "cliente": {
        "id": "cliente",
        "label": "Desenho Cliente",
        "color": "#999999",
        "visible": true,
        "opacity": 50,
        "graphics": [
          {
            "geometry": "POLYGON((lat lon, ...))",  # WKT
            "type": "polygon"
          }
        ]
      },
      "oficial": {...},
      "sobreposi": [...],
      "limites": [...]
    }
    """
```

**Fields to use:**
- `Lote.geom_cliente` (initial drawing)
- `Lote.geom_oficial` (edited)
- PostGIS ST_Intersects (overlaps with neighbors)
- PostGIS ST_Touches (shared limits)

**Tempo:** 1-2 horas

---

### 3. Backend - Validação PostGIS
**File:** `apps/api/routers/lotes.py`

**Adicionar endpoints:**
```python
@router.post("/api/lotes/{lote_id}/validar-overlaps")
async def validate_overlaps(lote_id: str, geometry_wkt: str, db: Session):
    """Detecta sobreposições com vizinhos"""
    # ST_Intersects com todas lotes do projeto
    
@router.post("/api/lotes/{lote_id}/validar-topografia")
async def validate_topografia(lote_id: str, request: ValidateRequest, db: Session):
    """Marca como validado pelo topografo"""
    # Atualizar status DESENHO → VALIDACAO_SIGEF
    # Salvar geom_oficial
```

**Tempo:** 2-3 horas

---

## 🟢 IMPORTANTE - PRÓXIMA SEMANA

### 4. Frontend - Contract Preview/Signing
**New Files:**
- `apps/web/src/components/ContractForm.tsx` (form fields)
- `apps/web/src/components/ContractPreview.tsx` (PDF preview)
- Integrar em `apps/web/src/pages/topografo/GerarPecas.tsx`

**Backend está 100% pronto:**
- POST /api/contracts/generate ✅
- POST /api/contracts/sign ✅
- GET /api/contracts/{id} ✅

**Frontend precisa:**
- Form UI para dados contrato
- Preview HTML/PDF
- Botão assinar
- Integração com endpoint

**Tempo:** 4-6 horas

---

### 5. Tests - Unit + E2E
**Test files to create:**
- `apps/web/src/components/maps/DrawMapValidation.test.tsx`
- `apps/web/src/components/LayerControl.test.tsx`
- `apps/web/src/pages/topografo/ValidarDesenhos.test.tsx`
- E2E: `apps/web-e2e/src/validar-desenhos.spec.ts`

**Uso:** Playwright (já configurado)

**Tempo:** 8-10 horas

---

## 📋 ANTIGOS - Ainda Aplicáveis

### DNS na Hostinger (1x)
**Arquivo existente:** [Veja O_QUE_FALTA.md original]

---

## 🎯 PRIORIDADES

### MVP (Essencial para launch)
1. ⚠️ Testar mapa (hoje)
2. ⚠️ Backend layers API (amanhã)
3. ⚠️ PostGIS validação (amanhã)
4. ⚠️ Frontend contrato UI (próxima semana)
5. ⚠️ Tests básicos (próxima semana)

### Nice-to-have (Pós-MVP)
1. SnapTool logic (lógica real)
2. EditTool refinement
3. Documentação usuário
4. Performance (lazy load)
5. Security (rate limiting)

---

## 📊 Estimate

| Task | Time | Status |
|------|------|--------|
| Teste mapa | 30 min | ⚠️ |
| Backend layers | 2h | ❌ |
| PostGIS validation | 3h | ❌ |
| Contract UI | 5h | ❌ |
| Tests | 8h | ❌ |
| Deploy | 2h | ❌ |
| **TOTAL** | **20h** | **~2-3 dias** |

---

## ✅ Final Checklist

```
MÃP INTEGRADO
[ ] Componentes criados
[ ] CSS escrito
[ ] ValidarDesenhos integrado
[ ] Dados de exemplo (4 polígonos)
[ ] Documentação completa
[ ] ✅ PRONTO PARA TESTE

BACKEND FALTANDO
[ ] Layers API
[ ] PostGIS validation
[ ] Contract signing logic (já existe!)
[ ] Tests

FRONTEND FALTANDO
[ ] Contract UI
[ ] Tests

DEPLOYMENT
[ ] VPS test
[ ] SSL check
[ ] Live deploy
```

---

**Last Update**: 2025-02-05 17:00  
**Status**: 85% Complete  
**Next Step**: Run `npm run dev` and test map

Depois copie a chave pública para o VPS (instruções no script).

**Resultado:** `scp` não pede senha e não abre Bloco de Notas.

---

## 📋 Resumo final

| Item | Status | Tempo |
|------|--------|-------|
| **DNS** | ❌ Manual | ~2 min |
| **Senha (upload)** | ❌ Manual | ~30 seg |
| **SUPABASE_SERVICE_KEY** | ✅ Automático | 0 |
| **JWT_SECRET** | ✅ Automático | 0 |
| **Deploy** | ✅ Automático | 0 |

**Total manual:** ~2-3 minutos (só DNS + senha no upload)

**Com SSH Key:** ~2 minutos (só DNS)

---

## 🎯 Deploy completo (modo automático)

1. **DNS:** Configure na Hostinger (2 min)
2. **Upload:** WinSCP ou `PREPARAR_UPLOAD.ps1` (3 min)
3. **Deploy:** `source /root/ENV_VARS_VPS.sh && bash /root/deploy-completo.sh` (automático)

**Pronto!** 🎉
