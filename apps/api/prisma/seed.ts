import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Limpar dados existentes (ordem respeita FK) ────────────────────────────
  await prisma.orderItemFlavor.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.printJob.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.flavor.deleteMany()
  await prisma.crust.deleteMany()
  await prisma.pizzaSize.deleteMany()
  await prisma.beverage.deleteMany()
  await prisma.storeConfig.deleteMany()

  // ── Configuração da Loja ──────────────────────────────────────────────────
  await prisma.storeConfig.create({
    data: {
      nome: 'Pizzaria Dom Luigi',
      endereco: 'Rua das Flores, 42 — Centro',
      telefone: '(11) 98765-4321',
      taxaEntrega: 6.0,
      horarioFuncionamento: 'Ter–Dom  18h–23h',
      calcPrecoSabor: 'MAIOR_PRECO',
    },
  })
  console.log('✅ StoreConfig criada')

  // ── Tamanhos de Pizza ─────────────────────────────────────────────────────
  const sizes = await prisma.pizzaSize.createManyAndReturn({
    data: [
      { nome: 'Broto',   preco: 45.00, pedacos:  4, maxSabores: 1, ordem: 1 },
      { nome: 'Média',   preco: 65.00, pedacos:  8, maxSabores: 2, ordem: 2 },
      { nome: 'Grande',  preco: 75.00, pedacos: 12, maxSabores: 3, ordem: 3 },
      { nome: 'GG',      preco: 85.00, pedacos: 16, maxSabores: 4, ordem: 4 },
      { nome: 'Família', preco: 95.00, pedacos: 20, maxSabores: 4, ordem: 5 },
    ],
  })
  console.log(`✅ ${sizes.length} tamanhos criados`)

  // ── Bordas ────────────────────────────────────────────────────────────────
  const crusts = await prisma.crust.createManyAndReturn({
    data: [
      { nome: 'Sem Borda / Borda Tradicional', preco: 0.00 },
      { nome: 'Borda de Catupiry',             preco: 7.00 },
      { nome: 'Borda de Cheddar',              preco: 7.00 },
      { nome: 'Borda de Provolone',            preco: 8.00 },
      { nome: 'Borda de Chocolate',            preco: 8.00 },
      { nome: 'Borda de Cream Cheese',         preco: 8.00 },
    ],
  })
  console.log(`✅ ${crusts.length} bordas criadas`)

  // ── Sabores ───────────────────────────────────────────────────────────────
  const flavors = await prisma.flavor.createManyAndReturn({
    data: [
      // Salgadas
      {
        nome: 'Mussarela',
        descricao: 'Molho de tomate, mussarela fatiada e orégano',
        preco: 32.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Calabresa',
        descricao: 'Molho de tomate, calabresa fatiada, cebola e orégano',
        preco: 35.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Portuguesa',
        descricao: 'Molho, mussarela, presunto, ovos, cebola, azeitona e pimentão',
        preco: 38.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Frango c/ Catupiry',
        descricao: 'Frango desfiado temperado com requeijão cremoso Catupiry',
        preco: 40.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Pepperoni',
        descricao: 'Molho especial, mussarela generosa e pepperoni fatiado',
        preco: 42.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Quatro Queijos',
        descricao: 'Mussarela, provolone, parmesão e catupiry sobre molho de tomate',
        preco: 44.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Margherita',
        descricao: 'Molho de tomate San Marzano, mussarela de búfala e manjericão fresco',
        preco: 38.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Carne Seca c/ Cebola Caramelizada',
        descricao: 'Carne seca desfiada, cebola caramelizada no azeite e catupiry',
        preco: 46.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Bacon c/ Cheddar',
        descricao: 'Bacon crocante, cheddar cremoso e cebola roxa',
        preco: 42.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Brócolis c/ Bacon',
        descricao: 'Brócolis refogado, bacon crocante, alho e mussarela',
        preco: 40.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Atum c/ Azeitona',
        descricao: 'Atum ao azeite, azeitonas pretas, alcaparras e cebola',
        preco: 42.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      {
        nome: 'Palmito',
        descricao: 'Palmito pupunha, mussarela e molho de tomate caseiro',
        preco: 40.00,
        categoria: 'SALGADA',
        imagemUrl: null,
      },
      // Doces
      {
        nome: 'Chocolate',
        descricao: 'Cobertura de chocolate ao leite com granulado colorido',
        preco: 38.00,
        categoria: 'DOCE',
        imagemUrl: null,
      },
      {
        nome: 'Brigadeiro',
        descricao: 'Brigadeiro cremoso artesanal com granulado e leite condensado',
        preco: 40.00,
        categoria: 'DOCE',
        imagemUrl: null,
      },
      {
        nome: 'Romeu e Julieta',
        descricao: 'Goiabada cremosa com queijo minas frescal',
        preco: 38.00,
        categoria: 'DOCE',
        imagemUrl: null,
      },
      {
        nome: 'Nutella c/ Banana',
        descricao: 'Nutella generosa, banana fatiada e leite condensado',
        preco: 46.00,
        categoria: 'DOCE',
        imagemUrl: null,
      },
      {
        nome: 'Prestígio',
        descricao: 'Chocolate ao leite com recheio de coco ralado',
        preco: 40.00,
        categoria: 'DOCE',
        imagemUrl: null,
      },
    ],
  })
  console.log(`✅ ${flavors.length} sabores criados`)

  // ── Bebidas ───────────────────────────────────────────────────────────────
  const beverages = await prisma.beverage.createManyAndReturn({
    data: [
      { nome: 'Coca-Cola',               preco: 7.00,  volume: '600ml' },
      { nome: 'Coca-Cola',               preco: 12.00, volume: '2L' },
      { nome: 'Coca-Cola Zero',          preco: 7.00,  volume: '600ml' },
      { nome: 'Guaraná Antarctica',      preco: 7.00,  volume: '600ml' },
      { nome: 'Guaraná Antarctica',      preco: 12.00, volume: '2L' },
      { nome: 'Fanta Laranja',           preco: 7.00,  volume: '600ml' },
      { nome: 'Suco de Laranja Natural', preco: 9.00,  volume: '500ml' },
      { nome: 'Água Mineral',            preco: 4.00,  volume: '500ml' },
      { nome: 'Água com Gás',            preco: 5.00,  volume: '500ml' },
      { nome: 'Heineken',                preco: 8.00,  volume: '350ml' },
      { nome: 'Stella Artois',           preco: 8.00,  volume: '350ml' },
      { nome: 'Monster Energy',          preco: 14.00, volume: '473ml' },
    ],
  })
  console.log(`✅ ${beverages.length} bebidas criadas`)

  // ── Usuários ──────────────────────────────────────────────────────────────
  const senhaAdmin    = await bcrypt.hash('admin123', 10)
  const senhaCliente  = await bcrypt.hash('cliente123', 10)
  const senhaCliente2 = await bcrypt.hash('maria456', 10)

  const admin = await prisma.user.create({
    data: {
      nome: 'Admin Dom Luigi',
      telefone: '11999999999',
      username: 'admin',
      senha: senhaAdmin,
      papel: Role.ADMIN,
    },
  })

  const cliente1 = await prisma.user.create({
    data: {
      nome: 'João Silva',
      telefone: '11988887777',
      senha: senhaCliente,
      papel: Role.CLIENTE,
      enderecos: {
        create: [
          {
            rua: 'Rua das Acácias',
            numero: '123',
            bairro: 'Jardim Primavera',
            complemento: 'Apto 45',
            referencia: 'Próximo ao mercado Extra',
            principal: true,
          },
          {
            rua: 'Av. Paulista',
            numero: '1000',
            bairro: 'Bela Vista',
            complemento: null,
            referencia: 'Em frente ao MASP',
            principal: false,
          },
        ],
      },
    },
  })

  const cliente2 = await prisma.user.create({
    data: {
      nome: 'Maria Fernanda',
      telefone: '11977776666',
      senha: senhaCliente2,
      papel: Role.CLIENTE,
      enderecos: {
        create: [
          {
            rua: 'Rua Barão do Triunfo',
            numero: '400',
            bairro: 'Brooklyn',
            complemento: 'Casa 2',
            referencia: null,
            principal: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Usuários criados: admin (${admin.telefone}), ${cliente1.nome}, ${cliente2.nome}`)

  // ── Pedido de exemplo ─────────────────────────────────────────────────────
  const sizeGrande  = sizes.find((s) => s.nome === 'Grande')!
  const bordaCatup  = crusts.find((c) => c.nome === 'Borda de Catupiry')!
  const flavorCalab = flavors.find((f) => f.nome === 'Calabresa')!
  const flavorMussa = flavors.find((f) => f.nome === 'Mussarela')!
  const bevCoca     = beverages.find((b) => b.nome === 'Coca-Cola' && b.volume === '600ml')!

  // Preço da pizza = sabor mais caro (Calabresa R$35 > Mussarela R$32) + borda R$7 = R$42
  const precoPizza = Math.max(flavorCalab.preco.toNumber(), flavorMussa.preco.toNumber()) + bordaCatup.preco.toNumber()
  const precoBebida = bevCoca.preco.toNumber()
  const total = precoPizza + precoBebida

  const endCliente1 = await prisma.address.findFirst({ where: { userId: cliente1.id, principal: true } })

  const pedidoExemplo = await prisma.order.create({
    data: {
      userId: cliente1.id,
      tipo: 'ENTREGA',
      enderecoEntrega: endCliente1
        ? {
            rua: endCliente1.rua,
            numero: endCliente1.numero,
            bairro: endCliente1.bairro,
            complemento: endCliente1.complemento,
            referencia: endCliente1.referencia,
          }
        : undefined,
      formaPagamento: 'PIX',
      trocoPara: null,
      status: 'ENTREGUE',
      total,
      itens: {
        create: [
          {
            tipo: 'PIZZA',
            tamanhoId: sizeGrande.id,
            bordaId: bordaCatup.id,
            quantidade: 1,
            precoUnitario: precoPizza,
            observacoes: 'Sem cebola no meio da Calabresa, por favor',
            sabores: {
              create: [
                { flavorId: flavorCalab.id },
                { flavorId: flavorMussa.id },
              ],
            },
          },
          {
            tipo: 'BEBIDA',
            bebidaId: bevCoca.id,
            quantidade: 1,
            precoUnitario: precoBebida,
          },
        ],
      },
      printJobs: {
        create: [
          { tipo: 'COZINHA', status: 'IMPRESSO' },
          { tipo: 'CAIXA',   status: 'IMPRESSO' },
        ],
      },
    },
  })

  console.log(`✅ Pedido de exemplo #${pedidoExemplo.numero} criado (status: ENTREGUE)`)

  // ── Resumo ────────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🍕 Seed concluído com sucesso!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Credenciais de acesso:')
  console.log('  ADMIN   → telefone: 11999999999  senha: admin123')
  console.log('  Cliente → telefone: 11988887777  senha: cliente123')
  console.log('  Cliente → telefone: 11977776666  senha: maria456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
