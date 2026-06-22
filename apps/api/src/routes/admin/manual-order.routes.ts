import { Router } from 'express'
import { manualOrderSchema } from '../../schemas/order'
import { createManualOrder } from '../../services/order.service'
import { validate } from '../../middleware/validate'

const router = Router()

router.post('/', validate(manualOrderSchema), async (req, res, next) => {
  try {
    const order = await createManualOrder(req.body)
    res.status(201).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

export default router
