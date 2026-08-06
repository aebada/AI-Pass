'use client';

import { useMemo, useState } from 'react';
import {
  getModels,
  MODEL_REGISTRY_COUNT,
  MODEL_CATEGORIES,
  MODEL_CAPABILITIES,
  MODEL_PROVIDERS,
  type ModelCapability,
  type ModelCategory,
  type ModelCatalogFilters,
} from '@ai-pass/model-hub';
import { ModelCard } from './components/ModelHubShell';
import styles from './model-hub.module.css';

export default function ModelHubPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ModelCategory | ''>('');
  const [provider, setProvider] = useState('');
  const [capability, setCapability] = useState<ModelCapability | ''>('');
  const [enterpriseOnly, setEnterpriseOnly] = useState(false);

  const models = useMemo(() => {
    const filters: ModelCatalogFilters = {};
    if (category) filters.category = category;
    if (provider) filters.provider = provider;
    if (capability) filters.capability = capability;
    if (search.trim()) filters.query = search.trim();
    if (enterpriseOnly) filters.enterprise = true;
    return getModels(filters);
  }, [search, category, provider, capability, enterpriseOnly]);

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{MODEL_REGISTRY_COUNT}</div>
          <div className={styles.statLabel}>Models in registry</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{models.length}</div>
          <div className={styles.statLabel}>Matching filters</div>
        </div>
      </div>
      <div className={styles.filters}>
        <input className={styles.filterInput} placeholder="Search models…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={category} onChange={(e) => setCategory(e.target.value as ModelCategory | '')}>
          <option value="">All categories</option>
          {MODEL_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">All providers</option>
          {MODEL_PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={capability} onChange={(e) => setCapability(e.target.value as ModelCapability | '')}>
          <option value="">All tasks</option>
          {MODEL_CAPABILITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className={styles.filterCheck}>
          <input type="checkbox" checked={enterpriseOnly} onChange={(e) => setEnterpriseOnly(e.target.checked)} />
          Enterprise only
        </label>
      </div>
      <div className={styles.grid}>
        {models.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </>
  );
}
