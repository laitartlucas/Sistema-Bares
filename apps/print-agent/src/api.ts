import axios from 'axios'
import type { Order, PrintJobType } from '@pizzaria/shared'
import { config } from './config'

const http = axios.create({
  baseURL: config.apiUrl,
  headers: { 'X-Print-Secret': config.printSecret },
  timeout: 10000,
})

// A API responde sempre no envelope { success, data }
interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export interface PendingJob {
  id: string
  orderId?: string | null
  tipo: PrintJobType
  /** Conteúdo pré-renderizado (relatórios). Quando presente, é impresso direto. */
  conteudo?: string | null
  /** Pedido associado (ausente em jobs de relatório). */
  order?: Order
}

export async function fetchPendingJobs(): Promise<PendingJob[]> {
  const { data } = await http.get<ApiEnvelope<PendingJob[]>>('/api/print-jobs/pending')
  return data.data
}

export async function markJobDone(jobId: string): Promise<void> {
  await http.patch(`/api/print-jobs/${jobId}/done`)
}

export async function markJobError(jobId: string, erro: string): Promise<void> {
  await http.patch(`/api/print-jobs/${jobId}/error`, { erro })
}
