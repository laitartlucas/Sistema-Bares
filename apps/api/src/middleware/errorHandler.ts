import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }

  // Prisma unique constraint
  if ((err as any).code === 'P2002') {
    res.status(409).json({ success: false, error: 'Registro duplicado' })
    return
  }

  console.error('[ERRO]', err)
  res.status(500).json({ success: false, error: 'Erro interno do servidor' })
}
