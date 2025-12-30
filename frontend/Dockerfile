# ==============================
# STAGE 1 — BUILDER
# ==============================
FROM node:20 AS builder

WORKDIR /app

# Use build args para variáveis de ambiente públicas
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_MAPBOX_TOKEN

# Converter ARGs em ENVs para que o Next.js possa usá-las no build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN

# Copia arquivos de dependências primeiro (cache + rápido)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

# Gera build otimizando
RUN npm run build


# ==============================
# STAGE 2 — PRODUCTION
# ==============================
FROM node:20 AS production

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário do builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]