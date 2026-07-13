import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart, type CartItem } from '../contexts/CartContext'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { formatCurrency } from '../utils/format'

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
    <div className="bg-white border-2 border-pizza-line rounded-2xl p-4 sm:px-5 flex items-center gap-4 flex-wrap animate-fade-in">
      <div className="flex flex-col gap-0.5 flex-1 min-w-[180px]">
        <span className="font-bold text-pizza-ink leading-tight">{name}</span>
        <span className="text-pizza-muted text-[13px]">{subtitle}</span>
        {item.tipo === 'PIZZA' && item.observacoes && (
          <span className="text-pizza-muted text-[13px] italic">"{item.observacoes}"</span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onQty(item.quantidade - 1)}
          className="w-8 h-8 rounded-full border-2 border-pizza-border bg-white text-pizza-dark grid place-items-center press-effect"
        >
          <Minus size={15} />
        </button>
        <span className="font-bold text-pizza-dark min-w-[20px] text-center">{item.quantidade}</span>
        <button
          onClick={() => onQty(item.quantidade + 1)}
          className="w-8 h-8 rounded-full border-2 border-pizza-border bg-white text-pizza-dark grid place-items-center press-effect"
        >
          <Plus size={15} />
        </button>
      </div>
      <span className="text-pizza-red font-bold text-[17px] min-w-[90px] text-right">
        {formatCurrency(item.precoUnitario * item.quantidade)}
      </span>
      <button onClick={onRemove} className="text-pizza-muted hover:text-pizza-red transition-colors p-1">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default function CartPage() {
  const { items, total, updateQty, remove } = useCart()
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        <h1 className="font-display text-3xl sm:text-4xl text-pizza-dark">Carrinho</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={30} />}
            title="Carrinho vazio"
            description="Adicione pizzas e bebidas para continuar"
            action={<Button onClick={() => navigate('/')}>Ver cardápio</Button>}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQty={(qty) => updateQty(item.id, qty)}
                  onRemove={() => remove(item.id)}
                />
              ))}

              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-dashed border-pizza-border rounded-2xl py-4 text-pizza-red font-bold text-sm hover:bg-brand-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Adicionar mais itens
              </button>
            </div>

            {/* Resumo escuro */}
            <div className="bg-pizza-dark text-pizza-cream rounded-3xl p-6 flex flex-col gap-2.5">
              <div className="flex justify-between text-[15px] text-pizza-sand">
                <span>Subtotal</span><span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-[15px] text-pizza-sand">
                <span>Entrega</span><span>calculada no checkout</span>
              </div>
              <div className="flex justify-between items-center border-t border-pizza-dark2 pt-3 mt-1">
                <span className="font-bold text-[17px]">Total</span>
                <span className="font-display text-3xl text-pizza-cheese">{formatCurrency(total)}</span>
              </div>
              <Button variant="cheese" fullWidth size="lg" className="mt-2 !rounded-full" onClick={() => navigate('/checkout')}>
                Finalizar pedido
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
