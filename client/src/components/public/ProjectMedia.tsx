import { Lock } from 'lucide-react';
import type { ProjetoPublico } from '@/lib/types';

/** Converte links do YouTube em URL de embed; null se não for YouTube. */
function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : null;
}

/** Mídia do projeto. `video` = tenta mostrar o vídeo (usado no modal). */
export default function ProjectMedia({ projeto: p, video = false }: { projeto: ProjetoPublico; video?: boolean }) {
  const confidencial = p.is_confidencial;

  if (video && p.video_url && !confidencial) {
    const yt = youtubeEmbed(p.video_url);
    return yt ? (
      <iframe
        src={yt}
        title={`Vídeo de ${p.nome}`}
        className="size-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <video src={p.video_url} className="size-full object-cover" controls autoPlay muted loop playsInline />
    );
  }

  if (p.imagem_url && !confidencial) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.imagem_url} alt={p.nome} loading="lazy" className="size-full object-cover" />;
  }

  return (
    <div className="grid size-full place-items-center bg-secondary">
      {confidencial ? (
        <Lock className="size-7 text-subtle" aria-hidden="true" />
      ) : (
        <span className="font-mono text-sm text-subtle">{p.categoria_projeto ?? 'Projeto'}</span>
      )}
    </div>
  );
}
