import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, RefreshCw } from 'lucide-react'
import type { Order, OrderStatus } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS } from '@pizzaria/shared'
import { adminOrdersApi } from '../api/orders'
import { useSocket } from '../contexts/SocketContext'
import { useToast } from '../hooks/useToast'
import { playNewOrder, unlockAudio } from '../utils/sound'
import { OrderCard } from '../components/kds/OrderCard'
import { OrderDetail } from '../components/kds/OrderDetail'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { cn } from '../utils/cn'

const COLUMNS: { status: OrderStatus; label: string; color: string; bg: string }[] = [
  { status: 'RECEBIDO',          label: 'Recebido',          color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  { status: 'EM_PREPARO',        label: 'Em Preparo',        color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  { status: 'PRONTO',            label: 'Pronto/Retirada',   color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-200' },
  { status: 'SAIU_PARA_ENTREGA', label: 'Saiu p/ Entrega',  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { status: 'ENTREGUE',          label: 'Entregue',          color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200' },
]

export function KDSPage() {
  const [orders, setOrders]           = useState<Order[]>([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<Order | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const audioUnlocked = useRef(false)
  const { socket } = useSocket()
  const { toast }  = useToast()

  const fetchOrders = useCallback(async () => {
    try {
      const active = await Promise.all(
        ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA'].map((s) =>
          adminOrdersApi.list({ status: s, limit: 50 })
        )
      )
      setOrders(active.flatMap((r) => r.items))
    } catch {
      toast('Erro ao carregar pedidos', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { void fetchOrders() }, [fetchOrders])

  useEffect(() => {
    if (!socket) return

    socket.on('novo-pedido', (payload) => {
      setOrders((prev) => [payload.order, ...prev])
      if (soundEnabled) playNewOrder()
      toast(`Novo pedido! #${payload.order.id.slice(-6).toUpperCase()}`, 'info')
    })

    socket.on('status-atualizado', ({ orderId, status }) => {
      setOrders((prev) => prev.map((o) =>
        o.id === orderId ? { ...o, status: status as OrderStatus } : o
      ))
      setSelected((prev) => prev?.id === orderId ? { ...prev, status: status as OrderStatus } : prev)
    })

    return () => {
      socket.off('novo-pedido')
      socket.off('status-atualizado')
    }
  }, [socket, soundEnabled, toast])

  function enableSound() {
    if (!audioUnlocked.current) { unlockAudio(); audioUnlocked.current = true }
    setSoundEnabled(true)
  }

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    setSelected((prev) => prev?.id === id ? { ...prev, status } : prev)
  }

  function getColumn(status: OrderStatus) {
    return orders.filter((o) => o.status === status)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pizza-red animate-pulse shadow-brand" />
          <h1 className="text-xl font-display font-extrabold text-slate-800">Pedidos ao Vivo</h1>
        </div>
        <div className="flex items-center gap-2">
          {!soundEnabled ? (
            <Button variant="secondary" size="sm" leftIcon={<VolumeX size={14} />} onClick={enableSound}>
              Ativar Sons
            </Button>
          ) : (
            <Button variant="ghost" size="sm" leftIcon={<Volume2 size={14} />} onClick={() => setSoundEnabled(false)}>
              Som ativo
            </Button>
          )}
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} loading={loading} onClick={fetchOrders}>
            Atualizar
          </Button>
        </div>
      </header>

      {/* KDS Board */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full p-4 min-w-max">
            {COLUMNS.map(({ status, label, color, bg }) => {
              const col = getColumn(status)
              return (
                <div key={status} className={cn('kds-col w-72 rounded-2xl border p-3 flex flex-col', bg)}>
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <h2 className={cn('font-bold text-sm', color)}>{label}</h2>
                    <span className={cn('text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm', color)}>
                      {col.length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {col.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400">Nenhum pedido</div>
                    )}
                    {col.map((order) => (
                      <OrderCard key={order.id} order={order} onClick={() => setSelected(order)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Pedido #${selected.id.slice(-6).toUpperCase()}` : ''}
        size="lg"
      >
        {selected && (
          <OrderDetail
            order={selected}
            onStatusChange={handleStatusChange}
          />
        )}
      </Modal>
    </div>
  )
}
