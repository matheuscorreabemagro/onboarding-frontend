# 🗺️ Editor GeoJSON com Ferramentas Geoespaciais

Editor interativo de geometrias LineString com funcionalidades geoespaciais avançadas usando Mapbox GL JS, Mapbox Draw e Turf.js.

## 📋 Funcionalidades Implementadas

### ✅ Funcionalidades Básicas
- ✏️ **Desenho de linhas** no mapa com clique duplo para finalizar
- 📁 **Upload de arquivos GeoJSON** com suporte a LineString
- 🎯 **Seleção e remoção** de geometrias
- 🖱️ **Hover visual** sobre linhas
- ⌨️ **Atalho Delete** para remover linhas selecionadas

### 🛠️ Ferramentas Geoespaciais

#### 1. 🧲 Snap (Atração Magnética)
- Ativa atração automática entre vértices ao desenhar
- Facilita conexão precisa de linhas
- Raio de snap configurável

#### 2. ✂️ Split (Corte)
- Divide uma linha existente em múltiplas partes
- Selecione a linha a ser cortada
- Desenhe a linha de corte cruzando a linha alvo
- Duplo clique para executar o corte

#### 3. ↔️ Offset (Linha Paralela)
- Cria linha paralela a uma existente
- Distância padrão: 10 metros
- Selecione a linha base e clique no botão Offset

#### 4. 〰️ Simplify (Suavização)
- Reduz vértices e suaviza o traçado
- Usa curvas de Bézier para resultado mais natural
- Selecione a linha e clique no botão Suavizar

## 🚀 Como Usar

### Pré-requisitos
```bash
npm install
```

### Configurar Token Mapbox
Crie um arquivo `.env.local` na raiz:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_aqui
```

### Executar
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📖 Manual de Uso

### Desenho Básico
1. Clique no botão **"Desenhar Linha"**
2. Clique no mapa para adicionar pontos
3. Duplo clique para finalizar

### Upload de GeoJSON
1. Clique na área de upload no topo
2. Selecione um arquivo `.geojson` com LineStrings
3. As geometrias aparecerão no mapa

### Ferramenta Snap 🧲
1. Clique no botão **Snap**
2. Desenhe normalmente
3. Vértices próximos se conectarão automaticamente

### Ferramenta Split ✂️
1. Selecione a linha que deseja cortar (clique nela)
2. Clique no botão **Cortar**
3. Desenhe uma linha que cruze a linha selecionada
4. Duplo clique para executar o corte
5. A linha original será substituída pelas partes resultantes

### Ferramenta Offset ↔️
1. Selecione uma linha existente
2. Clique no botão **Offset**
3. Uma linha paralela será criada automaticamente

### Ferramenta Simplify 〰️
1. Selecione uma linha existente
2. Clique no botão **Suavizar**
3. Uma versão suavizada será criada

## 🏗️ Arquitetura

### Estrutura de Pastas
```
frontend/
├── app/
│   ├── components/
│   │   ├── MapComponent.tsx    # Componente principal do mapa
│   │   ├── Toolbar.tsx         # Barra de ferramentas
│   │   ├── FileUpload.tsx      # Upload de GeoJSON
│   │   ├── Alert.tsx           # Notificações
│   │   └── Button.tsx          # Botões reutilizáveis
│   ├── store/
│   │   └── mapStore.ts         # Estado global (Zustand)
│   ├── utils/
│   │   ├── turfOperations.ts   # Operações geoespaciais
│   │   ├── drawConfig.ts       # Configuração Mapbox Draw
│   │   └── geojsonValidator.ts # Validação GeoJSON
│   └── types/
│       └── index.ts            # Definições de tipos
```

### Tecnologias Utilizadas
- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Mapbox GL JS** - Renderização de mapas
- **Mapbox Draw** - Ferramentas de desenho
- **Turf.js** - Operações geoespaciais
- **Zustand** - Gerenciamento de estado
- **Tailwind CSS** - Estilização

## 🧪 Critérios de Aceite

### ✅ Snapping
- [x] Vértices próximos se conectam automaticamente
- [x] Coordenadas idênticas quando conectados
- [x] Visual feedback durante desenho

### ✅ Corte (Split)
- [x] Divide linha em múltiplas partes
- [x] Remove geometria original após corte
- [x] Funciona com linhas que se intersectam

### ✅ Offset
- [x] Linha paralela acompanha traçado original
- [x] Distância configurável (padrão 10m)
- [x] Mantém geometria original

### ✅ Suavização
- [x] Reduz vértices
- [x] Cria curvas mais suaves
- [x] Comparação visual antes/depois

## 🔧 Configurações Personalizáveis

### Distância do Offset
Em [`mapStore.ts`](app/store/mapStore.ts#L44):
```typescript
offsetDistance: 10, // metros
```

### Tolerância de Suavização
Em [`mapStore.ts`](app/store/mapStore.ts#L45):
```typescript
simplifyTolerance: 0.01,
```

### Raio de Snap
Em [`drawConfig.ts`](app/utils/drawConfig.ts#L54):
```typescript
snapDistance: 15, // pixels
```

## 📚 Aprendizados

Este projeto demonstra:
1. **Integração Mapbox Draw** com modos customizados
2. **Operações geoespaciais** com Turf.js
3. **Gerenciamento de estado** complexo com Zustand
4. **Arquitetura modular** e escalável
5. **Manipulação de eventos** de mapa

## 🐛 Troubleshooting

### Mapa não carrega
- Verifique se o token Mapbox está configurado corretamente
- Confirme que o token tem permissões adequadas

### Snap não funciona
- Certifique-se de que a ferramenta está ativada (botão azul)
- Aproxime mais os vértices durante o desenho

### Split não divide a linha
- Verifique se as linhas realmente se intersectam
- Tente desenhar a linha de corte perpendicular

## 📝 Próximas Melhorias

- [ ] Interface para ajustar distância do offset
- [ ] Slider de tolerância para suavização
- [ ] Comparação visual antes/depois
- [ ] Exportar geometrias editadas como GeoJSON
- [ ] Desfazer/Refazer operações
- [ ] Suporte a MultiLineString

## 🤝 Contribuindo

Este projeto foi desenvolvido como exercício de onboarding para compreensão da arquitetura do webgis-frontend em produção.

---

**Desenvolvido para aprendizado e compreensão técnica das ferramentas geoespaciais** 🌍
