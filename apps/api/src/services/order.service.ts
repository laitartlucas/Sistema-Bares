import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { serialize } from '../lib/serialize'
import { getIO } from '../lib/socket'
import { AppError } from '../middleware/errorHandler'
import { sendOrderConfirmation, sendSaiuParaEntrega, sendProntoParaRetirada } from './whatsapp.service'
import type { CreateOrderInput, ListOrdersQuery, ManualOrderInput, UpdateOrderStatusInput } from '../schemas/order'

// ── Include padrão para pedidos ───────────────────────────────────────────────

const ORDER_INCLUDE = {
  user: { select: { id: true, nome: true, telefone: true } },
  itens: {
    include: {
      tamanho: true,
      borda: true,
      sabores: { include: { flavor: true } },
      bebida: true,
    },
  },
  printJobs: { orderBy: { createdAt: 'asc' as const } },
} as const

// ── Criar pedido ──────────────────────────────────────────────────────────────

export async function createOrder(userId: string, data: CreateOrderInput) {
  const storeConfig = await prisma.storeConfig.findFirst()
  const taxaEntrega = data.tipo === 'ENTREGA' ? Number(storeConfig?.taxaEntrega ?? 0) : 0

  // 1. Resolver endereço de entrega
  let enderecoSnapshot: Record<string, unknown> | null = null
  if (data.tipo === 'ENTREGA') {
    if (data.enderecoId) {
      const addr = await prisma.address.findUnique({ where: { id: data.enderecoId } })
      if (!addr || addr.userId !== userId) throw new AppError(404, 'Endereço não encontrado')
      enderecoSnapshot = {
        rua: addr.rua,
        numero: addr.numero,
        bairro: addr.bairro,
        complemento: addr.complemento,
        referencia: addr.referencia,
      }
    } else if (data.enderecoEntrega) {
      enderecoSnapshot = data.enderecoEntrega
    }
  }

  // 2. Validar e calcular preço de cada item
  type ProcessedItem = {
    tipo: 'PIZZA' | 'BEBIDA'
    tamanhoId?: string
    bordaId?: string
    saborIds?: string[]
    bebidaId?: string
    quantidade: number
    precoUnitario: number
    observacoes?: string
  }

  const processedItems: ProcessedItem[] = []

  for (const item of data.itens) {
    if (item.tipo === 'PIZZA') {
      const [tamanho, borda, sabores] = await Promise.all([
        prisma.pizzaSize.findUnique({ where: { id: item.tamanhoId } }),
        prisma.crust.findUnique({ where: { id: item.bordaId } }),
        prisma.flavor.findMany({ where: { id: { in: item.saborIds } } }),
      ])

      if (!tamanho || !tamanho.ativo)
        throw new AppError(400, `Tamanho inválido ou indisponível`)
      if (!borda || !borda.ativo)
        throw new AppError(400, `Borda inválida ou indisponível`)
      if (sabores.length !== item.saborIds.length)
        throw new AppError(400, `Um ou mais sabores não encontrados`)
      if (sabores.some((s) => !s.ativo))
        throw new AppError(400, `Um ou mais sabores estão indisponíveis`)
      if (item.saborIds.length > tamanho.maxSabores)
        throw new AppError(
          400,
          `Pizza ${tamanho.nome} permite no máximo ${tamanho.maxSabores} sabor(es)`,
        )

      const precoUnitario = parseFloat(Number(tamanho.preco).toFixed(2))

      processedItems.push({
        tipo: 'PIZZA',
        tamanhoId: tamanho.id,
        bordaId: borda.id,
        saborIds: item.saborIds,
        quantidade: item.quantidade,
        precoUnitario,
        observacoes: item.observacoes,
      })
    } else {
      const bebida = await prisma.beverage.findUnique({ where: { id: item.bebidaId } })
      if (!bebida || !bebida.ativo)
        throw new AppError(400, `Bebida inválida ou indisponível`)

      processedItems.push({
        tipo: 'BEBIDA',
        bebidaId: bebida.id,
        quantidade: item.quantidade,
        precoUnitario: Number(bebida.preco),
        observacoes: item.observacoes,
      })
    }
  }

  // 3. Calcular total (itens + taxa de entrega)
  const subtotal = processedItems.reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0,
  )
  const total = parseFloat((subtotal + taxaEntrega).toFixed(2))

  // 4. Criar pedido em transação
  const order = await prisma.$transaction(async (tx) => {
    return tx.order.create({
      data: {
        userId,
        tipo: data.tipo,
        enderecoEntrega: enderecoSnapshot
          ? (enderecoSnapshot as Prisma.InputJsonObject)
          : Prisma.JsonNull,
        formaPagamento: data.formaPagamento,
        trocoPara: data.trocoPara,
        total,
        itens: {
          create: processedItems.map((item) => ({
            tipo: item.tipo,
            tamanhoId: item.tamanhoId,
            bordaId: item.bordaId,
            bebidaId: item.bebidaId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            observacoes: item.observacoes,
            sabores:
              item.tipo === 'PIZZA' && item.saborIds
                ? { create: item.saborIds.map((flavorId) => ({ flavorId })) }
                : undefined,
          })),
        },
        printJobs: {
          create: [
            { tipo: 'COZINHA', status: 'PENDENTE' },
            { tipo: 'CAIXA', status: 'PENDENTE' },
          ],
        },
      },
      include: ORDER_INCLUDE,
    })
  })

  // 5. Emitir eventos WebSocket
  try {
    const io = getIO()
    const serialized = serialize(order)
    io.to('admin').emit('novo-pedido', { order: serialized as any })

    for (const job of order.printJobs) {
      io.to('admin').emit('print-job', {
        jobId: job.id,
        orderId: order.id,
        tipo: job.tipo,
      })
    }
  } catch {
    // WebSocket pode não estar disponível em testes — não bloqueia o pedido
  }

  return serialize(order)
}

