import { z } from 'zod'

const pizzaItemSchema = z.object({
  tipo: z.literal('PIZZA'),
  tamanhoId: z.string().cuid('ID de tamanho inválido'),
  bordaId: z.string().cuid('ID de borda inválido'),
  saborIds: z
    .array(z.string().cuid())
    .min(1, 'Escolha ao menos 1 sabor')
    .max(8, 'Máximo de 8 sabores'),
  quantidade: z.number().int().min(1).max(10).default(1),
  observacoes: z.string().max(500).optional(),
})

const bebidaItemSchema = z.object({
  tipo: z.literal('BEBIDA'),
  bebidaId: z.string().cuid('ID de bebida inválido'),
  quantidade: z.number().int().min(1).max(20),
  observacoes: z.string().max(200).optional(),
})

const enderecoSchema = z.object({
  rua: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  complemento: z.string().optional(),
  referencia: z.string().optional(),
})

export const manualOrderSchema = z.object({
  customerPhone: z.string().min(10, 'Telefone inválido (mín. 10 dígitos)'),
  customerName: z.string().min(2, 'Nome obrigatório'),
  tipo: z.enum(['ENTREGA', 'RETIRADA']),
  enderecoEntrega: enderecoSchema.optional(),
  formaPagamento: z.enum(['DINHEIRO', 'PIX', 'CARTAO']),
  trocoPara: z.number().positive().optional(),
  itens: z
    .array(z.discriminatedUnion('tipo', [pizzaItemSchema, bebidaItemSchema]))
    .min(1, 'Pedido deve ter ao menos 1 item'),
  observacoes: z.string().max(500).optional(),
  sendWhatsApp: z.boolean().default(true),
})

export const createOrderSchema = z
  .object({
    tipo: z.enum(['ENTREGA', 'RETIRADA']),
    enderecoId: z.string().cuid().optional(),
    enderecoEntrega: enderecoSchema.optional(),
    formaPagamento: z.enum(['DINHEIRO', 'PIX', 'CARTAO']),
    trocoPara: z.number().positive().optional(),
    itens: z
      .array(z.discriminatedUnion('tipo', [pizzaItemSchema, bebidaItemSchema]))
      .min(1, 'Pedido deve ter ao menos 1 item'),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'ENTREGA' && !data.enderecoId && !data.enderecoEntrega) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Endereço obrigatório para entrega',
        path: ['enderecoEntrega'],
      })
    }
    if (data.formaPagamento !== 'DINHEIRO' && data.trocoPara !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Troco só se aplica ao pagamento em dinheiro',
        path: ['trocoPara'],
      })
    }
  })

export const updateOrderStatusSchema = z.object({
  status: z.enum(['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']),
})

export const listOrdersQuerySchema = z.object({
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>
export type ManualOrderInput = z.infer<typeof manualOrderSchema>
