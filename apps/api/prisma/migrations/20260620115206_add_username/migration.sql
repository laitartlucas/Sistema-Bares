-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "FlavorCategory" AS ENUM ('SALGADA', 'DOCE');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('ENTREGA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PIZZA', 'BEBIDA');

-- CreateEnum
CREATE TYPE "PrintJobType" AS ENUM ('COZINHA', 'CAIXA');

-- CreateEnum
CREATE TYPE "PrintJobStatus" AS ENUM ('PENDENTE', 'IMPRESSO', 'ERRO');

-- CreateEnum
CREATE TYPE "PriceCalcMethod" AS ENUM ('MAIOR_PRECO', 'MEDIA_PRECO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "username" TEXT,
    "senha" TEXT NOT NULL,
    "papel" "Role" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "complemento" TEXT,
    "referencia" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pizza_sizes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "maxSabores" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pizza_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crusts" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "crusts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flavors" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "categoria" "FlavorCategory" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imagemUrl" TEXT,

    CONSTRAINT "flavors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beverages" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "volume" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "imagemUrl" TEXT,

    CONSTRAINT "beverages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "OrderType" NOT NULL,
    "enderecoEntrega" JSONB,
    "formaPagamento" "PaymentMethod" NOT NULL,
    "trocoPara" DECIMAL(10,2),
    "status" "OrderStatus" NOT NULL DEFAULT 'RECEBIDO',
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tipo" "ItemType" NOT NULL,
    "tamanhoId" TEXT,
    "bordaId" TEXT,
    "bebidaId" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_flavors" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "flavorId" TEXT NOT NULL,

    CONSTRAINT "order_item_flavors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_jobs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tipo" "PrintJobType" NOT NULL,
    "status" "PrintJobStatus" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_config" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "telefone" TEXT,
    "taxaEntrega" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "horarioFuncionamento" TEXT,
    "calcPrecoSabor" "PriceCalcMethod" NOT NULL DEFAULT 'MAIOR_PRECO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telefone_key" ON "users"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "orders_numero_key" ON "orders"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_flavors_orderItemId_flavorId_key" ON "order_item_flavors"("orderItemId", "flavorId");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tamanhoId_fkey" FOREIGN KEY ("tamanhoId") REFERENCES "pizza_sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_bordaId_fkey" FOREIGN KEY ("bordaId") REFERENCES "crusts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_bebidaId_fkey" FOREIGN KEY ("bebidaId") REFERENCES "beverages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_flavors" ADD CONSTRAINT "order_item_flavors_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_flavors" ADD CONSTRAINT "order_item_flavors_flavorId_fkey" FOREIGN KEY ("flavorId") REFERENCES "flavors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_jobs" ADD CONSTRAINT "print_jobs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
