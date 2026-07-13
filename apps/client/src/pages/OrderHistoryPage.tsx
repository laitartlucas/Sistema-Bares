import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
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
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl sm:text-4xl text-pizza-dark">Meus Pedidos</h1>
          <p className="text-pizza-muted">Histórico e acompanhamento</p>
        </div>

        <div className="flex flex-col gap-3.5">
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
                  className="bg-white border-2 border-pizza-line rounded-[18px] p-5 flex flex-col gap-3.5"
                >
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex items-start gap-4 flex-wrap text-left press-effect"
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-[180px]">
                      <span className="font-bold text-pizza-ink text-[17px]">Pedido #{order.numero}</span>
                      <span className="text-pizza-muted text-sm">{getOrderSummary(order)}</span>
                      <span className="text-pizza-red font-bold">{formatCurrency(order.total)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <OrderStatusBadge status={order.status as OrderStatus} animated={isActive} />
                      <span className="text-pizza-muted text-[13px]">{formatRelativeTime(order.createdAt)}</span>
                    </div>
                  </button>
                  <Button variant="secondary" fullWidth onClick={() => orderAgain(order)}>
                    Pedir novamente
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}
