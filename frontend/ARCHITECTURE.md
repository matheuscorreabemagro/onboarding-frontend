# Arquitetura da Aplicação - Editor GeoJSON

## 📋 Princípios Aplicados

### SOLID
- **Single Responsibility Principle (SRP)**: Cada hook tem uma responsabilidade única
- **Open/Closed Principle (OCP)**: Código aberto para extensão, fechado para modificação
- **Dependency Inversion Principle (DIP)**: Dependências através de abstrações (hooks)

### DRY (Don't Repeat Yourself)
- Constantes centralizadas
- Funções utilitárias reutilizáveis
- Hooks customizados eliminam duplicação

## 📁 Estrutura de Arquivos

```
app/
├── components/
│   ├── MapComponent.tsx      # Componente principal (55 linhas)
│   ├── Toolbar.tsx            # Barra de ferramentas
│   ├── Button.tsx             # Componente reutilizável
│   ├── FileUpload.tsx         # Upload de GeoJSON
│   └── Alert.tsx              # Mensagens de erro
├── hooks/                     # Custom Hooks (Separação de Responsabilidades)
│   ├── useMapInitialization.ts    # Inicialização do mapa
│   ├── useMapTools.ts             # Gerenciamento de ferramentas
│   ├── useMapStyles.ts            # Estilos dinâmicos
│   ├── useMapInteractions.ts      # Interações hover/mouse
│   ├── useMapClick.ts             # Eventos de clique
│   ├── useKeyboardEvents.ts       # Atalhos de teclado
│   ├── useCursor.ts               # Gerenciamento de cursor
│   └── useFeatures.ts             # Atualização de features
├── utils/                     # Funções Utilitárias (DRY)
│   ├── mapHelpers.ts              # Helpers do mapa
│   ├── drawHandlers.ts            # Handlers de eventos Draw
│   ├── turfOperations.ts          # Operações geoespaciais
│   ├── drawConfig.ts              # Configuração Mapbox Draw
│   └── geojsonValidator.ts        # Validação GeoJSON
├── constants/                 # Constantes (Eliminando Magic Numbers)
│   └── map.ts                     # Constantes do mapa
├── store/
│   └── mapStore.ts                # Estado global Zustand
└── types/
    └── index.ts                   # Tipos TypeScript
```

## 🎯 Benefícios da Refatoração

### Antes (422 linhas no MapComponent)
❌ Difícil manutenção  
❌ Lógica misturada  
❌ Repetição de código  
❌ Magic numbers/strings  
❌ Difícil testar  

### Depois (55 linhas no MapComponent)
✅ Fácil manutenção  
✅ Responsabilidades claras  
✅ Código reutilizável  
✅ Constantes centralizadas  
✅ Fácil testar (cada hook isolado)  

## 📦 Hooks Customizados

### `useMapInitialization`
**Responsabilidade**: Inicialização do mapa e Mapbox Draw  
**Quando usar**: Uma vez no mount do componente

### `useMapTools`
**Responsabilidade**: Ativar/desativar ferramentas (draw, snap, split, offset, simplify)  
**Quando usar**: Reage a mudanças em `activeTool`

### `useMapStyles`
**Responsabilidade**: Aplicar estilos dinâmicos (cores, larguras, opacidade)  
**Quando usar**: Reage a mudanças em `selectedFeatureId` e `hoveredFeatureId`

### `useMapInteractions`
**Responsabilidade**: Gerenciar hover e interações do mouse  
**Quando usar**: Uma vez no mount do componente

### `useMapClick`
**Responsabilidade**: Selecionar features ao clicar  
**Quando usar**: Uma vez no mount do componente

### `useKeyboardEvents`
**Responsabilidade**: Deletar feature com Delete/Backspace  
**Quando usar**: Reage a mudanças em `selectedFeatureId`

### `useCursor`
**Responsabilidade**: Mudar cursor conforme ferramenta ativa  
**Quando usar**: Reage a mudanças em `activeTool`

### `useFeatures`
**Responsabilidade**: Atualizar features no mapa e fit bounds  
**Quando usar**: Reage a mudanças em `features`

## 🔧 Funções Utilitárias

### `mapHelpers.ts`
- `createFeatureFromDraw`: Cria feature a partir de coordenadas
- `fitMapToFeatures`: Ajusta mapa para mostrar todas as features
- `updateMapSource`: Atualiza source GeoJSON do mapa

### `drawHandlers.ts`
- `handleDrawCreate`: Processa criação de novas linhas
- `handleDrawModeChange`: Processa mudança de modo
- Separação de lógica: split vs draw normal

## 📊 Constantes

### `map.ts`
- `MAP_CONFIG`: Configurações do mapa (centro, zoom, estilo)
- `LAYER_IDS`: IDs de layers e sources
- `COLORS`: Paleta de cores
- `LINE_WIDTHS`: Larguras de linha
- `OPACITY`: Valores de opacidade
- `CURSORS`: Tipos de cursor
- `DRAW_MODES`: Modos do Mapbox Draw

## 🧪 Testabilidade

Cada hook pode ser testado isoladamente:

```typescript
// Exemplo de teste
describe('useMapTools', () => {
  it('should activate snap mode', () => {
    const { result } = renderHook(() => useMapTools({
      drawRef,
      mapLoadedRef,
      activeTool: 'snap',
      features: mockFeatures,
      selectedFeatureId: null,
    }));
    
    expect(draw.changeMode).toHaveBeenCalledWith('snap_line');
  });
});
```

## 🔄 Fluxo de Dados

```
User Action → Store (Zustand) → Hook → MapboxGL/Draw → UI Update
    ↑                                                       ↓
    └───────────────── Event Handlers ─────────────────────┘
```

## 📝 Boas Práticas Implementadas

1. **Separação de Responsabilidades**: Um hook = uma responsabilidade
2. **Constantes Centralizadas**: Fácil manutenção e consistência
3. **Funções Puras**: Utils não têm side effects
4. **Type Safety**: TypeScript em todo código
5. **Performance**: Deps arrays otimizados, memoization onde necessário
6. **Reusabilidade**: Hooks e utils podem ser usados em outros contextos
7. **Manutenibilidade**: Código organizado e autodocumentado

## 🚀 Como Adicionar Nova Ferramenta

1. **Adicionar tipo no store**: `mapStore.ts`
2. **Criar handler** (se necessário): `drawHandlers.ts`
3. **Adicionar lógica**: `useMapTools.ts`
4. **Adicionar botão**: `Toolbar.tsx`

## 🎓 Padrões Next.js/React

- ✅ Client Components (`'use client'`)
- ✅ Custom Hooks para lógica complexa
- ✅ Refs para instâncias externas (Mapbox)
- ✅ Estado global com Zustand (alternativa ao Context API)
- ✅ TypeScript strict mode
- ✅ ESLint rules respeitadas
