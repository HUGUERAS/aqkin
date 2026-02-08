# 🎨 Novo Design System - Map Focused Layout

## 📋 O que foi criado

### 1. **map-focused-layout.css**

Novo stylesheet com design moderno focado em mapas:

- ✅ Cores escuras profissionais (tema dark)
- ✅ Mapa como elemento principal (full-screen)
- ✅ Toolbar flutuante com ferramentas CAD
- ✅ Sidebar colapsável e organizado
- ✅ Sistema de cores para ferramentas:
  - **Verde** (#10b981) = Desenhar
  - **Azul** (#3b82f6) = Modo/Seleção
  - **Âmbar** (#f59e0b) = Medir
  - **Vermelho** (#ef4444) = Validar

### 2. **FloatingToolbar.tsx**

Componente React para toolbar flutuante com:

- ✅ Botões para Desenhar, Medir, Validar
- ✅ Ferramentas CAD: Snap Tool, Editar Vértices
- ✅ Visual minimalista e profissional
- ✅ Estados ativos com cores de destaque

---

## 🚀 Como Implementar (3 passos)

### **Passo 1: Atualizar Imports nos Layouts**

Em `ClienteLayout.tsx` e `TopografoLayout.tsx`, altere:

```tsx
// Remova:
import '../styles/PortalLayout.css';

// Adicione:
import '../styles/map-focused-layout.css';
```

### **Passo 2: Usar FloatingToolbar na Página de Desenhar**

Em `apps/web/src/pages/cliente/DesenharArea.tsx`:

```tsx
import FloatingToolbar from '../../components/FloatingToolbar';

export default function DesenharArea() {
  const [activeMode, setActiveMode] = useState<'draw' | 'measure' | 'validate' | null>(null);
  
  // ... seu código existente ...

  return (
    <div className="map-shell">
      <div className="responsive-map-container">
        <DrawMapEsri /* props */ />
      </div>

      {/* Adicione a toolbar flutuante */}
      <FloatingToolbar
        activeMode={activeMode}
        onDraw={() => setActiveMode('draw')}
        onMeasure={() => setActiveMode('measure')}
        onValidate={() => setActiveMode('validate')}
        onSnapTool={() => console.log('Snap enabled')}
        onEditGeometry={() => console.log('Edit geometry')}
      />
    </div>
  );
}
```

### **Passo 3: Remover PortalLayout.css Antigo (Opcional)**

Após confirmar que tudo funciona, você pode manter `PortalLayout.css` como fallback ou removê-lo completamente.

---

## 🎯 Estrutura Visual Resultante

```
┌─────────────────────────────────────────────┐
│ Logo  Desenhar  Vizinhos  Documentos  Sair  │ ← Header Compacto
├──────────┬──────────────────────────────────┤
│          │                          [T]     │
│          │                          [M]     │
│ MENU     │         MAPA FULL-SCREEN [V]     │
│ Desenhar │                          [─]     │
│ Vizinhos │                          [S]     │
│ Doctos   │                          [E]     │
│          │                                  │
└──────────┴──────────────────────────────────┘

[T] = Toolbar Flutuante
    - T = Draw (Verde)
    - M = Measure (Âmbar)
    - V = Validate (Vermelho)
    - S = Snap Tool
    - E = Edit Geometry
```

---

## 🎨 Paleta de Cores

| Elemento | Cor | Hex | Uso |
|----------|-----|-----|-----|
| **Fundo** | Preto | #0f0f0f | Todo o app |
| **Superfícies** | Cinza Escuro | #1a1a1a | Cards, Painéis |
| **Texto Principal** | Branco | #ffffff | Títulos, Labels |
| **Texto Secundário** | Cinza | #b0b0b0 | Descrições, Hints |
| **Desenhar** | Verde | #10b981 | Modo Draw |
| **Selecionar** | Azul | #3b82f6 | Seleções, Links |
| **Medir** | Âmbar | #f59e0b | Medições |
| **Validar** | Vermelho | #ef4444 | Erros, Validação |

---

## 📱 Responsividade

O novo design é 100% responsivo:

- ✅ **Desktop**: Menu lateral + Toolbar flutuante
- ✅ **Tablet**: Sidebar colapsável + Toolbar compacta
- ✅ **Mobile**: Hamburger menu + Toolbar minimalista

---

## ✨ Benefícios do Novo Design

| Antes | Depois |
|-------|--------|
| Cores desorganizadas (Bronze misturado) | Cores consistentes e propositais |
| Mapa encolhido e ignorado | Mapa ocupa 90% da tela |
| Poluição visual no topo | Header compacto e limpo |
| Ferramentas espalhadas | Toolbar flutuante e organizada |
| Sem foco visual claro | Hierarquia clara: Mapa > Toolbar > Menu |

---

## 🔧 Próximos Passos (Opcional)

1. Ajustar tamanho dos ícones conforme necessário
2. Testar responsividade em diferentes dispositivos
3. Adicionar animações suaves ao abrir/fechar sidebar
4. Aplicar no dashboard do topografo também
5. Adicionar temas claros (opcional)

---

## 💡 Dicas

- Use `--accent-green`, `--accent-blue`, etc. para botões das ferramentas CAD
- A toolbar é flutuante e pode ser movida se precisar
- O sidebar se comporta diferente em mobile (toma tela inteira)
- Todas as cores são variáveis CSS e fáceis de customizar em `map-focused-layout.css`

Quer que eu implemente isso agora? 🚀
