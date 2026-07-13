import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, XCircle } from 'lucide-react'
import type { Order, OrderStatus } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@pizzaria/shared'
import { ordersApi } from '../api/orders'
import { ApiError } from '../api/client'
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
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    if (!order || !id) return
    if (!window.confirm('Tem certeza que deseja cancelar este pedido? Essa ação não pode ser desfeita.')) return

    setCancelling(true)
    try {
      const updated = await ordersApi.cancel(id)
      setOrder(updated)
      toast('Pedido cancelado', 'success')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao cancelar pedido'
      toast(msg, 'error')
    } finally {
      setCancelling(false)
    }
  }

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
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="w-10 h-10 rounded-full border-2 border-pizza-border bg-white grid place-items-center text-pizza-dark press-effect">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-sm text-pizza-muted">Pedido #{order.numero}</p>
            <h1 className="font-display text-2xl text-pizza-dark leading-tight">Acompanhamento</h1>
          </div>
          <OrderStatusBadge status={order.status as OrderStatus} animated />
        </div>

        {/* Timeline */}
        <div className="bg-white border-2 border-pizza-line rounded-3xl p-5 sm:p-6">
          <h2 className="font-display text-xl text-pizza-dark mb-4">Status do pedido</h2>
          <OrderTimeline status={order.status as OrderStatus} tipo={order.tipo} />
        </div>

        {/* Itens */}
        <div className="bg-white border-2 border-pizza-line rounded-3xl p-5 sm:p-6">
          <h2 className="font-display text-xl text-pizza-dark mb-3">Itens</h2>
          <div className="flex flex-col gap-2">
            {order.itens?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm gap-2">
                <div className="flex-1 min-w-0">
                  {item.tipo === 'PIZZA' ? (
                    <p className="text-pizza-ink font-bold leading-tight">
                      {item.quantidade}× {item.sabores?.map((s) => s.flavor?.nome).join(' + ')}
                    </p>
                  ) : (
                    <p className="text-pizza-ink font-bold leading-tight">
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
                <span className="text-pizza-red font-bold shrink-0">
                  {formatCurrency(item.precoUnitario * item.quantidade)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-pizza-border mt-3 pt-3 flex justify-between">
            <span className="font-bold text-pizza-ink">Total</span>
            <span className="font-bold text-pizza-red">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Detalhes */}
        <div className="bg-white border-2 border-pizza-line rounded-3xl p-5 sm:p-6 flex flex-col gap-2">
          <h2 className="font-display text-xl text-pizza-dark mb-1">Detalhes</h2>
          <div className="flex justify-between text-sm">
            <span className="text-pizza-muted">Pedido em</span>
            <span className="text-pizza-ink">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pizza-muted">Pagamento</span>
            <span className="text-pizza-ink">{PAYMENT_METHOD_LABELS[order.formaPagamento as keyof typeof PAYMENT_METHOD_LABELS]}</span>
          </div>
          {order.tipo === 'ENTREGA' && enderecoEntrega && (
            <div className="flex justify-between text-sm">
              <span className="text-pizza-muted">Entrega</span>
              <span className="text-pizza-ink text-right max-w-[180px]">
                {enderecoEntrega.rua}, {enderecoEntrega.numero} — {enderecoEntrega.bairro}
              </span>
            </div>
          )}
          {order.tipo === 'RETIRADA' && (
            <div className="flex justify-between text-sm">
              <span className="text-pizza-muted">Tipo</span>
              <span className="text-pizza-ink">Retirada no local</span>
            </div>
          )}
        </div>

        {/* Cancelar pedido — só enquanto ainda foi apenas recebido */}
        {order.status === 'RECEBIDO' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full border-2 border-red-200 text-pizza-red rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 press-effect transition-colors hover:bg-brand-50 disabled:opacity-50"
          >
            <XCircle size={18} />
            {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        )}
      </div>
    </Layout>
  )
}
