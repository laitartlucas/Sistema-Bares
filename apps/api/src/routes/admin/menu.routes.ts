import { Router } from 'express'
import multer from 'multer'
import { validate } from '../../middleware/validate'
import { uploadImage } from '../../middleware/upload'
import {
  createSizeSchema, updateSizeSchema,
  createCrustSchema, updateCrustSchema,
  createFlavorSchema, updateFlavorSchema,
  createBeverageSchema, updateBeverageSchema,
} from '../../schemas/menu'
import * as menuService from '../../services/menu.service'

const router = Router()

// ── Upload de imagem ──────────────────────────────────────────────────────────

router.post('/upload', (req, res) => {
  uploadImage.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Imagem muito grande (máx. 5MB)'
        : (err as Error).message || 'Erro ao enviar arquivo'
      res.status(400).json({ success: false, error: message })
      return
    }
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' })
      return
    }
    const baseUrl = process.env.API_PUBLIC_URL ?? `${req.protocol}://${req.get('host')}`
    res.status(201).json({ success: true, data: { url: `${baseUrl}/uploads/${req.file.filename}` } })
  })
})

// ── Tamanhos ──────────────────────────────────────────────────────────────────

router.get('/sizes', async (_req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminListSizes() }) }
  catch (err) { next(err) }
})

router.post('/sizes', validate(createSizeSchema), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await menuService.adminCreateSize(req.body) }) }
  catch (err) { next(err) }
})

router.put('/sizes/:id', validate(updateSizeSchema), async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminUpdateSize(req.params.id, req.body) }) }
  catch (err) { next(err) }
})

router.patch('/sizes/:id/toggle', async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminToggleSize(req.params.id) }) }
  catch (err) { next(err) }
})

router.delete('/sizes/:id', async (req, res, next) => {
  try {
    await menuService.adminDeleteSize(req.params.id)
    res.json({ success: true, data: null })
  } catch (err) { next(err) }
})

// ── Bordas ────────────────────────────────────────────────────────────────────

router.get('/crusts', async (_req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminListCrusts() }) }
  catch (err) { next(err) }
})

router.post('/crusts', validate(createCrustSchema), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await menuService.adminCreateCrust(req.body) }) }
  catch (err) { next(err) }
})

router.put('/crusts/:id', validate(updateCrustSchema), async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminUpdateCrust(req.params.id, req.body) }) }
  catch (err) { next(err) }
})

router.patch('/crusts/:id/toggle', async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminToggleCrust(req.params.id) }) }
  catch (err) { next(err) }
})

router.delete('/crusts/:id', async (req, res, next) => {
  try {
    await menuService.adminDeleteCrust(req.params.id)
    res.json({ success: true, data: null })
  } catch (err) { next(err) }
})

// ── Sabores ───────────────────────────────────────────────────────────────────

router.get('/flavors', async (req, res, next) => {
  try {
    const categoria = req.query.categoria as string | undefined
    res.json({ success: true, data: await menuService.adminListFlavors(categoria) })
  } catch (err) { next(err) }
})

router.post('/flavors', validate(createFlavorSchema), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await menuService.adminCreateFlavor(req.body) }) }
  catch (err) { next(err) }
})

router.put('/flavors/:id', validate(updateFlavorSchema), async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminUpdateFlavor(req.params.id, req.body) }) }
  catch (err) { next(err) }
})

router.patch('/flavors/:id/toggle', async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminToggleFlavor(req.params.id) }) }
  catch (err) { next(err) }
})

router.delete('/flavors/:id', async (req, res, next) => {
  try {
    await menuService.adminDeleteFlavor(req.params.id)
    res.json({ success: true, data: null })
  } catch (err) { next(err) }
})

// ── Bebidas ───────────────────────────────────────────────────────────────────

router.get('/beverages', async (_req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminListBeverages() }) }
  catch (err) { next(err) }
})

router.post('/beverages', validate(createBeverageSchema), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await menuService.adminCreateBeverage(req.body) }) }
  catch (err) { next(err) }
})

router.put('/beverages/:id', validate(updateBeverageSchema), async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminUpdateBeverage(req.params.id, req.body) }) }
  catch (err) { next(err) }
})

router.patch('/beverages/:id/toggle', async (req, res, next) => {
  try { res.json({ success: true, data: await menuService.adminToggleBeverage(req.params.id) }) }
  catch (err) { next(err) }
})

router.delete('/beverages/:id', async (req, res, next) => {
  try {
    await menuService.adminDeleteBeverage(req.params.id)
    res.json({ success: true, data: null })
  } catch (err) { next(err) }
})

export default router
