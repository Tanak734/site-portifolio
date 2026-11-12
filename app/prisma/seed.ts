// Cria a conta única do admin (idempotente: se o e-mail já existe, não mexe na senha).
// Uso: pnpm db:seed   (lê ADMIN_SEED_* do app/.env)
import { existsSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client.js';

if (existsSync('.env')) process.loadEnvFile('.env');

const { DATABASE_URL, ADMIN_SEED_NOME = 'Admin', ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
  throw new Error('Defina DATABASE_URL, ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD no app/.env');
}
if (ADMIN_SEED_PASSWORD.length < 12) throw new Error('ADMIN_SEED_PASSWORD precisa de pelo menos 12 caracteres');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

try {
  const email = ADMIN_SEED_EMAIL.trim().toLowerCase();
  const existente = await prisma.admin.findUnique({ where: { email } });
  if (existente) {
    console.log(`✓ Admin ${email} já existe — nada alterado.`);
  } else {
    await prisma.admin.create({
      data: { nome: ADMIN_SEED_NOME, email, senha_hash: await argon2.hash(ADMIN_SEED_PASSWORD, { type: argon2.argon2id }) },
    });
    console.log(`✓ Admin ${email} criado.`);
  }
} finally {
  await prisma.$disconnect();
}
