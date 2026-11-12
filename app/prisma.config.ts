// Configuração do Prisma CLI (Prisma 7: a URL do banco sai do schema e vem para cá).
import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // `env()` do prisma/config lança erro se a variável não existir, o que quebrava o
  // `prisma generate` do postinstall em ambientes sem banco (ex.: CI do GitHub Pages).
  // O generate não precisa de URL; migrate/push/studio continuam exigindo o DATABASE_URL.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
