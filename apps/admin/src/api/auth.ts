import { api } from './client'
import type { AuthResponse, User } from '@pizzaria/shared'

export const authApi = {
  login: (username: string, senha: string) =>
    api.post<AuthResponse>('/auth/admin-login', { username, senha }),
  me: () => api.get<User>('/auth/me'),
}
