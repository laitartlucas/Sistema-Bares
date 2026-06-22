import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { serialize } from '../lib/serialize'
import { AppError } from '../middleware/errorHandler'
import type { LoginInput, AdminLoginInput, RegisterInput, AddAddressInput, UpdateProfileInput } from '../schemas/auth'

const USER_SELECT = {
  id: true,
  nome: true,
  telefone: true,
  papel: true,
  createdAt: true,
  updatedAt: true,
  enderecos: true,
} as const

export async function register(data: RegisterInput) {
  const exists = await prisma.user.findUnique({ where: { telefone: data.telefone } })
  if (exists) throw new AppError(409, 'Telefone já cadastrado')

  const senha = await bcrypt.hash(data.senha, 10)
  const user = await prisma.user.create({
    data: { nome: data.nome, telefone: data.telefone, senha },
    select: USER_SELECT,
  })

  const token = signToken({ sub: user.id, papel: user.papel })
  return { token, user: serialize(user) }
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { telefone: data.telefone },
    select: { ...USER_SELECT, senha: true },
  })
  if (!user) throw new AppError(401, 'Telefone ou senha incorretos')

  const match = await bcrypt.compare(data.senha, user.senha)
  if (!match) throw new AppError(401, 'Telefone ou senha incorretos')

  const { senha: _senha, ...userSafe } = user
  const token = signToken({ sub: user.id, papel: user.papel })
  return { token, user: serialize(userSafe) }
}

export async function adminLogin(data: AdminLoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
    select: { ...USER_SELECT, senha: true },
  })
  if (!user) throw new AppError(401, 'Usuário ou senha incorretos')
  if (user.papel !== 'ADMIN') throw new AppError(403, 'Acesso negado')

  const match = await bcrypt.compare(data.senha, user.senha)
  if (!match) throw new AppError(401, 'Usuário ou senha incorretos')

  const { senha: _senha, ...userSafe } = user
  const token = signToken({ sub: user.id, papel: user.papel })
  return { token, user: serialize(userSafe) }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  })
  if (!user) throw new AppError(404, 'Usuário não encontrado')
  return serialize(user)
}

export async function addAddress(userId: string, data: AddAddressInput) {
  if (data.principal) {
    await prisma.address.updateMany({
      where: { userId },
      data: { principal: false },
    })
  }
  const address = await prisma.address.create({
    data: { ...data, userId },
  })
  return address
}

export async function removeAddress(userId: string, addressId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address || address.userId !== userId) {
    throw new AppError(404, 'Endereço não encontrado')
  }
  await prisma.address.delete({ where: { id: addressId } })
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ principal: 'desc' }, { id: 'asc' }],
  })
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.telefone) {
    const existing = await prisma.user.findFirst({
      where: { telefone: data.telefone, NOT: { id: userId } },
    })
    if (existing) throw new AppError(409, 'Telefone já cadastrado por outro usuário')
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.nome ? { nome: data.nome } : {}),
      ...(data.telefone ? { telefone: data.telefone } : {}),
    },
    select: USER_SELECT,
  })
  return serialize(user)
}
