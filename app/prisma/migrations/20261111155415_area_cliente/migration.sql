-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "portal_ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "token_portal" VARCHAR(64) NOT NULL DEFAULT md5(((random())::text || (clock_timestamp())::text));

-- CreateIndex
CREATE UNIQUE INDEX "clientes_token_portal_key" ON "clientes"("token_portal");

