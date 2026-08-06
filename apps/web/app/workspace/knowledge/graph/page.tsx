'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';

/** Legacy Knowledge Pipeline graph stub → dedicated Knowledge Graph module */
export default function KnowledgeGraphRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/workspace/knowledge-graph');
  }, [router]);

  return (
    <WorkspaceLayoutClient title="Knowledge Graph" subtitle="Redirecting…">
      <p style={{ fontSize: 13, color: 'var(--text-muted, #9ca3af)', padding: '1rem 0' }}>
        Moving to the Knowledge Graph module…
      </p>
    </WorkspaceLayoutClient>
  );
}
