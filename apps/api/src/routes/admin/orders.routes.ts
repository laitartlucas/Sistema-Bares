import { Router, Request, Response, NextFunction } from 'express'
import { validate } from '../../middleware/validate'
import { updateOrderStatusSchema, listOrdersQuerySchema } from '../../schemas/order'
import * as orderService from '../../services/order.service'
import * as printService from '../../services/print.service'

const router = Router()

// GET /api/admin/orders?status=...&from=...&to=...&page=1&limit=20
router.get('/', validate(listOrdersQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.adminListOrders(req.query as any)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.adminGetOrder(req.params.id)
    res.json({ success: true, data: order })
  } catch (err) { next(err) }
})

router.patch('/:id/status', validate(updateOrderStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.adminUpdateOrderStatus(req.params.id, req.body)
    res.json({ success: true, data: order })
  } catch (err) { next(err) }
})

router.post('/:id/reprint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.adminReprintOrder(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
})

// Jobs de impressão de um pedido específico
router.get('/:id/print-jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await printService.getJobsByOrder(req.params.id)
    res.json({ success: true, data: jobs })
  } catch (err) { next(err) }
})

// GET /api/admin/orders/report/daily?date=2024-06-01
router.get('/report/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await orderService.adminDailyReport(req.query.date as string | undefined)
    res.json({ success: true, data: report })
  } catch (err) { next(err) }
})

export default router
