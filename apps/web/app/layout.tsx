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
  title: 'AI-Pass - The Enterprise AI Operating System',
  description:
    'One workspace, one membership, every AI model, agent, and business application. AI-Pass unifies models, agents, workflows, governance, compliance, and marketplaces into one secure enterprise platform.',
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
    title: 'AI-Pass - The Enterprise AI Operating System',
    description:
      'One workspace. One membership. Every AI model, agent, and business application - unified under enterprise governance and compliance.',
    type: 'website',
    images: [{ url: '/logo.png', alt: 'AI-Pass' }],
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
const criticalThemeCss = `:root,[data-theme='dark']{--bg:#0d1117;--bg-elevated:#161b22;--bg-hover:#21262d;--border:#30363d;--text:#e6edf3;--text-muted:#8b949e;--accent:#58a6ff;--accent-muted:#1f6feb;--success:#3fb950;--warning:#d29922;--error:#f85149;--font-sans:'Segoe UI',system-ui,-apple-system,BlinkMacSystemFont,sans-serif;--font-mono:ui-monospace,'Cascadia Code','SF Mono',Menlo,monospace;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:dark}[data-theme='light']{--bg:#f6f8fa;--bg-elevated:#ffffff;--bg-hover:#eaeef2;--border:#d0d7de;--text:#1f2328;--text-muted:#656d76;--accent:#0969da;--accent-muted:#0550ae;--success:#1a7f37;--warning:#9a6700;--error:#cf222e;--ai-bg:var(--bg);--ai-bg-elevated:var(--bg-elevated);--ai-bg-hover:var(--bg-hover);--ai-border:var(--border);--ai-text:var(--text);--ai-text-muted:var(--text-muted);--ai-accent:var(--accent);color-scheme:light}html,body{min-height:100%;background-color:#0d1117;background-color:var(--bg);color:#e6edf3;color:var(--text);font-family:var(--font-sans)}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
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
