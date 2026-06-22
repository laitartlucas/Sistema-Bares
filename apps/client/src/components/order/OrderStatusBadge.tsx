import type { OrderStatus } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS } from '@pizzaria/shared'
import { cn } from '../../utils/cn'

const STATUS_STYLES: Record<OrderStatus, string> = {
  RECEBIDO:          'bg-blue-50   text-blue-700   border-blue-200',
  EM_PREPARO:        'bg-amber-50  text-amber-700  border-amber-200',
  PRONTO:            'bg-purple-50 text-purple-700 border-purple-200',
  SAIU_PARA_ENTREGA: 'bg-green-50  text-green-700  border-green-200',
  ENTREGUE:          'bg-gray-50   text-gray-600   border-gray-200',
  CANCELADO:         'bg-red-50    text-red-600    border-red-200',
}

const STATUS_DOTS: Record<OrderStatus, string> = {
  RECEBIDO:          'bg-blue-500',
  EM_PREPARO:        'bg-amber-500',
  PRONTO:            'bg-purple-500',
  SAIU_PARA_ENTREGA: 'bg-green-500',
  ENTREGUE:          'bg-gray-400',
  CANCELADO:         'bg-red-500',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  animated?: boolean
}

export function OrderStatusBadge({ status, animated }: OrderStatusBadgeProps) {
  const isPulsing = animated && (status === 'RECEBIDO' || status === 'EM_PREPARO' || status === 'PRONTO' || status === 'SAIU_PARA_ENTREGA')

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', STATUS_STYLES[status])}>
      <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOTS[status], isPulsing && 'animate-pulse')} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
