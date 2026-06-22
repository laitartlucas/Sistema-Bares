import { api } from './client'
import type { StoreConfig } from '@pizzaria/shared'

export const configApi = {
  get:    ()                      => api.get<StoreConfig | null>('/admin/config'),
  update: (data: Partial<StoreConfig>) => api.put<StoreConfig>('/admin/config', data),
}
