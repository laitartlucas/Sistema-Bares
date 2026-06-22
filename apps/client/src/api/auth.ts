import { api } from './client'
import type { AuthResponse, User, Address, LoginRequest, RegisterRequest } from '@pizzaria/shared'

export const authApi = {
  login:   (data: LoginRequest)    => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  me:      ()                       => api.get<User>('/auth/me'),

  updateProfile: (data: { nome?: string; telefone?: string }) =>
    api.patch<User>('/auth/me', data),

  listAddresses: () => api.get<Address[]>('/auth/addresses'),
  addAddress:    (data: Omit<Address, 'id' | 'userId'>) =>
    api.post<Address>('/auth/addresses', data),
  removeAddress: (id: string) => api.delete<null>(`/auth/addresses/${id}`),
}
