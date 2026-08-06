'use client';

import dynamic from 'next/dynamic';
import '@/src/styles/global.css';

const IdeWorkspace = dynamic(() => import('@/src/IdeWorkspace').then((m) => m.IdeWorkspace), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e1e1e',
        color: '#cccccc',
      }}
    >
      Loading AI Pass Platform...
    </div>
  ),
});

export default function IdePage() {
  return <IdeWorkspace />;
}
