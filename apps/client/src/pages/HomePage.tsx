import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import type { PizzaSize, Beverage, StoreConfig } from '@pizzaria/shared'
import { menuApi } from '../api/menu'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

const SIZE_ICONS = ['🫘', '🍕', '🍕', '🍕', '🎉']

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

  return (
    <Layout>
      {/* Header */}
      <div className="bg-pizza-red pt-safe">
        <div className="px-5 pt-5 pb-6">
          <p className="text-red-200 text-sm font-medium">Olá, {firstName} 👋</p>
          <h1 className="font-display text-2xl font-bold text-white mt-0.5">
            O que vai ser hoje?
          </h1>
          {config && (
            <p className="text-red-200 text-xs mt-1">
              {config.horarioFuncionamento} · Taxa de entrega {formatCurrency(Number(config.taxaEntrega))}
            </p>
          )}
        </div>
        <svg viewBox="0 0 375 28" className="w-full fill-pizza-cream" preserveAspectRatio="none">
          <path d="M0 28h375V14C312 0 250 20 188 14S64 0 0 14z" />
        </svg>
      </div>

      <div className="px-4 -mt-1 pb-4 flex flex-col gap-6">

        {/* Tamanhos */}
        <section>
          <h2 className="font-display font-semibold text-pizza-dark text-lg mb-3">Nossas Pizzas</h2>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sizes.map((size, i) => (
                <button
                  key={size.id}
                  onClick={() => navigate('/pizza/build', { state: { preselectedSize: size } })}
                  className="w-full bg-white rounded-3xl shadow-card border-2 border-transparent hover:border-pizza-red/20 p-4 flex items-center gap-4 press-effect active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-pizza-red flex items-center justify-center text-xl flex-shrink-0">
                    {SIZE_ICONS[i] ?? '🍕'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-pizza-dark text-base">{size.nome}</p>
                    <p className="text-xs text-pizza-muted mt-0.5">
                      {size.pedacos} pedaços · até {size.maxSabores} {size.maxSabores === 1 ? 'sabor' : 'sabores'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-pizza-red text-base">{formatCurrency(size.preco)}</span>
                    <ChevronRight size={18} className="text-pizza-red" />
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/pizza/build')}
            className="mt-3 w-full bg-pizza-red text-white rounded-3xl py-4 font-display font-bold text-base shadow-brand press-effect flex items-center justify-center gap-2"
          >
            🍕 Montar minha pizza
          </button>
        </section>

        {/* Bebidas */}
        {beverages.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-pizza-dark text-lg mb-3">Bebidas</h2>
            <div className="flex flex-col gap-2">
              {beverages.map((bev) => {
                const qty = cartBevCount(bev.id)
                return (
                  <div
                    key={bev.id}
                    className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center text-xl flex-shrink-0">
                      🥤
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-pizza-dark text-sm truncate">{bev.nome}</p>
                      {bev.volume && <p className="text-xs text-pizza-muted">{bev.volume}</p>}
                      <p className="text-xs font-bold text-pizza-red">{formatCurrency(bev.preco)}</p>
                    </div>
                    <button
                      onClick={() => handleAddBeverage(bev)}
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center transition-all press-effect flex-shrink-0',
                        qty > 0
                          ? 'bg-pizza-red text-white shadow-brand'
                          : 'bg-brand-50 text-pizza-red border border-brand-200',
                      )}
                    >
                      {qty > 0 ? <span className="text-xs font-bold">{qty}</span> : <Plus size={18} />}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
