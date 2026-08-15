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
  themeColor: '#f6f3eb',
  width: 'device-width',
  initialScale: 1,
};

const themeBootScript = `(function(){try{var t=localStorage.getItem('ai-pass:theme')||'light';var r=t==='dark'?'dark':t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):'light';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='light';}})();`;

const criticalThemeCss = `:root,[data-theme='light']{--bg:#f6f3eb;--bg-elevated:#ffffff;--bg-hover:#efece4;--bg-soft:#ebe8e0;--border:#d6d2c8;--text:#1f1f1f;--text-muted:#727272;--color-accent:#343ced;--accent:var(--color-accent);--accent-muted:#131bd4;--accent-deep:#1e2287;--highlight:#d8fd49;--font-display:'Space Grotesk','DM Sans',sans-serif;--font-sans:'DM Sans','Segoe UI',sans-serif;--font-mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:light}[data-theme='dark']{--bg:#0a0227;--bg-elevated:#12103a;--bg-hover:#1a1750;--bg-soft:#0e0a32;--border:#2a2760;--text:#f7f7f5;--text-muted:#a8a6b8;--color-accent:#535bff;--accent:var(--color-accent);--accent-muted:#343ced;--highlight:#d8fd49;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:dark}html,body{min-height:100%;background-color:#f6f3eb;background-color:var(--bg);color:#1f1f1f;color:var(--text);font-family:var(--font-sans)}h1,h2,h3{font-family:var(--font-display)}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@500;600;700&display=swap"
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
