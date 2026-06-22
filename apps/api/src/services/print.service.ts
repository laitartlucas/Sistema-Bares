import { prisma } from '../lib/prisma'
import { serialize } from '../lib/serialize'
import { AppError } from '../middleware/errorHandler'

const JOB_INCLUDE = {
  order: {
    include: {
      user: { select: { id: true, nome: true, telefone: true } },
      itens: {
        include: {
          tamanho: true,
          borda: true,
          sabores: { include: { flavor: true } },
          bebida: true,
        },
      },
    },
  },
} as const

// Agente busca os jobs pendentes via polling
export async function getPendingJobs() {
  const jobs = await prisma.printJob.findMany({
    where: { status: 'PENDENTE' },
    include: JOB_INCLUDE,
    orderBy: { createdAt: 'asc' },
  })
  return serialize(jobs)
}

export async function markJobDone(jobId: string) {
  const job = await prisma.printJob.findUnique({ where: { id: jobId } })
  if (!job) throw new AppError(404, 'Job não encontrado')

  return serialize(
    await prisma.printJob.update({
      where: { id: jobId },
      data: { status: 'IMPRESSO' },
    }),
  )
}

export async function markJobError(jobId: string, erro: string) {
  const job = await prisma.printJob.findUnique({ where: { id: jobId } })
  if (!job) throw new AppError(404, 'Job não encontrado')

  return serialize(
    await prisma.printJob.update({
      where: { id: jobId },
      data: {
        status: 'ERRO',
        tentativas: { increment: 1 },
        erro,
      },
    }),
  )
}

// Admin pode consultar o histórico de jobs de um pedido
export async function getJobsByOrder(orderId: string) {
  return serialize(
    await prisma.printJob.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    }),
  )
}
