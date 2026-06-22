import { z } from 'zod'

// ── Tamanhos ──────────────────────────────────────────────────────────────────

export const createSizeSchema = z.object({
  nome: z.string().min(1).max(50),
  maxSabores: z.number().int().min(1).max(8),
  ordem: z.number().int().min(1),
  ativo: z.boolean().optional().default(true),
})

export const updateSizeSchema = createSizeSchema.partial()

// ── Bordas ────────────────────────────────────────────────────────────────────

export const createCrustSchema = z.object({
  nome: z.string().min(1).max(100),
  preco: z.number().min(0),
  ativo: z.boolean().optional().default(true),
})

export const updateCrustSchema = createCrustSchema.partial()

// ── Sabores ───────────────────────────────────────────────────────────────────

export const createFlavorSchema = z.object({
  nome: z.string().min(1).max(100),
  descricao: z.string().max(500).optional(),
  preco: z.number().min(0),
  categoria: z.enum(['SALGADA', 'DOCE']),
  ativo: z.boolean().optional().default(true),
  imagemUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
})

export const updateFlavorSchema = createFlavorSchema.partial()

// ── Bebidas ───────────────────────────────────────────────────────────────────

export const createBeverageSchema = z.object({
  nome: z.string().min(1).max(100),
  preco: z.number().min(0),
  volume: z.string().max(20).optional(),
  ativo: z.boolean().optional().default(true),
  imagemUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
})

export const updateBeverageSchema = createBeverageSchema.partial()

// ── Tipos inferidos ───────────────────────────────────────────────────────────

export type CreateSizeInput     = z.infer<typeof createSizeSchema>
export type UpdateSizeInput     = z.infer<typeof updateSizeSchema>
export type CreateCrustInput    = z.infer<typeof createCrustSchema>
export type UpdateCrustInput    = z.infer<typeof updateCrustSchema>
export type CreateFlavorInput   = z.infer<typeof createFlavorSchema>
export type UpdateFlavorInput   = z.infer<typeof updateFlavorSchema>
export type CreateBeverageInput = z.infer<typeof createBeverageSchema>
export type UpdateBeverageInput = z.infer<typeof updateBeverageSchema>
