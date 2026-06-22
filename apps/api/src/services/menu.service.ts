import { prisma } from '../lib/prisma'
import { serialize } from '../lib/serialize'
import { AppError } from '../middleware/errorHandler'
import type {
  CreateSizeInput, UpdateSizeInput,
  CreateCrustInput, UpdateCrustInput,
  CreateFlavorInput, UpdateFlavorInput,
  CreateBeverageInput, UpdateBeverageInput,
} from '../schemas/menu'

// ── Cardápio público (somente ativos) ────────────────────────────────────────

export async function getPublicSizes() {
  return serialize(await prisma.pizzaSize.findMany({
    where: { ativo: true },
    orderBy: { ordem: 'asc' },
  }))
}

export async function getPublicCrusts() {
  return serialize(await prisma.crust.findMany({
    where: { ativo: true },
    orderBy: { preco: 'asc' },
  }))
}

export async function getPublicFlavors(categoria?: string) {
  return serialize(await prisma.flavor.findMany({
    where: {
      ativo: true,
      ...(categoria ? { categoria: categoria as 'SALGADA' | 'DOCE' } : {}),
    },
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
  }))
}

export async function getPublicBeverages() {
  return serialize(await prisma.beverage.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
  }))
}

export async function getPublicConfig() {
  return serialize(await prisma.storeConfig.findFirst())
}

// ── Admin — Tamanhos ──────────────────────────────────────────────────────────

export async function adminListSizes() {
  return serialize(await prisma.pizzaSize.findMany({ orderBy: { ordem: 'asc' } }))
}

export async function adminCreateSize(data: CreateSizeInput) {
  return serialize(await prisma.pizzaSize.create({ data }))
}

export async function adminUpdateSize(id: string, data: UpdateSizeInput) {
  await assertSizeExists(id)
  return serialize(await prisma.pizzaSize.update({ where: { id }, data }))
}

export async function adminToggleSize(id: string) {
  const size = await assertSizeExists(id)
  return serialize(await prisma.pizzaSize.update({
    where: { id },
    data: { ativo: !size.ativo },
  }))
}

export async function adminDeleteSize(id: string) {
  await assertSizeExists(id)
  await prisma.pizzaSize.delete({ where: { id } })
}

// ── Admin — Bordas ────────────────────────────────────────────────────────────

export async function adminListCrusts() {
  return serialize(await prisma.crust.findMany({ orderBy: { preco: 'asc' } }))
}

export async function adminCreateCrust(data: CreateCrustInput) {
  return serialize(await prisma.crust.create({ data }))
}

export async function adminUpdateCrust(id: string, data: UpdateCrustInput) {
  await assertCrustExists(id)
  return serialize(await prisma.crust.update({ where: { id }, data }))
}

export async function adminToggleCrust(id: string) {
  const crust = await assertCrustExists(id)
  return serialize(await prisma.crust.update({
    where: { id },
    data: { ativo: !crust.ativo },
  }))
}

export async function adminDeleteCrust(id: string) {
  await assertCrustExists(id)
  await prisma.crust.delete({ where: { id } })
}

// ── Admin — Sabores ───────────────────────────────────────────────────────────

export async function adminListFlavors(categoria?: string) {
  return serialize(await prisma.flavor.findMany({
    where: categoria ? { categoria: categoria as 'SALGADA' | 'DOCE' } : {},
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
  }))
}

export async function adminCreateFlavor(data: CreateFlavorInput) {
  return serialize(await prisma.flavor.create({ data }))
}

export async function adminUpdateFlavor(id: string, data: UpdateFlavorInput) {
  await assertFlavorExists(id)
  return serialize(await prisma.flavor.update({ where: { id }, data }))
}

export async function adminToggleFlavor(id: string) {
  const flavor = await assertFlavorExists(id)
  return serialize(await prisma.flavor.update({
    where: { id },
    data: { ativo: !flavor.ativo },
  }))
}

export async function adminDeleteFlavor(id: string) {
  await assertFlavorExists(id)
  await prisma.flavor.delete({ where: { id } })
}

// ── Admin — Bebidas ───────────────────────────────────────────────────────────

export async function adminListBeverages() {
  return serialize(await prisma.beverage.findMany({ orderBy: { nome: 'asc' } }))
}

export async function adminCreateBeverage(data: CreateBeverageInput) {
  return serialize(await prisma.beverage.create({ data }))
}

export async function adminUpdateBeverage(id: string, data: UpdateBeverageInput) {
  await assertBeverageExists(id)
  return serialize(await prisma.beverage.update({ where: { id }, data }))
}

export async function adminToggleBeverage(id: string) {
  const bev = await assertBeverageExists(id)
  return serialize(await prisma.beverage.update({
    where: { id },
    data: { ativo: !bev.ativo },
  }))
}

export async function adminDeleteBeverage(id: string) {
  await assertBeverageExists(id)
  await prisma.beverage.delete({ where: { id } })
}

// ── Helpers de validação ──────────────────────────────────────────────────────

async function assertSizeExists(id: string) {
  const item = await prisma.pizzaSize.findUnique({ where: { id } })
  if (!item) throw new AppError(404, 'Tamanho não encontrado')
  return item
}

async function assertCrustExists(id: string) {
  const item = await prisma.crust.findUnique({ where: { id } })
  if (!item) throw new AppError(404, 'Borda não encontrada')
  return item
}

async function assertFlavorExists(id: string) {
  const item = await prisma.flavor.findUnique({ where: { id } })
  if (!item) throw new AppError(404, 'Sabor não encontrado')
  return item
}

async function assertBeverageExists(id: string) {
  const item = await prisma.beverage.findUnique({ where: { id } })
  if (!item) throw new AppError(404, 'Bebida não encontrada')
  return item
}
