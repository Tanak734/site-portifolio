import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getContent } from '@/lib/content';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const { perfil } = await getContent();
  const title = `${perfil.marca} — ${perfil.cargo}`;
  return {
    title,
    description: perfil.subheadline,
    openGraph: { title, description: perfil.subheadline, type: 'website' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf6f1' },
    { media: '(prefers-color-scheme: dark)', color: '#110d0a' },
  ],
};

// Aplica o tema antes da primeira pintura (evita "piscar"): escolha salva > preferência do sistema.
const THEME_SCRIPT = `try{var t=localStorage.getItem('tema');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add('dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
