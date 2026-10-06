import type React from 'react';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from './components/premium/AppProviders';
import { OnboardingModal } from './components/premium/OnboardingModal';


const siteUrl = 'https://aipass.space';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'AI-Pass — The Enterprise AI Operating System',
  description:
    'The deployment gate for enterprise AI. Human expertise becomes a knowledge graph and organization rules, then specialist agents answer with an audit path.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/logo-icon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    url: siteUrl,
    siteName: 'AI-Pass',
    title: 'AI-Pass — The Enterprise AI Operating System',
    description:
      'One workspace. One membership. Every AI model, agent, and business application — unified under enterprise governance and compliance.',
    type: 'website',
    images: [{ url: '/logo-icon.png', alt: 'AI-Pass' }],
  },
  appleWebApp: {
    capable: true,
    title: 'AI-Pass',
  },
};

export const viewport: Viewport = {
  themeColor: '#673de6',
  width: 'device-width',
  initialScale: 1,
};

const themeBoot = `(function(){try{var t=localStorage.getItem('ai-pass:theme')||'light';var r=t==='dark'?'dark':t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):'light';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
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
