import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Lock, User } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { sanitizePhone } from '../utils/format'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [mode, setMode]       = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nome: '', telefone: '', senha: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (mode === 'register' && form.nome.trim().length < 2) e.nome = 'Nome muito curto'
    if (form.telefone.length < 10) e.telefone = 'Telefone inválido'
    if (form.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await authApi.login({ telefone: form.telefone, senha: form.senha })
        : await authApi.register({ nome: form.nome, telefone: form.telefone, senha: form.senha })
      login(result.token, result.user)
      navigate('/')
    } catch (err: any) {
      toast(err.message ?? 'Erro ao entrar', 'error')
      if (err.details) {
        const fieldErrors: Record<string, string> = {}
        for (const [k, v] of Object.entries(err.details)) {
          fieldErrors[k] = (v as string[])[0]
        }
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-pizza-cream flex flex-col">
      {/* Hero */}
      <div className="relative bg-brand-flame overflow-hidden pt-safe">
        <div className="absolute inset-0 bg-hero-pattern opacity-50" />
        <div className="absolute -top-12 -left-10 w-48 h-48 rounded-full bg-pizza-cheese/20 blur-3xl" />
        <div className="relative px-6 pt-16 pb-12 text-center">
          <div className="text-7xl mb-4 animate-float drop-shadow-lg">🍕</div>
          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.25em] mb-1">Pizzaria</p>
          <h1 className="font-serif italic text-4xl font-bold text-white leading-none">
            Dom Luigi
          </h1>
          <p className="text-white/85 mt-3 text-sm">Feita com amor, entregue com agilidade</p>
        </div>
        {/* Wave */}
        <svg viewBox="0 0 375 48" className="w-full fill-pizza-cream" preserveAspectRatio="none">
          <path d="M0 48h375V24C312 0 250 32 188 24S64 0 0 24z" />
        </svg>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 -mt-2 pb-10">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-card mb-6">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErrors({}) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === m
                  ? 'bg-brand-flame text-white shadow-brand'
                  : 'text-pizza-muted hover:text-pizza-dark'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <Input
              label="Seu nome"
              placeholder="João Silva"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              error={errors.nome}
              leftIcon={<User size={16} />}
              autoComplete="name"
            />
          )}
          <Input
            label="Telefone"
            placeholder="11999887766"
            type="tel"
            inputMode="numeric"
            value={form.telefone}
            onChange={(e) => set('telefone', sanitizePhone(e.target.value))}
            error={errors.telefone}
            leftIcon={<Phone size={16} />}
            autoComplete="tel"
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••"
            value={form.senha}
            onChange={(e) => set('senha', e.target.value)}
            error={errors.senha}
            leftIcon={<Lock size={16} />}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
            {mode === 'login' ? 'Entrar' : 'Criar minha conta'}
          </Button>
        </form>
      </div>
    </div>
  )
}
