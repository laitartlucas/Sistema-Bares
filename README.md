# 🍕 Pizzaria Dom Luigi — Sistema de Pedidos

Sistema completo de pedidos online: app do cliente (PWA), painel da pizzaria (KDS) e agente de impressão térmica.

## Arquitetura

```
pizzaria-sistema/
├── apps/
│   ├── api/           → Node.js + Express + Prisma  (porta 3001)
│   ├── client/        → React + Vite + PWA          (porta 5173)
│   ├── admin/         → React + Vite (KDS)          (porta 5174)
│   └── print-agent/   → Node.js standalone
└── packages/
    └── shared/        → Tipos TypeScript compartilhados
```

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 18+           |
| npm        | 9+            |
| Docker     | 24+           |
| Docker Compose | v2      |

---

## Como rodar (desenvolvimento)

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd pizzaria-sistema
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copie o exemplo e edite se necessário
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

> Os valores padrão já funcionam com o docker-compose abaixo.

### 3. Subir o banco de dados

```bash
docker compose up -d
```

Aguarde o container ficar saudável (≈ 5 s):

```bash
docker compose ps   # deve mostrar "healthy"
```

### 4. Rodar as migrations e seed

```bash
npm run db:migrate   # cria as tabelas
npm run db:seed      # popula com dados de exemplo
```

Credenciais do seed:

| Papel   | Telefone     | Senha       |
|---------|--------------|-------------|
| Admin   | 11999999999  | admin123    |
| Cliente | 11988887777  | cliente123  |
| Cliente | 11977776666  | maria456    |

### 5. Iniciar a API

```bash
npm run dev:api
```

Teste: `http://localhost:3001/health` deve retornar `{"status":"ok","db":"connected"}`

---

## Comandos úteis

```bash
# Banco
npm run db:migrate      # aplica novas migrations
npm run db:seed         # repovoar (apaga dados existentes!)
npm run db:reset        # zera + remigra + seed
npm run db:studio       # Prisma Studio visual (localhost:5555)

# Build completo
npm run build

# Apps individualmente
npm run dev:client      # PWA do cliente
npm run dev:admin       # Painel admin
```

---

## Variáveis de Ambiente

| Variável              | Descrição                                    | Padrão                      |
|-----------------------|----------------------------------------------|-----------------------------|
| `DATABASE_URL`        | String de conexão PostgreSQL (Prisma)        | postgresql://pizzaria:...   |
| `PORT`                | Porta da API                                 | `3001`                      |
| `JWT_SECRET`          | Segredo para assinar tokens JWT              | *(troque em produção!)*     |
| `JWT_EXPIRES_IN`      | Validade do token                            | `7d`                        |
| `CORS_ORIGINS`        | URLs permitidas (vírgula)                    | `http://localhost:5173,...` |
| `PRINT_AGENT_SECRET`  | Segredo compartilhado com o agente de impressão | —                        |
| `VITE_API_URL`        | URL da API (frontend)                        | `http://localhost:3001`     |
| `VITE_WS_URL`         | URL do WebSocket (frontend)                  | `http://localhost:3001`     |

---

## Regras de Negócio

### Montagem de pizza
- Cada tamanho tem um número máximo de sabores (configurável no admin).
- **Preço = sabor mais caro** entre os escolhidos (padrão; alternativa: média — configurável).
- **Borda é obrigatória**: o cliente deve escolher (existe opção "Sem Borda" com preço R$0).

### Fluxo do pedido
```
Recebido → Em Preparo → Saiu para Entrega → Entregue
```
- Transição para "Saiu para Entrega" dispara notificação push para o cliente.
- Pagamento ocorre na entrega/retirada (dinheiro, PIX ou cartão). App apenas registra a intenção.

---

## Fases de implementação

| Fase | Status | Descrição |
|------|--------|-----------|
| 1    | ✅     | Monorepo, banco de dados, schema Prisma, seed |
| 2    | ⏳     | API REST + WebSocket + fila de impressão |
| 3    | ⏳     | App do cliente (PWA) |
| 4    | ⏳     | Painel da pizzaria (KDS) |
| 5    | ⏳     | Agente de impressão térmica |

---

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **ORM:** Prisma 5 (PostgreSQL)
- **Tempo real:** Socket.IO
- **Autenticação:** JWT
- **Impressão:** node-thermal-printer (ESC/POS)
