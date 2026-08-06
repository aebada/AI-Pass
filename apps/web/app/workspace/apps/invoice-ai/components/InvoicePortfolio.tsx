'use client';

import Link from 'next/link';
import type { Invoice } from '@ai-pass/shared/invoice-ai';
import { StatusBadge } from './InvoiceShell';
import { InvoiceLifecycleMiniFromStatus } from './InvoiceLifecyclePanel';
import styles from '../invoice-ai.module.css';

export function InvoicePortfolioCard({ invoice }: { invoice: Invoice }) {
  const hasRisk = invoice.status === 'flagged' || invoice.status === 'rejected';

  return (
    <Link href={`/workspace/apps/invoice-ai/invoices/${invoice.id}`} className={styles.portfolioCard}>
      <div className={styles.portfolioCardTop}>
        <span className={styles.portfolioNumber}>{invoice.invoiceNumber}</span>
        <StatusBadge status={invoice.status} />
      </div>
      <p className={styles.portfolioVendor}>{invoice.vendorName}</p>
      <p className={styles.portfolioAmount}>
        {invoice.currency} {invoice.amount.toLocaleString()}
      </p>
      <InvoiceLifecycleMiniFromStatus status={invoice.status} />
      <div className={styles.portfolioMeta}>
        {invoice.department && <span>{invoice.department}</span>}
        <span>{new Date(invoice.uploadedAt).toLocaleDateString()}</span>
      </div>
      {hasRisk && (
        <span className={styles.portfolioFlag}>Needs attention</span>
      )}
      {invoice.purchaseOrderId && (
        <span className={styles.portfolioMatch}>PO matched</span>
      )}
    </Link>
  );
}

interface InvoicePortfolioProps {
  invoices: Invoice[];
  showFilters?: boolean;
  compact?: boolean;
}

export function InvoicePortfolio({ invoices, showFilters = true, compact = false }: InvoicePortfolioProps) {
  return (
    <div>
      {showFilters && (
        <p className={styles.portfolioCount}>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} in your portfolio
        </p>
      )}
      <div className={compact ? styles.portfolioGridCompact : styles.portfolioGrid}>
        {invoices.length === 0 ? (
          <div className={styles.empty}>
            <p>No invoices yet.</p>
            <Link href="/workspace/apps/invoice-ai/upload" className={styles.btn} style={{ marginTop: 12, display: 'inline-block' }}>
              Upload your first invoice
            </Link>
          </div>
        ) : (
          invoices.map((inv) => <InvoicePortfolioCard key={inv.id} invoice={inv} />)
        )}
      </div>
    </div>
  );
}
