import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus } from 'lucide-react'
import type { PizzaSize, Beverage, StoreConfig } from '@pizzaria/shared'
import { menuApi } from '../api/menu'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { formatCurrency } from '../utils/format'

export default function HomePage() {
  const { user } = useAuth()
  const { addBeverage, updateQty, items: cartItems } = useCart()
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
      {/* ── Hero escuro ──────────────────────────────────────── */}
      <div className="bg-pizza-dark text-pizza-cream px-4 sm:px-6 py-12 sm:py-14">
        <div className="max-w-[1080px] mx-auto flex flex-wrap items-center gap-8">
          <div className="flex-1 min-w-[300px] flex flex-col gap-3">
            <span className="text-pizza-sand text-base">Olá, {firstName ?? 'pizzalover'}</span>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] text-pizza-cream">
              Bateu aquela <span className="text-pizza-cheese">fome de pizza?</span>
            </h1>
            <span className="text-pizza-muted text-[15px]">
              Entrega {config ? formatCurrency(Number(config.taxaEntrega)) : '—'} · 40–60 min
            </span>
          </div>

          <div className="flex-1 min-w-[280px] sm:max-w-[360px] bg-pizza-dark2 border-2 border-pizza-cheese rounded-3xl p-6 sm:p-7 flex flex-col gap-2.5">
            <span className="text-pizza-cheese text-xs font-bold tracking-[3px]">DO SEU JEITO</span>
            <span className="font-display text-2xl sm:text-3xl text-pizza-cream">Monte sua pizza</span>
            <span className="text-pizza-muted text-sm">Escolha tamanho, sabores e borda</span>
            <button
              onClick={() => navigate('/pizza/build')}
              className="self-start mt-2 bg-pizza-cheese text-pizza-dark rounded-full px-7 py-3 text-base font-bold press-effect hover:bg-[#FFD75E] transition-colors"
            >
              Começar →
            </button>
          </div>
        </div>
      </div>

      {/* ── Tamanhos ─────────────────────────────────────────── */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-10 pb-4 flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl text-pizza-dark">Escolha o tamanho</h2>
          {cheapest > 0 && (
            <span className="text-pizza-muted text-sm">a partir de {formatCurrency(cheapest)}</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-3xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => navigate('/pizza/build', { state: { preselectedSize: size } })}
                className="group bg-white border-2 border-pizza-line rounded-[18px] p-5 flex flex-col gap-2 text-left transition-all duration-150 hover:border-pizza-cheese hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl text-pizza-dark">{size.nome}</span>
                  <span className="bg-pizza-honey text-pizza-label rounded-full text-xs font-bold px-2.5 py-1">
                    {size.pedacos} pedaços
                  </span>
                </div>
                <span className="text-pizza-muted text-sm">
                  até {size.maxSabores} {size.maxSabores === 1 ? 'sabor' : 'sabores'}
                </span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-pizza-red font-bold text-xl">{formatCurrency(size.preco)}</span>
                  <span className="text-pizza-cheese font-bold text-sm group-hover:translate-x-0.5 transition-transform">Montar →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Bebidas ──────────────────────────────────────────── */}
      {beverages.length > 0 && (
        <section className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-6 pb-16 flex flex-col gap-4">
          <h2 className="font-display text-2xl sm:text-3xl text-pizza-dark">Bebidas</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
            {beverages.map((bev) => {
              const qty = cartBevCount(bev.id)
              return (
                <div
                  key={bev.id}
                  className="bg-white border-2 border-pizza-line rounded-[18px] p-5 flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-bold text-pizza-ink truncate">
                      {bev.nome}{bev.volume ? ` ${bev.volume}` : ''}
                    </span>
                    <span className="text-pizza-red font-bold">{formatCurrency(bev.preco)}</span>
                  </div>
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(`bev-${bev.id}`, qty - 1)}
                        className="w-9 h-9 rounded-full border-2 border-pizza-border bg-white text-pizza-dark grid place-items-center press-effect"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="font-bold text-pizza-dark w-4 text-center">{qty}</span>
                      <button
                        onClick={() => handleAddBeverage(bev)}
                        className="w-10 h-10 rounded-full bg-pizza-dark text-pizza-cheese grid place-items-center text-xl press-effect hover:bg-pizza-dark2 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddBeverage(bev)}
                      className="w-10 h-10 rounded-full bg-pizza-dark text-pizza-cheese grid place-items-center text-xl press-effect hover:bg-pizza-dark2 transition-colors shrink-0"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </Layout>
  )
}
