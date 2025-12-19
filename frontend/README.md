# �️ GeoJSON Line Editor - Aplicação Web Interativa

Aplicação web interativa para visualização, upload, desenho e edição de linhas geográficas utilizando arquivos GeoJSON. Desenvolvida com **Next.js 14+**, **TypeScript**, **Mapbox GL JS** e **Zustand** para gerenciamento de estado.

---

## 📋 Funcionalidades

### ✅ Configuração do Mapa
- Mapa Mapbox ocupando toda a viewport
- Centralizado no Brasil (coordenadas: -15.7801, -47.9292)
- Zoom inicial de 4
- Estilo: `mapbox://styles/mapbox/satellite-streets-v12`

### ✅ Upload de GeoJSON
- Área de drag-and-drop para upload de arquivos `.geojson`
- Validação de formato GeoJSON
- Suporte para `FeatureCollection` e `Feature` única
- Filtragem automática para aceitar apenas `LineString`
- Ajuste automático do viewport (fit bounds) após upload
- Contador de features carregadas
- Mensagens de erro amigáveis

### ✅ Ferramenta de Desenho de Linhas
- Modo de desenho ativado por botão
- Cliques no mapa adicionam pontos à linha
- Preview visual em tempo real (linha roxa pontilhada)
- Duplo clique ou botão "Finalizar" para concluir
- Linhas desenhadas salvas no estado global
- Feedback visual durante o desenho

### ✅ Seleção e Remoção de Linhas
- Clique em linha para selecionar (highlight visual vermelho)
- Botão "Remover" habilitado quando há seleção
- Teclas **Delete** ou **Backspace** também removem
- Suporte para linhas do GeoJSON e desenhadas

### ✅ Interface do Usuário
- Toolbar com controles principais:
  - Botão de Upload (drag-and-drop)
  - Botão Desenhar Linha
  - Botão Remover (condicional)
  - Contador de features total
- Cursores dinâmicos:
  - `crosshair` no modo desenho
  - `pointer` ao passar sobre linhas
- Feedback visual claro do estado atual

### ✅ Estilos das Linhas
| Estado | Cor | Largura | Opacidade |
|--------|-----|---------|-----------|
| Normal (GeoJSON) | `#3388ff` (azul) | 3px | 0.8 |
| Normal (Desenhada) | `#22c55e` (verde) | 3px | 0.8 |
| Hover | `#fbbf24` (amarelo) | 4px | 1.0 |
| Selecionada | `#ef4444` (vermelho) | 5px | 1.0 |
| Desenho (preview) | `#9333ea` (roxo) | 2px dashed | 0.6 |

---

## 🛠️ Stack Tecnológica

- **Next.js 14+** (App Router)
- **TypeScript**
- **Mapbox GL JS** (sem wrappers React)
- **Zustand** (gerenciamento de estado)
- **Tailwind CSS** (estilização)
- **Docker** + **Docker Compose**

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Pré-requisitos

