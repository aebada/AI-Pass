'use client';

import { WorkspaceHome } from '../components/workspace/WorkspaceHome';
import { WorkspaceLayoutClient } from '../components/workspace/WorkspaceLayoutClient';

export default function WorkspacePage() {
  return (
    <WorkspaceLayoutClient title="Workspace" subtitle="AI Operating System — overview and quick actions">
      <WorkspaceHome />
    </WorkspaceLayoutClient>
  );
}
