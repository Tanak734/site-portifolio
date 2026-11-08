// Leitura dos dados públicos da Home (executa no servidor — Server Components).
// NEXT_PUBLIC_USE_MOCKS="true" usa src/data/mock.ts enquanto o backend não existe.
import { cacheLife } from 'next/cache';
import { apiFetch } from './api';
import { USE_MOCKS } from './flags';
import { mockAvaliacoes, mockProjetos } from '@/data/mock';
import type { AvaliacaoPublica, ProjetoPublico } from './types';

export async function getProjetosPublicos(): Promise<ProjetoPublico[]> {
  'use cache';
  cacheLife('minutes');
  if (USE_MOCKS) return [...mockProjetos].sort((a, b) => a.ordem - b.ordem);
  try {
    return await apiFetch<ProjetoPublico[]>('/api/public/projetos');
  } catch (e) {
    console.error('[public-api] projetos:', e);
    return []; // a seção some em vez de quebrar a página
  }
}

export async function getAvaliacoesPublicas(): Promise<AvaliacaoPublica[]> {
  'use cache';
  cacheLife('minutes');
  if (USE_MOCKS) return mockAvaliacoes;
  try {
    return await apiFetch<AvaliacaoPublica[]>('/api/public/avaliacoes');
  } catch (e) {
    console.error('[public-api] avaliacoes:', e);
    return [];
  }
}
