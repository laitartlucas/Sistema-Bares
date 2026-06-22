import { Router, Request, Response, NextFunction } from 'express'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { loginSchema, adminLoginSchema, registerSchema, addAddressSchema, updateProfileSchema } from '../schemas/auth'
import * as authService from '../services/auth.service'

const router = Router()

router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body)
      res.json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/admin-login',
  validate(adminLoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.adminLogin(req.body)
      res.json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getMe(req.user!.sub)
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  },
)

router.get(
  '/addresses',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addresses = await authService.listAddresses(req.user!.sub)
      res.json({ success: true, data: addresses })
    } catch (err) {
      next(err)
    }
  },
)

router.post(
  '/addresses',
  requireAuth,
  validate(addAddressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await authService.addAddress(req.user!.sub, req.body)
      res.status(201).json({ success: true, data: address })
    } catch (err) {
      next(err)
    }
  },
)

router.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.updateProfile(req.user!.sub, req.body)
      res.json({ success: true, data: user })
    } catch (err) {
      next(err)
    }
  },
)

router.delete(
  '/addresses/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.removeAddress(req.user!.sub, req.params.id)
      res.json({ success: true, data: null })
    } catch (err) {
      next(err)
    }
  },
)

export default router
