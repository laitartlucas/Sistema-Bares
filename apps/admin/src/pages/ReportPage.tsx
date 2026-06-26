import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, ShoppingBag, DollarSign, Star, Printer, CreditCard, ListChecks, XCircle } from 'lucide-react'
import type { OrderStatus, PaymentMethod, ReportFilters, SalesReport, FlavorCategory } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@pizzaria/shared'
import { adminOrdersApi } from '../api/orders'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const STATUS_OPTS: OrderStatus[] = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']
const PAY_OPTS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'CARTAO']

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  )
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-pizza-red text-white border-pizza-red'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-pizza-red/50'
      }`}
    >
      {label}
    </button>
  )
}

function BreakdownBar({ label, count, value, max, color }: { label: string; count: number; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-0.5">
          <span className="font-medium text-slate-700 dark:text-slate-200">{label} <span className="text-slate-400">({count})</span></span>
          <span className="text-slate-500 dark:text-slate-400">{formatCurrency(value)}</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

function toggleInSet<T>(set: T[], value: T): T[] {
  return set.includes(value) ? set.filter((v) => v !== value) : [...set, value]
}

export function ReportPage() {
  const today = new Date().toISOString().split('T')[0]
  const [from, setFrom]           = useState(today)
  const [to, setTo]               = useState(today)
  const [statusSel, setStatusSel] = useState<OrderStatus[]>([])
  const [paySel, setPaySel]       = useState<PaymentMethod[]>([])
  const [categoria, setCategoria] = useState<FlavorCategory | ''>('')
  const [report, setReport]       = useState<SalesReport | null>(null)
  const [loading, setLoading]     = useState(false)
  const [printing, setPrinting]   = useState(false)
  const { toast } = useToast()

  const buildFilters = useCallback((): ReportFilters => ({
    from,
    to,
    status: statusSel.length ? statusSel.join(',') : undefined,
    formaPagamento: paySel.length ? paySel.join(',') : undefined,
    categoria: categoria || undefined,
  }), [from, to, statusSel, paySel, categoria])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setReport(await adminOrdersApi.salesReport(buildFilters()))
    } catch {
      toast('Erro ao carregar relatório', 'error')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [buildFilters, toast])

  useEffect(() => { void load() }, [load])

  const handlePrint = async () => {
    setPrinting(true)
    try {
      await adminOrdersApi.printReport(buildFilters())
      toast('Relatório enviado para impressão', 'success')
    } catch {
      toast('Erro ao enviar para impressão', 'error')
    } finally {
      setPrinting(false)
    }
  }

  const applyPreset = (preset: 'hoje' | '7dias' | 'mes') => {
    const now = new Date()
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    if (preset === 'hoje') {
      setFrom(fmt(now)); setTo(fmt(now))
    } else if (preset === '7dias') {
      const past = new Date(now); past.setDate(now.getDate() - 6)
      setFrom(fmt(past)); setTo(fmt(now))
    } else {
      setFrom(fmt(new Date(now.getFullYear(), now.getMonth(), 1))); setTo(fmt(now))
    }
  }

  const maxPay = report ? Math.max(0, ...report.porPagamento.map((p) => p.total)) : 0
  const maxStatus = report ? Math.max(0, ...report.porStatus.map((s) => s.total)) : 0

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Relatório de Vendas</h1>
        <Button variant="primary" loading={printing} onClick={handlePrint}>
          <Printer size={16} /> Imprimir fechamento
        </Button>
      </div>

      {/* ── Filtros ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div className="flex items-end gap-3 flex-wrap">
          <label className="text-sm">
            <span className="block text-xs font-medium text-slate-400 mb-1">De</span>
            <input type="date" max={to} value={from} onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pizza-red/30" />
          </label>
          <label className="text-sm">
            <span className="block text-xs font-medium text-slate-400 mb-1">Até</span>
            <input type="date" min={from} max={today} value={to} onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pizza-red/30" />
          </label>
          <div className="flex gap-2">
            <Chip active={false} label="Hoje" onClick={() => applyPreset('hoje')} />
            <Chip active={false} label="7 dias" onClick={() => applyPreset('7dias')} />
            <Chip active={false} label="Mês" onClick={() => applyPreset('mes')} />
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400 mb-1.5">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTS.map((s) => (
              <Chip key={s} active={statusSel.includes(s)} label={ORDER_STATUS_LABELS[s]} onClick={() => setStatusSel(toggleInSet(statusSel, s))} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-1.5">Forma de pagamento</span>
            <div className="flex flex-wrap gap-2">
              {PAY_OPTS.map((p) => (
                <Chip key={p} active={paySel.includes(p)} label={PAYMENT_METHOD_LABELS[p]} onClick={() => setPaySel(toggleInSet(paySel, p))} />
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-1.5">Categoria (sabores)</span>
            <div className="flex gap-2">
              <Chip active={categoria === ''} label="Todas" onClick={() => setCategoria('')} />
              <Chip active={categoria === 'SALGADA'} label="Salgadas" onClick={() => setCategoria('SALGADA')} />
              <Chip active={categoria === 'DOCE'} label="Doces" onClick={() => setCategoria('DOCE')} />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !report || report.totalPedidos === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-semibold">Sem dados para os filtros selecionados</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={ShoppingBag} label="Pedidos"      value={String(report.totalPedidos)} color="bg-blue-500" />
            <StatCard icon={DollarSign}  label="Faturamento"  value={formatCurrency(report.faturamento)} color="bg-emerald-500" />
            <StatCard icon={TrendingUp}  label="Ticket Médio" value={formatCurrency(report.ticketMedio)} color="bg-purple-500" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-emerald-500" />
                <h2 className="font-bold text-slate-700 dark:text-slate-200">Por forma de pagamento</h2>
              </div>
              <div className="space-y-2.5">
                {report.porPagamento.map((p) => (
                  <BreakdownBar key={p.forma} label={PAYMENT_METHOD_LABELS[p.forma]} count={p.count} value={p.total} max={maxPay} color="bg-emerald-500" />
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={16} className="text-blue-500" />
                <h2 className="font-bold text-slate-700 dark:text-slate-200">Por status</h2>
              </div>
              <div className="space-y-2.5">
                {report.porStatus.map((s) => (
                  <BreakdownBar key={s.status} label={ORDER_STATUS_LABELS[s.status]} count={s.count} value={s.total} max={maxStatus} color="bg-blue-500" />
                ))}
              </div>
            </section>
          </div>

          {report.topProdutos.length > 0 && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-amber-500" />
                <h2 className="font-bold text-slate-700 dark:text-slate-200">Mais vendidos</h2>
              </div>
              <div className="space-y-2">
                {report.topProdutos.map((t, i) => {
                  const pct = report.topProdutos[0].count > 0 ? (t.count / report.topProdutos[0].count) * 100 : 0
                  return (
                    <div key={t.nome} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{t.nome}</span>
                          <span className="text-slate-400">{t.count}× · {formatCurrency(t.total)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-pizza-red rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {report.cancelados.count > 0 && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-sm">
              <XCircle size={18} className="text-red-500 shrink-0" />
              <span className="text-red-700 dark:text-red-300">
                <strong>{report.cancelados.count}</strong> pedido(s) cancelado(s) no período — {formatCurrency(report.cancelados.total)} (não contabilizados no faturamento)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
