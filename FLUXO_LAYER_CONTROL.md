# 🎮 **Controle de Layers - Fluxo Completo**

## 📍 **O Que é Layer Control?**

É o **painel onde o usuário controla qual layer aparece e qual sua transparência** (opacidade).

```
USUARIO
  ↓
[checkbox: on/off]     → Mostra ou esconde a layer
[slider: 0-100%]       → Ajusta transparência (opacidade)
  ↓
MAPA
  ├─ Layer visível com opacidade X
  ├─ Layer oculta (não aparece)
  ├─ Layer semi-transparente (50% opaco)
  └─ Múltiplas layers sobrepostas com diferentes opacidades
```

---

## 🎯 **Fluxo Visual - ValidarDesenhos.tsx**

```
┌─────────────────────────────────────────────────────────────────┐
│ PÁGINA: Validar Desenhos                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐  ┌──────────────────────────┐  ┌────────────┐ │
│ │ LAYER       │  │ MAP + TOOLS              │  │ VALIDATION │ │
│ │ CONTROL     │  │                          │  │ CHECKLIST  │ │
│ │             │  │ ┌────────────────────┐   │  │            │ │
│ │ 🗺️ Layers   │  │ │ 🧲 Snap            │   │  │ ✓ Geomet   │ │
│ │             │  │ │ ✏️ Edit Vertices    │   │  │ ✓ Snap     │ │
│ │ ☑ Cliente   │  │ │ 📏 Measure         │   │  │ ✗ Overlap  │ │
│ │   50% ━━━── │  │ │ 📐 Calculate Area  │   │  │ ✓ Area     │ │
│ │             │  │ ├────────────────────┤   │  │ ✓ CRS      │ │
│ │ ☑ Oficial   │  │ │ 🗺️                  │   │  │ ✗ Confront │ │
│ │ 100% ━━━──  │  │ │ MAP WITH LAYERS    │   │  │            │ │
│ │             │  │ │ (renderizado aqui) │   │  │ ✅Approve  │ │
│ │ ☐ Overlap   │  │ │                    │   │  │            │ │
│ │ 70% ━━━───  │  │ └────────────────────┘   │  │            │ │
│ │             │  │                          │  │            │ │
│ │ ☐ Limits    │  │ 📍 Layers Visíveis:     │  │            │ │
│ │ 80% ━━━───  │  │ • Cliente (50%)          │  │            │ │
│ │             │  │ • Oficial (100%)         │  │            │ │
│ │ 👁️ Todas    │  │                          │  │            │ │
│ │ 👁️‍🗨️ Nenhuma │  │ 📊 Stats:                │  │            │ │
│ │ ↺ Padrão    │  │ • Área: 2.540,85 m²     │  │            │ │
│ │             │  │ • Perímetro: 245,32 m   │  │            │ │
│ │             │  │ • Vértices: 12          │  │            │ │
│ └─────────────┘  └──────────────────────────┘  └────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Como Funciona o Fluxo**

### **1. Usuário Liga/Desliga Layer (Checkbox)**

```typescript
// Arquivo: LayerControl.tsx
// Função: handleVisibilityChange

const handleVisibilityChange = (layerId: string) => {
  const newVisible = !layerStates[layerId].visible;  // Toggle true/false
  setLayerStates({
    ...layerStates,
    [layerId]: { visible: newVisible, opacity: state.opacity }
  });
  onLayerChange(layerId, newVisible, opacity);  // Callback parent
};
```

**Exemplo:**

```
Usuário clica em ☑ Cliente
  ↓
visible: true → false
  ↓
Callback: onLayerChange('cliente', false, 50)
  ↓
ValidarDesenhos limpa o estado
  ↓
Mapa re-renderiza SEM layer cliente
```

---

### **2. Usuário Ajusta Opacidade (Slider)**

```typescript
// Arquivo: LayerControl.tsx
// Função: handleOpacityChange

const handleOpacityChange = (layerId: string, opacity: number) => {
  setLayerStates({
    ...layerStates,
    [layerId]: { visible: state.visible, opacity }  // 0-100
  });
  onLayerChange(layerId, visible, opacity);  // Callback parent
};
```

**Exemplo:**

```
Usuário puxa slider de "Oficial" para 50%
  ↓
opacity: 100 → 50
  ↓
Callback: onLayerChange('oficial', true, 50)
  ↓
ValidarDesenhos atualiza estado
  ↓
