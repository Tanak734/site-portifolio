-- CreateEnum
CREATE TYPE "modalidade_cobranca" AS ENUM ('PAGO', 'DESCONTO', 'GRATUITO');

-- AlterTable
ALTER TABLE "projetos" ADD COLUMN     "contrapartida" TEXT,
ADD COLUMN     "desconto_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "impostos_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "modalidade_cobranca" "modalidade_cobranca" NOT NULL DEFAULT 'PAGO';

-- AlterTable
ALTER TABLE "tarefas_projetos" ADD COLUMN     "horas_estimadas" DECIMAL(6,2) NOT NULL DEFAULT 0,
ADD COLUMN     "horas_gastas" DECIMAL(6,2) NOT NULL DEFAULT 0;
