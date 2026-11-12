import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import type { Env } from './env.js';
import { zodIssuesToCampos } from './common/validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix('api');
  // O front (Next) chama a API com credentials: 'include' para enviar o cookie HTTP-only do admin.
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }), credentials: true });
  app.use(cookieParser());
  // Valida @Body({ schema }) / @Param(..., { schema }) com Zod (Standard Schema).
  app.useGlobalPipes(new StandardSchemaValidationPipe({ exceptionFactory: zodIssuesToCampos }));
  app.enableShutdownHooks();

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