Mapa re-renderiza Oficial layer com 50% transparency
```

**Visual:**

```
100% Opaco       50% Opaco       0% Transparent
█████████        ░░░░░░░         (invisível)
Sólido           Semi-transparente
```

---

## 🎨 **Layers Disponíveis em ValidarDesenhos**

### **4 Layers Configuradas:**

```typescript
const layers: Layer[] = [
  {
    id: 'cliente',
    label: 'Desenho Cliente (rascunho)',
    color: '#999999',              // Cinza
    initialVisible: true,          // Padrão: ligada
    initialOpacity: 50,            // Padrão: 50% opaca
    description: 'Geometria original do cliente'
  },
  {
    id: 'oficial',
    label: 'Geometria Oficial (ajustada)',
    color: '#667eea',              // Azul
    initialVisible: true,          // Padrão: ligada
    initialOpacity: 100,           // Padrão: totalmente opaca
    description: 'Desenho corrigido pelo topografo'
  },
  {
    id: 'sobreposi',
    label: 'Sobreposições',
    color: '#f44336',              // Vermelho
    initialVisible: false,         // Padrão: desligada
    initialOpacity: 70,            // Padrão: 70% opaca
    description: 'Conflitos com vizinhos'
  },
  {
    id: 'limites',
    label: 'Limites Compartilhados',
    color: '#4caf50',              // Verde
    initialVisible: false,         // Padrão: desligada
    initialOpacity: 80,            // Padrão: 80% opaca
    description: 'Arestas comuns com lotes'
  }
];
```

---

## 🎛️ **UI Components - Layer Control**

### **1. Layer Item (Cada Layer)**

```
┌─────────────────────────────────────────┐
│ ☑ ● Desenho Cliente (rascunho)          │
│   [╋━━━━━━━━] 50%                        │
│   Geometria original do cliente         │
└─────────────────────────────────────────┘

Elementos:
├─ ☑ = Checkbox (visibilidade)
├─ ● = Cor dot (visual reference)
├─ Label = Nome da layer
├─ Slider = 0-100% (opacidade)
└─ Description = O que é essa layer
```

---

### **2. Action Buttons (Atalhos)**

```
┌─────────────────────────┐
│ 👁️ Todas               │  ← Mostrar TODAS as layers
│ 👁️‍🗨️ Nenhuma            │  ← Esconder TODAS as layers
│ ↺ Padrão               │  ← Resta padrão (initial state)
└─────────────────────────┘
```

---

### **3. Color Dot (Referência Visual)**

```
Representa a cor da layer no mapa:

● Cinza   = Desenho Cliente
● Azul    = Geometria Oficial
● Vermelho = Sobreposições
● Verde   = Limites Compartilhados
```

---

## 📊 **Estados Possíveis**

### **Estado 1: Layer Visível (100% opaca)**

```
✓ Checkbox: CHECKED
  Slider: 100% ━━━━━━━━
  
  Resultado: Layer aparece sólida no mapa
  Aparência: █████████ (sólido)
```

### **Estado 2: Layer Visível (50% opaca)**

```
✓ Checkbox: CHECKED
  Slider: 50% ━━━
  
  Resultado: Layer semi-transparente
  Aparência: ░░░░░░░░░ (meio opaco)
```

### **Estado 3: Layer Invisível (0%)**

```
☐ Checkbox: UNCHECKED
  Slider: (desabilitado - não aparece)
  
  Resultado: Layer completamente oculta
  Aparência: (não aparece no mapa)
```

---

## 🔌 **Integração com o Mapa**

### **Próxima Etapa: DrawMapEsri com Múltiplas Layers**

Quando implementado, o componente DrawMapEsri será modificado para:

```typescript
interface DrawMapMultipleLayers {
  layers: Array<{
    id: string;
    visible: boolean;
    opacity: number;
    data: __esri.Graphic[];
  }>;
  activeTool: 'snap' | 'edit' | 'measure' | 'area' | null;
}

export function DrawMapWithLayers({ layers, activeTool }: DrawMapMultipleLayers) {
  // Para cada layer:
  // 1. Criar GraphicsLayer
  // 2. Aplicar visible = true/false
  // 3. Aplicar opacity 0-1 (0-100% /// 100)
  // 4. Renderizar features
  
  layers.forEach((layerDef) => {
    const graphicsLayer = new GraphicsLayer({
      id: layerDef.id,
      visible: layerDef.visible,
      opacity: layerDef.opacity / 100  // Converter 0-100 → 0-1
    });
    
    // Adicionar graphics baseado em layerDef.data
    graphicsLayer.addMany(layerDef.data);
    map.add(graphicsLayer);
  });
}
```

---

## 💾 **Estado Persistido**

### **ValidarDesenhos.tsx - State Management**

```typescript
const [layerStates, setLayerStates] = useState<LayerState>({
  cliente: { visible: true, opacity: 50 },      // Layer 1
  oficial: { visible: true, opacity: 100 },     // Layer 2
  sobreposi: { visible: false, opacity: 70 },   // Layer 3
  limites: { visible: false, opacity: 80 },     // Layer 4
});

