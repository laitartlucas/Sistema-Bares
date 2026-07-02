import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { initSocket } from './lib/socket'
import { initWhatsApp } from './lib/whatsapp'
import { prisma } from './lib/prisma'
import { errorHandler } from './middleware/errorHandler'
import { UPLOADS_DIR } from './middleware/upload'
import routes from './routes'

const app = express()
const httpServer = createServer(app)

initSocket(httpServer)

// ── Middlewares ───────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',')

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(UPLOADS_DIR))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: String(err) })
  }
})

// ── API ───────────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Rota não encontrada' })
})

// ── Error handler (deve ser o último middleware) ───────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001)

httpServer.listen(PORT, () => {
  console.log(`\n🍕 Pizzaria API — http://localhost:${PORT}`)
  console.log(`🔌 WebSocket na mesma porta`)
  console.log(`🏥 Health: http://localhost:${PORT}/health`)
  console.log(`📋 Rotas: /api/auth  /api/menu  /api/orders  /api/admin/*\n`)
  initWhatsApp().catch(console.error)
})
