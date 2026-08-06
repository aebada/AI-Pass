'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SUPPLY_CHAIN_RULES } from '@ai-pass/invoice-ai';
import type { SupplyOffer, Tender, UserRule, UserRuleAction, UserRuleConditionField, UserRuleOperator } from '@ai-pass/shared/invoice-ai';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';
import { ModuleIcon } from '@ai-pass/ui';

type Tab = 'tenders' | 'offers' | 'compare' | 'rules' | 'recommendations';

const TABS: { id: Tab; label: string }[] = [
  { id: 'tenders', label: 'Tenders' },
  { id: 'offers', label: 'Offers' },
  { id: 'compare', label: 'Compare' },
  { id: 'rules', label: 'Rules' },
  { id: 'recommendations', label: 'Recommendations' },
];

const CONDITION_FIELDS: { value: UserRuleConditionField; label: string }[] = [
  { value: 'price', label: 'Net price (€)' },
  { value: 'total', label: 'Total (€)' },
  { value: 'lead_time', label: 'Lead time (days)' },
  { value: 'vendor_risk', label: 'Vendor risk score' },
  { value: 'compliance', label: 'Compliance score' },
  { value: 'po_match', label: 'PO match (%)' },
];

const OPERATORS: { value: UserRuleOperator; label: string }[] = [
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'eq', label: '=' },
];

const ACTIONS: { value: UserRuleAction; label: string }[] = [
  { value: 'prefer', label: 'Prefer' },
  { value: 'reject', label: 'Reject' },
  { value: 'warn', label: 'Warn' },
  { value: 'require_revision', label: 'Require revision' },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: 'rgba(63,185,80,0.2)', color: '#3fb950' },
  closed: { bg: 'rgba(139,148,158,0.2)', color: '#8b949e' },
  awarded: { bg: 'rgba(56,139,253,0.2)', color: '#58a6ff' },
  received: { bg: 'rgba(210,153,34,0.2)', color: '#d29922' },
  parsed: { bg: 'rgba(56,139,253,0.2)', color: '#58a6ff' },
  compared: { bg: 'rgba(139,148,158,0.2)', color: '#8b949e' },
  selected: { bg: 'rgba(63,185,80,0.2)', color: '#3fb950' },
  rejected: { bg: 'rgba(248,81,73,0.2)', color: '#f85149' },
  revision_requested: { bg: 'rgba(210,153,34,0.2)', color: '#d29922' },
};

function rulesStorageKey(tenantId: string): string {
  return `invoice-ai:supply-chain-rules:${tenantId}`;
}

function loadRules(tenantId: string): UserRule[] {
  if (typeof window === 'undefined') return DEFAULT_SUPPLY_CHAIN_RULES;
  try {
    const raw = localStorage.getItem(rulesStorageKey(tenantId));
    if (raw) return JSON.parse(raw) as UserRule[];
  } catch {
    /* use defaults */
  }
  return DEFAULT_SUPPLY_CHAIN_RULES.map((r) => ({ ...r }));
}

function saveRules(tenantId: string, rules: UserRule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(rulesStorageKey(tenantId), JSON.stringify(rules));
}

