import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate'
import { prisma } from '../../lib/prisma'
import { serialize } from '../../lib/serialize'

const router = Router()

const updateConfigSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  endereco: z.string().max(300).optional(),
  telefone: z.string().max(20).optional(),
  taxaEntrega: z.coerce.number().min(0).optional(),
  horarioFuncionamento: z.string().max(200).optional(),
  calcPrecoSabor: z.enum(['MAIOR_PRECO', 'MEDIA_PRECO']).optional(),
})

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.storeConfig.findFirst()
    res.json({ success: true, data: serialize(config) })
  } catch (err) { next(err) }
})

router.put('/', validate(updateConfigSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.storeConfig.findFirst()
    const config = existing
      ? await prisma.storeConfig.update({ where: { id: existing.id }, data: req.body })
      : await prisma.storeConfig.create({ data: { nome: 'Pizzaria', ...req.body } })
    res.json({ success: true, data: serialize(config) })
  } catch (err) { next(err) }
})

export default router
