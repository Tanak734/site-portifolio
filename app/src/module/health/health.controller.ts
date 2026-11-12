import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/** GET /api/health — confirma que a API está de pé e alcança o banco. */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'erro', banco: 'indisponível' });
    }
    return { status: 'ok', banco: 'ok', horario: new Date().toISOString() };
  }
}