export default function SupplyChainPage() {
  const { tenantId, service, version } = useInvoiceAI();
  void version;

  const [tab, setTab] = useState<Tab>('tenders');
  const [selectedTenderId, setSelectedTenderId] = useState('tnd_tunnel_241');
  const [detailTenderId, setDetailTenderId] = useState<string | null>(null);
  const [rules, setRules] = useState<UserRule[]>(() => loadRules(tenantId));
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [createForm, setCreateForm] = useState({
    title: '',
    project: '',
    deadline: '',
    requirements: '',
  });

  useEffect(() => {
    setRules(loadRules(tenantId));
  }, [tenantId]);

  const tenders = service.listTenders(tenantId);
  const offers = service.listSupplyOffers(tenantId);
  const stats = service.getSupplyChainStats(tenantId);
  const vendors = service.listVendors(tenantId);

  const comparison = useMemo(() => {
    try {
      return service.compareSupplyOffers(tenantId, selectedTenderId, rules);
    } catch {
      return null;
    }
  }, [service, tenantId, selectedTenderId, rules, version]);

  const matrix = useMemo(() => {
    try {
      return service.getTenderComparison(tenantId, selectedTenderId, rules);
    } catch {
      return null;
    }
  }, [service, tenantId, selectedTenderId, rules, version]);

  const recommendation = useMemo(() => {
    try {
      return service.getSupplyChainRecommendation(tenantId, selectedTenderId, rules);
    } catch {
      return null;
    }
  }, [service, tenantId, selectedTenderId, rules, version]);

  const offersByTender = useMemo(() => {
    const map = new Map<string, SupplyOffer[]>();
    for (const o of offers) {
      const tid = o.tenderId ?? o.rfqId;
      const list = map.get(tid) ?? [];
      list.push(o);
      map.set(tid, list);
    }
    return map;
  }, [offers]);

  const detailTender = detailTenderId ? service.getTender(detailTenderId) : null;

  const persistRules = useCallback(
    (next: UserRule[]) => {
      setRules(next);
      saveRules(tenantId, next);
    },
    [tenantId],
  );

  const handleAward = (offerId: string) => {
    const result = service.awardTender(tenantId, selectedTenderId, offerId);
    setActionMessage(`Awarded tender to ${result.offer.vendorName}`);
  };

  const handleUpload = () => {
    if (!uploadFileName.trim()) return;
    const offer = service.uploadSupplyOfferStub(tenantId, selectedTenderId, uploadFileName.trim());
    setActionMessage(`Parsed offer from ${uploadFileName} → ${offer.vendorName} (€${offer.totalAmount.toLocaleString()})`);
    setUploadFileName('');
  };

  const handleCreateTender = () => {
    if (!createForm.title || !createForm.project || !createForm.deadline) return;
    const tender = service.createTender(tenantId, {
      title: createForm.title,
      project: createForm.project,
      deadline: createForm.deadline,
      requirements: createForm.requirements.split('\n').filter(Boolean),
      invitedVendors: vendors.slice(0, 4).map((v) => v.id),
    });
    setSelectedTenderId(tender.id);
    setDetailTenderId(tender.id);
    setActionMessage(`Created tender: ${tender.title}`);
    setCreateForm({ title: '', project: '', deadline: '', requirements: '' });
  };

  const updateRule = (id: string, patch: Partial<UserRule>) => {
    persistRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRule = () => {
    persistRules([
      ...rules,
      {
        id: `rule_custom_${Date.now()}`,
        name: 'New rule',
        enabled: true,
        scope: 'global',
        condition: { field: 'vendor_risk', operator: 'gt', value: 50 },
        action: 'warn',
      },
    ]);
  };

  const removeRule = (id: string) => persistRules(rules.filter((r) => r.id !== id));
  const resetRules = () => {
    persistRules(DEFAULT_SUPPLY_CHAIN_RULES.map((r) => ({ ...r })));
    setActionMessage('Rules reset to defaults');
  };

  return (
    <InvoiceShell showChat={false}>
      {actionMessage && <p className={styles.bannerInfo}>{actionMessage}</p>}

      <section className={styles.card} style={{ marginBottom: 24 }}>
        <h2 className={styles.cardTitle}>Supply Chain — tenders, offers &amp; award</h2>
        <p className={styles.hint}>
          Manage procurement tenders, compare vendor quotes, apply tenant rules, and award contracts.
          Activate the Supply Chain pack under{' '}
          <Link href="/workspace/apps/invoice-ai/use-cases">Use Cases</Link>.
        </p>

        <div className={styles.grid} style={{ marginTop: 16 }}>
          <div className={styles.card} style={{ padding: 14 }}>
            <p className={styles.cardTitle}>Open tenders</p>
            <p className={styles.statValue}>{stats.openTenders}</p>
          </div>
          <div className={styles.card} style={{ padding: 14 }}>
            <p className={styles.cardTitle}>Incoming offers</p>
            <p className={styles.statValue}>{stats.totalOffers}</p>
          </div>
          <div className={styles.card} style={{ padding: 14 }}>
            <p className={styles.cardTitle}>Pending review</p>
            <p className={styles.statValue}>{stats.pendingOffers}</p>
          </div>
          <div className={styles.card} style={{ padding: 14 }}>
            <p className={styles.cardTitle}>Workflows</p>
            <p className={styles.statValue}>{stats.activeWorkflows}</p>
          </div>
        </div>

        <div className={styles.adminTabs} role="tablist" style={{ marginTop: 16 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.adminTab} ${tab === t.id ? styles.adminTabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'tenders' && (
        <div className={styles.stackOnMobile}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Tenders</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Offers</th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((t: Tender) => (
                  <tr
                    key={t.id}
                    onClick={() => setDetailTenderId(t.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{t.title}</td>
                    <td>{t.project}</td>
                    <td>{t.deadline}</td>
                    <td>
                      <span className={styles.badge} style={STATUS_COLORS[t.status]}>
                        {t.status}
                      </span>
                    </td>
                    <td>{offersByTender.get(t.id)?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            {detailTender ? (
              <>
                <h3 className={styles.cardTitle}>{detailTender.title}</h3>
                <p className={styles.hint}>
                  Project: {detailTender.project} · Deadline: {detailTender.deadline}
                </p>
                <ul style={{ fontSize: 13, paddingLeft: 20 }}>
                  {detailTender.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <p className={styles.hint} style={{ marginTop: 12 }}>
                  Invited: {detailTender.invitedVendors.length} vendors
                </p>
                <button
                  type="button"
                  className={styles.btn}
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setSelectedTenderId(detailTender.id);
                    setTab('compare');
                  }}
                >
                  Compare offers →
                </button>
              </>
            ) : (
              <p className={styles.hint}>Select a tender to view requirements and invited vendors.</p>
            )}

            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--ai-border)' }} />

            <h4 className={styles.cardTitle}>Create tender</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                placeholder="Title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className={styles.field}
              />
              <input
                placeholder="Project"
                value={createForm.project}
                onChange={(e) => setCreateForm({ ...createForm, project: e.target.value })}
                className={styles.field}
              />
              <input
                type="date"
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                className={styles.field}
              />
              <textarea
                placeholder="Requirements (one per line)"
                value={createForm.requirements}
                onChange={(e) => setCreateForm({ ...createForm, requirements: e.target.value })}
                rows={3}
                className={styles.field}
              />
              <button type="button" className={styles.btnPrimary} onClick={handleCreateTender}>
                Publish tender
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === 'offers' && (
        <section className={styles.card}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label className={styles.field} style={{ margin: 0 }}>
              Tender
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <input
              placeholder="quote-filename.pdf"
              value={uploadFileName}
              onChange={(e) => setUploadFileName(e.target.value)}
              className={styles.field}
              style={{ margin: 0, minWidth: 200 }}
            />
            <button type="button" className={styles.btn} onClick={handleUpload}>
              Upload &amp; parse stub
            </button>
          </div>

          {[...offersByTender.entries()].map(([tid, tenderOffers]) => {
            const tender = service.getTender(tid);
            return (
              <div key={tid} style={{ marginBottom: 24 }}>
                <h4 className={styles.cardTitle}>
                  {tender?.title ?? tid} ({tenderOffers.length} offers)
                </h4>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Quote</th>
                      <th>Vendor</th>
                      <th>Total</th>
                      <th>Lead</th>
                      <th>Compliance</th>
                      <th>Valid until</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenderOffers.map((o) => (
                      <tr key={o.id}>
                        <td>{o.quoteNumber}</td>
                        <td>{o.vendorName}</td>
                        <td>€{o.totalAmount.toLocaleString()}</td>
                        <td>{o.leadTimeDays}d</td>
                        <td>{o.complianceScore}%</td>
                        <td>{o.validityDate}</td>
                        <td>
                          <span className={styles.badge} style={STATUS_COLORS[o.status]}>
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </section>
      )}

      {tab === 'compare' && (
        <section className={styles.card}>
          <label className={styles.field} style={{ marginBottom: 16 }}>
            Tender
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>

          {comparison ? (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Vendor</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Lead</th>
                    <th>Compliance</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.offers.map((row) => (
                    <tr
                      key={row.offerId}
                      style={row.rejected ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}
                    >
                      <td>#{row.rank}</td>
                      <td>
                        {row.vendorName}
                        {row.ruleViolations.length > 0 && (
                          <div style={{ fontSize: 11, color: '#d29922' }}>{row.ruleViolations.join(' · ')}</div>
                        )}
                      </td>
                      <td>€{row.price.toLocaleString()}</td>
                      <td>€{row.total.toLocaleString()}</td>
                      <td>{row.leadTimeDays}d</td>
                      <td>{row.complianceScore}%</td>
                      <td>
                        <strong>{row.compositeScore}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {matrix && (
                <div style={{ marginTop: 24 }}>
                  <h4 className={styles.cardTitle}>Comparison matrix</h4>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        {matrix.criteria.map((c) => (
                          <th key={c.id}>{c.label}</th>
                        ))}
                        <th>Total score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.offers.map((row) => (
                        <tr key={row.offerId}>
                          <td>{row.vendorName}</td>
                          {row.cells.map((cell) => (
                            <td key={cell.criterionId}>
                              {cell.rawValue.toLocaleString()} ({cell.normalizedScore})
                            </td>
                          ))}
                          <td>
                            <strong>{row.totalScore}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className={styles.hint}>Select a tender with offers to compare.</p>
          )}
        </section>
      )}

      {tab === 'rules' && (
        <section className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className={styles.cardTitle} style={{ margin: 0 }}>
              Evaluation rules
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className={styles.btnSecondary} onClick={resetRules}>
                Reset defaults
              </button>
              <button type="button" className={styles.btn} onClick={addRule}>
                + Add rule
              </button>
            </div>
          </div>
          <p className={styles.hint}>
            Saved to localStorage for tenant <code>{tenantId}</code>. Tender-scoped rules apply to
            specific tenders only.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr repeat(4, minmax(90px, auto)) auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: 12,
                  border: '1px solid var(--ai-border)',
                  borderRadius: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                />
                <input
                  value={rule.name}
                  onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                  className={styles.field}
                  style={{ margin: 0 }}
                />
                <select
                  value={rule.condition.field}
                  onChange={(e) =>
                    updateRule(rule.id, {
                      condition: { ...rule.condition, field: e.target.value as UserRuleConditionField },
                    })
                  }
                >
                  {CONDITION_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <select
                  value={rule.condition.operator}
                  onChange={(e) =>
                    updateRule(rule.id, {
                      condition: { ...rule.condition, operator: e.target.value as UserRuleOperator },
                    })
                  }
                >
                  {OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={rule.condition.value}
                  onChange={(e) =>
                    updateRule(rule.id, {
                      condition: { ...rule.condition, value: Number(e.target.value) },
                    })
                  }
                  style={{ width: 72 }}
                />
                <select
                  value={rule.action}
                  onChange={(e) => updateRule(rule.id, { action: e.target.value as UserRuleAction })}
                >
                  {ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <button type="button" className={styles.btnSecondary} onClick={() => removeRule(rule.id)}>
                  <ModuleIcon name="x" size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'recommendations' && recommendation && (
        <section className={styles.card}>
          <label className={styles.field} style={{ marginBottom: 16 }}>
            Tender
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>

          <div style={{ padding: 16, borderRadius: 8, background: 'var(--ai-surface-hover)', marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ai-text-muted)' }}>
              Recommendation · {Math.round(recommendation.confidence * 100)}% confidence
            </p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{recommendation.rationale}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={!recommendation.bestOfferId || recommendation.decision === 'reject_all'}
              onClick={() => recommendation.bestOfferId && handleAward(recommendation.bestOfferId)}
            >
              Award — {recommendation.bestVendorName || 'N/A'}
            </button>
            {recommendation.runnerUpVendorName && (
              <span className={styles.hint} style={{ alignSelf: 'center' }}>
                Runner-up: {recommendation.runnerUpVendorName}
              </span>
            )}
          </div>
        </section>
      )}

      <p style={{ marginTop: 16, fontSize: 13 }}>
        <Link href="/workspace/apps/invoice-ai/procure-to-pay">Procure-to-Pay →</Link>
        {' · '}
        <Link href="/workspace/apps/invoice-ai/chat">Ask about tender status or best offer →</Link>
      </p>
    </InvoiceShell>
  );
}
