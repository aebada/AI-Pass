'use client';

import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { ModelHubNav } from './components/ModelHubShell';
import styles from './model-hub.module.css';

export default function ModelHubLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceLayoutClient title="Model Hub" subtitle="One workspace. One membership. One AI wallet. All AI models.">
      <div className={styles.shell}>
        <ModelHubNav />
        {children}
      </div>
    </WorkspaceLayoutClient>
  );
}
