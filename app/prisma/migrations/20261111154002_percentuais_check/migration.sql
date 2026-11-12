-- Percentuais da calculadora sempre válidos (o Prisma não expressa CHECK)
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_desconto_percentual_check" CHECK ("desconto_percentual" >= 0 AND "desconto_percentual" <= 100);
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_impostos_percentual_check" CHECK ("impostos_percentual" >= 0 AND "impostos_percentual" < 100);
