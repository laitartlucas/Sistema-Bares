import { api } from './client'
import type { Order, OrderStatus } from '@pizzaria/shared'

interface OrderListResult {
  items: Order[]
  total: number
  page: number
  limit: number
  pages: number
}

interface DailyReport {
  date: string
  totalPedidos: number
  faturamento: number
  topSabores: { nome: string; count: number }[]
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
  dailyReport:  (date?: string)               =>
    api.get<DailyReport>(`/admin/orders/report/daily${date ? `?date=${date}` : ''}`),
  createManual: (data: ManualOrderPayload)    => api.post<Order>('/admin/manual-order', data),
}
