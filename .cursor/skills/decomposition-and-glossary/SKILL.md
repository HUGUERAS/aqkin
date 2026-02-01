---
name: decomposition-and-glossary
description: Orienta decomposição de pedidos grandes em passos incrementais (arquitetura, workspace, stack) e mapeia linguagem coloquial para terminologia técnica (PostGIS, topologia, overlap, SIRGAS). Use quando o usuário pedir uma feature muito ampla, usar termos informais de terreno/espacial, ou quando o agente deva sugerir quebrar a tarefa em blocos menores.
---

# Decomposição e Terminologia Técnica

Este skill ensina dois comportamentos: **dividir para conquistar** (não aceitar pedidos gigantes de uma vez) e **usar terminologia gatilho** para ativar as bibliotecas e skills certos.

---

## 1. Decomposição (Dividir para Conquistar)

### Problema

Pedidos como "Crie um app de topografia" ou "Faça o sistema de mapas" são grandes demais. A IA se perde e o resultado fica vago ou inconsistente.

### O que fazer

Quebrar o problema em **blocos** e implementar **um tijolo por vez**.

Ordem sugerida:

1. **Estrutura** — pastas, módulos, convenções (workspace)
2. **Dados** — schema do banco, tabelas, PostGIS (banco primeiro)
3. **Backend** — APIs, validações, regras de negócio
4. **Frontend** — telas, componentes, mapa (só depois que dados e API existirem)
5. **Integração** — conectar front ↔ back, testes

### Na prática

| Evite pedir de uma vez | Peça em etapas |
|------------------------|----------------|
| "Crie um app de topografia" | "Defina a estrutura de pastas do projeto" → depois "Crie o schema do banco para lotes e projetos" → depois "Adicione a tela de mapa com desenho de polígono" |
| "Faça o sistema de mapas" | "Crie a tabela `lotes` com geometria PostGIS (SRID 4674)" → "Exponha um endpoint GET /api/lotes" → "Implemente o componente ViewMap que lista os lotes" |
| "Implemente tudo do fluxo do cliente" | "Implemente apenas o upload de documentos" → em seguida "Implemente a tela de desenho de área" → em seguida "Implemente a validação antes de salvar" |

### Checklist ao receber um pedido grande

- [ ] O pedido cabe em uma única tarefa (ex.: "uma tela", "um endpoint", "uma tabela")?
- [ ] Se não: sugerir decomposição e perguntar por qual bloco começar (estrutura, banco, mapa, API, etc.).

---

## 2. Terminologia Técnica (Glossário)

Para a IA programar certo, use **palavras-gatilho** que ativam as bibliotecas e skills adequados.

### Regra

Em vez de descrever só no linguajar do dia a dia, use o **termo técnico** correspondente.

### Tabela rápida

| Você pensa / fala (coloquial) | Diga / use (técnico) |
|------------------------------|----------------------|
| "O vizinho não pode invadir o terreno" | "Validação de **topologia** com **PostGIS** para evitar **overlap** (sobreposição)" |
| "O desenho do lote tem que bater com o que está no registro" | "Geometria em **SIRGAS 2000 (SRID 4674)** e validação de **topologia** com lotes vizinhos" |
| "Medir a área do terreno em hectares" | "**ST_Area(geom::geography)** em m² e conversão para hectares (÷ 10000)" |
| "Onde fica esse ponto no mapa?" | "**Reverse geocoding**" ou "Conversão de coordenadas para endereço/lote" |
| "Não pode cruzar a linha da divisa" | "**ST_Intersects** / detecção de **overlap** entre polígonos" |
| "Sistema de coordenadas do Brasil" | "**SIRGAS 2000**, **SRID 4674**, **EPSG:4674**" |
| "Desenho do terreno no mapa" | "Polígono **WKT** / **GeoJSON**, geometria **PostGIS**, layer de desenho **OpenLayers**" |
| "Documento da matrícula do imóvel" | "**Parsing/OCR** de matrícula, extração de confrontações e dados cadastrais" |
| "Gerar o documento oficial do lote" | "Gerador de **peças técnicas** (ART, Memorial Descritivo) a partir de dados do banco" |

### Gatilhos por skill do projeto

- **PostGIS, topologia, overlap, ST_Intersects, ST_IsValid** → ativam validação espacial (spatial-topology-validator)
- **SIRGAS 2000, SRID 4674, EPSG:4674, coordenadas** → ativam referência geodésica (sirgas-2000-reference)
- **Reverse geocoding, endereço a partir de coordenadas** → ativam reverse-geocoding
- **Matrícula, OCR, extração de confrontações** → ativam document-parsing-ocr
- **ART, Memorial Descritivo, peças técnicas** → ativam technical-documents-generator

---

## Resumo

1. **Pedido grande** → Não implementar tudo de uma vez. Sugerir blocos (estrutura → banco → API → mapa → integração) e perguntar por qual bloco começar.
2. **Pedido com termos vagos** → Rephrase com terminologia técnica (PostGIS, topologia, overlap, SIRGAS, WKT, etc.) para direcionar a IA aos skills e bibliotecas corretos.

- **Referência rápida** (dividir para conquistar + glossário em duas práticas): [dividir-conquistar-glossario.md](dividir-conquistar-glossario.md)
- **Glossário completo** e mais exemplos: [reference.md](reference.md)
