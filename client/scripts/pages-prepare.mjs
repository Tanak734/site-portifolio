// Prepara o código para o export estático do GitHub Pages. RODA SÓ NO CI:
// apaga o admin e altera arquivos do src (o checkout do CI é descartável).
//
// Por quê:
//  - O admin usa Server Actions e cookies → não existe em site estático.
//  - Cache Components ('use cache', cacheLife, cacheTag) liga o PPR, que o Next não
//    aceita com output: 'export'. No Pages tudo é gerado uma vez no build, então o
//    cache não faz falta: tiramos as diretivas e as chamadas.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

if (!process.env.CI && !process.argv.includes('--force')) {
  console.error('pages-prepare: este script apaga e altera arquivos do src. Rode só no CI (ou use --force).');
  process.exit(1);
}

for (const dir of ['src/app/admin', 'src/components/admin']) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`removido ${dir}`);
}

const FILES = ['src/lib/content.ts', 'src/lib/public-api.ts', 'src/components/public/Footer.tsx'];
for (const file of FILES) {
  if (!existsSync(file)) continue;
  const before = readFileSync(file, 'utf8');
  const after = before
    .replace(/^\s*'use cache';.*\n/gm, '')
    .replace(/^\s*cache(Life|Tag)\([^)]*\);.*\n/gm, '')
    .replace(/^import \{[^}]*\} from 'next\/cache';\n/gm, '');
  writeFileSync(file, after);
  console.log(`${file}: ${before === after ? 'sem mudanças' : 'cache removido'}`);
}
