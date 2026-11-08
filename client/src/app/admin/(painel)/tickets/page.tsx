import EmConstrucao from '@/components/admin/EmConstrucao';

export default function TicketsPage() {
  return (
    <EmConstrucao
      title="Tickets"
      description="Funil de pré-venda: triagem, conversa e MVP."
      itens={[
        'Kanban por status (Novo → Em conversa → MVP → Convertido / Desistência)',
        'Notas da conversa, resumo do MVP e link do protótipo',
        'Botão "Converter em Cliente + Projeto" (transação atômica)',
      ]}
    />
  );
}
