import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './env.js';
import { HealthModule } from './module/health/health.module.js';
import { PrismaModule } from './module/prisma/prisma.module.js';

// Módulos de domínio (auth, site-config, public, tickets...) entram aqui conforme
// o roteiro de docs/back/docs-backend.md §7.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
