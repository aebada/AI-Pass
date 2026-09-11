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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
          <OnboardingModal />
        </AppProviders>
      </body>
    </html>
  );
}
