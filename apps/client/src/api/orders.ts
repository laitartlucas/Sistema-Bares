import { api } from './client'
import type { Order, CreateOrderRequest } from '@pizzaria/shared'

export const ordersApi = {
  create:  (data: CreateOrderRequest) => api.post<Order>('/orders', data),
  list:    ()                          => api.get<Order[]>('/orders'),
  getById: (id: string)               => api.get<Order>(`/orders/${id}`),
}
