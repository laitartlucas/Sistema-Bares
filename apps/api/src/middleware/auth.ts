import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../lib/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token não fornecido' })
    return
  }
  try {
    req.user = verifyToken(auth.slice(7))
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido ou expirado' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.papel !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Acesso restrito ao administrador' })
      return
    }
    next()
  })
}
