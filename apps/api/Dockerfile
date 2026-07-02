# ============================================================================
# Dockerfile do serviço apps/api (WhatsApp via whatsapp-web.js + Chromium).
#
# ATENÇÃO — configuração no Railway:
#   - Root Directory: DEIXE VAZIO (o contexto de build é a RAIZ do monorepo,
#     pois usamos npm workspaces e o `npm ci` precisa de todos os package.json).
#   - Dockerfile Path: apps/api/Dockerfile
# ============================================================================

FROM node:20-slim

# Chromium do sistema + fontes e libs necessárias para o Puppeteer rodar.
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-freefont-ttf \
    ca-certificates \
    openssl \
  && rm -rf /var/lib/apt/lists/*

# Não baixar o Chromium do Puppeteer — usar o instalado via apt.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 1) Copia só os manifests de todos os workspaces + o lock da raiz.
#    Isso mantém a camada do `npm ci` em cache enquanto o código muda.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin/package.json ./apps/admin/package.json
COPY apps/client/package.json ./apps/client/package.json
COPY apps/print-agent/package.json ./apps/print-agent/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm ci

# 2) Copia o restante do código.
COPY . .

# 3) Build do pacote compartilhado, geração do Prisma Client e build da API.
RUN npm run build --workspace=packages/shared
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace=apps/api

EXPOSE 8080

# Aplica as migrations pendentes e sobe a API.
CMD npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && node apps/api/dist/src/index.js
