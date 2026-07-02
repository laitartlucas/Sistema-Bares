import 'dotenv/config'
import os from 'os'
import { io } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@pizzaria/shared'
import { config } from './config'
import { fetchPendingJobs, markJobDone, markJobError } from './api'
import { buildCozinhaTicket, buildCaixaTicket } from './formatter'
import { printText } from './printer'

const VERSION = '1.0.0'

console.log(`🖨️  Agente de Impressão v${VERSION}`)
console.log(`   API: ${config.apiUrl}`)
console.log(`   Impressora cozinha: \\\\${os.hostname()}\\${config.printerShares.COZINHA}`)
console.log(`   Impressora caixa:   \\\\${os.hostname()}\\${config.printerShares.CAIXA}`)

// ── Processamento de um job ───────────────────────────────────────────────────

async function processJob(job: Awaited<ReturnType<typeof fetchPendingJobs>>[number]): Promise<void> {
  // Jobs com conteúdo pré-renderizado (relatórios) são impressos direto
  let ticket: string
  if (job.conteudo) {
    ticket = job.conteudo
  } else if (job.order) {
    ticket = job.tipo === 'COZINHA'
      ? buildCozinhaTicket(job.order)
      : buildCaixaTicket(job.order)
  } else {
    await markJobError(job.id, 'Job sem conteúdo nem pedido associado').catch(() => {})
    console.error(`❌ Job ${job.id} ignorado: sem conteúdo nem pedido`)
    return
  }

  const ref = job.order ? `Pedido #${job.order.numero}` : job.tipo

  try {
    await printText(ticket, job.tipo)
    await markJobDone(job.id)
    console.log(`✅ Job ${job.id} (${job.tipo}) impresso — ${ref}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markJobError(job.id, msg).catch(() => {})
    console.error(`❌ Job ${job.id} falhou: ${msg}`)
    throw err
  }
}

// ── Polling de jobs pendentes ─────────────────────────────────────────────────

let polling = false

async function pollJobs(): Promise<void> {
  if (polling) return
  polling = true
  try {
    const jobs = await fetchPendingJobs()
    if (jobs.length > 0) {
      console.log(`📋 ${jobs.length} job(s) pendente(s)`)
    }
    for (const job of jobs) {
      await processJob(job).catch(() => {})
    }
  } catch (err) {
    console.error('Erro ao buscar jobs:', err instanceof Error ? err.message : err)
  } finally {
    polling = false
  }
}

// ── WebSocket para push instantâneo ──────────────────────────────────────────

type AppSocket = ReturnType<typeof io> & {
  on: <E extends keyof ServerToClientEvents>(event: E, listener: ServerToClientEvents[E]) => AppSocket
}

function connectSocket(): void {
  const socket = io(config.apiUrl, {
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
  }) as AppSocket

  socket.on('connect', () => {
    console.log('🔌 WebSocket conectado')
  })

  socket.on('disconnect', () => {
    console.warn('⚠️  WebSocket desconectado — aguardando reconexão...')
  })

  socket.on('print-job', ({ jobId, orderId, tipo }) => {
    console.log(`📨 Push: job ${jobId} (${tipo}) para pedido ${orderId}`)
    void pollJobs()
  })
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Print any pending jobs on startup
  await pollJobs()

  // Connect to WebSocket for push notifications
  connectSocket()

  // Fallback polling loop
  setInterval(() => void pollJobs(), config.pollIntervalMs)

  console.log(`⏱️  Polling a cada ${config.pollIntervalMs / 1000}s como fallback`)
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
