# 🐳 Projeto Next.js + Nginx + MongoDB (Ambiente Docker)

Este repositório contém uma configuração completa de ambiente de desenvolvimento utilizando **Next.js**, **Nginx** como proxy reverso e **MongoDB**, todos rodando via **Docker + Docker Compose**.

O objetivo é fornecer um ambiente padronizado, simples de subir e isolado da máquina local.

---

## 📁 Estrutura de Pastas

```
frontend/
├── app/                     # Código da aplicação Next.js
├── docker-compose.yml
├── Dockerfile
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── next.config.mjs
├── .env.example
└── README.md
```
---

## 🚀 Como Rodar o Projeto

### 1️⃣ Criar arquivo `.env`

Baseado no `.env.example`, crie o arquivo:

```
cp .env.example .env
```

Preencha as variáveis necessárias:

```
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

---

### 2️⃣ Subir os containers

```
docker compose up -d --build
```

### Verificar logs:

```
docker compose logs -f
```

### Derrubar containers:

```
docker compose down
```

---

## 🌐 URLs Importantes

| Serviço                           | URL                                            |
| --------------------------------- | ---------------------------------------------- |
| **Aplicação Next.js (via Nginx)** | [http://localhost/](http://localhost/)         |
| **Next.js (interno)**             | [http://localhost:3000](http://localhost:3000) |
| **MongoDB**                       | Porta 27017                                    |

---

## 📦 Scripts do projeto (Next.js)

```
npm run dev
npm run build
npm run start
npm run lint
```

---

## 🧱 Tecnologias usadas

* **Next.js 14+ (App Router)**
* **React 18**
* **TypeScript**
* **Nginx (proxy reverso)**
* **MongoDB + Volume Persistente**
* **Docker + Docker Compose**

---

## 🧪 Healthcheck

O Docker Compose valida automaticamente quando a aplicação Next.js está pronta para receber tráfego.

O serviço Nginx só sobe após o app ficar saudável.

---