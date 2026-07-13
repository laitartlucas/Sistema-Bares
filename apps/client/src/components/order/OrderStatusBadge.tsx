import type { OrderStatus } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS } from '@pizzaria/shared'
import { cn } from '../../utils/cn'

const STATUS_STYLES: Record<OrderStatus, string> = {
  RECEBIDO:          'bg-pizza-honey text-pizza-label border-[#F0D9A0]',
  EM_PREPARO:        'bg-pizza-honey text-pizza-label border-[#F0D9A0]',
  PRONTO:            'bg-pizza-honey text-pizza-label border-[#F0D9A0]',
  SAIU_PARA_ENTREGA: 'bg-pizza-honey text-pizza-label border-[#F0D9A0]',
  ENTREGUE:          'bg-[#EAF7EE] text-[#1E7A3C] border-[#C4E8CF]',
  CANCELADO:         'bg-[#FDEBE9] text-[#C92B1E] border-[#F5C6C1]',
}

const STATUS_DOTS: Record<OrderStatus, string> = {
  RECEBIDO:          'bg-pizza-label',
  EM_PREPARO:        'bg-pizza-label',
  PRONTO:            'bg-pizza-label',
  SAIU_PARA_ENTREGA: 'bg-pizza-label',
  ENTREGUE:          'bg-[#1E7A3C]',
  CANCELADO:         'bg-[#C92B1E]',
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
