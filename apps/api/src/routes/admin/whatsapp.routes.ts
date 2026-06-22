import { Router } from 'express'
import { getWhatsAppInfo } from '../../lib/whatsapp'

const router = Router()

router.get('/status', (_req, res) => {
  res.json({ success: true, data: getWhatsAppInfo() })
})

export default router