// Quando usuário muda algo:
const handleLayerChange = (layerId: string, visible: boolean, opacity: number) => {
  setLayerStates((prev) => ({
    ...prev,
    [layerId]: { visible, opacity }
  }));
  // Re-render: Mapa mostra/esconde e ajusta opacidades
};
```

---

## 📱 **Responsividade**

### **Desktop (>1200px)**

```
┌─────────────────────────────────────────────────┐
│ LayerControl │      Map + Tools      │ Validation│
│ (left)       │      (center)         │ (right)   │
└─────────────────────────────────────────────────┘
```

### **Tablet (768-1200px)**

```
┌──────────────────────────────────────┐
│ LayerControl (horizontal scroll)     │
├──────────────────────────────────────┤
│ Map + Tools (600px height)           │
├──────────────────────────────────────┤
│ Validation (scrollable)              │
└──────────────────────────────────────┘
```

### **Mobile (<768px)**

```
┌──────────────────────┐
│ LayerControl         │
├──────────────────────┤
│ Map (300px height)   │
├──────────────────────┤
│ Validation           │
└──────────────────────┘
```

---

## 🎯 **Fluxo Completo: Um Exemplo Real**

### **Cenário: Topografo revisa desenho cliente**

```
1. Página carrega com defaults:
   ✓ Cliente (50%) - mostra desenho original
   ✓ Oficial (100%) - mostra geometria corrigida
   ☐ Sobreposições (70%) - oculta (padrão)
   ☐ Limites (80%) - oculta (padrão)

2. Topografo quer ver sobreposições com vizinhos:
   - Clica checkbox "Sobreposições"
   
3. Sistema:
   - sobreposi.visible = false → true
   - Dispara: onLayerChange('sobreposi', true, 70)
   - ValidarDesenhos atualiza state
   - Mapa re-renderiza COM sobreposições (vermelho, 70% opaco)

4. Topografo ajusta transparência de "Cliente":
   - Puxa slider para 30%
   
5. Sistema:
   - cliente.opacity = 50 → 30
   - Dispara: onLayerChange('cliente', true, 30)
   - ValidarDesenhos atualiza state
   - Mapa re-renderiza com Cliente mais transparente

6. Resultado visual:
   ┌─────────────────────────┐
   │ ░░░░ Cliente (30%)      │  (semi-opaco, abaixo)
   │ █████ Oficial (100%)    │  (opaco, acima)
   │ ▓▓▓▓▓ Sobreposições(70%) │  (vermelho, ao lado)
   └─────────────────────────┘

7. Topografo clica "Resetar Padrão":
   - ClientScript state volta a:
     Cliente (50%) ✓
     Oficial (100%) ✓
     Sobreposições (70%) ☐
     Limites (80%) ☐
   - Mapa volta ao estado padrão

8. Valida tudo e clica "Aprovar Geometria":
   - POST /api/lotes/{id}/validar-topografia
   - Salva geometry oficial no banco
   - Redireciona para contrato
```

---

## 📚 **Arquivos Criados**

1. **LayerControl.tsx** - Componente reutilizável
   - Checkboxes de visibilidade
   - Sliders de opacidade
   - Botões de atalho

2. **LayerControl.css** - Estilos do painel
   - Layout responsivo
   - Animações
   - Themes (cores)

3. **ValidarDesenhos.tsx** - Página atualizada
   - 3 colunas: LayerControl | Map | Validation
   - State de layers
   - Tools de desenho

4. **ValidarDesenhos.css** - Layout grid
   - Responsividade
   - Animations

---

## ✅ **Checklist de Funcionalidades**

| Funcionalidade | Status | Descrição |
|---|---|---|
| Layer visibility toggle | ✅ Implementado | Checkboxes ligar/desligar |
| Opacity slider | ✅ Implementado | 0-100% para cada layer |
| Color visual reference | ✅ Implementado | Dot com cor da layer |
| Quick actions | ✅ Implementado | Todas, Nenhuma, Padrão |
| Responsive design | ✅ Implementado | 3 breakpoints (desktop, tablet, mobile) |
| State persistence | ✅ Implementado | React useState |
| **Map rendering** | ⏳ Próximo | Integrar com DrawMapEsri |
| **Tool interactions** | ⏳ Próximo | Snap, Edit, Measure, Area |
| **PostGIS validation** | ⏳ Próximo | Chamadas ao backend |
| **Approval workflow** | ⏳ Próximo | POST endpoint |

---

## 🚀 **Próximas Etapas**

1. **Integrar DrawMapEsri** com suporte a múltiplas layers
2. **Implementar Tool Interactions** (Snap, Edit, Measure, Area)
3. **Conectar ao Backend** (PostGIS para validação)
4. **Teste E2E** (Playwright)
5. **Deploy**

---

**Data**: 2025-02-05  
**Componente**: ValidarDesenhos.tsx + LayerControl.tsx  
**Status**: Pronto para teste
