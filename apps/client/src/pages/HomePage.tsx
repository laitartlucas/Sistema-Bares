import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Clock, MapPin, Flame, Sparkles } from 'lucide-react'
import type { PizzaSize, Beverage, StoreConfig } from '@pizzaria/shared'
import { menuApi } from '../api/menu'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

const SIZE_EMOJI = ['🍕', '🍕', '🍕', '🍕', '🍕']

export default function HomePage() {
  const { user } = useAuth()
  const { addBeverage, items: cartItems } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [sizes, setSizes]         = useState<PizzaSize[]>([])
  const [beverages, setBeverages] = useState<Beverage[]>([])
  const [config, setConfig]       = useState<StoreConfig | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([menuApi.getSizes(), menuApi.getBeverages(), menuApi.getConfig()])
      .then(([s, b, c]) => { setSizes(s); setBeverages(b); setConfig(c) })
      .catch(() => toast('Erro ao carregar cardápio', 'error'))
      .finally(() => setLoading(false))
  }, [])

  function handleAddBeverage(bev: Beverage) {
    addBeverage({
      id: `bev-${bev.id}`,
      tipo: 'BEBIDA',
      bebida: bev,
      quantidade: 1,
      precoUnitario: bev.preco,
    })
    toast(`${bev.nome} adicionado ao carrinho!`, 'success')
  }

  const cartBevCount = (bevId: string) =>
    cartItems.find((i) => i.tipo === 'BEBIDA' && i.bebida.id === bevId)?.quantidade ?? 0

  const firstName = user?.nome.split(' ')[0]
  const cheapest = sizes.length ? Math.min(...sizes.map((s) => s.preco)) : 0

  return (
    <Layout>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative bg-brand-flame overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-60" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-pizza-cheese/20 blur-2xl" />
        <div className="relative px-5 pt-7 pb-9">
          <div className="flex items-center justify-between">
            <span className="font-serif italic text-white/90 text-lg leading-none">
              {config?.nome ?? 'Dom Luigi'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-pizza-basil animate-pulse" />
              Aberto agora
            </span>
          </div>

          <p className="text-white/85 text-sm font-medium mt-6">Olá, {firstName ?? 'pizzalover'} 👋</p>
          <h1 className="font-display text-3xl font-extrabold text-white leading-tight mt-1 text-balance">
            Bateu aquela<br />fome de pizza? 🍕
          </h1>

          {config && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-white/80 text-xs font-medium">
              {config.horarioFuncionamento && (
                <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {config.horarioFuncionamento}</span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> Entrega {formatCurrency(Number(config.taxaEntrega))}
              </span>
            </div>
          )}
        </div>
        <svg viewBox="0 0 375 28" className="w-full fill-pizza-cream block" preserveAspectRatio="none">
          <path d="M0 28h375V14C312 0 250 20 188 14S64 0 0 14z" />
        </svg>
      </div>

      <div className="px-4 -mt-2 pb-6 flex flex-col gap-7">

        {/* ── Card destaque: montar pizza ─────────────────── */}
        <button
          onClick={() => navigate('/pizza/build')}
          className="relative overflow-hidden rounded-4xl bg-pizza-dark text-left p-5 shadow-card-lg press-effect"
        >
          <div className="absolute -right-6 -bottom-8 text-[7rem] leading-none rotate-12 opacity-90 animate-float select-none">🍕</div>
          <div className="absolute inset-0 bg-cheese-glow opacity-15" />
          <div className="relative max-w-[62%]">
            <span className="inline-flex items-center gap-1 text-pizza-cheese text-[11px] font-extrabold uppercase tracking-wide">
              <Sparkles size={13} /> Do seu jeito
            </span>
            <p className="font-display text-2xl font-extrabold text-white mt-1.5 leading-tight">
              Monte sua pizza
            </p>
            <p className="text-white/70 text-xs mt-1">
              Escolha tamanho, sabores e borda
            </p>
            <span className="inline-flex items-center gap-1.5 mt-4 bg-brand-flame text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-brand">
              Começar <ChevronRight size={16} />
            </span>
          </div>
        </button>

        {/* ── Tamanhos ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-extrabold text-pizza-dark text-xl">Escolha o tamanho</h2>
            {cheapest > 0 && (
              <span className="text-xs font-semibold text-pizza-muted">a partir de {formatCurrency(cheapest)}</span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[88px] rounded-4xl shimmer" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sizes.map((size, i) => (
                <button
                  key={size.id}
                  onClick={() => navigate('/pizza/build', { state: { preselectedSize: size } })}
                  className="group w-full bg-white rounded-4xl shadow-card border border-transparent hover:border-brand-200 p-3.5 flex items-center gap-4 press-effect text-left"
                >
                  <div className="relative w-16 h-16 rounded-3xl bg-brand-flame-soft flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                    <span className="group-active:scale-90 transition-transform">{SIZE_EMOJI[i] ?? '🍕'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-extrabold text-pizza-dark text-lg leading-tight">{size.nome}</p>
                    <p className="text-xs text-pizza-muted mt-0.5">
                      {size.pedacos} pedaços · até {size.maxSabores} {size.maxSabores === 1 ? 'sabor' : 'sabores'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-display font-extrabold text-pizza-red text-lg leading-none">{formatCurrency(size.preco)}</span>
                    <span className="mt-1.5 w-8 h-8 rounded-full bg-brand-50 group-hover:bg-brand-flame group-hover:text-white text-pizza-red flex items-center justify-center transition-colors">
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Bebidas ──────────────────────────────────────── */}
        {beverages.length > 0 && (
          <section>
            <h2 className="font-display font-extrabold text-pizza-dark text-xl mb-3">Bebidas geladas 🥤</h2>
            <div className="flex flex-col gap-3">
              {beverages.map((bev) => {
                const qty = cartBevCount(bev.id)
                return (
                  <div
                    key={bev.id}
                    className="bg-white rounded-4xl shadow-card p-3.5 flex items-center gap-4"
                  >
                    <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-100 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                      {bev.imagemUrl
                        ? <img src={bev.imagemUrl} alt={bev.nome} className="w-full h-full object-cover" />
                        : '🥤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-extrabold text-pizza-dark text-lg leading-tight truncate">{bev.nome}</p>
                      {bev.volume && <p className="text-xs text-pizza-muted mt-0.5">{bev.volume}</p>}
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 gap-1.5">
                      <span className="font-display font-extrabold text-pizza-red text-lg leading-none">{formatCurrency(bev.preco)}</span>
                      <button
                        onClick={() => handleAddBeverage(bev)}
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center press-effect flex-shrink-0 transition-colors',
                          qty > 0
                            ? 'bg-brand-flame text-white shadow-brand'
                            : 'bg-brand-50 text-pizza-red',
                        )}
                      >
                        {qty > 0 ? <span className="text-xs font-extrabold">{qty}</span> : <Plus size={16} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <p className="text-center text-[11px] text-pizza-muted/70 font-medium pt-2 flex items-center justify-center gap-1.5">
          <Flame size={12} className="text-pizza-tomato" /> Feito com massa fresca todos os dias
        </p>
      </div>
    </Layout>
  )
}
