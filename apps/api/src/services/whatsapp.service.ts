import { sendWhatsAppMessage } from '../lib/whatsapp'

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CARTAO: 'Cartão na entrega',
  DINHEIRO: 'Dinheiro',
}

export async function sendOrderConfirmation(order: any): Promise<void> {
  const phone = order.user?.telefone
  if (!phone) return

  const pixKey = process.env.WHATSAPP_PIX_KEY
  const storeName = process.env.STORE_NAME ?? 'Pizzaria'

  const itemLines = (order.itens ?? []).map((item: any) => {
    if (item.tipo === 'PIZZA') {
      const sabores = (item.sabores ?? []).map((sf: any) => sf.flavor?.nome ?? '').join(' + ')
      const borda = item.borda?.nome ? ` | Borda: ${item.borda.nome}` : ''
      return `• ${item.quantidade}x Pizza ${item.tamanho?.nome} — ${sabores}${borda}`
    }
    return `• ${item.quantidade}x ${item.bebida?.nome ?? 'Bebida'}`
  })

  const total = Number(order.total).toFixed(2).replace('.', ',')
  const firstName = (order.user?.nome ?? 'cliente').split(' ')[0]

  let msg = `🍕 *${storeName} — Pedido #${order.numero} confirmado!*\n\n`
  msg += `Olá, ${firstName}! Recebemos seu pedido. ✅\n\n`
  msg += `📋 *Itens:*\n${itemLines.join('\n')}\n\n`

  if (order.tipo === 'ENTREGA' && order.enderecoEntrega) {
    const addr = order.enderecoEntrega as any
    msg += `🚚 *Entrega em:* ${addr.rua}, ${addr.numero} — ${addr.bairro}`
    if (addr.complemento) msg += ` (${addr.complemento})`
    msg += '\n\n'
  } else {
    msg += `🏪 *Retirada no local*\n\n`
  }

  msg += `💰 *Total: R$ ${total}*\n`
  msg += `💳 *Pagamento:* ${PAYMENT_LABELS[order.formaPagamento] ?? order.formaPagamento}`

  if (order.formaPagamento === 'PIX' && pixKey) {
    msg += `\n🔑 *Chave PIX:* \`${pixKey}\``
  }

  if (order.formaPagamento === 'DINHEIRO' && order.trocoPara) {
    const troco = Number(order.trocoPara).toFixed(2).replace('.', ',')
    msg += `\n💵 Troco para: R$ ${troco}`
  }

  msg += `\n\n⏱️ Tempo estimado: ~40 min`
  msg += `\nObrigado pela preferência! 😊`

  await sendWhatsAppMessage(phone, msg)
}

export async function sendSaiuParaEntrega(order: any): Promise<void> {
  const phone = order.user?.telefone
  if (!phone) return
  const storeName = process.env.STORE_NAME ?? 'Pizzaria'
  const firstName = (order.user?.nome ?? 'cliente').split(' ')[0]
  const msg =
    `🛵 *${storeName} — Pedido #${order.numero}*\n\n` +
    `Olá, ${firstName}! Seu pedido saiu para entrega e está a caminho! 🚀\n\n` +
    `Fique atento à sua porta. Obrigado pela preferência! 😊`
  await sendWhatsAppMessage(phone, msg)
}

export async function sendProntoParaRetirada(order: any): Promise<void> {
  const phone = order.user?.telefone
  if (!phone) return
  const storeName = process.env.STORE_NAME ?? 'Pizzaria'
  const firstName = (order.user?.nome ?? 'cliente').split(' ')[0]
  const msg =
    `✅ *${storeName} — Pedido #${order.numero}*\n\n` +
    `Olá, ${firstName}! Seu pedido está *pronto para retirada*! 🍕\n\n` +
    `Venha buscar quando quiser. Obrigado pela preferência! 😊`
  await sendWhatsAppMessage(phone, msg)
}
