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
  themeColor: '#141413',
  width: 'device-width',
  initialScale: 1,
};

const themeBootScript = `(function(){try{var t=localStorage.getItem('ai-pass:theme')||'dark';var r=t==='light'?'light':t==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'dark';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

/** Critical theme tokens inlined so the site stays readable even if CDN serves a bad CSS response. */
const criticalThemeCss = `:root,[data-theme='dark']{--bg:#141413;--bg-elevated:#1c1b19;--bg-hover:#262521;--border:#3d3d3a;--text:#faf9f5;--text-muted:#b0aea5;--accent:#d97757;--accent-muted:#c96442;--font-sans:'DM Sans',system-ui,sans-serif;--font-display:'Newsreader',Georgia,serif;--ai-bg:var(--bg);--ai-text:var(--text);--ai-accent:var(--accent);color-scheme:dark}[data-theme='light']{--bg:#faf9f5;--bg-elevated:#f0eee6;--bg-hover:#e8e6dc;--border:#d1cfc4;--text:#141413;--text-muted:#5e5d59;--accent:#c96442;--accent-muted:#a84f33;--font-sans:'DM Sans',system-ui,sans-serif;--font-display:'Newsreader',Georgia,serif;--ai-bg:var(--bg);--ai-text:var(--text);--ai-accent:var(--accent);color-scheme:light}html,body{min-height:100%;background-color:#141413;background-color:var(--bg);color:#faf9f5;color:var(--text);font-family:var(--font-sans)}h1,h2,h3{font-family:var(--font-display);font-weight:500}`;

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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&display=swap"
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
