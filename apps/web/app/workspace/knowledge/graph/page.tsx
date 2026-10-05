'use client';

import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';
import { DemoStudio } from '../../../demo/DemoStudio';

export default function KnowledgeGraphPage() {
  return (
    <WorkspaceLayoutClient
      title="Knowledge Graph"
      subtitle="Nodes, attributes, metadata, and role-based deterministic paths"
    >
      <KnowledgeShell>
        <DemoStudio />
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
