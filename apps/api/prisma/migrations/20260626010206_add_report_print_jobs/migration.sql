-- AlterEnum
ALTER TYPE "PrintJobType" ADD VALUE 'RELATORIO';

-- AlterTable
ALTER TABLE "print_jobs" ADD COLUMN     "conteudo" TEXT,
ALTER COLUMN "orderId" DROP NOT NULL;
