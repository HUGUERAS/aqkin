# 🗺️ Visual Guide - Novo Layout

## Página do Cliente: DesenharArea

### ANTES (Atual)

```
┌─────────────────────────────────────────────────────┐
│ Logo | Desenhar | Vizinhos | Docs    [Sair]         │ Header Grande
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │  Pequeno:                                    │   │
│ │  "Use as ferramentas..."                     │   │  ← Mapa Encolhido!
│ │  [Snap] [Edit] [Topology]                    │   │  
│ │                                              │   │
│ │          MAPA (preto, ocupando pouco)        │   │
│ │                                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘

❌ Problema:
  - Mapa muito pequeno (~60% da tela)
  - Header gigante espalhando espaço
  - Ferramentas embutidas e confusas
  - Cores não combinam bem
```

---

### DEPOIS (Novo)

```
┌──────────┬──────────────────────────────────────────┐
│ Logo Desenhar Vizinhos Docs [Sair]                  │ Header Compacto (56px)
├──────────┼────────────────────────────────────────┬─┤
│          │                                        │T│
│ Desenhar │                                        │O│
│ Vizinhos │                                        │O│ Toolbar Flutuante
│ Docs     │          MAPA FULL-SCREEN             │L│ - Draw (Verde)
│          │   Ocupa 90% da tela visível            │B│ - Measure (Âmbar)
│          │   Com espaço respirável                │A│ - Validate (Vermelho)
│          │                                        │R│ - Snap Tool
│          │                                        │S│ - Edit Geometry
│ [+] Mais │                                        │ │
└──────────┴────────────────────────────────────────┴─┘

✅ Melhorias:
  + Mapa ocupa 90%+ da tela
  + Header minimalista (56px vs anterior 72px+)
  + Toolbar flutuante e organizada
  + Cores consistentes e propositais
  + Sidebar com menu bem definido
  + Foco 100% no que importa: O MAPA!
```

---

## Cores e Componentes

### Header / Toolbar

```
┌────────────────────────────────────────────────────┐
│ 🏠 Logo  Desenhar  Vizinhos  Docs    [Sair]        │
│ BG: #0f0f0f (Preto)                                │
│ Border: rgba(255,255,255,0.08)                     │
└────────────────────────────────────────────────────┘
  ↑ Compacto e limpo
```

### Floating Toolbar

```
    ┌─────────────┐
    │  ┌─────┐   │
    │  │ 🖊️  │ Draw (Verde #10b981)
    │  └─────┘   │
    │  ┌─────┐   │
    │  │ 📏  │ Measure (Âmbar #f59e0b)
    │  └─────┘   │
    │  ┌─────┐   │
    │  │ ✓   │ Validate (Vermelho #ef4444)
    │  └─────┘   │
    │  ─────────  │ Divider
    │  ┌─────┐   │
    │  │ ⊞   │ Snap Tool
    │  └─────┘   │
    │  ┌─────┐   │
    │  │ ↔   │ Edit Geometry
    │  └─────┘   │
    │ BG: rgba(15,15,15,0.95) │
    │ Border: rgba(255,255,255,0.08) │
    └─────────────┘
```

### Sidebar (Esquerda)

```
┌──────────────┐
│ Desenhar 📍  │
│ Vizinhos 👥  │
│ Documentos 📄│
│ ──────────── │
│ [+] Mais     │
└──────────────┘
  BG: #1a1a1a
  Text: #b0b0b0
  Width: 280px (desktop)
```

---

## Responsividade

### Desktop (1200px+)

```
┌─────────────────────────────────────────────────────┐
│ LogoMenu  Nav        [Toolbar Direita]              │
├──────────┬───────────────────────────────────────┬─┤
│ Sidebar  │                                       │T│
│ (280px)  │        MAPA FULL-SCREEN (95%)        │B│
│          │                                       │ │
└──────────┴───────────────────────────────────────┴─┘
```

### Tablet (768px - 1024px)

```
┌─────────────────────────────────────┐
│ ☰ LogoMenu  Nav      [Toolbar]      │
├───────────────────────────────────┬─┤
│                                   │T│
│        MAPA FULL-SCREEN (90%)     │B│
│                                   │ │
└───────────────────────────────────┴─┘
  (Sidebar oculto, abre com ☰)
```

### Mobile (< 768px)

```
┌──────────────────────────┐
│ ☰ Logo  Nav  [Toolbar]   │
├──────────────────────────┤
│                          │
│  MAPA FULL-SCREEN (100%) │
│                          │
└──────────────────────────┘
  (Sidebar: drawer overlay)
```

---

## Sistema de Cores Aplicado

| Elemento | Antes | Depois |
|----------|-------|--------|
| **Fundo** | Gradiente claro cinzento | Preto #0f0f0f |
| **Superfícies** | Branco | Cinza Escuro #1a1a1a |
| **Bordo** | Múltiplas cores | Branco 8% |
| **Header** | Gradiente azul | Preto sólido |
| **Texto** | Variádio | Branco / Cinza |
| **Destaque (Draw)** | Bronze | Verde #10b981 |
| **Destaque (Menu)** | Bronze | Azul #3b82f6 |
| **Destaque (Validar)** | Nenhum | Vermelho #ef4444 |

---

## Estados dos Botões Toolbar

### Normal

```
┌─────┐
│ 🖊️  │ Border: rgba(255,255,255,0.08)
└─────┘ BG: transparent
```

### Hover

```
┌─────┐
│ 🖊️  │ Border: rgba(255,255,255,0.15)
└─────┘ BG: #2a2a2a
```

### Active + Draw

```
┌─────┐
│ 🖊️  │ Border: #10b981
└─────┘ BG: #10b981, Color: white
```

### Active + Measure

```
┌─────┐
│ 📏  │ Border: #f59e0b
└─────┘ BG: #f59e0b, Color: white
```

---

## Comparação de Espaço

### Antes

```
Overhead (header + margin): ~120px
Espaço útil para mapa: ~calc(100vh - 120px - 32px)
Ocupação do mapa: ~60%
```

### Depois

```
Overhead (header compacto): ~56px
Espaço útil para mapa: ~calc(100vh - 56px)
Ocupação do mapa: ~94%
```

**Ganho: +34% de espaço visual!**

---

## Resumo das Mudanças

✅ **Layout**: Grid com sidebar + main + toolbar flutuante
✅ **Cores**: Dark mode profissional
✅ **Mapa**: Priorizado com 94% de ocupação
✅ **Ferramentas**: Flutuantes no topo direito
✅ **Header**: Compacto (56px vs antes 72px+)
✅ **Responsividade**: 100% em todos os breakpoints
✅ **Acessibilidade**: Mantida com aria-labels

---

## Próximos Passos

1. ✅ Aplicar `map-focused-layout.css` ao invés de `PortalLayout.css`
2. ✅ Usar `FloatingToolbar` component na página DesenharArea
3. ✅ Testar responsividade em mobile
4. ✅ Ajustar cores conforme feedback
5. ✅ Aplicar também no dashboard do topografo
