'use client';

import { useMemo, useState } from 'react';
import {
  getWorkspaceRbacService,
  type ScimConfig,
} from '@ai-pass/workspace-rbac';
import { ModuleScaffold } from '../../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../../components/workspace/WorkspaceLayoutClient';
import { Button, Card, workspaceTokens } from '@ai-pass/ui';
import styles from './scim.module.css';

export default function ScimSettingsPage() {
  const svc = useMemo(() => getWorkspaceRbacService(), []);
  const [scim, setScim] = useState<ScimConfig | undefined>(() => svc.getScim());
  const [plainToken, setPlainToken] = useState<string | null>(null);

  function enable() {
    const next = svc.enableScim();
    setScim(next);
    setPlainToken(next.token ?? null);
  }

  function disable() {
    setScim(svc.disableScim());
    setPlainToken(null);
  }

  return (
    <WorkspaceLayoutClient title="SCIM" subtitle="Provision users and groups from your IdP">
      <ModuleScaffold
        title="SCIM provisioning"
        description="Provision users and groups through SCIM 2.0. Assigned capabilities still come from Groups — SCIM only syncs membership."
        moduleId="settings-scim"
        icon="link"
        status="done"
        actions={[
          { label: 'Groups', href: '/workspace/people/groups' },
          { label: 'Settings & Governance', href: '/workspace/settings/governance' },
        ]}
      >
        <Card padding="md" className={styles.card}>
          <div className={styles.row}>
            <div>
              <strong style={{ color: workspaceTokens.colors.text }}>
                Status: {scim?.enabled ? 'Enabled' : 'Disabled'}
              </strong>
              <p className={styles.muted}>Base URL</p>
              <code className={styles.code}>{typeof window !== 'undefined' ? `${window.location.origin}/scim/v2` : '/scim/v2'}</code>
            </div>
            <div className={styles.actions}>
              {scim?.enabled ? (
                <Button variant="ghost" onClick={disable}>
                  Disable
                </Button>
              ) : (
                <Button variant="primary" onClick={enable}>
                  Generate token
                </Button>
              )}
            </div>
          </div>

          {plainToken && (
            <div className={styles.tokenBox}>
              <p>Copy this bearer token now — it will not be shown again:</p>
              <code className={styles.code}>{plainToken}</code>
            </div>
          )}

          {scim?.enabled && scim.tokenHint && !plainToken && (
            <p className={styles.muted}>Active token hint: {scim.tokenHint}</p>
          )}
        </Card>

        <h3 className={styles.sectionTitle}>IdP setup</h3>
        <ol className={styles.steps}>
          <li>Generate a SCIM bearer token above (or via <code>POST /api/v1/orgs/&#123;org&#125;/scim/enable</code>).</li>
          <li>Set the IdP SCIM base URL to <code>/scim/v2</code> on your auth API host.</li>
          <li>Map IdP groups to AI-Pass groups; assign capabilities in People → Groups.</li>
          <li>Users are linked by email; groups use SCIM <code>displayName</code> / <code>externalId</code>.</li>
        </ol>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
