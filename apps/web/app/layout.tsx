import type React from 'react';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from './components/premium/AppProviders';
import { OnboardingModal } from './components/premium/OnboardingModal';

// NODE_STANDALONE_FORCE_DYNAMIC (patched during build-node-prod.sh)
export const dynamic = 'force-dynamic';

const siteUrl = 'https://aipass.space';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'AI-Pass — One workspace for every AI model',
  description:
    'AI-Pass gives enterprise teams one membership to run models, agents, and business apps with shared governance and billing.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    url: siteUrl,
    siteName: 'AI-Pass',
    title: 'AI-Pass — One workspace for every AI model',
    description:
      'AI-Pass gives enterprise teams one membership to run models, agents, and business apps with shared governance and billing.',
    type: 'website',
    images: [{ url: '/logo.png', alt: 'AI-Pass' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Pass — One workspace for every AI model',
    description:
      'AI-Pass gives enterprise teams one membership to run models, agents, and business apps with shared governance and billing.',
  },
  appleWebApp: {
    capable: true,
    title: 'AI-Pass',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d1117',
  width: 'device-width',
  initialScale: 1,
};

const themeBootScript = `(function(){try{var t=localStorage.getItem('ai-pass:theme')||'dark';var r=t==='light'?'light':t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'dark';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

/** Critical theme tokens inlined so the site stays readable even if CDN serves a bad CSS response. */
const criticalThemeCss = `:root,[data-theme='dark']{--bg:#0d1117;--bg-elevated:#161b22;--bg-hover:#21262d;--bg-soft:#11161d;--border:#30363d;--text:#e6edf3;--text-muted:#8b949e;--color-accent:#3b82f6;--accent:var(--color-accent);--accent-muted:#2563eb;--font-display:'Syne','IBM Plex Sans',sans-serif;--font-sans:'IBM Plex Sans','Segoe UI',sans-serif;--font-mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:dark}[data-theme='light']{--bg:#f7f8fa;--bg-elevated:#ffffff;--bg-hover:#eef1f5;--bg-soft:#eef2f7;--border:#d0d7de;--text:#1f2328;--text-muted:#656d76;--color-accent:#2563eb;--accent:var(--color-accent);--accent-muted:#1d4ed8;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:light}html,body{min-height:100%;background-color:#0d1117;background-color:var(--bg);color:#e6edf3;color:var(--text);font-family:var(--font-sans)}h1,h2,h3{font-family:var(--font-display)}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: criticalThemeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
          <OnboardingModal />
        </AppProviders>
      </body>
    </html>
  );
}
