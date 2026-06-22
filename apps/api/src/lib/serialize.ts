import { Decimal } from '@prisma/client/runtime/library'

// Converte Decimal do Prisma para number antes de serializar em JSON.
export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value instanceof Decimal) return value.toNumber()
      return value
    }),
  )
}
