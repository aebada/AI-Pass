'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  createMetricId,
  getSemanticCatalog,
  type Entity,
  type MetricAggregation,
  type MetricDefinition,
  type MetricStatus,
} from '@ai-pass/semantic-layer';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './semantic.module.css';

const AGGREGATIONS: MetricAggregation[] = ['sum', 'avg', 'count', 'min', 'max', 'ratio', 'custom'];
const STATUSES: MetricStatus[] = ['draft', 'certified', 'deprecated'];

function statusClass(status: MetricStatus): string {
  if (status === 'certified') return styles.badgeCertified;
  if (status === 'deprecated') return styles.badgeDeprecated;
  return styles.badgeDraft;
}

export default function SemanticLayerPage() {
  const catalog = useMemo(() => getSemanticCatalog(), []);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [toast, setToast] = useState('');

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [formula, setFormula] = useState('');
  const [aggregation, setAggregation] = useState<MetricAggregation>('sum');
  const [status, setStatus] = useState<MetricStatus>('draft');
  const [entityId, setEntityId] = useState('');
  const [unit, setUnit] = useState('');

  const refresh = useCallback(() => {
    setMetrics(catalog.listMetrics());
    setEntities(catalog.listEntities());
  }, [catalog]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const entityName = (id?: string) => entities.find((e) => e.id === id)?.name ?? '—';

  const onDefine = (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    const now = new Date().toISOString();
    const name = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const metric: MetricDefinition = {
      id: createMetricId(name || 'metric'),
      name: name || 'metric',
      label: label.trim(),
      description: description.trim() || 'User-defined metric',
      formula: formula.trim() || 'TBD',
      aggregation,
      status,
      entityId: entityId || undefined,
      dimensions: [],
      unit: unit.trim() || undefined,
      owner: 'Workspace user',
      tags: ['user-defined'],
      createdAt: now,
      updatedAt: now,
    };
    catalog.upsertMetric(metric);
    refresh();
    setLabel('');
    setDescription('');
    setFormula('');
    setUnit('');
    setStatus('draft');
    setAggregation('sum');
    showToast(`Defined “${metric.label}”`);
  };

  const resetDemo = () => {
    catalog.resetToDemo();
    refresh();
    showToast('Restored demo semantic catalog');
  };

  return (
    <WorkspaceLayoutClient
      title="Semantic Layer"
      subtitle="Governed business metrics and entities for agents & analytics"
    >
      <div className={styles.shell}>
        <div className={styles.banner}>
          Sits between{' '}
          <Link href="/workspace/knowledge">Knowledge</Link> and{' '}
          <Link href="/workspace/analysis">Analysis</Link> — business meaning over raw knowledge &amp;
          data products. Demo data persists in localStorage.
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{metrics.length}</span>
            <span className={styles.statLabel}>Metrics</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{entities.length}</span>
            <span className={styles.statLabel}>Entities</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {metrics.filter((m) => m.status === 'certified').length}
            </span>
            <span className={styles.statLabel}>Certified</span>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Metrics</h2>
              <button type="button" className={styles.ghostBtn} onClick={resetDemo}>
                Reset demo
              </button>
            </div>
            <div className={styles.list}>
              {metrics.map((m) => (
                <article key={m.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <strong>{m.label}</strong>
                    <span className={`${styles.badge} ${statusClass(m.status)}`}>{m.status}</span>
                  </div>
                  <p className={styles.cardDesc}>{m.description}</p>
                  <div className={styles.meta}>
                    <span>{m.aggregation}</span>
                    <span>{entityName(m.entityId)}</span>
                    {m.unit ? <span>{m.unit}</span> : null}
                  </div>
                  <code className={styles.formula}>{m.formula}</code>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Entities</h2>
            </div>
            <div className={styles.list}>
              {entities.map((ent) => (
                <article key={ent.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <strong>{ent.name}</strong>
                    <span className={`${styles.badge} ${styles.badgeDraft}`}>{ent.kind}</span>
                  </div>
                  <p className={styles.cardDesc}>{ent.description}</p>
                  <div className={styles.meta}>
                    {ent.primaryKey ? <span>PK: {ent.primaryKey}</span> : null}
                    <span>{ent.dimensions.length} dims</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Define metric</h2>
          </div>
          <form className={styles.form} onSubmit={onDefine}>
            <label className={styles.field}>
              <span>Label</span>
              <input
                value={label}
                onChange={(ev) => setLabel(ev.target.value)}
                placeholder="e.g. Gross Margin %"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Description</span>
              <input
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="Business definition"
              />
            </label>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Formula</span>
              <input
                value={formula}
                onChange={(ev) => setFormula(ev.target.value)}
                placeholder="SUM(revenue) - SUM(cogs)"
              />
            </label>
            <label className={styles.field}>
              <span>Aggregation</span>
              <select
                value={aggregation}
                onChange={(ev) => setAggregation(ev.target.value as MetricAggregation)}
              >
                {AGGREGATIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Status</span>
              <select value={status} onChange={(ev) => setStatus(ev.target.value as MetricStatus)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Entity</span>
              <select value={entityId} onChange={(ev) => setEntityId(ev.target.value)}>
                <option value="">None</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Unit</span>
              <input value={unit} onChange={(ev) => setUnit(ev.target.value)} placeholder="USD, %, days" />
            </label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn}>
                Save metric
              </button>
            </div>
          </form>
        </section>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
      </div>
    </WorkspaceLayoutClient>
  );
}
