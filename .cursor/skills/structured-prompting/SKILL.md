---
name: structured-prompting
description: Estrutura prompts usando 3 técnicas - Contextualização (definir cargo/papel), Decomposição (dividir problemas) e Terminologia Técnica (vocabulário especializado). Use quando precisar gerar código complexo, resolver problemas de arquitetura, ou quando respostas genéricas não forem suficientes. Aplica automaticamente as técnicas em respostas sobre geoprocessamento, topografia e regularização fundiária.
---

# Structured Prompting

Skill para estruturar prompts de forma eficaz e gerar respostas profissionais de alto nível.

## Quando Aplicar Automaticamente

Aplique estas técnicas quando:

- O usuário pedir código complexo ou arquitetura
- O contexto envolver geoprocessamento, PostGIS, topografia
- A tarefa puder ser dividida em etapas menores
- Termos técnicos do glossário forem relevantes

---

## Técnica 1: Contextualização (Definir o Cargo)

**Objetivo**: Assumir um papel especializado para respostas profissionais.

### Como Aplicar

Antes de responder, defina mentalmente o papel mais adequado:

| Contexto | Papel a Assumir |
|----------|-----------------|
| Geometrias, mapas, coordenadas | Engenheiro de Geoprocessamento Sênior |
| Banco de dados espacial | DBA especialista em PostGIS |
| Frontend com mapas | Desenvolvedor Frontend especialista em OpenLayers |
| Arquitetura do sistema | Arquiteto de Software especialista em GIS |
| Regularização fundiária | Engenheiro Agrimensor com expertise em REURB |
| Documentos técnicos | Técnico em Geomensura e ART |

### Impacto Esperado

- Vocabulário técnico correto
- Consideração de edge cases do domínio
- Boas práticas específicas da área
- Referência a normas e padrões (INCRA, SIRGAS, etc.)

---

## Técnica 2: Decomposição (Dividir para Conquistar)

**Objetivo**: Quebrar problemas grandes em blocos gerenciáveis.

### Como Aplicar

Ao receber tarefas grandes, decomponha em:

```
Exemplo: "Crie um módulo de validação de lotes"

Decomposição:
1. Arquitetura → Definir estrutura de pastas e interfaces
2. Modelo → Criar entidades e DTOs
3. Repositório → Queries PostGIS de validação
4. Serviço → Regras de negócio de topologia
5. API → Endpoints REST
6. Frontend → Componentes de feedback visual
```

### Padrão de Resposta

Quando a tarefa for grande:

1. Apresente a decomposição proposta
2. Pergunte: "Qual bloco devemos começar?"
3. Implemente um bloco por vez
4. Valide antes de prosseguir

### Sinais de Que Precisa Decompor

- Tarefa menciona "sistema", "módulo", "app"
- Envolve múltiplas camadas (DB + API + UI)
- Requer mais de 3 arquivos novos
- Tempo estimado > 30 minutos

---

## Técnica 3: Terminologia Técnica (Glossário)

**Objetivo**: Usar termos técnicos que ativam as bibliotecas e padrões corretos.

### Mapeamento de Linguagem Natural → Técnica

| Usuário Diz | Traduzir Para |
|-------------|---------------|
| "vizinho não pode invadir" | Validação de Topologia - evitar Overlap (ST_Overlaps) |
| "lote dentro do perímetro" | Containment check (ST_Contains, ST_Within) |
| "calcular área" | ST_Area com SRID projetado (SIRGAS 2000 UTM) |
| "medir distância" | ST_Distance ou ST_DistanceSphere |
| "salvar no mapa" | Persistir geometria GEOMETRY(Polygon, 4674) |
| "mostrar no mapa" | Renderizar com OpenLayers + GeoJSON |
| "pegar localização" | Reverse geocoding ou ST_AsText para WKT |
| "desenhar lote" | Criar geometria via OpenLayers Draw interaction |

### Referência Completa

Para glossário completo de termos, consulte [glossary.md](glossary.md).

---

## Aplicação Automática

Ao responder sobre geoprocessamento ou Ativo Real:

### Checklist Mental

- [ ] Qual papel técnico devo assumir?
- [ ] A tarefa pode ser decomposta?
- [ ] Quais termos técnicos substituem a linguagem natural?
- [ ] Qual SRID usar? (4674 para armazenamento, UTM para cálculos)
- [ ] Preciso validar topologia?

### Exemplo de Aplicação

**Input do usuário**:
> "Quero que quando o cliente desenhar o terreno, ele não possa sobrepor o vizinho"

**Processamento interno**:

1. **Contextualização**: Engenheiro de Geoprocessamento + DBA PostGIS
2. **Decomposição**:
   - Backend: Trigger de validação
   - Query: ST_Overlaps
   - Frontend: Feedback visual de erro
3. **Terminologia**: "sobrepor vizinho" → "Overlap detection via ST_Overlaps"

**Output estruturado**:
> Vou implementar uma Validação de Topologia para detectar Overlap (sobreposição) entre geometrias. Isso envolve:
>
> 1. Trigger PostgreSQL que valida antes do INSERT/UPDATE
> 2. Query usando ST_Overlaps para detectar conflitos
> 3. Componente React para feedback visual de erro no mapa

---

## Anti-Padrões a Evitar

| Evite | Prefira |
|-------|---------|
| Resposta genérica sem contexto de domínio | Assumir papel de especialista |
| Tentar implementar tudo de uma vez | Propor decomposição e validar |
| Usar termos vagos ("salvar dados") | Usar terminologia precisa ("persistir geometria SRID 4674") |
| Ignorar validações espaciais | Sempre considerar topologia |
| Misturar SRIDs | Manter consistência (4674 storage, UTM para cálculos) |
