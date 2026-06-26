import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ClipboardList } from 'lucide-react'
import type { Order, OrderStatus } from '@pizzaria/shared'
import { ordersApi } from '../api/orders'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { EmptyState } from '../components/ui/EmptyState'
import { OrderStatusBadge } from '../components/order/OrderStatusBadge'
import { OrderCardSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatRelativeTime } from '../utils/format'

export default function OrderHistoryPage() {
  const navigate = useNavigate()
  const { addPizza, addBeverage } = useCart()
  const { toast } = useToast()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.list()
      .then(setOrders)
      .catch(() => toast('Erro ao carregar pedidos', 'error'))
      .finally(() => setLoading(false))
  }, [])

  function orderAgain(order: Order) {
    let added = 0
    for (const item of order.itens ?? []) {
      if (item.tipo === 'PIZZA' && item.tamanho && item.borda && item.sabores?.length) {
        addPizza({
          tipo: 'PIZZA',
          tamanho: item.tamanho,
          borda: item.borda,
          sabores: item.sabores.map((sf: any) => sf.flavor ?? sf),
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          observacoes: item.observacoes ?? undefined,
        })
        added++
      } else if (item.tipo === 'BEBIDA' && item.bebida) {
        addBeverage({
          id: `bev-${item.bebida.id}`,
          tipo: 'BEBIDA',
          bebida: item.bebida,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })
        added++
      }
    }
    if (added > 0) {
      toast(`${added} ${added === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho!`, 'success')
      navigate('/cart')
    } else {
      toast('Não foi possível re-adicionar os itens', 'error')
    }
  }

  function getOrderSummary(order: Order): string {
    const pizzas = (order.itens ?? []).filter((i) => i.tipo === 'PIZZA')
    const beverages = (order.itens ?? []).filter((i) => i.tipo === 'BEBIDA')
    const parts: string[] = []
    if (pizzas.length) parts.push(`${pizzas.length} pizza${pizzas.length > 1 ? 's' : ''}`)
    if (beverages.length) parts.push(`${beverages.length} bebida${beverages.length > 1 ? 's' : ''}`)
    return parts.join(' + ')
  }

  return (
    <Layout>
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-3xl font-extrabold text-pizza-dark">Meus Pedidos</h1>
        <p className="text-pizza-muted text-sm mt-0.5">Histórico e acompanhamento</p>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={28} />}
            title="Nenhum pedido ainda"
            description="Seus pedidos aparecerão aqui após a primeira compra"
            action={<Button onClick={() => navigate('/')}>Fazer meu primeiro pedido</Button>}
          />
        ) : (
          orders.map((order) => {
            const isActive = !['ENTREGUE', 'CANCELADO'].includes(order.status)
            return (
              <div
                key={order.id}
                className="bg-white rounded-4xl shadow-card overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full p-4 flex items-start gap-3 text-left press-effect"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-flame shadow-brand flex items-center justify-center text-xl flex-shrink-0">
                    🍕
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-pizza-dark text-sm">Pedido #{order.numero}</p>
                      <OrderStatusBadge status={order.status as OrderStatus} animated={isActive} />
                    </div>
                    <p className="text-xs text-pizza-muted mt-0.5">{getOrderSummary(order)}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-bold text-pizza-red">{formatCurrency(order.total)}</span>
                      <span className="text-xs text-pizza-muted">{formatRelativeTime(order.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 mt-1 flex-shrink-0" />
                </button>
                <div className="border-t border-gray-100 px-4 py-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => orderAgain(order)}
                  >
                    Pedir novamente
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}
