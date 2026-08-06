'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  createDraftProduct,
  getDataProductRepository,
  type DataProduct,
  type DataProductStatus,
} from '@ai-pass/data-products';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './data-products.module.css';

function statusClass(status: DataProductStatus): string {
  if (status === 'published') return styles.statusPublished;
  if (status === 'deprecated' || status === 'retired') return styles.statusDeprecated;
  return styles.statusDraft;
}

function qualityTone(score: number): string {
  if (score >= 0.9) return styles.qualityGood;
  if (score >= 0.8) return styles.qualityOk;
  return styles.qualityWarn;
}

function contractTone(status: string): string {
  if (status === 'active') return styles.contractActive;
  if (status === 'violated') return styles.contractViolated;
  return styles.contractDraft;
}

export default function DataProductsPage() {
  const repo = useMemo(() => getDataProductRepository(), []);
  const [products, setProducts] = useState<DataProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => {
    const list = repo.list();
    setProducts(list);
    setSelectedId((prev) => {
      if (prev && list.some((p) => p.id === prev)) return prev;
      return list[0]?.id ?? null;
    });
  }, [repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = products.find((p) => p.id === selectedId) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const product = createDraftProduct({
      name: name.trim(),
      description: description.trim() || 'New data product',
      domain: domain.trim() || undefined,
    });
    repo.upsert(product);
    refresh();
    setSelectedId(product.id);
    setName('');
    setDescription('');
    setDomain('');
    showToast(`Created “${product.name}”`);
  };

  const publishSelected = () => {
    if (!selected) return;
    repo.upsert({ ...selected, status: 'published', version: selected.version || '0.1.0' });
    refresh();
    showToast(`Published “${selected.name}”`);
  };

  const resetDemo = () => {
    repo.resetToDemo();
    refresh();
    showToast('Restored demo data product catalog');
  };

  return (
    <WorkspaceLayoutClient
      title="Data Products"
      subtitle="Datasets as products — catalog, ownership, quality, and contracts"
    >
      <div className={styles.shell}>
        <div className={styles.banner}>
          Managed datasets that feed{' '}
          <Link href="/workspace/knowledge">Knowledge Pipeline</Link>,{' '}
          <Link href="/workspace/semantic">Semantic Layer</Link>, and apps. Ownership, quality scores,
          and contracts are first-class. Demo catalog persists in localStorage.
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{products.length}</span>
            <span className={styles.statLabel}>Products</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {products.filter((p) => p.status === 'published').length}
            </span>
            <span className={styles.statLabel}>Published</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {products.filter((p) => p.contracts.some((c) => c.status === 'violated')).length}
            </span>
            <span className={styles.statLabel}>Contract issues</span>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.catalog}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Catalog</h2>
              <button type="button" className={styles.ghostBtn} onClick={resetDemo}>
                Reset demo
              </button>
            </div>
            <div className={styles.cardGrid}>
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.productCard} ${selectedId === p.id ? styles.productCardActive : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className={styles.cardTop}>
                    <strong>{p.name}</strong>
                    <span className={`${styles.badge} ${statusClass(p.status)}`}>{p.status}</span>
                  </div>
                  <p className={styles.cardDesc}>{p.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={`${styles.quality} ${qualityTone(p.quality.overall)}`}>
                      Q {(p.quality.overall * 100).toFixed(0)}%
                    </span>
                    <span className={styles.metaMuted}>v{p.version}</span>
                    {p.domain ? <span className={styles.metaMuted}>{p.domain}</span> : null}
                  </div>
                </button>
              ))}
            </div>

            <form className={styles.createForm} onSubmit={onCreate}>
              <h3 className={styles.formTitle}>Create data product</h3>
              <input
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Product name"
                required
              />
              <input
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="Short description"
              />
              <input
                value={domain}
                onChange={(ev) => setDomain(ev.target.value)}
                placeholder="Domain (e.g. Finance)"
              />
              <button type="submit" className={styles.primaryBtn}>
                Add to catalog
              </button>
            </form>
          </section>

          <aside className={styles.detail}>
            {selected ? (
              <>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>{selected.name}</h2>
                  {selected.status === 'draft' ? (
                    <button type="button" className={styles.primaryBtn} onClick={publishSelected}>
                      Publish
                    </button>
                  ) : null}
                </div>
                <p className={styles.cardDesc}>{selected.description}</p>

                <div className={styles.detailBlock}>
                  <h4>Ownership</h4>
                  <ul>
                    {selected.owners.map((o) => (
                      <li key={o.id}>
                        {o.name}
                        {o.team ? ` · ${o.team}` : ''}
                        {o.role ? ` (${o.role})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.detailBlock}>
                  <h4>Quality</h4>
                  <p className={`${styles.quality} ${qualityTone(selected.quality.overall)}`}>
                    Overall {(selected.quality.overall * 100).toFixed(0)}%
                  </p>
                  <div className={styles.dimRow}>
                    {Object.entries(selected.quality.dimensions).map(([k, v]) => (
                      <span key={k}>
                        {k}: {((v ?? 0) * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                  {selected.quality.notes ? (
                    <p className={styles.metaMuted}>{selected.quality.notes}</p>
                  ) : null}
                </div>

                <div className={styles.detailBlock}>
                  <h4>Schema v{selected.schema.version}</h4>
                  <ul className={styles.schemaList}>
                    {selected.schema.fields.map((f) => (
                      <li key={f.name}>
                        <code>{f.name}</code>
                        <span>{f.type}</span>
                        {f.primaryKey ? <em>PK</em> : null}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.detailBlock}>
                  <h4>Contracts</h4>
                  {selected.contracts.length === 0 ? (
                    <p className={styles.metaMuted}>No contracts yet</p>
                  ) : (
                    selected.contracts.map((c) => (
                      <div key={c.id} className={styles.contractCard}>
                        <div className={styles.cardTop}>
                          <strong>{c.name}</strong>
                          <span className={`${styles.badge} ${contractTone(c.status)}`}>{c.status}</span>
                        </div>
                        <ul>
                          {c.expectations.map((ex) => (
                            <li key={ex}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.detailBlock}>
                  <h4>Lineage (stub)</h4>
                  <p className={styles.metaMuted}>
                    Upstream: {selected.lineage.upstreamProductIds.join(', ') || '—'}
                  </p>
                  <p className={styles.metaMuted}>
                    Downstream: {selected.lineage.downstreamProductIds.join(', ') || '—'}
                  </p>
                  <p className={styles.metaMuted}>
                    Knowledge: {selected.lineage.knowledgePipelineIds?.join(', ') || '—'}
                  </p>
                </div>
              </>
            ) : (
              <p className={styles.metaMuted}>Select a product to view details.</p>
            )}
          </aside>
        </div>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
      </div>
    </WorkspaceLayoutClient>
  );
}
