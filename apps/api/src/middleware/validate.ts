import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'

export function validate(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: result.error.flatten().fieldErrors,
      })
      return
    }
    ;(req as any)[source] = result.data
    next()
  }
}
