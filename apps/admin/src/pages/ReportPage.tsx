import { useState, useEffect, useCallback, useRef } from 'react'
import {
  TrendingUp, ShoppingBag, DollarSign, FileText,
  CreditCard, ListChecks, Star, XCircle, X, RefreshCw,
  BarChart2, ChevronDown, ChevronUp, Filter,
} from 'lucide-react'
import type {
  OrderStatus, PaymentMethod, ReportFilters, SalesReport,
  FlavorCategory, ReportDailyEntry,
} from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@pizzaria/shared'
import { adminOrdersApi } from '../api/orders'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/format'
import { generateReportPDF } from '../utils/generateReportPDF'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

type Preset = 'hoje' | '7dias' | 'mes' | 'custom'

const STATUS_OPTS: OrderStatus[] = ['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']
const PAY_OPTS: PaymentMethod[] = ['DINHEIRO', 'PIX', 'CARTAO']

function today() { return new Date().toISOString().split('T')[0] }

function presetDates(p: Preset): { from: string; to: string } {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  if (p === 'hoje') return { from: fmt(now), to: fmt(now) }
  if (p === '7dias') {
    const past = new Date(now); past.setDate(now.getDate() - 6)
    return { from: fmt(past), to: fmt(now) }
  }
  if (p === 'mes') {
    return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) }
  }
  return { from: fmt(now), to: fmt(now) }
}

