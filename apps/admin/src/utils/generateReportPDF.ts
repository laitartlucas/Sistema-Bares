import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SalesReport, ReportFilters } from '@pizzaria/shared'
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '@pizzaria/shared'

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const RED: [number, number, number] = [180, 30, 30]
const GREEN: [number, number, number] = [16, 185, 129]
const BLUE: [number, number, number] = [59, 130, 246]
const AMBER: [number, number, number] = [245, 158, 11]
const PURPLE: [number, number, number] = [139, 92, 246]

export function generateReportPDF(
  report: SalesReport,
  filters: ReportFilters,
  storeName = 'Pizzaria',
): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 15
  let y = 18

  // ── Cabeçalho ──────────────────────────────────────────────────────────────
  doc.setFillColor(...RED)
  doc.rect(0, 0, W, 14, 'F')

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(storeName, M, 9)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório de Vendas', W - M, 9, { align: 'right' })

  y = 22

  // Período
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  const period =
    filters.from && filters.to
      ? `${fmtDate(filters.from)} — ${fmtDate(filters.to)}`
      : 'Todo o período'
  doc.text(`Período: ${period}`, M, y)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  const now = new Date()
  doc.text(
    `Gerado em ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    W - M,
    y,
    { align: 'right' },
  )

  y += 5
  doc.setDrawColor(220, 220, 220)
  doc.line(M, y, W - M, y)
  y += 8

  // ── Resumo (3 cards) ────────────────────────────────────────────────────────
  sectionTitle(doc, 'RESUMO', M, y)
  y += 6

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Total de Pedidos', 'Faturamento', 'Ticket Médio']],
    body: [[
      String(report.totalPedidos),
      fmt(report.faturamento),
      fmt(report.ticketMedio),
    ]],
    headStyles: { fillColor: RED, textColor: 255, fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 13, fontStyle: 'bold', halign: 'center', cellPadding: 5 },
    theme: 'grid',
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // ── Por pagamento ──────────────────────────────────────────────────────────
  if (report.porPagamento.length) {
    sectionTitle(doc, 'FORMA DE PAGAMENTO', M, y)
    y += 6

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Forma de Pagamento', 'Pedidos', 'Total']],
      body: report.porPagamento.map((p) => [
        PAYMENT_METHOD_LABELS[p.forma],
        String(p.count),
        fmt(p.total),
      ]),
      headStyles: { fillColor: GREEN, textColor: 255, fontSize: 8 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      theme: 'striped',
    })

    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Por status ─────────────────────────────────────────────────────────────
  if (report.porStatus.length) {
    sectionTitle(doc, 'POR STATUS', M, y)
    y += 6

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Status', 'Pedidos', 'Total']],
      body: report.porStatus.map((s) => [
        ORDER_STATUS_LABELS[s.status],
        String(s.count),
        fmt(s.total),
      ]),
      headStyles: { fillColor: BLUE, textColor: 255, fontSize: 8 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      theme: 'striped',
    })

    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Top sabores ────────────────────────────────────────────────────────────
  if (report.topSabores?.length) {
    sectionTitle(doc, 'SABORES MAIS PEDIDOS', M, y)
    y += 6

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['#', 'Sabor', 'Qtd', 'Total']],
      body: report.topSabores.map((t, i) => [
        String(i + 1),
        t.nome,
        String(t.count),
        fmt(t.total),
      ]),
      headStyles: { fillColor: PURPLE, textColor: 255, fontSize: 8 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center' },
        3: { halign: 'right' },
      },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      theme: 'striped',
    })

    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Top produtos ────────────────────────────────────────────────────────────
  if (report.topProdutos?.length) {
    sectionTitle(doc, 'MAIS VENDIDOS (GERAL)', M, y)
    y += 6

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['#', 'Produto', 'Qtd', 'Total']],
      body: report.topProdutos.map((t, i) => [
        String(i + 1),
        t.nome,
        String(t.count),
        fmt(t.total),
      ]),
      headStyles: { fillColor: AMBER, textColor: 255, fontSize: 8 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center' },
        3: { halign: 'right' },
      },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      theme: 'striped',
    })

    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Cancelamentos ───────────────────────────────────────────────────────────
  if (report.cancelados.count > 0) {
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(252, 165, 165)
    doc.roundedRect(M, y, W - M * 2, 10, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(185, 28, 28)
    doc.text(
      `⚠  ${report.cancelados.count} pedido(s) cancelado(s) — ${fmt(report.cancelados.total)} (nao contabilizados no faturamento)`,
      M + 3,
      y + 6.5,
    )
    y += 16
  }

  // ── Rodapé ──────────────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220)
  doc.line(M, H - 14, W - M, H - 14)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(160, 160, 160)
  doc.text(`${storeName} · Sistema de Gestão`, M, H - 9)
  doc.text(`Pág. 1`, W - M, H - 9, { align: 'right' })

  return doc.output('bloburl') as unknown as string
}

function sectionTitle(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text(text, x, y)
}
