import ContactTitle from './ContactTitle';
import TicketForm from './TicketForm';
import { getContent } from '@/lib/content';

export default async function ContactSection() {
  const content = await getContent();
  const form = content.textos_secoes.ticket_form;

  return (
    <section id="contato" className="border-t px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-brand uppercase">Contato</p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <ContactTitle text={form.titulo} />
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">{form.descricao}</p>
        </div>

        <TicketForm config={content.formulario_contato} />
      </div>
    </section>
  );
}
