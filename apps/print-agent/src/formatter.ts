import type { Order } from '@pizzaria/shared'
import { PAYMENT_METHOD_LABELS } from '@pizzaria/shared'
import { config } from './config'

// ── Padrão de impressão (largura 42 col — térmica 80mm) ───────────────────────

const WIDTH = 42
const SEP = '='.repeat(WIDTH)
const LINE = '-'.repeat(WIDTH)

function center(text: string): string {
  if (text.length >= WIDTH) return text
  const pad = WIDTH - text.length
  return ' '.repeat(Math.floor(pad / 2)) + text
}

/** "esquerda ........... direita" alinhado às bordas. */
function row(left: string, right: string): string {
  const spaces = Math.max(1, WIDTH - left.length - right.length)
  return left + ' '.repeat(spaces) + right
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

/** Cabeçalho comum a todas as vias. */
function header(order: Order, titulo: string): string[] {
  return [
    SEP,
    center(titulo),
    center(`PEDIDO #${order.numero}`),
    center(formatDate(order.createdAt)),
    SEP,
  ]
}

/** Dados do cliente / tipo de entrega. */
function customerBlock(order: Order): string[] {
  const lines = [
    `Cliente: ${order.user?.nome ?? '—'}`,
    `Telefone: ${order.user?.telefone ?? '—'}`,
    `Tipo: ${order.tipo === 'ENTREGA' ? 'Entrega' : 'Retirada no local'}`,
  ]
  return lines
}

/** Bloco de endereço (apenas entregas). */
function addressBlock(order: Order): string[] {
  if (order.tipo !== 'ENTREGA' || !order.enderecoEntrega) return []
  const a = order.enderecoEntrega as unknown as Record<string, string>
  const lines = [LINE, 'ENDERECO DE ENTREGA:', `${a.rua}, ${a.numero}`]
  if (a.complemento) lines.push(a.complemento)
  if (a.bairro) lines.push(a.bairro)
  if (a.referencia) lines.push(`Ref: ${a.referencia}`)
  return lines
}

function rodape(): string {
  return '\n\n\n' // margem para o corte
}

// ── Via da cozinha (sem preços) ───────────────────────────────────────────────

export function buildCozinhaTicket(order: Order): string {
  const lines: string[] = []

  lines.push(...header(order, '*** COZINHA ***'))
  lines.push(...customerBlock(order))
  lines.push(LINE)

  for (const item of order.itens) {
    if (item.bebida) {
      lines.push(`${item.quantidade}x ${item.bebida.nome}`)
    } else {
      lines.push(`${item.quantidade}x PIZZA ${item.tamanho?.nome ?? ''}`.trimEnd())
      const sabores = item.sabores.map((s) => s.flavor?.nome ?? '').filter(Boolean)
      if (sabores.length) lines.push(`   Sabores: ${sabores.join(' / ')}`)
      if (item.borda) lines.push(`   Borda: ${item.borda.nome}`)
    }
    if (item.observacoes) lines.push(`   >> OBS: ${item.observacoes}`)
    lines.push('')
  }

  lines.push(SEP)
  lines.push(rodape())
  return lines.join('\n')
}

// ── Via do caixa / cliente (com preços) ───────────────────────────────────────

export function buildCaixaTicket(order: Order): string {
  const lines: string[] = []

  lines.push(...header(order, config.storeName.toUpperCase()))
  lines.push(...customerBlock(order))
  lines.push(LINE)

  for (const item of order.itens) {
    const name = item.bebida
      ? item.bebida.nome
      : `Pizza ${item.tamanho?.nome ?? ''} (${item.sabores.map((s) => s.flavor?.nome).filter(Boolean).join('/')})`
    const linha = `${item.quantidade}x ${name}`
    const preco = money(item.precoUnitario * item.quantidade)
    // Nome pode passar da largura: quebra o valor para a linha de baixo
    if (linha.length + preco.length + 1 > WIDTH) {
      lines.push(linha)
      lines.push(row('', preco))
    } else {
      lines.push(row(linha, preco))
    }
    if (item.borda && !item.bebida) lines.push(`   Borda: ${item.borda.nome}`)
    if (item.observacoes) lines.push(`   OBS: ${item.observacoes}`)
  }

  lines.push(LINE)
  lines.push(row('TOTAL', money(order.total)))
  lines.push(LINE)
  lines.push(row('Pagamento', PAYMENT_METHOD_LABELS[order.formaPagamento]))
  if (order.trocoPara != null) {
    lines.push(row('Troco para', money(order.trocoPara)))
    lines.push(row('  Levar troco de', money(order.trocoPara - order.total)))
  }

  lines.push(...addressBlock(order))

  lines.push(SEP)
  lines.push(center('Obrigado pela preferencia!'))
  lines.push(SEP)
  lines.push(rodape())

  return lines.join('\n')
}
