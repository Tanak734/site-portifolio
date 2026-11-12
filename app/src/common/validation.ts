import { BadRequestException, type StandardSchemaValidationPipeOptions } from '@nestjs/common';

type Issues = Parameters<NonNullable<StandardSchemaValidationPipeOptions['exceptionFactory']>>[0];

/**
 * Erro 400 no formato que o front já usa no editor do admin:
 * { message, campos: { "caminho.do.campo": "mensagem" } }.
 */
export function zodIssuesToCampos(issues: Issues) {
  const campos: Record<string, string> = {};
  for (const issue of issues) {
    const path = (issue.path ?? []).map((p) => (typeof p === 'object' ? p.key : p)).join('.');
    campos[path || '_'] ??= issue.message;
  }
  return new BadRequestException({ message: 'Há campos inválidos.', campos });
}
