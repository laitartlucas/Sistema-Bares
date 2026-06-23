import { useState } from 'react'
import { MapPin, ShoppingBag, Phone, User, Printer, ChevronRight, Ban } from 'lucide-react'
import type { Order, OrderStatus } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, getNextStatus } from '@pizzaria/shared'
import { adminOrdersApi } from '../../api/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useToast } from '../../hooks/useToast'

interface Props {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
}

const statusBadge: Record<string, 'blue' | 'amber' | 'green' | 'gray' | 'purple'> = {
  RECEBIDO:          'blue',
  EM_PREPARO:        'amber',
  PRONTO:            'purple',
  SAIU_PARA_ENTREGA: 'green',
  ENTREGUE:          'gray',
}

export function OrderDetail({ order, onStatusChange }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const nextStatus: OrderStatus | null = getNextStatus(order.tipo, order.status)
  const canCancel = order.status !== 'ENTREGUE' && order.status !== 'CANCELADO'

  async function advance() {
    if (!nextStatus) return
    setLoading(true)
    try {
      await adminOrdersApi.updateStatus(order.id, nextStatus)
      onStatusChange(order.id, nextStatus)
      toast(`Status → ${ORDER_STATUS_LABELS[nextStatus]}`, 'success')
    } catch {
      toast('Erro ao atualizar status', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function cancel() {
    if (!window.confirm('Cancelar este pedido? Essa ação não pode ser desfeita.')) return
    setLoading(true)
    try {
      await adminOrdersApi.updateStatus(order.id, 'CANCELADO')
      onStatusChange(order.id, 'CANCELADO')
      toast('Pedido cancelado', 'success')
    } catch {
      toast('Erro ao cancelar pedido', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function reprint() {
    setLoading(true)
    try {
      await adminOrdersApi.reprint(order.id)
      toast('Reimpressão solicitada', 'info')
    } catch {
      toast('Erro ao reimprimir', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 font-mono">#{order.id.slice(-6).toUpperCase()}</p>
          <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusBadge[order.status] ?? 'gray'}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      {/* Customer */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cliente</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <User size={14} className="text-slate-400" />
            {order.user?.nome ?? '—'}
          </div>
          {order.user?.telefone && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone size={14} className="text-slate-400" />
              {order.user.telefone}
            </div>
          )}
        </div>
      </section>

      {/* Delivery */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Entrega</h3>
        <div className="flex items-start gap-2 text-sm text-slate-700">
          {order.tipo === 'ENTREGA'
            ? <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
            : <ShoppingBag size={14} className="text-slate-400 mt-0.5 shrink-0" />}
          {order.tipo === 'ENTREGA' && order.enderecoEntrega
            ? (() => {
                const a = order.enderecoEntrega as unknown as Record<string, string>
                return <span>{a.rua}, {a.numero}{a.complemento ? `, ${a.complemento}` : ''} — {a.bairro}</span>
              })()
            : <span>Retirada no local</span>}
        </div>
      </section>

      {/* Items */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Itens</h3>
        <div className="space-y-2">
          {order.itens.map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {item.bebida ? (
                    <p className="font-semibold text-sm text-slate-800">{item.quantidade}× {item.bebida.nome}</p>
                  ) : (
                    <>
                      <p className="font-semibold text-sm text-slate-800">
                        {item.quantidade}× Pizza {item.tamanho?.nome}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.sabores.map((sf) => sf.flavor?.nome).filter(Boolean).join(' / ')}
                      </p>
                      {item.borda && (
                        <p className="text-xs text-slate-500">Borda: {item.borda.nome}</p>
                      )}
                    </>
                  )}
                  {item.observacoes && (
                    <p className="text-xs text-amber-600 mt-1 italic">"{item.observacoes}"</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">{formatCurrency(item.precoUnitario * item.quantidade)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Totals */}
      <section className="border-t border-slate-100 pt-3 space-y-1.5">
        <div className="flex justify-between font-bold text-base text-slate-800">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <p className="text-xs text-slate-400 text-right">{PAYMENT_METHOD_LABELS[order.formaPagamento]}</p>
        {order.trocoPara != null && (
          <p className="text-xs text-slate-500 text-right">Troco para: {formatCurrency(order.trocoPara)}</p>
        )}
      </section>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {nextStatus && (
          <Button className="flex-1" loading={loading} onClick={advance}>
            Avançar para {ORDER_STATUS_LABELS[nextStatus]}
            <ChevronRight size={14} />
          </Button>
        )}
        <Button variant="secondary" loading={loading} onClick={reprint} leftIcon={<Printer size={14} />}>
          Reimprimir
        </Button>
        {canCancel && (
          <Button variant="danger" loading={loading} onClick={cancel} leftIcon={<Ban size={14} />}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}
