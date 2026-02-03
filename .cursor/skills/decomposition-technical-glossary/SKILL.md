---
name: decomposition-technical-glossary
description: Identifica pedidos muito amplos e sugere decomposição em blocos menores (um tijolo por vez). Mapeia linguagem natural para termos técnicos (PostGIS, topologia, overlap, SIRGAS 2000) para ativar as skills corretas. Use quando o usuário pedir algo grande demais (ex: "crie um app de topografia"), usar linguagem coloquial sobre terrenos/divisas, ou quando precisar traduzir intenções para implementação técnica no projeto Ativo Real.
---

# Decomposição e Glossário Técnico

Esta skill orienta como quebrar problemas grandes e usar a terminologia certa para a IA implementar corretamente no projeto Ativo Real (regularização fundiária).

---

## Parte 1: Decomposição (Dividir para Conquistar)

### Problema

Pedidos como "Crie um app de topografia" são muito amplos. A IA se perde ao tentar implementar tudo de uma vez.

### Solução: Um tijolo por vez

Quando o usuário fizer um pedido amplo demais:

1. **Identifique** que o escopo é grande
2. **Sugira** decomposição em blocos menores
3. **Peça** que o usuário escolha o primeiro bloco

### Blocos comuns no Ativo Real

| Bloco | O que inclui | Exemplo de pedido |
|-------|--------------|-------------------|
| **Arquitetura** | Estrutura de pastas, stack, monorepo | "Defina a estrutura de pastas do projeto" |
| **Banco de dados** | Schema, tabelas, PostGIS | "Crie o schema do banco com lotes e geometrias" |
| **Mapa** | OpenLayers, DrawMap, ViewMap | "Implemente o componente de desenho no mapa" |
| **Validação** | PostGIS, topologia, overlap | "Adicione validação de sobreposição" |
| **Documentos** | Parsing, templates, peças técnicas | "Implemente extração de matrícula" |

### Fluxo de decomposição

```
Usuário: "Crie um app de topografia"
     ↓
IA: "Esse escopo é amplo. Sugiro quebrar em:
     1. Estrutura de pastas e stack
     2. Banco de dados (schema + PostGIS)
     3. Mapa interativo (OpenLayers)
     4. Validação de topologia
     Qual bloco você quer implementar primeiro?"
     ↓
Usuário: "Primeiro a estrutura de pastas"
     ↓
IA: [Implementa apenas isso]
```

### Quando sugerir decomposição

- Pedidos com 3+ funcionalidades distintas
- Palavras como "app completo", "sistema inteiro", "tudo"
- Ausência de foco em uma tarefa específica

---

## Parte 2: Glossário Técnico (Termos Gatilho)

Para a IA programar direito, use (ou interprete) as palavras que ativam as skills corretas.

### Mapeamento: Linguagem natural → Técnico

| O que o usuário quer dizer | Termo técnico / Skill a ativar |
|----------------------------|--------------------------------|
| "Vizinho invada o terreno" | **Validação de Topologia** com PostGIS para evitar **Overlap** (sobreposição) |
| "Divisas não batem" | **ST_Intersects**, **ST_Overlaps**, validação topológica |
| "Desenhar meu lote no mapa" | **DrawMap** (OpenLayers), polígono, WKT, SRID 4674 |
| "Ver onde fica" | **ViewMap**, coordenadas SIRGAS 2000 |
| "Extrair dados da matrícula" | **Parsing de documentos**, OCR, `document-parsing-ocr` |
| "Gerar memorial/ART" | **Templates de peças técnicas**, `technical-documents-generator` |
| "Coordenadas do terreno" | **SIRGAS 2000**, SRID 4674, PostGIS geography |
| "Saber o endereço do ponto" | **Geocodificação reversa**, reverse geocoding |
| "Polígono inválido" | **ST_IsValid**, **ST_MakeValid** |
| "Área em hectares" | **ST_Area** com `::geography`, divisão por 10000 |

### Frases-modelo para o usuário

Em vez de linguagem coloquial, use:

| ❌ Evitar | ✅ Preferir |
|----------|-------------|
| "Quero que o vizinho não invada o terreno" | "Implemente validação de topologia com PostGIS para evitar overlap (sobreposição)" |
| "O cliente desenha o terreno errado" | "Adicione validação de geometria (ST_IsValid) antes de salvar" |
| "Preciso do documento da prefeitura" | "Gere Memorial Descritivo usando template com dados do lote" |
| "Pegar as informações do PDF" | "Extraia dados da matrícula usando OCR e parsing" |
| "Onde fica no mapa" | "Exiba geometria no ViewMap com coordenadas SIRGAS 2000" |

### Bibliotecas e termos-chave por domínio

| Domínio | Termos gatilho | Skill relacionada |
|---------|----------------|-------------------|
| Geometria/Mapa | PostGIS, ST_*, WKT, GeoJSON, OpenLayers | spatial-topology-validator |
| Coordenadas | SIRGAS 2000, SRID 4674 | sirgas-2000-reference |
| Topologia | Overlap, ST_Intersects, ST_Overlaps | spatial-topology-validator |
| Documentos | OCR, parsing, matrícula, confrontações | document-parsing-ocr |
| Peças técnicas | ART, Memorial Descritivo, template | technical-documents-generator |
| Endereço | Geocodificação reversa, reverse geocoding | reverse-geocoding |

---

## Resumo para a IA

1. **Pedido amplo?** → Sugira decomposição e peça o primeiro bloco
2. **Linguagem coloquial?** → Traduza para termos técnicos antes de implementar
3. **Mencionar terreno/vizinho/divisa?** → Provavelmente é validação de topologia (PostGIS, overlap)
4. **Mencionar documento/matrícula?** → document-parsing-ocr
5. **Mencionar memorial/ART?** → technical-documents-generator
6. **Mencionar mapa/desenho?** → DrawMap, ViewMap, OpenLayers, SIRGAS 2000
