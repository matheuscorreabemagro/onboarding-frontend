# 🗺️ Geospatial Drawing Application (Full Stack)

Aplicação web full stack moderna para visualização e manipulação de dados geoespaciais. Frontend em Next.js/TypeScript/Mapbox com Backend em FastAPI/PostgreSQL/PostGIS. Oferece ferramentas avançadas de desenho, edição, importação e exportação de geometrias.

## 📋 Índice

- [Características](#-características)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Quick Start](#-quick-start)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Testes](#-testes)
- [Tecnologias](#-tecnologias)
- [Documentação Adicional](#-documentação-adicional)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

### Frontend
- 🎨 **Interface Intuitiva**: Interface clean com React e Tailwind CSS
- 🗺️ **Mapbox GL JS**: Visualização de mapas interativos de alta performance
- ✏️ **Ferramentas de Desenho**: Draw, Edit, Delete geometrias (Point, LineString, Polygon)
- 📐 **Operações Geoespaciais**: Snap, Split, Offset, Simplify usando Turf.js
- 📁 **Import/Export**: Upload e download de arquivos GeoJSON
- ⚡ **State Management**: Zustand para gerenciamento de estado global
- 🎯 **TypeScript**: Tipagem forte em todo o código
- ✅ **100% Test Coverage**: 131 testes unitários com Jest e Testing Library

### Backend (Novo! 🎉)
- 🚀 **FastAPI**: API RESTful moderna e rápida
- 🗄️ **PostgreSQL + PostGIS**: Banco de dados geoespacial robusto
- 📦 **Import Multi-formato**: GeoJSON, KML, Shapefile
- 💾 **Persistência**: Salvar geometrias no banco de dados
- 🔄 **CRUD Completo**: Criar, ler, atualizar, deletar camadas
- 📤 **Export Multi-formato**: GeoJSON, KML, Shapefile
- 🔍 **Busca Espacial**: Queries geoespaciais otimizadas
- 🐳 **Docker**: Deploy fácil com Docker Compose

## 🔧 Pré-requisitos

### Frontend
- **Node.js**: versão 18.x ou superior
- **npm**: versão 9.x ou superior
- **Mapbox Access Token**: necessário para uso da API Mapbox

### Backend
- **Python**: versão 3.11 ou superior
- **PostgreSQL**: versão 15 ou superior com extensão PostGIS
- **Docker** (recomendado): versão 20.x ou superior
- **Docker Compose**: versão 2.x ou superior

## 🚀 Quick Start

### Opção 1: Docker (Recomendado - Full Stack)

```bash
# 1. Backend
cd backend
cp .env.example .env
docker-compose up -d
docker-compose exec backend alembic upgrade head

# 2. Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev

# Acessar:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Backend Docs: http://localhost:8000/docs
```

### Opção 2: Local Development

```bash
# 1. Backend (terminal 1)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload

# 2. Frontend (terminal 2)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📁 Estrutura do Projeto

```
frontend/
├── backend/                    # 🆕 Backend FastAPI
│   ├── alembic/                # Migrations
│   ├── app/
│   │   ├── models/             # SQLAlchemy models
│   │   ├── routes/             # API endpoints
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/           # Business logic
│   ├── docker-compose.yml      # Docker setup
│   ├── requirements.txt        # Python dependencies
│   ├── README.md               # Backend docs
│   ├── ONBOARDING.md          # Detailed guide
│   └── INTEGRATION.md         # Frontend integration
│
├── frontend/                   # Frontend Next.js
│   ├── app/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── store/              # Zustand store
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utilities
│   ├── public/                 # Static assets
│   ├── __tests__/              # Tests
│   ├── docker-compose.yml      # Docker setup
│   └── package.json            # Dependencies
│
└── README.md                   # This file
```

## 💻 Frontend

### Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd frontend
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
MONGODB_USER=seu_usuario
MONGODB_PASSWORD=sua_senha
MONGODB_DB=geospatial
API_URL=http://localhost:5000/api
APP_ENV=development
NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_aqui
```

## 🔑 Configuração do Mapbox Token

O token de acesso do Mapbox é **obrigatório** para que a aplicação funcione.

### Como Obter seu Token:

1. Acesse [https://account.mapbox.com/](https://account.mapbox.com/)
2. Faça login ou crie uma conta gratuita
3. Navegue até **Account > Access Tokens**
4. Copie o **Default Public Token** ou crie um novo token
5. Cole o token no arquivo `.env` na variável `NEXT_PUBLIC_MAPBOX_TOKEN`

**Importante**: O token deve começar com `pk.` para tokens públicos.

## 🚀 Executando o Projeto

### Modo Desenvolvimento (Recomendado para desenvolvimento local)

```bash
npm run dev
```

Aplicação disponível em: [http://localhost:3000](http://localhost:3000)

- ✅ Hot reload automático
- ✅ Source maps para debug
- ✅ Error overlay no browser

### Modo Produção (Build local)

```bash
# Gerar build otimizado
npm run build

# Executar build em produção
npm start
```

Aplicação disponível em: [http://localhost:3000](http://localhost:3000)

### Docker (Recomendado para deploy)

#### Pré-requisitos:
- Docker e Docker Compose instalados
- Arquivo `.env` configurado com `NEXT_PUBLIC_MAPBOX_TOKEN`

#### Executar com Docker Compose:

```bash
# Build e start de todos os containers (app, nginx, mongo)
docker compose up --build

# Ou executar em background
docker compose up -d --build
```

**Serviços disponíveis:**
- **Aplicação Next.js**: [http://localhost](http://localhost) (via Nginx) ou [http://localhost:3000](http://localhost:3000) (direto)
- **Nginx**: Porta 80
- **MongoDB**: Porta 27017

#### Comandos Docker úteis:

```bash
# Parar containers
docker compose down

# Ver logs
docker compose logs -f

# Rebuild apenas o app
docker compose up --build app

# Remover volumes e containers
docker compose down -v
```

## 🔙 Backend

O backend foi implementado com FastAPI, PostgreSQL/PostGIS e fornece API RESTful completa para gerenciamento de geometrias.

### 🌟 Funcionalidades

- ✅ **Import de arquivos**: GeoJSON, KML, Shapefile
- ✅ **Persistência**: PostgreSQL com extensão PostGIS
- ✅ **CRUD completo**: Create, Read, Update, Delete layers
- ✅ **Export multi-formato**: GeoJSON, KML, Shapefile
- ✅ **API RESTful**: Documentação automática com Swagger
- ✅ **Migrations**: Controle de versão com Alembic

### 📚 Documentação Detalhada

- **[backend/README.md](backend/README.md)** - Documentação geral do backend
- **[backend/QUICKSTART.md](backend/QUICKSTART.md)** - Setup rápido em 5 minutos
- **[backend/ONBOARDING.md](backend/ONBOARDING.md)** - Guia completo de onboarding
- **[backend/INTEGRATION.md](backend/INTEGRATION.md)** - Integração com frontend
- **[backend/COMMANDS.md](backend/COMMANDS.md)** - Comandos úteis

### 🚀 Quick Start Backend

```bash
cd backend

# Docker (recomendado)
docker-compose up -d
docker-compose exec backend alembic upgrade head

# Local
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Acessar:**
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 🔌 Principais Endpoints

```
POST   /api/v1/layers/              # Criar camada
GET    /api/v1/layers/              # Listar camadas
GET    /api/v1/layers/geojson       # Listar como GeoJSON
GET    /api/v1/layers/{id}          # Buscar camada
PUT    /api/v1/layers/{id}          # Atualizar camada
DELETE /api/v1/layers/{id}          # Deletar camada
POST   /api/v1/layers/upload        # Upload de arquivo
GET    /api/v1/layers/{id}/export/{format}  # Exportar camada
```

### 🧪 Testar Backend

```bash
# Via Swagger UI
http://localhost:8000/docs

# Via script Python
cd backend
python test_api.py

# Via curl
curl http://localhost:8000/health
```

## ✅ Testes

### Frontend

Este projeto possui **131 testes unitários** com cobertura completa.

### Executar Todos os Testes

```bash
npm test
```

### Testes em Modo Watch (Desenvolvimento)

```bash
npm run test:watch
```

- Roda automaticamente testes dos arquivos modificados
- Ideal para desenvolvimento TDD

### Relatório de Cobertura

```bash
npm run test:coverage
```

Gera relatório HTML em `coverage/lcov-report/index.html`

### Executar Testes Específicos

```bash
# Testar um arquivo específico
npm test -- Button.test.tsx

# Testar por padrão
npm test -- --testNamePattern="should render"
```

### Estrutura de Testes

```
app/
├── components/__tests__/
│   ├── Button.test.tsx
│   ├── FileUpload.test.tsx
│   └── Toolbar.test.tsx
├── store/__tests__/
│   └── mapStore.test.ts
└── utils/__tests__/
    ├── geojsonValidator.test.ts
    ├── mapHelpers.test.ts
    └── turfOperations.test.ts
```

## 📁 Estrutura do Projeto

```
frontend/
├── app/                        # Next.js App Router
│   ├── components/            # Componentes React
│   │   ├── Alert.tsx
│   │   ├── Button.tsx
│   │   ├── FileUpload.tsx
│   │   ├── MapComponent.tsx
│   │   ├── Toolbar.tsx
│   │   └── __tests__/        # Testes de componentes
│   ├── constants/            # Constantes da aplicação
│   │   └── map.ts           # Configurações do mapa
│   ├── hooks/               # Custom React Hooks
│   │   ├── useCursor.ts
│   │   ├── useFeatures.ts
│   │   ├── useKeyboardEvents.ts
│   │   ├── useMapClick.ts
│   │   ├── useMapInitialization.ts
│   │   ├── useMapInteractions.ts
│   │   ├── useMapStyles.ts
│   │   └── useMapTools.ts
│   ├── store/               # Zustand state management
│   │   ├── mapStore.ts
│   │   └── __tests__/
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Funções utilitárias
│   │   ├── drawConfig.ts
│   │   ├── drawHandlers.ts
│   │   ├── geojsonValidator.ts
│   │   ├── mapHelpers.ts
│   │   ├── turfOperations.ts
│   │   └── __tests__/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout root
│   └── page.tsx             # Página principal
├── nginx/                    # Configuração Nginx
│   ├── Dockerfile
│   └── nginx.conf
├── public/                   # Assets estáticos
├── __mocks__/               # Mocks para testes
├── .env.example             # Template de variáveis
├── Dockerfile               # Multi-stage build Next.js
├── docker-compose.yml       # Orquestração de containers
├── jest.config.js           # Configuração Jest
├── jest.setup.js            # Setup de testes
├── jest-setup.d.ts          # Types para Jest DOM
├── next.config.ts           # Configuração Next.js
├── tsconfig.json            # Configuração TypeScript
├── eslint.config.mjs        # Configuração ESLint
└── package.json             # Dependências e scripts
```

## 🛠️ Tecnologias

### Frontend
| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | Next.js 16.0.10 (App Router) |
| **Linguagem** | TypeScript 5.x |
| **UI** | React 19.x, Tailwind CSS 3.x |
| **Mapas** | Mapbox GL JS 3.10.0, Mapbox Draw 1.4.3 |
| **Geoespacial** | Turf.js 7.x |
| **State** | Zustand 5.x |
| **Testes** | Jest 30.2.0, Testing Library 16.3.1 |
| **Linting** | ESLint 9.x, TypeScript ESLint |

### Backend
| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | FastAPI 0.109.0 |
| **Linguagem** | Python 3.11+ |
| **Database** | PostgreSQL 15 + PostGIS 3.4 |
| **ORM** | SQLAlchemy 2.0, GeoAlchemy2 |
| **Geoespacial** | Shapely 2.0, Fiona 1.9, FastKML 1.0 |
| **Validação** | Pydantic 2.5 |
| **Migrations** | Alembic 1.13 |
| **Deploy** | Docker, Docker Compose |

## ✅ Requisitos Atendidos

Este projeto implementa todas as funcionalidades geoespaciais solicitadas:

### Story Original - Frontend
- ✅ **Desenhar geometrias**: Point, LineString, Polygon
- ✅ **Editar geometrias**: Modificar vértices e formas
- ✅ **Deletar geometrias**: Remover do mapa
- ✅ **Upload GeoJSON**: Importar arquivos GeoJSON
- ✅ **Download GeoJSON**: Exportar geometrias

### Task Atual - Backend (🆕)
- ✅ **Importação multi-formato**: GeoJSON, KML, Shapefile
- ✅ **Persistência no banco**: PostgreSQL + PostGIS
- ✅ **Recuperação e edição**: Carregar do banco e editar no Mapbox
- ✅ **Gerenciamento de camadas**: Listar, criar, atualizar, deletar
- ✅ **Exportação multi-formato**: GeoJSON, KML, Shapefile

### Ferramentas Geoespaciais Avançadas

### ✅ Objetivo: Capacitação Técnica Completa

**Compreender a lógica de snapping (atração magnética de vértices)**
- ✅ Implementado com `mapbox-gl-draw-snap-mode`
- ✅ Raio de atração configurável (10px padrão)
- ✅ Conexão automática de vértices próximos
- 📄 Documentação: [GEOSPATIAL_TOOLS.md - Snap](./GEOSPATIAL_TOOLS.md#snap-ímã)

**Aplicar operações geoespaciais com Turf.js**
- ✅ Split (corte) de geometrias
- ✅ Offset (linhas paralelas)
- ✅ Simplify (suavização de traçado)
- 📄 Documentação: [GEOSPATIAL_TOOLS.md - Ferramentas](./GEOSPATIAL_TOOLS.md)

**Entender e estender os modos de desenho do Mapbox Draw**
- ✅ Integração com Mapbox Draw 1.4.3
- ✅ Modos customizados implementados
- 📄 Documentação: [ARCHITECTURE.md - Hooks](./ARCHITECTURE.md)

**Reproduzir comportamentos semelhantes aos utilizados em produção**
- ✅ Arquitetura SOLID aplicada
- ✅ Hooks customizados (useMapTools, useFeatures, etc.)
- ✅ 131 testes unitários garantindo qualidade

### ✅ Escopo: Implementações Realizadas

| Funcionalidade | Status | Critérios de Aceite | Testes |
|----------------|--------|---------------------|--------|
| **Snapping (Imã)** | ✅ Completo | Vértices se conectam automaticamente | ✅ 18 testes |
| **Corte (Split)** | ✅ Completo | Geometrias divididas corretamente | ✅ 24 testes |
| **Offset (Paralelas)** | ✅ Completo | Paralelas em ambos os lados | ✅ 12 testes |
| **Suavização** | ✅ Completo | Redução de vértices visível | ✅ 15 testes |

### ✅ Detalhamento Técnico

**1. Snapping (Imã)**
- ✅ Mapbox Draw configurado com snap mode
- ✅ Raio de atração: 10px (configurável)
- ✅ Coordenadas idênticas em zoom máximo
- 📁 Código: `app/utils/drawConfig.ts`, `app/hooks/useMapTools.ts`

**2. Corte (Split)**
- ✅ Botão "Split" na toolbar
- ✅ Desenho de linha de corte sobre geometria
- ✅ Usa `lineSplit` do Turf.js
- ✅ Remove original, adiciona partes resultantes
- 📁 Código: `app/utils/turfOperations.ts` (função `splitFeature`)

**3. Offset (Paralelas)**
- ✅ Função `offsetFeature` implementada
- ✅ Distância em metros configurável
- ✅ Usa `lineOffset` do Turf.js
- ✅ Offset positivo/negativo em lados opostos
- 📁 Código: `app/utils/turfOperations.ts` (função `offsetFeature`)

**4. Suavização**
- ✅ Função `simplifyFeature` implementada
- ✅ Usa `simplify` do Turf.js
- ✅ Tolerância: 0.0001 graus
- ✅ Comparação visual antes/depois
- 📁 Código: `app/utils/turfOperations.ts` (função `simplifyFeature`)

### ✅ Dependências Atendidas

- ✅ Editor GeoJSON funcional (import/export)
- ✅ `@mapbox/mapbox-gl-draw` v1.4.3
- ✅ `mapbox-gl-draw-snap-mode` v1.0.6
- ✅ `@turf/turf` v7.1.0
- ✅ Arquitetura de produção replicada

### 📊 Qualidade e Cobertura

```
✅ 131 testes unitários (100% passing)
✅ Cobertura de código completa
✅ TypeScript com tipagem forte
✅ ESLint sem warnings
✅ Arquitetura SOLID aplicada
✅ 87% redução de complexidade (ver REFACTORING.md)
```

## �📚 Documentação Adicional

Este projeto possui documentação detalhada em arquivos específicos:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitetura, princípios SOLID, estrutura de hooks
- **[GEOSPATIAL_TOOLS.md](./GEOSPATIAL_TOOLS.md)**: Guia completo das ferramentas geoespaciais (Snap, Split, Offset, Simplify)
- **[TESTES_UNITARIOS.md](./TESTES_UNITARIOS.md)**: Documentação completa sobre testes, matchers e cobertura
- **[REFACTORING.md](./REFACTORING.md)**: Histórico de refatorações e melhorias (redução de 87% na complexidade)

## 🔍 Troubleshooting

### Erro: "API access token is required"

**Causa**: Token do Mapbox não configurado ou inválido.

**Solução**:
1. Verifique se a variável `NEXT_PUBLIC_MAPBOX_TOKEN` está definida no `.env`
2. Confirme que o token é válido e começa com `pk.`
3. Se usando Docker, reconstrua a imagem: `docker compose up --build`

### Testes Falhando com Erro de Tipo

**Causa**: Tipos do `@testing-library/jest-dom` não importados.

**Solução**: O arquivo `jest-setup.d.ts` já deve estar presente. Se não estiver, crie-o:

```typescript
import '@testing-library/jest-dom';
```

### Docker não encontra variável NEXT_PUBLIC_MAPBOX_TOKEN

**Causa**: Variável de ambiente não passada corretamente no build.

**Solução**: O `docker-compose.yml` já está configurado para passar a variável. Certifique-se de que:
1. O arquivo `.env` existe na raiz do projeto
2. A variável `NEXT_PUBLIC_MAPBOX_TOKEN` está definida no `.env`
3. Execute `docker compose up --build` para forçar rebuild

### Porta 3000 ou 80 já em uso

**Solução**:
```bash
# Encontrar processo usando a porta
netstat -ano | findstr :3000

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### Erro de Permissão no Docker (Linux)

**Solução**:
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Relogar ou executar
newgrp docker
```

**Status do Projeto**: ✅ 131/131 Testes Passando | 🐳 Docker Ready | 📦 Production Ready
