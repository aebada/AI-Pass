'use client';

import { useMemo, useState } from 'react';
import {
  PROVIDER_DEFINITIONS,
  MODEL_CATALOG,
  createProviderHub,
  type AuthMode,
  type HubProviderId,
} from '@ai-pass/provider-hub';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './providers.module.css';

export default function ProvidersPage() {
  const [search, setSearch] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('hybrid');
  const [selectedProvider, setSelectedProvider] = useState<HubProviderId | null>(null);
  const [byokKeys, setByokKeys] = useState<Record<string, string>>({});

  const hub = useMemo(() => createProviderHub(), []);
  const health = useMemo(() => hub.health.checkAll(), [hub]);

  const models = useMemo(
    () => hub.catalog.search({ query: search, providerId: selectedProvider ?? undefined }),
    [hub, search, selectedProvider],
  );

  return (
    <WorkspaceLayoutClient
      title="Provider Hub"
      subtitle="Model catalog browser, provider health, and BYOK settings"
    >
      <section className={styles.authSection}>
        <h2 className={styles.sectionTitle}>Authentication mode</h2>
        <div className={styles.authModes}>
          {(['managed', 'byok', 'hybrid'] as AuthMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`${styles.authBtn} ${authMode === mode ? styles.authBtnActive : ''}`}
              onClick={() => setAuthMode(mode)}
            >
              <strong>{mode === 'managed' ? 'AI-Pass Managed' : mode === 'byok' ? 'Bring Your Own Key' : 'Hybrid'}</strong>
              <span>
                {mode === 'managed'
                  ? 'Keys managed by AI-Pass membership'
                  : mode === 'byok'
                    ? 'Use your provider API keys'
                    : 'Managed default, BYOK override per provider'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className={styles.grid}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sectionTitle}>Providers ({PROVIDER_DEFINITIONS.length})</h2>
          <button
            type="button"
            className={`${styles.providerBtn} ${!selectedProvider ? styles.providerBtnActive : ''}`}
            onClick={() => setSelectedProvider(null)}
          >
            All providers
          </button>
          {PROVIDER_DEFINITIONS.map((p) => {
            const h = health.find((x) => x.providerId === p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.providerBtn} ${selectedProvider === p.id ? styles.providerBtnActive : ''}`}
                onClick={() => setSelectedProvider(p.id)}
              >
                <span className={styles.providerName}>{p.name}</span>
                <span className={`${styles.health} ${styles[`health_${h?.status ?? 'healthy'}`]}`}>
                  {h?.status ?? 'healthy'} · {h?.latencyMs}ms
                </span>
              </button>
            );
          })}
        </aside>

        <section className={styles.catalog}>
          <div className={styles.catalogHeader}>
            <h2 className={styles.sectionTitle}>Model Catalog ({MODEL_CATALOG.length} models)</h2>
            <input
              className={styles.search}
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.modelGrid}>
            {models.map((m) => (
              <article key={m.id} className={styles.modelCard}>
                <div className={styles.modelCardTop}>
                  <h3>{m.displayName}</h3>
                  <span className={styles.tier}>{m.tier}</span>
                </div>
                <p className={styles.modelDesc}>{m.description}</p>
                <dl className={styles.modelStats}>
                  <div><dt>Provider</dt><dd>{m.providerName}</dd></div>
                  <div><dt>Context</dt><dd>{(m.contextLength / 1000).toFixed(0)}K</dd></div>
                  <div><dt>Speed</dt><dd>{m.speed}</dd></div>
                  <div><dt>Quality</dt><dd>{m.quality}</dd></div>
                  <div><dt>Input</dt><dd>${m.inputCostPer1M}/1M</dd></div>
                  <div><dt>Output</dt><dd>${m.outputCostPer1M}/1M</dd></div>
                </dl>
                <div className={styles.useCases}>
                  {m.bestUseCases.map((u) => (
                    <span key={u} className={styles.tag}>{u}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {(authMode === 'byok' || authMode === 'hybrid') && (
        <section className={styles.byok}>
          <h2 className={styles.sectionTitle}>BYOK API Keys</h2>
          <p className={styles.byokNote}>Keys are stored locally in this demo. Never commit API keys to source control.</p>
          <div className={styles.byokGrid}>
            {PROVIDER_DEFINITIONS.filter((p) => p.authModes.includes('byok')).slice(0, 6).map((p) => (
              <label key={p.id} className={styles.byokField}>
                <span>{p.name}</span>
                <input
                  type="password"
                  placeholder={`${p.name} API key`}
                  value={byokKeys[p.id] ?? ''}
                  onChange={(e) => setByokKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        </section>
      )}
    </WorkspaceLayoutClient>
  );
}
