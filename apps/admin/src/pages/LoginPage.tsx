import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [senha, setSenha]       = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.login(username, senha)
      if (user.papel !== 'ADMIN') { setError('Acesso negado. Somente admins.'); return }
      login(token, user)
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg || 'E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pizza-red rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <UtensilsCrossed size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Painel da Pizzaria</h1>
          <p className="text-slate-400 text-sm mt-1">Acesso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Usuário</label>
            <input
              type="text" required autoFocus autoComplete="username"
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red/50 focus:border-pizza-red"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Senha</label>
            <input
              type="password" required
              value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red/50 focus:border-pizza-red"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
