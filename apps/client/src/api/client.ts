const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new ApiError(data.error ?? 'Erro desconhecido', res.status, data.details)
  }
  return (data as { success: true; data: T }).data
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const api = {
  get:    <T>(path: string)                    => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)     => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown)    => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
}
