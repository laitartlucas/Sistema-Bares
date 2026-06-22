import { z } from 'zod'

// Normaliza: extrai só dígitos e remove código do país 55 se presente
function normalizePhone(val: string): string {
  const digits = val.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length > 11) return digits.slice(2)
  return digits
}

const telefone = z
  .string()
  .transform(normalizePhone)
  .pipe(
    z.string()
      .min(10, 'Telefone inválido (mín. 10 dígitos)')
      .max(11, 'Telefone inválido (máx. 11 dígitos)')
      .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  )

export const loginSchema = z.object({
  telefone,
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export const adminLoginSchema = z.object({
  username: z.string().min(2, 'Usuário obrigatório').max(50),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto').max(100),
  telefone,
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(100),
})

export const addAddressSchema = z.object({
  rua: z.string().min(1, 'Rua obrigatória').max(200),
  numero: z.string().min(1, 'Número obrigatório').max(20),
  bairro: z.string().min(1, 'Bairro obrigatório').max(100),
  complemento: z.string().max(100).optional(),
  referencia: z.string().max(200).optional(),
  principal: z.boolean().optional().default(false),
})

export const updateProfileSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  telefone: z.string().transform(normalizePhone).pipe(
    z.string().min(10).max(11).regex(/^\d+$/)
  ).optional(),
}).refine(data => data.nome || data.telefone, {
  message: 'Informe ao menos um campo para atualizar',
})

export type LoginInput = z.infer<typeof loginSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AddAddressInput = z.infer<typeof addAddressSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
