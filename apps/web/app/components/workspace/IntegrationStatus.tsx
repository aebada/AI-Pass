'use client';

import { useEffect, useState } from 'react';
import { ModuleIcon } from '@ai-pass/ui';
import { INTEGRATIONS } from '@ai-pass/platform-core';
import styles from './integration-status.module.css';

interface IntegrationRow {
  id: string;
  label: string;
  status: 'ok' | 'degraded' | 'unreachable';
  reachable: boolean;
  api_key_configured: boolean;
  remote_api_configured?: boolean | null;
  http_status?: number | null;
}

const LABELS: Record<IntegrationRow['status'], string> = {
  ok: 'Connected',
  degraded: 'Reachable, not connected',
  unreachable: 'Offline',
};

/**
 * Live status for the external ecosystem deployments.
 *
 * Reads through /api/v1/integrations, which is served by the Laravel service —
 * the remotes send no CORS headers, so the browser cannot probe them directly.
 * On a static-only host that route is absent, which is reported as unknown
 * rather than as an outage.
 */
export function IntegrationStatus() {
  const [rows, setRows] = useState<IntegrationRow[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/v1/integrations', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { integrations?: IntegrationRow[] };
        if (!cancelled) setRows(body.integrations ?? []);
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h2 className={styles.sectionLabel}>Integrations</h2>
      <div className={styles.grid}>
        {INTEGRATIONS.map((integration) => {
          const row = rows?.find((r) => r.id === integration.id);

          return (
            <a
              key={integration.id}
              href={integration.url}
              className={styles.card}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.cardTop}>
                <ModuleIcon name={integration.icon} size={18} />
                <strong className={styles.name}>{integration.label}</strong>
                <span
                  className={`${styles.dot} ${
                    row ? styles[row.status] : unavailable ? styles.unknown : styles.pending
                  }`}
                  aria-hidden="true"
                />
              </span>
              <span className={styles.status}>
                {row
                  ? LABELS[row.status]
                  : unavailable
                    ? 'Status unavailable'
                    : 'Checking…'}
              </span>
              <span className={styles.detail}>
                {row && !row.api_key_configured
                  ? 'No API key configured on this platform'
                  : row?.remote_api_configured === false
                    ? 'Remote has no key configured'
                    : integration.description}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
