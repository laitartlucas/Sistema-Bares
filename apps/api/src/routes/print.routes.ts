import { Router, Request, Response, NextFunction } from 'express'
import * as printService from '../services/print.service'

const router = Router()

// Autenticação simples por segredo compartilhado (header X-Print-Secret)
function requirePrintSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-print-secret']
  if (!secret || secret !== process.env.PRINT_AGENT_SECRET) {
    res.status(401).json({ success: false, error: 'Acesso não autorizado' })
    return
  }
  next()
}

// GET /api/print-jobs/pending — agente faz polling neste endpoint
router.get('/pending', requirePrintSecret, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await printService.getPendingJobs()
    res.json({ success: true, data: jobs })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/print-jobs/:id/done
router.patch('/:id/done', requirePrintSecret, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await printService.markJobDone(req.params.id)
    res.json({ success: true, data: job })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/print-jobs/:id/error
router.patch('/:id/error', requirePrintSecret, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { erro } = req.body as { erro?: string }
    const job = await printService.markJobError(req.params.id, erro ?? 'Erro desconhecido')
    res.json({ success: true, data: job })
  } catch (err) {
    next(err)
  }
})

export default router
