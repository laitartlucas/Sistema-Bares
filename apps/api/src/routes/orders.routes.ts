import { Router, Request, Response, NextFunction } from 'express'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createOrderSchema } from '../schemas/order'
import * as orderService from '../services/order.service'
import { sendOrderConfirmation } from '../services/whatsapp.service'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  validate(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.createOrder(req.user!.sub, req.body)
      sendOrderConfirmation(order).catch(() => null)
      res.status(201).json({ success: true, data: order })
    } catch (err) {
      next(err)
    }
  },
)

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.listMyOrders(req.user!.sub)
    res.json({ success: true, data: orders })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getMyOrder(req.user!.sub, req.params.id)
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

export default router
