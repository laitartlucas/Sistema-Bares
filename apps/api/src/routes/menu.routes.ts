import { Router, Request, Response, NextFunction } from 'express'
import * as menuService from '../services/menu.service'

const router = Router()

router.get('/sizes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await menuService.getPublicSizes() })
  } catch (err) { next(err) }
})

router.get('/crusts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await menuService.getPublicCrusts() })
  } catch (err) { next(err) }
})

router.get('/flavors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoria = req.query.categoria as string | undefined
    res.json({ success: true, data: await menuService.getPublicFlavors(categoria) })
  } catch (err) { next(err) }
})

router.get('/beverages', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await menuService.getPublicBeverages() })
  } catch (err) { next(err) }
})

router.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: await menuService.getPublicConfig() })
  } catch (err) { next(err) }
})

export default router
