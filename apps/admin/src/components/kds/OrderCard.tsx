import { useState, useEffect } from 'react'
import { Clock, ChevronRight, MapPin, ShoppingBag } from 'lucide-react'
import type { Order } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@pizzaria/shared'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

interface Props {
  order: Order
  onClick: () => void
}

function useElapsed(createdAt: string) {
  const [mins, setMins] = useState(0)
  useEffect(() => {
    const calc = () => setMins(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000))
    calc()
    const id = setInterval(calc, 30000)
    return () => clearInterval(id)
  }, [createdAt])
  return mins
}

function TimerBadge({ mins }: { mins: number }) {
  const color = mins < 15 ? 'text-emerald-600 bg-emerald-50' : mins < 30 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
  const pulse = mins >= 30 ? 'animate-pulse' : ''
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full', color, pulse)}>
      <Clock size={11} />
      {mins}m
    </span>
  )
}

const statusBadge: Record<string, 'blue' | 'amber' | 'green' | 'gray'> = {
  RECEBIDO:          'blue',
  EM_PREPARO:        'amber',
  SAIU_PARA_ENTREGA: 'green',
  ENTREGUE:          'gray',
}

export function OrderCard({ order, onClick }: Props) {
  const mins = useElapsed(order.createdAt)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-pizza-red/30 cursor-pointer transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs text-slate-400 font-mono">#{order.id.slice(-6).toUpperCase()}</p>
          <p className="font-bold text-slate-800 text-sm leading-tight mt-0.5">{order.user?.nome ?? '—'}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <TimerBadge mins={mins} />
          <Badge variant={statusBadge[order.status] ?? 'gray'}>{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {order.itens.map((item, i) => (
          <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
            <span className="shrink-0 font-semibold text-slate-700">{item.quantidade}×</span>
            <span className="leading-tight">
              {item.bebida
                ? item.bebida.nome
                : item.sabores.map((sf) => sf.flavor?.nome ?? '').filter(Boolean).join(' / ')}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {order.tipo === 'ENTREGA' ? <MapPin size={11} /> : <ShoppingBag size={11} />}
          <span>{order.tipo === 'ENTREGA' ? 'Entrega' : 'Retirada'}</span>
          <span className="text-slate-300">·</span>
          <span>{PAYMENT_METHOD_LABELS[order.formaPagamento]}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm text-slate-800">{formatCurrency(order.total)}</span>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-pizza-red transition-colors" />
        </div>
      </div>
    </div>
  )
}
