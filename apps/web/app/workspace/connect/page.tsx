'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import {
  CONNECT_CATALOG,
  CONNECTOR_CATEGORIES,
  type CatalogConnector,
  type ConnectorCategory,
} from '../../lib/connect-catalog';
import styles from './connect.module.css';

type Connected = {
  id: string;
  name: string;
  kind: string;
  at: string;
};

export default function ConnectPlatformPage() {
  const [category, setCategory] = useState<ConnectorCategory | 'all'>('all');
  const [selected, setSelected] = useState<CatalogConnector | null>(null);
  const [connected, setConnected] = useState<Connected[]>([]);
  const [doneMsg, setDoneMsg] = useState('');
  const [apiName, setApiName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const list = useMemo(
    () =>
      CONNECT_CATALOG.filter((c) => (category === 'all' ? true : c.category === category)),
    [category],
  );

  function connectCatalogItem(item: CatalogConnector) {
    setSelected(item);
    setDoneMsg('');
  }

  function finishConnect() {
    if (!selected) return;
    const entry: Connected = {
      id: `${selected.id}-${Date.now()}`,
      name: selected.name,
      kind: selected.category,
      at: new Date().toLocaleString(),
    };
    setConnected((prev) => [entry, ...prev]);
    setDoneMsg(`${selected.name} is connected. Data can sync into your digital twin.`);
    setSelected(null);
  }

  function addCustomApi(e: React.FormEvent) {
    e.preventDefault();
    if (!apiName.trim() || !apiUrl.trim()) return;
    const entry: Connected = {
      id: `custom-${Date.now()}`,
      name: apiName.trim(),
      kind: 'custom API',
      at: new Date().toLocaleString(),
    };
    setConnected((prev) => [entry, ...prev]);
    setDoneMsg(`${apiName.trim()} is connected at ${apiUrl.trim()}.`);
    setApiName('');
    setApiUrl('');
    setApiKey('');
  }

  return (
    <WorkspaceLayoutClient
      title="Connect"
      subtitle="Attach your apps and APIs in three steps — feed the twin, then use agents."
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <h2>Use the platform in 3 steps</h2>
          <p>
            Pick a connector or paste your API. AI-Pass syncs into your digital twin. Agents then
            work on real company context — not empty chat.
          </p>
        </section>

        <section className={styles.steps} aria-label="How to use Connect">
          <article className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <h3>Connect</h3>
            <p>Choose SAP, Salesforce, SharePoint, or add your own REST URL.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <h3>Sync to twin</h3>
            <p>People, apps, and records land in one twin with your rules.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <h3>Use agents</h3>
            <p>
              Open{' '}
              <Link href="/workspace/playground" className={styles.btnGhost} style={{ minHeight: 28, padding: '0 0.6rem' }}>
                Playground
              </Link>{' '}
              or solutions — they already see the twin.
            </p>
          </article>
        </section>

        {doneMsg ? <div className={styles.success}>{doneMsg}</div> : null}

        <section className={styles.panel}>
          <h3>1) Pick a connector</h3>
          <div className={styles.tabs} role="tablist" aria-label="Connector categories">
            {CONNECTOR_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={category === c.id ? styles.tabActive : styles.tab}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            {list.map((item) => (
              <article key={item.id} className={styles.card}>
                <span className={styles.badge}>
                  {item.status === 'bring_your_own' ? 'Your API' : item.status}
                </span>
                <h4>{item.name}</h4>
                <p>{item.summary}</p>
                <p className={styles.meta}>Feeds twin: {item.twinFeed}</p>
                <button type="button" className={styles.btn} onClick={() => connectCatalogItem(item)}>
                  Connect
                </button>
              </article>
            ))}
          </div>
        </section>

        {selected ? (
          <section className={styles.panel} aria-labelledby="confirm-connect">
            <h3 id="confirm-connect">Confirm: {selected.name}</h3>
            <p className={styles.meta} style={{ marginBottom: '0.75rem' }}>
              Auth: {selected.auth.join(', ')} · Twin feed: {selected.twinFeed}
            </p>
            <p style={{ margin: '0 0 1rem', color: '#5c5f6b', lineHeight: 1.5 }}>
              In production you sign in once (OAuth or API key). For this workspace demo, click
              Connect now to attach it to your twin.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className={styles.btn} onClick={finishConnect}>
                Connect now
              </button>
              <button type="button" className={styles.btnGhost} onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </section>
        ) : null}

        <section className={styles.panel}>
          <h3>Or add your own API (1 minute)</h3>
          <form className={styles.form} onSubmit={addCustomApi}>
            <div className={styles.formRow}>
              <label htmlFor="api-name">Name</label>
              <input
                id="api-name"
                value={apiName}
                onChange={(e) => setApiName(e.target.value)}
                placeholder="e.g. Inventory API"
                required
              />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="api-url">Base URL</label>
              <input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.yourcompany.com/v1"
                required
              />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="api-key">API key (optional for demo)</label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Stored in your workspace vault"
              />
            </div>
            <button type="submit" className={styles.btn}>
              Add API
            </button>
          </form>
        </section>

        <section className={styles.panel}>
          <h3>Connected to your twin</h3>
          {connected.length === 0 ? (
            <p className={styles.meta}>Nothing connected yet. Pick a connector above.</p>
          ) : (
            <div className={styles.connected}>
              {connected.map((c) => (
                <div key={c.id} className={styles.connectedItem}>
                  <div>
                    <strong>{c.name}</strong>
                    <span>
                      {c.kind} · {c.at}
                    </span>
                  </div>
                  <span className={styles.statusOk}>Syncing</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/workspace/knowledge" className={styles.btnGhost}>
              View twin knowledge
            </Link>
            <Link href="/workspace/playground" className={styles.btn}>
              Try agents now
            </Link>
          </div>
        </section>
      </div>
    </WorkspaceLayoutClient>
  );
}
