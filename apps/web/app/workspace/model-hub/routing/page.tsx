'use client';

import { useMemo, useState } from 'react';
import { autoRoute, getModels, type AutoRouteRequest, type RoutingMode } from '@ai-pass/model-hub';
import { selectAutoModel, type AutoComplexity } from '@ai-pass/provider-hub';
import styles from '../model-hub.module.css';

const AUTO_MODES: Array<{ id: AutoComplexity; label: string; blurb: string }> = [
  {
    id: 'fast',
    label: 'Fast',
    blurb: 'Lowest latency with strong value — best cheap/fast model available now.',
  },
  {
    id: 'standard',
    label: 'Standard',
    blurb: 'Best performance-to-price tradeoff, with live multi-provider failover.',
  },
  {
    id: 'complex',
    label: 'Complex',
    blurb: 'Favors frontier capability for hard tasks while still watching cost.',
  },
];

const LEGACY_MODES: RoutingMode[] = [
  'balanced',
  'best_quality',
  'lowest_cost',
  'fastest',
  'most_private',
  'enterprise_safe',
  'manual',
];

export default function RoutingPage() {
  const [autoMode, setAutoMode] = useState<AutoComplexity>('standard');
  const [mode, setMode] = useState<RoutingMode>('balanced');
  const [task, setTask] = useState('chat');
  const [preferred, setPreferred] = useState('gpt-4o');
  const [plan, setPlan] = useState<AutoRouteRequest['membership_plan']>('professional');
  const models = useMemo(() => getModels({ status: 'available' }), []);

  const autoResult = useMemo(
    () =>
      selectAutoModel({
        complexity: autoMode,
        taskType: task as 'chat' | 'code' | 'reasoning' | 'vision',
        membershipTier: plan ?? 'professional',
      }),
    [autoMode, task, plan],
  );

  const result = useMemo(
    () =>
      autoRoute({
        mode,
        task,
        preferred_model_id: mode === 'manual' ? preferred : undefined,
        membership_plan: plan,
      }),
    [mode, task, preferred, plan],
  );

  return (
    <>
      <p className={styles.notice}>
        <strong>Auto models</strong> route each agent to the best performance-to-price model at this
        moment, and switch providers when one is down — without picking a model by hand.
      </p>

      <h3 className={styles.cardTitle}>Fast / Standard / Complex</h3>
      <div className={styles.modeGrid}>
        {AUTO_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.modeBtn} ${autoMode === m.id ? styles.modeBtnActive : ''}`}
            onClick={() => setAutoMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{autoResult.model.displayName}</h3>
        <p className={styles.cardDesc}>{autoResult.reason}</p>
        <p className={styles.cardDesc}>{AUTO_MODES.find((m) => m.id === autoMode)?.blurb}</p>
        {autoResult.fallbackModelIds.length > 0 && (
          <p className={styles.cardDesc}>
            Failover chain: {autoResult.fallbackModelIds.join(' → ')}
          </p>
        )}
      </div>

      <h3 className={styles.cardTitle} style={{ marginTop: 28 }}>
        Legacy routing modes
      </h3>
      <div className={styles.filters}>
        <select className={styles.filterSelect} value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="chat">chat</option>
          <option value="code">code</option>
          <option value="reasoning">reasoning</option>
          <option value="vision">vision</option>
        </select>
        <select
          className={styles.filterSelect}
          value={plan}
          onChange={(e) => setPlan(e.target.value as AutoRouteRequest['membership_plan'])}
        >
          <option value="free">free</option>
          <option value="professional">professional</option>
          <option value="power">power</option>
          <option value="enterprise">enterprise</option>
        </select>
      </div>
      <div className={styles.modeGrid}>
        {LEGACY_MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>
      {mode === 'manual' && (
        <select
          className={styles.filterSelect}
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
      )}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{result.primary.displayName}</h3>
        <p className={styles.cardDesc}>{result.reason}</p>
        {result.fallbacks.length > 0 && (
          <p className={styles.cardDesc}>
            Fallbacks: {result.fallbacks.map((m) => m.displayName).join(', ')}
          </p>
        )}
      </div>
    </>
  );
}
