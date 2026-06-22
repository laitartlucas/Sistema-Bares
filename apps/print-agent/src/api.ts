import axios from 'axios'
import type { Order } from '@pizzaria/shared'
import { config } from './config'

const http = axios.create({
  baseURL: config.apiUrl,
  headers: { 'X-Print-Secret': config.printSecret },
  timeout: 10000,
})

export interface PendingJob {
  id: string
  orderId: string
  tipo: 'COZINHA' | 'CAIXA'
  order: Order
}

export async function fetchPendingJobs(): Promise<PendingJob[]> {
  const { data } = await http.get<PendingJob[]>('/api/print/jobs/pending')
  return data
}

export async function markJobDone(jobId: string): Promise<void> {
  await http.patch(`/api/print/jobs/${jobId}/done`)
}

export async function markJobError(jobId: string, erro: string): Promise<void> {
  await http.patch(`/api/print/jobs/${jobId}/error`, { erro })
}
