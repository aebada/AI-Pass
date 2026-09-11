'use client';

import { useState } from 'react';
import type { OrgMembershipPolicy } from '@ai-pass/shared';
import { defaultMembershipService } from '@ai-pass/membership';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from './org-settings.module.css';

const DEMO_POLICY: OrgMembershipPolicy = {
  orgId: 'org-demo',
  defaultTier: 'professional',
  allowedProviders: ['openai', 'anthropic', 'gemini', 'mistral'],
  blockedModels: [],
  monthlyBudgetUsd: 10000,
  perUserDailyLimit: 200,
  requireApprovalAboveUsd: 500,
};

export default function OrgSettingsPage() {
  const [policy, setPolicy] = useState<OrgMembershipPolicy>(DEMO_POLICY);

  const savePolicy = () => {
    defaultMembershipService.setOrgPolicy(policy);
  };

  return (
    <WorkspaceLayoutClient
      title="Organization AI Policy"
      subtitle="Enterprise scaffold - quotas, allowed providers, model restrictions, budget controls"
    >
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Provider restrictions</h2>
          <p className={styles.hint}>Limit which providers org members can route through Provider Hub.</p>
          <textarea
            className={styles.textarea}
            rows={4}
            value={policy.allowedProviders.join(', ')}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                allowedProviders: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              }))
            }
          />
        </section>

        <section className={styles.card}>
          <h2>Blocked models</h2>
          <p className={styles.hint}>Model IDs denied by governance (comma-separated).</p>
          <textarea
            className={styles.textarea}
            rows={4}
            value={policy.blockedModels.join(', ')}
            onChange={(e) =>
              setPolicy((p) => ({
                ...p,
                blockedModels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              }))
            }
          />
        </section>

        <section className={styles.card}>
          <h2>Budget controls</h2>
          <label className={styles.field}>
            Monthly org budget (USD)
            <input
              type="number"
              value={policy.monthlyBudgetUsd ?? ''}
              onChange={(e) =>
                setPolicy((p) => ({ ...p, monthlyBudgetUsd: Number(e.target.value) || null }))
              }
            />
          </label>
          <label className={styles.field}>
            Per-user daily request limit
            <input
              type="number"
              value={policy.perUserDailyLimit ?? ''}
              onChange={(e) =>
                setPolicy((p) => ({ ...p, perUserDailyLimit: Number(e.target.value) || null }))
              }
            />
          </label>
          <label className={styles.field}>
            Require approval above (USD)
            <input
              type="number"
              value={policy.requireApprovalAboveUsd ?? ''}
              onChange={(e) =>
                setPolicy((p) => ({ ...p, requireApprovalAboveUsd: Number(e.target.value) || null }))
              }
            />
          </label>
        </section>
      </div>

      <button type="button" className={styles.saveBtn} onClick={savePolicy}>
        Save org policy (demo)
      </button>

      <p className={styles.note}>
        Flutter and Tauri clients will consume <code>OrgMembershipPolicy</code> from{' '}
        <code>@ai-pass/shared</code> - see docs/UNIVERSAL-MEMBERSHIP.md.
      </p>
    </WorkspaceLayoutClient>
  );
}