function toggleInSet<T>(set: T[], value: T): T[] {
  return set.includes(value) ? set.filter((v) => v !== value) : [...set, value]
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color }: {
  icon: typeof TrendingUp; label: string; value: string; color: string
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={21} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight mt-0.5 truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Filter chip ───────────────────────────────────────────────────────────────
function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? 'bg-pizza-red text-white border-pizza-red'
          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-pizza-red/60'
      }`}
    >
      {label}
    </button>
  )
}

// ── Breakdown bar ─────────────────────────────────────────────────────────────
function BreakdownBar({ label, count, value, max, color }: {
  label: string; count: number; value: number; max: number; color: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
          {label} <span className="text-slate-400 font-normal">({count})</span>
        </span>
        <span className="text-slate-500 dark:text-slate-400 shrink-0 ml-2">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Daily sales bar chart (SVG) ───────────────────────────────────────────────
function DailyChart({ data }: { data: ReportDailyEntry[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const touchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  if (!data.length) return null

  const W = 900, H = 220
  const PAD = { top: 24, bottom: 40, left: 80, right: 20 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxFat = Math.max(...data.map((d) => d.faturamento), 1)
  const barStep = chartW / data.length
  const barW = Math.max(Math.min(barStep * 0.62, 54), 2)

  const ticks = [0, 0.25, 0.5, 0.75, 1]

  const getBarX = (i: number) => PAD.left + i * barStep + (barStep - barW) / 2
  const getBarY = (fat: number) => PAD.top + chartH - (fat / maxFat) * chartH
  const getBarH = (fat: number) => Math.max((fat / maxFat) * chartH, fat > 0 ? 2 : 0)

  const showTooltip = (clientX: number, clientY: number, i: number) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    setTooltipPos({ x: clientX - rect.left, y: clientY - rect.top })
    setHovered(i)
  }

  const handleMouseEnter = (e: React.MouseEvent<SVGRectElement>, i: number) => {
    showTooltip(e.clientX, e.clientY, i)
  }

  const handleTouchStart = (e: React.TouchEvent<SVGRectElement>, i: number) => {
    if (touchTimeout.current) clearTimeout(touchTimeout.current)
    const touch = e.touches[0]
    showTooltip(touch.clientX, touch.clientY, i)
  }

  const handleTouchEnd = () => {
    touchTimeout.current = setTimeout(() => setHovered(null), 2000)
  }

  const showAllLabels = data.length <= 14
  const labelStep = Math.ceil(data.length / 10)

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 220 }}
        onMouseLeave={() => setHovered(null)}
        onTouchEnd={handleTouchEnd}
      >
        {/* Horizontal grid + Y labels */}
        {ticks.map((t, i) => {
          const val = maxFat * t
          const y = PAD.top + chartH - t * chartH
          return (
            <g key={i}>
              <line
                x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                stroke="#e2e8f0" strokeWidth={1}
                strokeDasharray={t === 0 ? '' : '4 3'}
              />
              <text
                x={PAD.left - 8} y={y + 4}
                textAnchor="end" fontSize={10} fill="#94a3b8"
                fontFamily="system-ui, sans-serif"
              >
                {val === 0 ? 'R$ 0' : val >= 1000
                  ? `R$${(val / 1000).toFixed(1)}k`
                  : `R$${val.toFixed(0)}`}
              </text>
            </g>
          )
        })}

        {/* Bars + X labels */}
        {data.map((d, i) => {
          const x = getBarX(i)
          const y = getBarY(d.faturamento)
          const h = getBarH(d.faturamento)
          const [, m, day] = d.date.split('-')
          const isHovered = hovered === i

          return (
            <g key={d.date}>
              <rect
                x={x} y={y} width={barW} height={h}
                rx={3} ry={3}
                fill={isHovered ? '#b91c1c' : '#ef4444'}
                style={{ transition: 'fill 0.12s' }}
                onMouseEnter={(e) => handleMouseEnter(e, i)}
                onTouchStart={(e) => handleTouchStart(e, i)}
                className="cursor-pointer"
              />
              {(showAllLabels || i % labelStep === 0) && (
                <text
                  x={x + barW / 2}
                  y={H - PAD.bottom + 16}
                  textAnchor="middle"
                  fontSize={data.length > 20 ? 8 : 10}
                  fill="#94a3b8"
                  fontFamily="system-ui, sans-serif"
                >
                  {`${day}/${m}`}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip — desktop hover / mobile touch */}
      {hovered !== null && (
        <div
          className="absolute pointer-events-none bg-slate-800 text-white rounded-xl px-3 py-2 text-xs shadow-2xl z-20 whitespace-nowrap"
          style={{
            left: tooltipPos.x,
            top: Math.max(tooltipPos.y - 12, 4),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-semibold text-slate-300 mb-0.5">{data[hovered].date}</p>
          <p className="text-emerald-400 font-bold text-sm">{formatCurrency(data[hovered].faturamento)}</p>
          <p className="text-blue-300">{data[hovered].pedidos} pedido{data[hovered].pedidos !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Mobile hint — visível apenas em touch devices sem hover */}
      <p className="text-center text-xs text-slate-400 mt-2 sm:hidden">
        Toque em uma barra para ver detalhes
      </p>
    </div>
  )
}

// ── PDF preview modal ──────────────────────────────────────────────────────────
function PDFPreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-pizza-red" />
          <span className="text-white font-semibold text-sm">Pré-visualização do Relatório</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            download="relatorio-vendas.pdf"
            className="px-4 py-1.5 rounded-lg bg-pizza-red text-white text-sm font-semibold hover:bg-pizza-red/90 transition-colors"
          >
            Baixar PDF
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <iframe src={url} className="flex-1 w-full border-0" title="Relatório de Vendas" />
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function ReportPage() {
  const t = today()

  const [preset, setPreset]         = useState<Preset>('hoje')
  const [from, setFrom]             = useState(t)
  const [to, setTo]                 = useState(t)
  const [statusSel, setStatusSel]   = useState<OrderStatus[]>([])
  const [paySel, setPaySel]         = useState<PaymentMethod[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [report, setReport]         = useState<SalesReport | null>(null)
  const [loading, setLoading]       = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pdfUrl, setPdfUrl]         = useState<string | null>(null)

  const { toast } = useToast()

  const buildFilters = useCallback((): ReportFilters => ({
    from,
    to,
    status: statusSel.length ? statusSel.join(',') : undefined,
    formaPagamento: paySel.length ? paySel.join(',') : undefined,
  }), [from, to, statusSel, paySel])

  const loadMetrics = useCallback(async () => {
    setLoading(true)
    try {
      setReport(await adminOrdersApi.salesReport(buildFilters()))
    } catch {
      toast('Erro ao carregar métricas', 'error')
    } finally {
      setLoading(false)
    }
  }, [buildFilters, toast])

  useEffect(() => { void loadMetrics() }, [loadMetrics])

  const handlePreset = (p: Preset) => {
    if (p === 'custom') return
    setPreset(p)
    const d = presetDates(p)
    setFrom(d.from)
    setTo(d.to)
  }

  const handleFromChange = (v: string) => { setFrom(v); setPreset('custom') }
  const handleToChange   = (v: string) => { setTo(v);   setPreset('custom') }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const data = await adminOrdersApi.salesReport(buildFilters())
      setPdfUrl(generateReportPDF(data, buildFilters()))
    } catch {
      toast('Erro ao gerar relatório', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const activeFilterCount = statusSel.length + paySel.length
  const maxPay    = report ? Math.max(0, ...report.porPagamento.map((p) => p.total)) : 0
  const maxStatus = report ? Math.max(0, ...report.porStatus.map((s) => s.total)) : 0
  const maxSabor  = report ? Math.max(0, ...(report.topSabores ?? []).map((s) => s.count)) : 0
  const maxProd   = report?.topProdutos?.[0]?.count ?? 1

  const PRESETS = [
    { key: 'hoje'  as Preset, label: 'Hoje' },
    { key: '7dias' as Preset, label: '7 dias' },
    { key: 'mes'   as Preset, label: 'Este mês' },
  ]

  return (
    <>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-5xl mx-auto">

        {/* ── Cabeçalho ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Relatórios</h1>
            <p className="text-sm text-slate-400 mt-0.5">Métricas de vendas com filtros personalizados</p>
          </div>
          <Button variant="primary" loading={generating} onClick={handleGeneratePDF}>
            <FileText size={15} /> Exportar PDF
          </Button>
        </div>

        {/* ── Painel de filtros ─────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

          {/* Período + datas */}
          <div className="px-4 sm:px-5 py-4 flex flex-wrap items-center gap-3">
            {/* Presets */}
            <div className="flex gap-1.5">
              {PRESETS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => handlePreset(b.key)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    preset === b.key
                      ? 'bg-pizza-red text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Custom date range — empilha em mobile, lado a lado em sm+ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <label className="flex items-center gap-2">
                <span className="text-slate-400 text-xs w-6 shrink-0">De</span>
                <input
                  type="date" value={from} max={to}
                  onChange={(e) => handleFromChange(e.target.value)}
                  className="flex-1 sm:flex-none rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pizza-red/30"
                />
              </label>
              <span className="hidden sm:block text-slate-300">—</span>
              <label className="flex items-center gap-2">
                <span className="text-slate-400 text-xs w-6 shrink-0">Até</span>
                <input
                  type="date" value={to} min={from} max={t}
                  onChange={(e) => handleToChange(e.target.value)}
                  className="flex-1 sm:flex-none rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2.5 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pizza-red/30"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFilterCount > 0 || showAdvanced
                    ? 'bg-pizza-red/10 text-pizza-red'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Filter size={13} />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-pizza-red text-white text-[10px] flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
                {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button
                onClick={loadMetrics}
                title="Atualizar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-pizza-red hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Filtros avançados */}
          {showAdvanced && (
            <div className="px-4 sm:px-5 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-700">
              <div className="pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTS.map((s) => (
                    <Chip key={s} active={statusSel.includes(s)} label={ORDER_STATUS_LABELS[s]}
                      onClick={() => setStatusSel(toggleInSet(statusSel, s))} />
                  ))}
                  {statusSel.length > 0 && (
                    <button onClick={() => setStatusSel([])}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pagamento</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAY_OPTS.map((p) => (
                    <Chip key={p} active={paySel.includes(p)} label={PAYMENT_METHOD_LABELS[p]}
                      onClick={() => setPaySel(toggleInSet(paySel, p))} />
                  ))}
                  {paySel.length > 0 && (
                    <button onClick={() => setPaySel([])}
                      className="px-2 py-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Conteúdo ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : !report || report.totalPedidos === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Sem dados para o período selecionado</p>
            <p className="text-sm mt-1">Ajuste os filtros ou selecione outro período</p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard icon={ShoppingBag} label="Total de Pedidos"
                value={String(report.totalPedidos)} color="bg-blue-500" />
              <KpiCard icon={DollarSign} label="Faturamento"
                value={formatCurrency(report.faturamento)} color="bg-emerald-500" />
              <KpiCard icon={TrendingUp} label="Ticket Médio"
                value={formatCurrency(report.ticketMedio)} color="bg-purple-500" />
            </div>

            {/* Gráfico de evolução diária */}
            {report.dailyBreakdown?.length > 1 && (
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 size={16} className="text-pizza-red" />
                  <h2 className="font-bold text-slate-700 dark:text-slate-200">Evolução Diária</h2>
                  <span className="ml-auto text-xs text-slate-400 font-mono">
                    {report.from} → {report.to}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Faturamento por dia no período selecionado</p>
                <DailyChart data={report.dailyBreakdown} />
              </section>
            )}

            {/* Pagamento + Status */}
            <div className="grid lg:grid-cols-2 gap-4">
              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard size={16} className="text-emerald-500" />
                  <h2 className="font-bold text-slate-700 dark:text-slate-200">Forma de Pagamento</h2>
                </div>
                <div className="space-y-4">
                  {report.porPagamento.map((p) => (
                    <BreakdownBar key={p.forma} label={PAYMENT_METHOD_LABELS[p.forma]}
                      count={p.count} value={p.total} max={maxPay} color="bg-emerald-500" />
                  ))}
                </div>
              </section>

              <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <ListChecks size={16} className="text-blue-500" />
                  <h2 className="font-bold text-slate-700 dark:text-slate-200">Por Status</h2>
                </div>
                <div className="space-y-4">
                  {report.porStatus.map((s) => (
                    <BreakdownBar key={s.status} label={ORDER_STATUS_LABELS[s.status]}
                      count={s.count} value={s.total} max={maxStatus} color="bg-blue-500" />
                  ))}
                </div>
              </section>
            </div>

            {/* Top sabores + produtos */}
            {(report.topSabores?.length > 0 || report.topProdutos?.length > 0) && (
              <div className="grid lg:grid-cols-2 gap-4">
                {report.topSabores?.length > 0 && (
                  <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Star size={16} className="text-purple-500" />
                      <h2 className="font-bold text-slate-700 dark:text-slate-200">Top Sabores</h2>
                    </div>
                    <div className="space-y-3">
                      {report.topSabores.map((s, i) => {
                        const pct = maxSabor > 0 ? (s.count / maxSabor) * 100 : 0
                        return (
                          <div key={s.nome} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-sm mb-0.5">
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{s.nome}</span>
                                <span className="text-slate-400 shrink-0 ml-2">{s.count}×</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {report.topProdutos?.length > 0 && (
                  <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <Star size={16} className="text-amber-500" />
                      <h2 className="font-bold text-slate-700 dark:text-slate-200">Mais Vendidos</h2>
                    </div>
                    <div className="space-y-3">
                      {report.topProdutos.map((p, i) => {
                        const pct = maxProd > 0 ? (p.count / maxProd) * 100 : 0
                        return (
                          <div key={p.nome} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-sm mb-0.5">
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{p.nome}</span>
                                <span className="text-slate-400 shrink-0 ml-2">{p.count}× · {formatCurrency(p.total)}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Cancelamentos */}
            {report.cancelados.count > 0 && (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-sm">
                <XCircle size={18} className="text-red-500 shrink-0" />
                <span className="text-red-700 dark:text-red-300">
                  <strong>{report.cancelados.count}</strong> pedido(s) cancelado(s) —{' '}
                  {formatCurrency(report.cancelados.total)} não contabilizados no faturamento
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF preview */}
      {pdfUrl && <PDFPreviewModal url={pdfUrl} onClose={() => setPdfUrl(null)} />}
    </>
  )
}
