---
name: problem-decomposition-glossary
description: Ensina a decompor pedidos grandes em blocos (arquitetura, workspace, stack) e a usar terminologia técnica como gatilhos para as bibliotecas certas (PostGIS, topologia, overlap). Use quando o usuário pedir algo muito amplo (ex. "crie um app de topografia"), quando descrever requisitos em linguagem leiga, ou quando quiser formular prompts para respostas melhores no projeto Ativo Real.
---

# Decomposição e Glossário Técnico

Este skill orienta dois comportamentos: **dividir para conquistar** (um tijolo por vez) e **usar palavras-gatilho** que ativam as bibliotecas e conceitos corretos.

---

## 1. Decomposição (Dividir para Conquistar)

Pedidos como "Crie um app de topografia" são grandes demais: a IA se perde e o resultado fica vago ou incompleto.

### O que fazer

Quebrar o problema em **blocos** e pedir **um de cada vez**:

| Ordem | Bloco | Exemplo de pedido |
|-------|--------|-------------------|
| 1 | **Estrutura / Arquitetura** | "Defina a estrutura de pastas do projeto (front, API, banco)." |
| 2 | **Workspace / Ambiente** | "Configure o workspace (Node, Python, Docker) para este repo." |
| 3 | **Banco de dados** | "Crie o schema SQL (tabelas de lotes, geometrias) para o Supabase." |
| 4 | **Mapa / UI** | "Implemente só o mapa interativo com OpenLayers e desenho de polígono." |
| 5 | **Regras de negócio** | "Adicione validação de topologia ao salvar o lote." |

### Na prática

- **Evitar:** "Faça o sistema de topografia completo."
- **Preferir:** Primeiro pedir a estrutura de pastas; depois só o banco; depois só o mapa; depois só a validação. Um tijolo por vez.

### Checklist ao receber um pedido grande

1. Identificar o **primeiro bloco** (geralmente estrutura ou schema).
2. Responder só para esse bloco e sugerir o próximo passo.
3. Não implementar tudo de uma vez a menos que o usuário peça explicitamente.

---

## 2. Terminologia Técnica (Glossário)

Para a IA escolher as bibliotecas e abordagens certas, use **palavras-gatilho** em vez de só linguagem do dia a dia.

### Regra

Em vez de descrever só o efeito desejado ("quero que o vizinho não invada o terreno"), diga **o conceito técnico** e a **ferramenta**: "Implemente **validação de topologia** usando **PostGIS** para evitar **overlap (sobreposição)**."

### Glossário rápido (linguagem leiga → gatilho técnico)

| O usuário diz… | Use / sugira… |
|----------------|----------------|
| Vizinho não invada o terreno / não sobrepor | **Validação de topologia**, **PostGIS**, **overlap**, **ST_Intersects**, **sobreposição** |
| Desenhar o lote no mapa | **Polígono**, **OpenLayers**, **draw**, **geometria**, **GeoJSON** |
| Onde fica o ponto no mundo | **Coordenadas**, **SIRGAS 2000**, **SRID 4674**, **latitude/longitude** |
| Endereço ou nome do lugar do ponto | **Reverse geocoding**, **nominatim** ou serviço de geocoding |
| Documento da matrícula / escaneado | **OCR**, **parsing**, **extração de dados**, **matrícula** |
| Peça para o cartório / prefeitura | **ART**, **Memorial Descritivo**, **Requerimento**, **gerador de peças técnicas** |
| Lote fechado / desenho certo | **Polígono fechado**, **ST_IsValid**, **ST_MakeValid**, **topologia** |
| Área em hectares / tamanho do lote | **ST_Area**, **geography**, **área em m² ou ha** |

### Exemplos de reformulação

- **Antes:** "Quero que o vizinho não invada o terreno."  
  **Depois:** "Implemente validação de topologia com PostGIS para evitar overlap (sobreposição) entre lotes."

- **Antes:** "Preciso que o usuário desenhe onde é o terreno."  
  **Depois:** "Adicione desenho de polígono no mapa (OpenLayers) e salve como geometria (GeoJSON/WKT) no banco."

- **Antes:** "Tem que dar certo no Brasil."  
  **Depois:** "Use SIRGAS 2000 (SRID 4674) nas geometrias e no mapa."

---

## 3. Quando aplicar este skill

- O usuário faz um **pedido muito amplo** (ex.: "crie um app de topografia").
- O usuário descreve o que quer em **linguagem leiga** (invadir terreno, desenhar no mapa, documento da matrícula).
- O usuário quer **dicas de como pedir** para a IA responder melhor.

Nesses casos: sugerir decomposição em blocos e reformular ou completar o pedido com termos do glossário (PostGIS, topologia, overlap, OpenLayers, SIRGAS 2000, etc.).

---

## Recursos adicionais

- Glossário expandido e mais termos do domínio: [reference.md](reference.md)
- Validação espacial concreta: skill `spatial-topology-validator`
- Sistema de referência: skill `sirgas-2000-reference`
