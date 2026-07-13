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

  const authTitle    = mode === 'register' ? 'Criar conta' : 'Bem-vindo de volta'
  const authSubtitle = mode === 'register' ? 'Leva menos de um minuto' : 'Entre para pedir sua pizza'

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      {/* ── Painel da marca ─────────────────────────────────── */}
      <div className="relative flex-1 md:min-h-dvh bg-pizza-dark text-pizza-cream flex flex-col justify-center items-center gap-5 px-8 py-14 md:py-16 overflow-hidden">
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-pizza-red opacity-[0.14]" />
        <div className="absolute -bottom-32 -left-24 w-[22rem] h-[22rem] rounded-full bg-pizza-cheese opacity-10" />
        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-[2rem] bg-brand-flame grid place-items-center text-6xl md:text-7xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] select-none">
          🍕
        </div>
        <div className="relative text-center flex flex-col gap-2">
          <span className="text-[13px] tracking-[5px] text-pizza-cheese font-bold">DELIVERY</span>
          <span
            className="font-display text-5xl md:text-6xl leading-none text-pizza-cheese"
            style={{ textShadow: '3px 3px 0 #E2382A' }}
          >
            Solange
          </span>
          <span className="text-base md:text-[17px] text-pizza-sand">Feita com amor, entregue com agilidade</span>
        </div>
        <div className="relative flex items-center gap-4 text-sm text-pizza-muted mt-2">
          <span>54 99672-7602</span>
          <span className="text-pizza-red">•</span>
          <span>54 99960-6907</span>
        </div>
      </div>

      {/* ── Painel do formulário ────────────────────────────── */}
      <div className="flex-1 bg-pizza-cream flex items-center justify-center px-6 py-14 sm:px-8">
        <div className="w-full max-w-[420px] flex flex-col gap-6">
          {/* Abas */}
          <div className="bg-[#F1E7D6] rounded-full p-1.5 flex gap-1">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}) }}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  mode === m
                    ? 'bg-pizza-dark text-pizza-cheese'
                    : 'text-pizza-muted hover:text-pizza-ink'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-display text-3xl text-pizza-dark">{authTitle}</h2>
            <p className="text-pizza-muted text-[15px]">{authSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <Input
                label="Nome"
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                error={errors.nome}
                leftIcon={<User size={16} />}
                autoComplete="name"
              />
            )}
            <Input
              label="Telefone"
              placeholder="54 99999-9999"
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
    </div>
  )
}
