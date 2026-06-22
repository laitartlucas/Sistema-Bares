import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone } from 'lucide-react'
import type { Order, OrderStatus } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@pizzaria/shared'
import { ordersApi } from '../api/orders'
import { useSocket } from '../contexts/SocketContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { OrderTimeline } from '../components/order/OrderTimeline'
import { OrderStatusBadge } from '../components/order/OrderStatusBadge'
import { Spinner } from '../components/ui/Spinner'
import { formatCurrency, formatDate } from '../utils/format'

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/favicon.svg' })
  }
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    requestNotificationPermission()
    ordersApi.getById(id)
      .then(setOrder)
      .catch(() => toast('Erro ao carregar pedido', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  // WebSocket: receber atualizações de status
  useEffect(() => {
    if (!socket || !id) return
    socket.emit('join-order', id)

    socket.on('status-atualizado', (payload) => {
      if (payload.orderId !== id) return
      setOrder((prev) => prev ? { ...prev, status: payload.status } : prev)

      const label = ORDER_STATUS_LABELS[payload.status]
      toast(`Pedido #${payload.orderNumero}: ${label}`, 'info')

      if (payload.status === 'SAIU_PARA_ENTREGA') {
        showNotification('🛵 Pedido saiu para entrega!', 'Seu pedido está a caminho. Fique atento!')
      } else if (payload.status === 'PRONTO') {
        showNotification('✅ Pedido pronto para retirada!', 'Venha buscar seu pedido!')
      }
    })

    return () => {
      socket.off('status-atualizado')
      socket.emit('leave-order', id)
    }
  }, [socket, id])

  if (loading) {
    return (
      <Layout hideNav>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout hideNav>
        <div className="flex flex-col items-center justify-center h-64 text-pizza-muted gap-2">
          <p>Pedido não encontrado</p>
          <button onClick={() => navigate('/orders')} className="text-pizza-red font-semibold text-sm">
            Ver meus pedidos
          </button>
        </div>
      </Layout>
    )
  }

  const enderecoEntrega = order.enderecoEntrega as { rua: string; numero: string; bairro: string; complemento?: string } | undefined

  return (
    <Layout hideNav>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/orders')} className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-pizza-red press-effect">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-pizza-muted">Pedido #{order.numero}</p>
            <h1 className="font-display font-bold text-pizza-dark text-base leading-tight">Acompanhamento</h1>
          </div>
          <OrderStatusBadge status={order.status as OrderStatus} animated />
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Timeline */}
        <div className="bg-white rounded-3xl shadow-soft p-5">
          <h2 className="font-display font-semibold text-pizza-dark mb-4">Status do pedido</h2>
          <OrderTimeline status={order.status as OrderStatus} tipo={order.tipo} />
        </div>

        {/* Itens */}
        <div className="bg-white rounded-3xl shadow-card p-4">
          <h2 className="font-semibold text-pizza-dark mb-3">Itens</h2>
          <div className="flex flex-col gap-2">
            {order.itens?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm gap-2">
                <div className="flex-1 min-w-0">
                  {item.tipo === 'PIZZA' ? (
                    <p className="text-pizza-dark font-medium leading-tight">
                      {item.quantidade}× {item.sabores?.map((s) => s.flavor?.nome).join(' + ')}
                    </p>
                  ) : (
                    <p className="text-pizza-dark font-medium leading-tight">
                      {item.quantidade}× {item.bebida?.nome}
                    </p>
                  )}
                  {item.tipo === 'PIZZA' && (
                    <p className="text-xs text-pizza-muted">
                      {item.tamanho?.nome} · {item.borda?.nome}
                    </p>
                  )}
                  {item.observacoes && <p className="text-xs text-pizza-muted italic">"{item.observacoes}"</p>}
                </div>
                <span className="text-pizza-red font-semibold shrink-0">
                  {formatCurrency(item.precoUnitario * item.quantidade)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between">
            <span className="font-bold text-pizza-dark">Total</span>
            <span className="font-bold text-pizza-red">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Detalhes */}
        <div className="bg-white rounded-3xl shadow-card p-4 flex flex-col gap-2">
          <h2 className="font-semibold text-pizza-dark mb-1">Detalhes</h2>
          <div className="flex justify-between text-sm">
            <span className="text-pizza-muted">Pedido em</span>
            <span className="text-pizza-dark">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pizza-muted">Pagamento</span>
            <span className="text-pizza-dark">{PAYMENT_METHOD_LABELS[order.formaPagamento as keyof typeof PAYMENT_METHOD_LABELS]}</span>
          </div>
          {order.tipo === 'ENTREGA' && enderecoEntrega && (
            <div className="flex justify-between text-sm">
              <span className="text-pizza-muted">Entrega</span>
              <span className="text-pizza-dark text-right max-w-[180px]">
                {enderecoEntrega.rua}, {enderecoEntrega.numero} — {enderecoEntrega.bairro}
              </span>
            </div>
          )}
          {order.tipo === 'RETIRADA' && (
            <div className="flex justify-between text-sm">
              <span className="text-pizza-muted">Tipo</span>
              <span className="text-pizza-dark">Retirada no local</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
