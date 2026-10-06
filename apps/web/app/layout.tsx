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

const themeBoot = `(function(){try{var p=location.pathname||'';var marketing=p==='/'||/^\\/(demo|partners|solutions|about|research|trust)(\\/|$)/.test(p);if(marketing){document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light';return;}var t=localStorage.getItem('ai-pass:theme')||'light';var r=t==='dark'?'dark':t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):'light';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='light';}})();`;

const marketingContrastCss = `
html,body{background:#ffffff;color:#16171a;font-family:Arial,Helvetica,sans-serif;font-synthesis:none;-webkit-text-stroke:0;text-shadow:none;}
a[class*="btnPrimary"],button[class*="submit"],button[class*="btnPrimary"]{background:#5025d1!important;color:#ffffff!important;border-color:#5025d1!important;}
a[class*="btnSecondary"],button[class*="btnSecondary"]{background:#ffffff!important;color:#16171a!important;border:2px solid #16171a!important;}
a[class*="btnGhost"],button[class*="btnGhost"]{color:#16171a!important;}
h1,h2,h3,label,p{color:inherit;}
input,select,textarea{color:#16171a!important;background:#ffffff!important;}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <style dangerouslySetInnerHTML={{ __html: marketingContrastCss }} />
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
