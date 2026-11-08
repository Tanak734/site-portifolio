import EmConstrucao from '@/components/admin/EmConstrucao';

export default function ProjetosPage() {
  return (
    <EmConstrucao
      title="Projetos"
      description="Projetos em andamento, inativos e concluídos."
      itens={[
        'Lista filtrável por status',
        'Hub do projeto com 6 abas: Geral, Requisitos, BI/ADR, Calculadora Jr, Tarefas e Publicação',
        'Link do Portal do Cliente (/status/[token])',
      ]}
    />
  );
}
