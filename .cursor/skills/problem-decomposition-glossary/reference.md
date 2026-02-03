# Glossário Expandido — Terminologia Técnica

Referência para mapear linguagem do usuário para termos e bibliotecas que a IA deve usar no projeto Ativo Real.

---

## Espacial / Topografia

| Linguagem leiga | Termo técnico / gatilho | Biblioteca / ferramenta |
|-----------------|-------------------------|--------------------------|
| Vizinho não invada / não sobrepor | Topologia, overlap, sobreposição, ST_Intersects | PostGIS |
| Desenhar o lote no mapa | Polígono, draw, geometria, GeoJSON, WKT | OpenLayers, PostGIS |
| Onde fica no mundo | Coordenadas, SIRGAS 2000, SRID 4674 | PostGIS, OpenLayers |
| Lote fechado / desenho certo | ST_IsValid, ST_MakeValid, polígono fechado | PostGIS |
| Área em hectares | ST_Area, geography, área em m²/ha | PostGIS |
| Endereço do ponto | Reverse geocoding | Nominatim ou API de geocoding |
| Divisas / confrontações | Topologia, ST_Touches, ST_Adjacent | PostGIS |

---

## Documentos / Cadastro

| Linguagem leiga | Termo técnico / gatilho | Biblioteca / ferramenta |
|-----------------|-------------------------|--------------------------|
| Documento da matrícula / escaneado | OCR, parsing, extração de dados, matrícula | document-parsing-ocr (skill) |
| Peça para cartório / prefeitura | ART, Memorial Descritivo, Requerimento | technical-documents-generator (skill) |

---

## Blocos de decomposição (ordem sugerida)

1. **Estrutura** — pastas, monorepo, apps (web, api)
2. **Workspace** — Node, Python, Docker, env
3. **Schema** — tabelas, geometrias, RLS (Supabase/PostgreSQL)
4. **Mapa** — OpenLayers, draw, CRS SIRGAS 2000
5. **Validação** — topologia, overlap, área mínima/máxima
6. **Documentos** — upload, OCR, geração de peças

Usar este glossário ao reformular pedidos do usuário ou ao sugerir o próximo bloco na decomposição.