- Docker e Docker Compose instalados
- Token do Mapbox (obtenha gratuitamente em [mapbox.com](https://account.mapbox.com/access-tokens/))

### 2️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

Crie um arquivo `.env` na raiz do projeto:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_aqui
```

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` com seu token real. Use `.env.example` para documentar as variáveis necessárias.

### 3️⃣ Rodar com Docker Compose

```bash
docker compose up --build
```

A aplicação estará disponível em: **http://localhost:3000**

### 4️⃣ Parar os containers

```bash
docker compose down
```

---

## 📂 Estrutura do Projeto

```
frontend/
├── app/
│   ├── components/
│   │   ├── Alert.tsx           # Componente de alertas (sucesso/erro)
│   │   ├── Button.tsx          # Componente de botão reutilizável
│   │   ├── FileUpload.tsx      # Upload e validação de GeoJSON
│   │   ├── LineControls.tsx    # Controles de linha (não utilizado)
│   │   ├── MapComponent.tsx    # Componente principal do mapa Mapbox
│   │   └── Toolbar.tsx         # Barra de ferramentas lateral
│   ├── store/
│   │   └── mapStore.ts         # Store Zustand (estado global)
│   ├── types/
│   │   └── index.ts            # Definições de tipos TypeScript
│   ├── utils/
│   │   └── geojsonValidator.ts # Validador de GeoJSON
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── README.md
```

---

## 🧠 Decisões Técnicas

### 1. **Mapbox GL JS Direto (sem wrappers React)**
**Decisão:** Usar Mapbox GL JS diretamente em vez de bibliotecas wrapper como `react-map-gl`.

**Motivo:** 
- Maior controle sobre o ciclo de vida do mapa
- Acesso completo à API do Mapbox sem limitações
- Melhor performance sem camada de abstração adicional
- Facilita debugging e personalização avançada

### 2. **Zustand para Gerenciamento de Estado**
**Decisão:** Escolher Zustand em vez de Redux, Context API ou outras alternativas.

**Motivo:**
- API simples e minimalista (menos boilerplate)
- Excelente performance com seletores otimizados
- TypeScript com inferência de tipos automática
- Menor curva de aprendizado
- Tamanho reduzido (~1KB)
- Suporte a `getState()` para evitar problemas de closure em event handlers

### 3. **Data-Driven Styling no Mapbox**
**Decisão:** Usar expressões data-driven do Mapbox para estilos dinâmicos.

**Motivo:**
- Performance superior (renderização no GPU)
- Atualização visual instantânea sem re-render
- Menos manipulação de DOM
- Código mais limpo e declarativo

### 4. **useEffect com getState() para Event Handlers**
**Decisão:** Usar `useMapStore.getState()` dentro de event handlers em vez de dependências no useEffect.

**Motivo:**
- Evita problemas de closure (valores "antigos" capturados)
- Handlers sempre acessam o estado mais recente
- Elimina re-registros desnecessários de eventos
- Resolve bug crítico de desenho contínuo após finalizar linha

### 5. **Componentização Completa**
**Decisão:** Criar componentes reutilizáveis (Button, Alert) em vez de elementos nativos.

**Motivo:**
- Reutilização de código
- Manutenibilidade e consistência visual
- Facilita mudanças globais de estilo
- Melhor experiência de desenvolvimento com TypeScript

### 6. **Docker Multi-Stage Build**
**Decisão:** Usar multi-stage build no Dockerfile.

**Motivo:**
- Imagem final mais leve
- Separação de dependências de build e runtime
- Builds mais rápidos com cache de layers
- Segurança (não expõe código-fonte desnecessário)

---

## 🗄️ Gerenciamento de Estado com Zustand

### Por que Zustand?

Zustand foi escolhido por ser:
- **Simples**: API minimalista sem boilerplate
- **Performático**: Re-renders otimizados automaticamente
- **TypeScript-friendly**: Inferência de tipos automática
- **Flexível**: Funciona fora de componentes React (`getState()`)

### Estrutura do Store

O store centraliza todo o estado da aplicação:

```typescript
interface MapStore {
  // Estado
  features: Feature[];              // Todas as linhas (uploaded + drawn)
  selectedFeatureId: string | null; // ID da linha selecionada
  hoveredFeatureId: string | null;  // ID da linha com hover
  isDrawing: boolean;               // Modo de desenho ativo
  drawingPoints: Position[];        // Pontos da linha sendo desenhada
  error: string | null;             // Mensagens de erro
  mode: MapMode;                    // Modo atual ('idle' | 'drawing' | 'removing')

  // Ações
  addFeature: (feature: Feature) => void;
  setFeatures: (features: Feature[]) => void;
  removeFeature: (id: string) => void;
  selectFeature: (id: string | null) => void;
  setHoveredFeatureId: (id: string | null) => void;
  startDrawing: () => void;
  finishDrawing: (props?: Record<string, unknown>) => Feature | null;
  cancelDrawing: () => void;
  // ... outras ações
}
```

### Como usar no componente

```typescript
// Seletores específicos (otimizado)
const features = useMapStore((state) => state.features);
const isDrawing = useMapStore((state) => state.isDrawing);

// Ações
const startDrawing = useMapStore((state) => state.startDrawing);
const removeFeature = useMapStore((state) => state.removeFeature);

// Uso fora de componentes (event handlers)
const currentState = useMapStore.getState().isDrawing;
useMapStore.getState().addDrawingPoint([lng, lat]);
```

### Vantagens observadas

1. **Performance**: Re-renders apenas quando o valor selecionado muda
2. **Debugging**: Fácil inspecionar estado no DevTools
3. **Testabilidade**: Store pode ser testado isoladamente
4. **Escalabilidade**: Fácil adicionar novas features sem refatorar

---

## 🔐 Variável de Ambiente - Token Mapbox

### Como obter o token

1. Acesse [mapbox.com](https://account.mapbox.com/)
2. Crie uma conta gratuita
3. Acesse [Access Tokens](https://account.mapbox.com/access-tokens/)
4. Copie o **Default Public Token** ou crie um novo

### Configuração

Adicione no arquivo `.env`:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
```

**Importante:**
- O prefixo `NEXT_PUBLIC_` é obrigatório para variáveis acessíveis no client-side
- Nunca exponha tokens privados/secretos no frontend
- Use tokens públicos com escopo limitado
- Configure restrições de URL no painel do Mapbox para segurança adicional

### Validação

Se o token estiver incorreto ou ausente, o mapa não carregará e você verá um erro no console do navegador.

---

## 🧪 Casos de Teste

### ✅ Teste 1: Upload Válido
1. Clicar na área de upload
2. Selecionar arquivo GeoJSON válido com LineStrings
3. **Esperado:** Linhas aparecem no mapa, viewport ajusta, contador atualiza

### ✅ Teste 2: Upload Inválido
1. Tentar fazer upload de arquivo `.txt` ou JSON inválido
2. **Esperado:** Mensagem de erro, mapa permanece inalterado

### ✅ Teste 3: Desenhar Linha
1. Clicar em "Desenhar Linha"
2. Clicar em 3+ pontos no mapa
3. Duplo clique ou botão "Finalizar"
4. **Esperado:** Linha verde aparece, contador incrementa, estado resetado

### ✅ Teste 4: Selecionar e Remover
1. Clicar em uma linha existente
2. **Esperado:** Linha fica vermelha (selecionada)
3. Clicar em "Remover" ou pressionar Delete/Backspace
4. **Esperado:** Linha desaparece, contador decrementa

### ✅ Teste 5: Fluxo Completo
1. Upload GeoJSON (3 linhas)
2. Desenhar 2 linhas novas
3. Selecionar e remover 1 linha do GeoJSON
4. Selecionar e remover 1 linha desenhada
5. **Esperado:** Total de 3 linhas restantes (2 originais + 1 desenhada)