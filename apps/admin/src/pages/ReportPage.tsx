import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, ShoppingBag, DollarSign, Star } from 'lucide-react'
import { adminOrdersApi } from '../api/orders'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/format'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

interface DailyReport {
  date: string
  totalPedidos: number
  faturamento: number
  topSabores: { nome: string; count: number }[]
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export function ReportPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate]         = useState(today)
  const [report, setReport]     = useState<DailyReport | null>(null)
  const [loading, setLoading]   = useState(false)
  const { toast } = useToast()

  const fetch = useCallback(async (d: string) => {
    setLoading(true)
    try {
      const r = await adminOrdersApi.dailyReport(d)
      setReport(r)
    } catch {
      toast('Erro ao carregar relatório', 'error')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { void fetch(date) }, [date, fetch])

  const ticketMedio = report && report.totalPedidos > 0
    ? report.faturamento / report.totalPedidos
    : 0

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black text-slate-800">Relatório Diário</h1>
        <div className="flex items-center gap-3">
          <input
            type="date" max={today} value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red"
          />
          <Button variant="secondary" loading={loading} onClick={() => fetch(date)}>Atualizar</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !report ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-semibold">Sem dados para esta data</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={ShoppingBag}  label="Pedidos"        value={String(report.totalPedidos)} color="bg-blue-500" />
            <StatCard icon={DollarSign}   label="Faturamento"    value={formatCurrency(report.faturamento)} color="bg-emerald-500" />
            <StatCard icon={TrendingUp}   label="Ticket Médio"   value={formatCurrency(ticketMedio)} color="bg-purple-500" />
          </div>

          {report.topSabores.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-amber-500" />
                <h2 className="font-bold text-slate-700">Sabores mais pedidos</h2>
              </div>
              <div className="space-y-2">
                {report.topSabores.map((s, i) => {
                  const pct = report.topSabores[0].count > 0 ? (s.count / report.topSabores[0].count) * 100 : 0
                  return (
                    <div key={s.nome} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="font-medium text-slate-700">{s.nome}</span>
                          <span className="text-slate-400">{s.count}×</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-pizza-red rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
