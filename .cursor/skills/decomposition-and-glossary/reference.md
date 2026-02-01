# Referência: Glossário e Decomposição

## Glossário técnico (termos gatilho)

Use estes termos ao pedir ou descrever funcionalidades para ativar os skills e bibliotecas corretos.

### Espacial / PostGIS / Topologia

| Coloquial | Técnico |
|-----------|---------|
| Vizinho invadindo o terreno | Overlap, sobreposição; validação de topologia com PostGIS |
| Desenho que cruza a divisa | ST_Intersects, detecção de overlap entre polígonos |
| Desenho mal fechado ou que se cruza | Geometria inválida; ST_IsValid, ST_MakeValid |
| Medir área do lote em hectares | ST_Area(geom::geography) / 10000 (m² → ha) |
| Perímetro do lote | ST_Perimeter(geom::geography) |
| Polígono no banco | GEOMETRY(POLYGON, 4674), WKT, GeoJSON |

### Sistema de referência

| Coloquial | Técnico |
|-----------|---------|
| Coordenadas do Brasil / oficiais | SIRGAS 2000, SRID 4674, EPSG:4674 |
| Lat/lon para o mapa web | EPSG:3857 (Web Mercator) para exibição; converter de/para 4674 |
| Conversão de coordenadas | fromLonLat / toLonLat (OpenLayers); SRID no PostGIS |

### Mapas e frontend

| Coloquial | Técnico |
|-----------|---------|
| Desenhar o lote no mapa | Layer de desenho OpenLayers; polígono WKT/GeoJSON |
| Mostrar os lotes no mapa | ViewMap; carregar geometrias do backend; projeção 3857/4674 |
| Onde fica esse ponto? | Reverse geocoding; coordenadas → endereço/lote/quadra |

### Documentos e cadastro

| Coloquial | Técnico |
|-----------|---------|
| Ler dados da matrícula do imóvel | Parsing/OCR de matrícula; extração de confrontações |
| Gerar documento oficial do lote | Peças técnicas; ART; Memorial Descritivo; template com dados do banco |

### Validações e regras

| Coloquial | Técnico |
|-----------|---------|
| Área mínima/máxima do lote | Validação de área (hectares); limites em regra de negócio |
| Lote tem que ser um polígono fechado | ST_IsValid; anel exterior fechado (primeiro ponto = último ponto) |
| Não sobrepor área pública | Validação de topologia contra camada de logradouros/áreas públicas |

---

## Exemplos de decomposição

### Exemplo 1: "Quero um app de topografia"

**Ruim:** implementar tudo de uma vez.

**Bom — em blocos:**

1. **Estrutura:** "Defina a estrutura de pastas: apps/api, apps/web, database/init."
2. **Banco:** "Crie o schema SQL com tabelas projeto, lote (geom GEOMETRY(POLYGON, 4674)), e índices GIST em geom."
3. **API:** "Crie o endpoint GET /api/projetos/:id/lotes que retorna os lotes em GeoJSON."
4. **Mapa:** "Implemente o componente ViewMap que chama esse endpoint e exibe os lotes com OpenLayers."
5. **Desenho:** "Adicione no ViewMap uma camada de desenho para novo polígono e retorne WKT ao salvar."
6. **Validação:** "Antes de salvar, chame a validação de topologia (PostGIS) para evitar overlap."

### Exemplo 2: "Sistema para o cliente desenhar o terreno"

**Decomposição:**

1. Tabela e API: "Garanta que existe tabela lotes com geom e endpoint POST /api/lotes com geom em WKT (SRID 4674)."
2. Tela de mapa: "Crie a página DesenharArea que usa DrawMap e envia o WKT do polígono para o POST."
3. Validação: "Integre a validação de topologia em tempo real no DrawMap (evitar overlap)."
4. UX: "Mostre erros/avisos de topologia (sobreposição, área mínima) abaixo do mapa."

### Exemplo 3: "Não deixar o vizinho invadir"

**Rephrase com terminologia:**

- "Implemente validação de **topologia** com **PostGIS** para evitar **overlap** (sobreposição) entre o lote que está sendo editado e os demais lotes do mesmo projeto. Use **ST_Intersects** e **ST_Intersection** para área sobreposta e bloqueie ou alerte conforme a regra de negócio."

Isso ativa o skill `spatial-topology-validator` e direciona a solução para PostGIS.

---

## Quando sugerir decomposição

- O usuário pede "o sistema de...", "o app de...", "tudo do fluxo...".
- A tarefa envolve banco + API + mapa + validação ao mesmo tempo.
- A descrição é longa e mistura muitas funcionalidades.

Sugestão de resposta: "Esse pedido envolve vários blocos (estrutura, banco, API, mapa, validação). Podemos fazer um tijolo por vez. Por onde prefere começar: estrutura de pastas, schema do banco, API dos lotes, tela de mapa ou validação de topologia?"
