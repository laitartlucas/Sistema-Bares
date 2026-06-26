import type { SalesReport } from '@pizzaria/shared'
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '@pizzaria/shared'

const WIDTH = 42
const SEP = '='.repeat(WIDTH)
const LINE = '-'.repeat(WIDTH)

function center(text: string): string {
  const pad = Math.max(0, WIDTH - text.length)
  return ' '.repeat(Math.floor(pad / 2)) + text
}

function money(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)
}

/** Linha "rótulo .......... valor" alinhada às bordas. */
function row(left: string, right: string): string {
  const spaces = Math.max(1, WIDTH - left.length - right.length)
  return left + ' '.repeat(spaces) + right
}

function formatDateBR(isoDay: string): string {
  const [y, m, d] = isoDay.split('-')
  return `${d}/${m}/${y}`
}

function nowBR(): string {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Renderiza o relatório de fechamento como texto para impressora térmica. */
export function buildReportTicket(report: SalesReport): string {
  const lines: string[] = []
  const periodo = report.from === report.to
    ? formatDateBR(report.from)
    : `${formatDateBR(report.from)} a ${formatDateBR(report.to)}`

  lines.push(SEP)
  lines.push(center('FECHAMENTO DE CAIXA'))
  lines.push(center(periodo))
  lines.push(SEP)

  lines.push(row('Pedidos', String(report.totalPedidos)))
  lines.push(row('Faturamento', money(report.faturamento)))
  lines.push(row('Ticket medio', money(report.ticketMedio)))
  lines.push(LINE)

  lines.push('POR FORMA DE PAGAMENTO')
  if (report.porPagamento.length === 0) {
    lines.push('  (sem vendas)')
  } else {
    for (const p of report.porPagamento) {
      lines.push(row(`  ${PAYMENT_METHOD_LABELS[p.forma]} (${p.count})`, money(p.total)))
    }
  }
  lines.push(LINE)

  lines.push('POR STATUS')
  for (const s of report.porStatus) {
    lines.push(row(`  ${ORDER_STATUS_LABELS[s.status]} (${s.count})`, money(s.total)))
  }
  lines.push(LINE)

  if (report.topProdutos.length > 0) {
    lines.push('MAIS VENDIDOS')
    for (const t of report.topProdutos.slice(0, 8)) {
      lines.push(row(`  ${t.count}x ${t.nome}`.slice(0, WIDTH - 12), money(t.total)))
    }
    lines.push(LINE)
  }

  if (report.cancelados.count > 0) {
    lines.push(row(`Cancelados (${report.cancelados.count})`, money(report.cancelados.total)))
    lines.push(LINE)
  }

  lines.push(center(`Emitido em ${nowBR()}`))
  lines.push(SEP)
  lines.push('\n\n\n')

  return lines.join('\n')
}
