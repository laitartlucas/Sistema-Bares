import type { Order } from '@pizzaria/shared'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@pizzaria/shared'

const SEP  = '='.repeat(42)
const LINE = '-'.repeat(42)

function center(text: string, width = 42): string {
  const pad = Math.max(0, width - text.length)
  return ' '.repeat(Math.floor(pad / 2)) + text + ' '.repeat(Math.ceil(pad / 2))
}

function money(v: number | undefined | null): string {
  if (v == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function buildCozinhaTicket(order: Order): string {
  const lines: string[] = []

  lines.push(SEP)
  lines.push(center('*** COZINHA ***'))
  lines.push(center(`PEDIDO #${order.numero}`))
  lines.push(center(formatDate(order.createdAt)))
  lines.push(SEP)

  lines.push(`CLIENTE: ${order.user?.nome ?? '—'}`)
  lines.push(`TEL:     ${order.user?.telefone ?? '—'}`)
  lines.push(`TIPO:    ${order.tipo === 'ENTREGA' ? 'Entrega' : 'Retirada no local'}`)
  lines.push(LINE)

  for (const item of order.itens) {
    if (item.bebida) {
      lines.push(`${item.quantidade}x ${item.bebida.nome}`)
    } else {
      lines.push(`${item.quantidade}x PIZZA ${item.tamanho?.nome ?? ''}`)
      const sabores = item.sabores.map((s) => s.flavor?.nome ?? '').filter(Boolean)
      lines.push(`   Sabores: ${sabores.join(' / ')}`)
      if (item.borda) lines.push(`   Borda: ${item.borda.nome}`)
    }
    if (item.observacoes) lines.push(`   OBS: ${item.observacoes}`)
    lines.push('')
  }

  lines.push(SEP)
  return lines.join('\n')
}

export function buildCaixaTicket(order: Order): string {
  const lines: string[] = []

  lines.push(SEP)
  lines.push(center('PIZZARIA'))
  lines.push(center(`PEDIDO #${order.numero}`))
  lines.push(center(formatDate(order.createdAt)))
  lines.push(SEP)

  lines.push(`CLIENTE: ${order.user?.nome ?? '—'}`)
  lines.push(`TEL:     ${order.user?.telefone ?? '—'}`)
  lines.push(LINE)

  for (const item of order.itens) {
    const name = item.bebida
      ? `${item.bebida.nome}`
      : `Pizza ${item.tamanho?.nome ?? ''} (${item.sabores.map((s) => s.flavor?.nome).join('/')})`
    const price = money(item.precoUnitario * item.quantidade)
    const left  = `${item.quantidade}x ${name}`
    const right  = price
    const spaces = Math.max(1, 42 - left.length - right.length)
    lines.push(left + ' '.repeat(spaces) + right)
  }

  lines.push(LINE)
  const totalLine = 'TOTAL'
  const totalVal  = money(order.total)
  lines.push(totalLine + ' '.repeat(42 - totalLine.length - totalVal.length) + totalVal)

  lines.push(LINE)
  lines.push(`PAGAMENTO: ${PAYMENT_METHOD_LABELS[order.formaPagamento]}`)
  if (order.trocoPara != null) lines.push(`TROCO PARA: ${money(order.trocoPara)}`)

  if (order.tipo === 'ENTREGA' && order.enderecoEntrega) {
    lines.push(LINE)
    const a = order.enderecoEntrega as unknown as Record<string, string>
    lines.push('ENDEREÇO DE ENTREGA:')
    lines.push(`${a.rua}, ${a.numero}`)
    if (a.complemento) lines.push(a.complemento)
    lines.push(a.bairro)
    if (a.referencia) lines.push(`Ref: ${a.referencia}`)
  }

  lines.push(SEP)
  lines.push(center('Obrigado pela preferência!'))
  lines.push(SEP)
  lines.push('\n\n\n')  // cut margin

  return lines.join('\n')
}
