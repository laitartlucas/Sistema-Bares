import { Router } from 'express'
import { requireAdmin } from '../middleware/auth'

import authRoutes    from './auth.routes'
import menuRoutes    from './menu.routes'
import ordersRoutes  from './orders.routes'
import printRoutes   from './print.routes'
import adminMenuRoutes         from './admin/menu.routes'
import adminOrdersRoutes       from './admin/orders.routes'
import adminConfigRoutes       from './admin/config.routes'
import adminWhatsAppRoutes     from './admin/whatsapp.routes'
import adminManualOrderRoutes  from './admin/manual-order.routes'

const router = Router()

// ── Públicas ──────────────────────────────────────────────────────────────────
router.use('/auth',   authRoutes)
router.use('/menu',   menuRoutes)

// ── Cliente autenticado ───────────────────────────────────────────────────────
router.use('/orders', ordersRoutes)

// ── Agente de impressão ───────────────────────────────────────────────────────
router.use('/print-jobs', printRoutes)

// ── Admin ─────────────────────────────────────────────────────────────────────
router.use('/admin/menu',          requireAdmin, adminMenuRoutes)
router.use('/admin/orders',        requireAdmin, adminOrdersRoutes)
router.use('/admin/config',        requireAdmin, adminConfigRoutes)
router.use('/admin/whatsapp',      requireAdmin, adminWhatsAppRoutes)
router.use('/admin/manual-order',  requireAdmin, adminManualOrderRoutes)

export default router
