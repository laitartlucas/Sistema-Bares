import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart, type CartItem } from '../contexts/CartContext'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

function CartItemRow({ item, onQty, onRemove }: {
  item: CartItem
  onQty: (qty: number) => void
  onRemove: () => void
}) {
  const name = item.tipo === 'PIZZA'
    ? item.sabores.map((s) => s.nome).join(' + ')
    : `${item.bebida.nome}${item.bebida.volume ? ` ${item.bebida.volume}` : ''}`

  const subtitle = item.tipo === 'PIZZA'
    ? `${item.tamanho.nome} · ${item.borda.nome}`
    : 'Bebida'

  return (
    <div className="bg-white rounded-3xl shadow-card p-4 flex gap-3 animate-fade-in">
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0',
        item.tipo === 'PIZZA'
          ? 'bg-gradient-to-br from-brand-400 to-pizza-red'
          : 'bg-gradient-to-br from-blue-50 to-cyan-100',
      )}>
        {item.tipo === 'PIZZA' ? '🍕' : '🥤'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-pizza-dark text-sm leading-tight line-clamp-2">{name}</p>
        <p className="text-xs text-pizza-muted mt-0.5">{subtitle}</p>
        {item.tipo === 'PIZZA' && item.observacoes && (
          <p className="text-xs text-pizza-muted mt-0.5 italic">"{item.observacoes}"</p>
        )}
        <p className="text-sm font-bold text-pizza-red mt-1">
          {formatCurrency(item.precoUnitario)}
        </p>
      </div>
      <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors p-1">
          <Trash2 size={15} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQty(item.quantidade - 1)}
            className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-pizza-red press-effect border border-brand-200"
          >
            <Minus size={13} />
          </button>
          <span className="text-sm font-bold text-pizza-dark w-4 text-center">{item.quantidade}</span>
          <button
            onClick={() => onQty(item.quantidade + 1)}
            className="w-7 h-7 rounded-lg bg-pizza-red flex items-center justify-center text-white shadow-brand press-effect"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { items, total, updateQty, remove, clear } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <Layout>
        <EmptyState
          icon={<ShoppingCart size={32} />}
          title="Carrinho vazio"
          description="Adicione pizzas e bebidas para continuar"
          action={
            <Button onClick={() => navigate('/')}>Ver cardápio</Button>
          }
        />
      </Layout>
    )
  }

  return (
    <Layout hideNav>
      <div className="px-4 pt-6 pb-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-pizza-dark">Seu pedido</h1>
          <button onClick={clear} className="text-xs text-pizza-muted hover:text-red-500 transition-colors font-medium underline underline-offset-2">
            Limpar tudo
          </button>
        </div>
        <p className="text-pizza-muted text-sm">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-36">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onQty={(qty) => updateQty(item.id, qty)}
            onRemove={() => remove(item.id)}
          />
        ))}

        {/* Adicionar mais */}
        <button
          onClick={() => navigate('/pizza/build')}
          className="w-full border-2 border-dashed border-brand-200 rounded-3xl py-4 text-pizza-red font-semibold text-sm hover:bg-brand-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Adicionar mais itens
        </button>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-4 pb-safe z-30">
        <div className="flex justify-between text-sm px-1 mb-3">
          <span className="text-pizza-muted font-medium">Subtotal</span>
          <span className="font-bold text-pizza-dark text-base">{formatCurrency(total)}</span>
        </div>
        <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>
          Ir para o checkout →
        </Button>
      </div>
    </Layout>
  )
}
