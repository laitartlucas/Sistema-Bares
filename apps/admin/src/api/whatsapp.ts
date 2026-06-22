import { api } from './client'

export interface WhatsAppStatus {
  status: 'disconnected' | 'qr' | 'connected'
  qr: string | null
}

export const whatsappApi = {
  getStatus: () => api.get<WhatsAppStatus>('/admin/whatsapp/status'),
}
