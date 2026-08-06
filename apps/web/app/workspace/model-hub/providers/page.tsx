'use client';

import { useMemo, useState } from 'react';
import { getModels, PROVIDER_DEFINITIONS } from '@ai-pass/model-hub';
import { ModelCard } from '../components/ModelHubShell';
import styles from '../model-hub.module.css';

export default function ProviderModelsPage() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [query, setQuery] = useState('');
  const models = useMemo(
    () => getModels({ category: 'provider', provider: selectedProvider || undefined, query: query || undefined }),
    [selectedProvider, query],
  );

  return (
    <>
      <div className={styles.providerList}>
        <button type="button" className={`${styles.providerChip} ${!selectedProvider ? styles.providerChipActive : ''}`} onClick={() => setSelectedProvider('')}>
          All
        </button>
        {PROVIDER_DEFINITIONS.filter((p) => p.id !== 'aipass').map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.providerChip} ${selectedProvider === p.name ? styles.providerChipActive : ''}`}
            onClick={() => setSelectedProvider(p.name)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <input className={styles.searchInput} placeholder="Search provider models…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className={styles.modelGrid}>
        {models.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
    </>
  );
}
