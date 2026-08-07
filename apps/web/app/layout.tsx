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
  title: 'AI-Pass — Enterprise AI Infrastructure Platform',
  description:
    'Build, orchestrate, govern and deploy enterprise AI securely across cloud and on-premises. Secure AI infrastructure for Government, Defence, and regulated enterprise operations.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo-icon.svg',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    url: siteUrl,
    siteName: 'AI-Pass',
    title: 'AI-Pass — Enterprise AI Infrastructure Platform',
    description:
      'Enterprise AI infrastructure for secure, governed and autonomous business operations — cloud, private cloud, hybrid, and air-gapped.',
    type: 'website',
    images: [{ url: '/brand-banner.png', alt: 'AI-Pass' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Pass — Enterprise AI Infrastructure Platform',
    description:
      'Secure, governed enterprise AI infrastructure across cloud and on-premises. Built for Government, Defence, and regulated industries.',
    images: ['/brand-banner.png'],
  },
  appleWebApp: {
    capable: true,
    title: 'AI-Pass',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0d10',
  width: 'device-width',
  initialScale: 1,
};

const themeBootScript = `(function(){try{var t=localStorage.getItem('ai-pass:theme')||'dark';var r=t==='light'?'light':t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'dark';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

const criticalThemeCss = `:root,[data-theme='dark']{--bg:#0b0d10;--bg-elevated:#12151a;--bg-hover:#1a1f27;--bg-soft:#0f1217;--border:#2a3038;--text:#f2f4f7;--text-muted:#9aa3ad;--color-accent:#3b82f6;--accent:var(--color-accent);--accent-muted:#2563eb;--font-display:'Syne','IBM Plex Sans',sans-serif;--font-sans:'IBM Plex Sans','Segoe UI',sans-serif;--font-mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:dark}[data-theme='light']{--bg:#f7f8fa;--bg-elevated:#ffffff;--bg-hover:#eef1f5;--bg-soft:#eef1f4;--border:#d8dee6;--text:#101418;--text-muted:#5c6670;--color-accent:#2563eb;--accent:var(--color-accent);--accent-muted:#1d4ed8;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:light}html,body{min-height:100%;background-color:#0b0d10;background-color:var(--bg);color:#f2f4f7;color:var(--text);font-family:var(--font-sans)}h1,h2,h3{font-family:var(--font-display)}`;

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