// ── Pedido manual (registrado pelo admin) ─────────────────────────────────────

async function findOrCreateUserByPhone(phone: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { telefone: phone } })
  if (existing) return existing

  const hash = await bcrypt.hash(crypto.randomUUID(), 10)
  return prisma.user.create({
    data: { nome: name, telefone: phone, senha: hash, papel: 'CLIENTE' },
  })
}

export async function createManualOrder(data: ManualOrderInput) {
  const user = await findOrCreateUserByPhone(data.customerPhone, data.customerName)
  const order = await createOrder(user.id, {
    tipo: data.tipo,
    enderecoEntrega: data.enderecoEntrega,
    formaPagamento: data.formaPagamento,
    trocoPara: data.trocoPara,
    itens: data.itens,
  })

  if (data.sendWhatsApp) {
    sendOrderConfirmation(order).catch(() => null)
  }

  return order
}

// ── Listar pedidos do cliente ─────────────────────────────────────────────────

export async function listMyOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
  return serialize(orders)
}

export async function getMyOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  })
  if (!order || order.userId !== userId) throw new AppError(404, 'Pedido não encontrado')
  return serialize(order)
}

// ── Admin — listar pedidos ────────────────────────────────────────────────────

export async function adminListOrders(query: ListOrdersQuery) {
  const { page, limit, status, from, to } = query

  const statusList = status?.split(',').filter(Boolean) as
    | ('RECEBIDO' | 'EM_PREPARO' | 'PRONTO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO')[]
    | undefined

  const where: Prisma.OrderWhereInput = {
    ...(statusList?.length ? { status: { in: statusList } } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to + 'T23:59:59.999Z') } : {}),
          },
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return {
    items: serialize(items),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  }
}

export async function adminGetOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  })
  if (!order) throw new AppError(404, 'Pedido não encontrado')
  return serialize(order)
}

// ── Admin — atualizar status ──────────────────────────────────────────────────

export async function adminUpdateOrderStatus(
  orderId: string,
  data: UpdateOrderStatusInput,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  })
  if (!order) throw new AppError(404, 'Pedido não encontrado')

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: data.status },
    include: ORDER_INCLUDE,
  })

  // Emitir para o cliente dono do pedido
  try {
    const io = getIO()
    const payload = {
      orderId: updated.id,
      orderNumero: updated.numero,
      status: updated.status,
      userId: updated.userId,
    }
    io.to(`order:${orderId}`).emit('status-atualizado', payload)
    io.to('admin').emit('status-atualizado', payload)
  } catch {
    // sem WS disponível
  }

  const serialized = serialize(updated)

  if (updated.status === 'SAIU_PARA_ENTREGA') {
    sendSaiuParaEntrega(serialized).catch(() => null)
  } else if (updated.status === 'PRONTO') {
    sendProntoParaRetirada(serialized).catch(() => null)
  }

  return serialized
}

// ── Admin — reimprimir ────────────────────────────────────────────────────────

export async function adminReprintOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError(404, 'Pedido não encontrado')

  const jobs = await prisma.printJob.createManyAndReturn({
    data: [
      { orderId, tipo: 'COZINHA', status: 'PENDENTE' },
      { orderId, tipo: 'CAIXA', status: 'PENDENTE' },
    ],
  })

  try {
    const io = getIO()
    for (const job of jobs) {
      io.to('admin').emit('print-job', { jobId: job.id, orderId, tipo: job.tipo })
    }
  } catch {
    // sem WS
  }

  return { queued: jobs.length }
}

// ── Admin — relatório do dia ──────────────────────────────────────────────────

export async function adminDailyReport(date?: string) {
  const day = date ? new Date(date) : new Date()
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0)
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)

  const [orders, totalResult] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELADO' },
      },
      include: {
        itens: { include: { sabores: { include: { flavor: true } }, bebida: true, tamanho: true } },
      },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELADO' } },
      _sum: { total: true },
      _count: true,
    }),
  ])

  // Top sabores
  const flavorCount: Record<string, { nome: string; count: number }> = {}
  for (const order of orders) {
    for (const item of order.itens) {
      if (item.tipo !== 'PIZZA') continue
      for (const sf of item.sabores) {
        const id = sf.flavor.id
        if (!flavorCount[id]) flavorCount[id] = { nome: sf.flavor.nome, count: 0 }
        flavorCount[id].count += item.quantidade
      }
    }
  }
  const topSabores = Object.values(flavorCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    date: start.toISOString().split('T')[0],
    totalPedidos: totalResult._count,
    faturamento: Number(totalResult._sum.total ?? 0),
    topSabores,
  }
}
