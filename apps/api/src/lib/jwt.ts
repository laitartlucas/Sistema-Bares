import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'fallback-dev-secret'
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn']

export interface JwtPayload {
  sub: string
  papel: 'CLIENTE' | 'ADMIN'
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}
