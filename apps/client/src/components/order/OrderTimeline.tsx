import { Check, Clock, Truck, Package } from 'lucide-react'
import type { OrderStatus, OrderType } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, ORDER_STATUS_FLOW_RETIRADA } from '@pizzaria/shared'
import { cn } from '../../utils/cn'

const STEP_ICONS: Record<OrderStatus, React.ReactNode> = {
  RECEBIDO:          <Clock size={16} />,
  EM_PREPARO:        <span className="text-base">🍕</span>,
  PRONTO:            <Package size={16} />,
  SAIU_PARA_ENTREGA: <Truck size={16} />,
  ENTREGUE:          <Check size={16} strokeWidth={3} />,
  CANCELADO:         <span>✕</span>,
}

interface OrderTimelineProps {
  status: OrderStatus
  tipo: OrderType
}

export function OrderTimeline({ status, tipo }: OrderTimelineProps) {
  if (status === 'CANCELADO') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
        <span className="text-red-500 text-xl">✕</span>
        <span className="font-semibold text-red-600">Pedido cancelado</span>
      </div>
    )
  }

  const flow = tipo === 'RETIRADA' ? ORDER_STATUS_FLOW_RETIRADA : ORDER_STATUS_FLOW
  const currentIdx = flow.indexOf(status)

  return (
    <div className="flex flex-col gap-0">
      {flow.map((step, idx) => {
        const isDone    = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isLast    = idx === flow.length - 1

        return (
          <div key={step} className="flex items-start gap-4">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500',
                  isDone    && 'bg-pizza-red text-white',
                  isCurrent && 'bg-pizza-red text-white ring-4 ring-pizza-red/20',
                  !isDone && !isCurrent && 'bg-gray-100 text-gray-400',
                )}
              >
                {isDone ? <Check size={16} strokeWidth={3} /> : STEP_ICONS[step]}
              </div>
              {!isLast && (
                <div className={cn('w-0.5 h-8 mt-1 transition-colors duration-500', idx < currentIdx ? 'bg-pizza-red' : 'bg-gray-200')} />
              )}
            </div>

            {/* Label */}
            <div className="pt-1.5 pb-6">
              <p className={cn('font-semibold text-sm', isCurrent ? 'text-pizza-red' : isDone ? 'text-pizza-dark' : 'text-gray-400')}>
                {ORDER_STATUS_LABELS[step]}
              </p>
              {isCurrent && step === 'SAIU_PARA_ENTREGA' && (
                <p className="text-xs text-pizza-muted mt-0.5 animate-pulse">Seu pedido está a caminho! 🛵</p>
              )}
              {isCurrent && step === 'PRONTO' && (
                <p className="text-xs text-pizza-muted mt-0.5 animate-pulse">Venha buscar seu pedido! 🍕</p>
              )}
              {isCurrent && step === 'EM_PREPARO' && (
                <p className="text-xs text-pizza-muted mt-0.5 animate-pulse">Preparando com carinho...</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
