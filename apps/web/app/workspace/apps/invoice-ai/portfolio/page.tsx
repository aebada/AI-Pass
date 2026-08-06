'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Invoice } from '@ai-pass/shared/invoice-ai';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { ExportButtons } from '../components/ExportButtons';
import { InvoicePortfolio } from '../components/InvoicePortfolio';
import { InvoiceVisuals } from '../components/InvoiceVisuals';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

type Filter = 'all' | 'pending_approval' | 'approved' | 'flagged' | 'validated';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending_approval', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'validated', label: 'Validated' },
  { id: 'flagged', label: 'Flagged' },
];

export default function PortfolioPage() {
  const { tenantId, service, version } = useInvoiceAI();
  void version;

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const all = service.listInvoices(tenantId);

  const filtered = useMemo(() => {
    let list: Invoice[] = all;
    if (filter !== 'all') {
      list = list.filter((i) =>
        filter === 'approved' ? i.status === 'approved' || i.status === 'paid' : i.status === filter,
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.vendorName.toLowerCase().includes(q) ||
          (i.department?.toLowerCase().includes(q) ?? false),
      );
    }
    return list.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [all, filter, search]);

  const totalValue = filtered.reduce((s, i) => s + i.amount, 0);

  const exportRows = useMemo(
    () =>
      filtered.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        vendorName: i.vendorName,
        amount: i.amount,
        currency: i.currency,
        status: i.status,
        department: i.department ?? '',
        uploadedAt: i.uploadedAt,
      })),
    [filtered],
  );

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.portfolioHero}>
        <div>
          <h1 className={styles.portfolioTitle}>Invoice portfolio</h1>
          <p className={styles.portfolioSub}>
            All your invoices in one place — click any card to see full details, validation, and compliance results.
          </p>
          <ExportButtons
            rows={exportRows}
            jsonPayload={{ filter, search, count: filtered.length, totalValue, invoices: exportRows }}
            baseName="invoice-ai-portfolio"
          />
        </div>
        <div className={styles.portfolioHeroStats}>
          <div>
            <span className={styles.portfolioHeroValue}>{all.length}</span>
            <span className={styles.portfolioHeroLabel}>Total</span>
          </div>
          <div>
            <span className={styles.portfolioHeroValue}>€{totalValue.toLocaleString()}</span>
            <span className={styles.portfolioHeroLabel}>Filtered value</span>
          </div>
        </div>
      </section>

      <div className={styles.filterBar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by number, vendor, department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterTabs}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.filterTab} ${filter === f.id ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className={styles.filterCount}>
                {f.id === 'all'
                  ? all.length
                  : all.filter((i) =>
                      f.id === 'approved'
                        ? i.status === 'approved' || i.status === 'paid'
                        : i.status === f.id,
                    ).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <InvoiceVisuals invoices={filtered} />

      <section className={styles.card} style={{ marginTop: 24 }}>
        {all.length === 0 ? (
          <div className={styles.empty}>
            <p>No invoices yet. Upload your first invoice to get started.</p>
            <Link
              href="/workspace/apps/invoice-ai/upload"
              className={styles.btn}
              style={{ marginTop: 12, display: 'inline-block' }}
            >
              Upload invoice
            </Link>
          </div>
        ) : (
          <InvoicePortfolio invoices={filtered} showFilters={false} />
        )}
      </section>
    </InvoiceShell>
  );
}
