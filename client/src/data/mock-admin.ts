// Dados de exemplo do painel — substituídos pela API quando NEXT_PUBLIC_USE_MOCKS="false".
import type { ProjetoResumo, TicketResumo } from '@/lib/admin-types';

export const mockTickets: TicketResumo[] = [
  { id: 12, cliente_nome: 'Mariana Souza', empresa_nome: 'Clínica Vida', ideia_inicial: 'Sistema de agendamento online com lembretes automáticos.', orcamento_previo_cliente: 'R$ 5.000 – R$ 15.000', status: 'NOVO', created_at: '2026-11-06T14:20:00Z' },
  { id: 11, cliente_nome: 'Carlos Lima', empresa_nome: null, ideia_inicial: 'Landing page para lançamento de curso.', orcamento_previo_cliente: 'Até R$ 2.000', status: 'NOVO', created_at: '2026-11-05T09:10:00Z' },
  { id: 10, cliente_nome: 'Ana Ribeiro', empresa_nome: 'Transportes AR', ideia_inicial: 'Controle de frota e manutenção dos caminhões.', orcamento_previo_cliente: 'Acima de R$ 15.000', status: 'EM_CONVERSA', created_at: '2026-11-02T18:45:00Z' },
  { id: 9, cliente_nome: 'Pedro Alves', empresa_nome: 'PA Contabilidade', ideia_inicial: 'Portal para clientes enviarem documentos.', orcamento_previo_cliente: 'R$ 2.000 – R$ 5.000', status: 'MVP_EM_ELABORACAO', created_at: '2026-10-28T11:00:00Z' },
  { id: 8, cliente_nome: 'Júlia Castro', empresa_nome: 'Loja JC', ideia_inicial: 'E-commerce com integração ao estoque.', orcamento_previo_cliente: 'R$ 5.000 – R$ 15.000', status: 'MVP_APRESENTADO', created_at: '2026-10-20T16:30:00Z' },
];

export const mockProjetosAdmin: ProjetoResumo[] = [
  { id: 3, nome: 'ERP Interno de Logística', cliente_nome: 'Transportes AR', status: 'EM_ANDAMENTO', progresso: 62, end_date: '2026-12-15', horas_estimadas: 180, horas_gastas: 104 },
  { id: 5, nome: 'Portal do Aluno', cliente_nome: 'Escola Saber', status: 'EM_ANDAMENTO', progresso: 35, end_date: '2027-01-30', horas_estimadas: 120, horas_gastas: 38 },
  { id: 6, nome: 'Dashboard Financeiro', cliente_nome: 'FinPlus', status: 'INATIVO', progresso: 80, end_date: null, horas_estimadas: 60, horas_gastas: 49 },
  { id: 1, nome: 'Plataforma de Agendamentos', cliente_nome: 'Clínica Vida', status: 'CONCLUIDO', progresso: 100, end_date: '2026-09-01', horas_estimadas: 140, horas_gastas: 151 },
];
