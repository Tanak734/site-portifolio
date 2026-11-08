import { tomDaCor } from '@/lib/tech-icon-color';

/**
 * Logo SVG da tecnologia.
 * - Sem `colorido`: monocromático, herda a cor do texto.
 * - Com `colorido`: cor oficial da marca (ajustada por tema via .tech-cor no globals.css).
 * Sem path → fallback skillicons em escala de cinza.
 */
export default function TechIcon({
  path,
  hex,
  slug,
  colorido = false,
  className = 'size-5',
}: {
  path: string | null;
  hex?: string | null;
  slug?: string | null;
  colorido?: boolean;
  className?: string;
}) {
  if (path) {
    const cor = colorido && hex;
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${className} ${cor ? 'tech-cor' : ''}`}
        style={cor ? ({ '--c': hex } as React.CSSProperties) : undefined}
        data-tom={cor ? tomDaCor(hex) ?? undefined : undefined}
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    );
  }
  if (slug)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://skillicons.dev/icons?i=${slug}`} alt="" className={`${className} grayscale opacity-70`} loading="lazy" />;
  return null;
}
