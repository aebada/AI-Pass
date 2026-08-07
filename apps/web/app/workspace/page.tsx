'use client';

import { WorkspaceHome } from '../components/workspace/WorkspaceHome';
import { WorkspaceLayoutClient } from '../components/workspace/WorkspaceLayoutClient';

export default function WorkspacePage() {
  return (
    <WorkspaceLayoutClient title="Workspace" subtitle="AI applications, trust scores, and operating overview">
      <WorkspaceHome />
    </WorkspaceLayoutClient>
  );
}
