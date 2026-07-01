/**
 * Seed de pedidos de teste — NÃO apaga dados existentes.
 * Cria ~25 pedidos finalizados variados para testar métricas e relatórios.
 * Uso: npx ts-node prisma/seed-orders.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000)
}

async function main() {
  console.log('🌱 Gerando pedidos de teste...\n')

  // ── Busca dados existentes ──────────────────────────────────────────────────
  const [users, sizes, crusts, flavors, beverages] = await Promise.all([
    prisma.user.findMany({ where: { papel: 'CLIENTE' } }),
    prisma.pizzaSize.findMany({ where: { ativo: true } }),
    prisma.crust.findMany({ where: { ativo: true } }),
    prisma.flavor.findMany({ where: { ativo: true } }),
    prisma.beverage.findMany({ where: { ativo: true } }),
  ])

  if (!users.length || !sizes.length || !flavors.length) {
    console.error('❌ Rode "npm run db:seed" primeiro para criar o cardápio e usuários.')
    process.exit(1)
  }

  const salgadas = flavors.filter((f) => f.categoria === 'SALGADA')
  const doces    = flavors.filter((f) => f.categoria === 'DOCE')

  // ── Definição dos pedidos ───────────────────────────────────────────────────
  const ordersConfig = [
    // PIX — entregas finalizadas
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 0.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 1,    withBev: false, flavCat: 'SALGADA', qtdSab: 1 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'RETIRADA',  hAgo: 1.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 3 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 2,    withBev: false, flavCat: 'DOCE',    qtdSab: 1 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 2.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'RETIRADA',  hAgo: 3,    withBev: false, flavCat: 'SALGADA', qtdSab: 1 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 3.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 4 },
    { pay: 'PIX',      status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 4,    withBev: false, flavCat: 'DOCE',    qtdSab: 2 },
    // DINHEIRO — entregas finalizadas
    { pay: 'DINHEIRO', status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 4.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    { pay: 'DINHEIRO', status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 5,    withBev: false, flavCat: 'SALGADA', qtdSab: 1 },
    { pay: 'DINHEIRO', status: 'ENTREGUE',  tipo: 'RETIRADA',  hAgo: 5.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    { pay: 'DINHEIRO', status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 6,    withBev: false, flavCat: 'DOCE',    qtdSab: 1 },
    { pay: 'DINHEIRO', status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 6.5,  withBev: false, flavCat: 'SALGADA', qtdSab: 3 },
    { pay: 'DINHEIRO', status: 'ENTREGUE',  tipo: 'RETIRADA',  hAgo: 7,    withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    // CARTAO — entregas finalizadas
    { pay: 'CARTAO',   status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 7.5,  withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    { pay: 'CARTAO',   status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 8,    withBev: false, flavCat: 'SALGADA', qtdSab: 1 },
    { pay: 'CARTAO',   status: 'ENTREGUE',  tipo: 'RETIRADA',  hAgo: 8.5,  withBev: true,  flavCat: 'DOCE',    qtdSab: 2 },
    { pay: 'CARTAO',   status: 'ENTREGUE',  tipo: 'ENTREGA',   hAgo: 9,    withBev: false, flavCat: 'SALGADA', qtdSab: 3 },
    // Cancelados
    { pay: 'PIX',      status: 'CANCELADO', tipo: 'ENTREGA',   hAgo: 9.5,  withBev: false, flavCat: 'SALGADA', qtdSab: 1 },
    { pay: 'DINHEIRO', status: 'CANCELADO', tipo: 'ENTREGA',   hAgo: 10,   withBev: false, flavCat: 'SALGADA', qtdSab: 2 },
    // Em preparo (pedidos em aberto)
    { pay: 'PIX',      status: 'EM_PREPARO', tipo: 'ENTREGA',  hAgo: 0.2,  withBev: true,  flavCat: 'SALGADA', qtdSab: 2 },
    { pay: 'CARTAO',   status: 'RECEBIDO',   tipo: 'RETIRADA', hAgo: 0.1,  withBev: false, flavCat: 'DOCE',    qtdSab: 1 },
  ] as const

  let criados = 0

  for (const cfg of ordersConfig) {
    const user    = pick(users)
    const size    = pick(sizes)
    const crust   = pick(crusts)
    const pool    = cfg.flavCat === 'DOCE' ? doces : salgadas
    const sabores = pickN(pool, cfg.qtdSab)

    const precoPizza =
      Math.max(...sabores.map((s) => Number(s.preco))) + Number(crust.preco)

    const itens: any[] = [
      {
        tipo: 'PIZZA',
        tamanhoId: size.id,
        bordaId: crust.id,
        quantidade: 1,
        precoUnitario: precoPizza,
        sabores: { create: sabores.map((s) => ({ flavorId: s.id })) },
      },
    ]

    let total = precoPizza

    if (cfg.withBev && beverages.length) {
      const bev = pick(beverages)
      const precoBev = Number(bev.preco)
      total += precoBev
      itens.push({
        tipo: 'BEBIDA',
        bebidaId: bev.id,
        quantidade: 1,
        precoUnitario: precoBev,
      })
    }

    const createdAt = hoursAgo(cfg.hAgo)

    await prisma.order.create({
      data: {
        userId: user.id,
        tipo: cfg.tipo,
        formaPagamento: cfg.pay,
        status: cfg.status,
        total,
        createdAt,
        updatedAt: createdAt,
        ...(cfg.tipo === 'ENTREGA'
          ? {
              enderecoEntrega: {
                rua: 'Rua Teste',
                numero: String(Math.floor(Math.random() * 900) + 100),
                bairro: pick(['Centro', 'Jardins', 'Vila Nova', 'Bela Vista']),
              },
            }
          : {}),
        itens: { create: itens },
      },
    })

    criados++
    process.stdout.write(`  ✅ Pedido ${criados}/${ordersConfig.length} — ${cfg.status} · ${cfg.pay}\n`)
  }

  console.log(`\n🍕 ${criados} pedidos de teste criados com sucesso!`)
  console.log('   Acesse /relatorio no admin para visualizar as métricas.\n')
}

main()
  .catch((e) => { console.error('❌ Erro:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
