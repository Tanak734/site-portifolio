import ContactChannels, { type Channel } from './ContactChannels';
import ContactTitle from './ContactTitle';
import TicketForm from './TicketForm';
import { getContent, emailAddress, emailLink } from '@/lib/content';

export default async function ContactSection() {
  const content = await getContent();
  const { links_sociais, textos_secoes } = content;
  const form = textos_secoes.ticket_form;
  const direto = textos_secoes.contato;

  const find = (icone: string) => links_sociais.find((l) => l.icone === icone);
  const mail = emailLink(content);
  const email = emailAddress(content);
  const linkedin = find('linkedin');
  const github = find('github');

  const channels = [
    mail && email && { icone: 'mail', nome: 'E-mail', detalhe: email, url: mail.url, copiar: email, primario: true },
    linkedin && { icone: 'linkedin', nome: 'LinkedIn', detalhe: 'Conecte-se comigo', url: linkedin.url },
    github && { icone: 'github', nome: 'GitHub', detalhe: 'Veja meu código', url: github.url },
  ].filter(Boolean) as Channel[];

  return (
    <section id="contato" className="border-t px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-brand uppercase">Contato</p>
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <ContactTitle text={form.titulo} />
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">{form.descricao}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <aside>
            <h3 className="font-medium">{direto.titulo}</h3>
            <p className="mt-2 mb-6 text-sm text-muted-foreground">{direto.descricao}</p>
            <ContactChannels channels={channels} />
          </aside>
          <TicketForm />
        </div>
      </div>
    </section>
  );
}
