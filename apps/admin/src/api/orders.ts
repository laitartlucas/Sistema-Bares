import { api } from './client'
import type { Order, OrderStatus, ReportFilters, SalesReport } from '@pizzaria/shared'

interface OrderListResult {
  items: Order[]
  total: number
  page: number
  limit: number
  pages: number
}

function reportQuery(f: ReportFilters = {}): string {
  const q = new URLSearchParams()
  if (f.from)           q.set('from', f.from)
  if (f.to)             q.set('to', f.to)
  if (f.status)         q.set('status', f.status)
  if (f.formaPagamento) q.set('formaPagamento', f.formaPagamento)
  if (f.saborId)        q.set('saborId', f.saborId)
  if (f.categoria)      q.set('categoria', f.categoria)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export interface ManualOrderPayload {
  customerPhone: string
  customerName: string
  tipo: 'ENTREGA' | 'RETIRADA'
  enderecoEntrega?: { rua: string; numero: string; bairro: string; complemento?: string }
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO'
  trocoPara?: number
  itens: Array<
    | { tipo: 'PIZZA'; tamanhoId: string; bordaId: string; saborIds: string[]; quantidade: number }
    | { tipo: 'BEBIDA'; bebidaId: string; quantidade: number }
  >
  observacoes?: string
  sendWhatsApp: boolean
}

export const adminOrdersApi = {
  list: (params?: { status?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.status)  q.set('status',  params.status)
    if (params?.from)    q.set('from',    params.from)
    if (params?.to)      q.set('to',      params.to)
    if (params?.page)    q.set('page',    String(params.page))
    if (params?.limit)   q.set('limit',   String(params.limit))
    return api.get<OrderListResult>(`/admin/orders?${q}`)
  },

  getById:      (id: string)                  => api.get<Order>(`/admin/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/admin/orders/${id}/status`, { status }),
  reprint:      (id: string)                  => api.post<{ queued: number }>(`/admin/orders/${id}/reprint`, {}),
  salesReport:  (filters?: ReportFilters)     => api.get<SalesReport>(`/admin/orders/report${reportQuery(filters)}`),
  printReport:  (filters?: ReportFilters)     =>
    api.post<{ queued: number; jobId: string }>(`/admin/orders/report/print${reportQuery(filters)}`, {}),
  createManual: (data: ManualOrderPayload)    => api.post<Order>('/admin/manual-order', data),
}
