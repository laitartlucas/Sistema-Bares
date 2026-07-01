const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly details?: unknown) {
    super(message); this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('admin_token')
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new ApiError(data.error ?? 'Erro desconhecido', res.status, data.details)
  return (data as { success: true; data: T }).data
}

async function upload<T>(path: string, file: File): Promise<T> {
  const token = localStorage.getItem('admin_token')
  const body = new FormData()
  body.append('file', file)
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new ApiError(data.error ?? 'Erro desconhecido', res.status, data.details)
  return (data as { success: true; data: T }).data
}

export const api = {
  get:    <T>(p: string)              => request<T>(p, { method: 'GET' }),
  post:   <T>(p: string, b: unknown)  => request<T>(p, { method: 'POST',  body: JSON.stringify(b) }),
  put:    <T>(p: string, b: unknown)  => request<T>(p, { method: 'PUT',   body: JSON.stringify(b) }),
  patch:  <T>(p: string, b?: unknown) => request<T>(p, { method: 'PATCH', body: b ? JSON.stringify(b) : undefined }),
  delete: <T>(p: string)              => request<T>(p, { method: 'DELETE' }),
  upload,
}
