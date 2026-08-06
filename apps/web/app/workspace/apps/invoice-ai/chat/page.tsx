'use client';

import Link from 'next/link';
import { InvoiceChatPanel } from '../components/InvoiceChatPanel';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function ChatPage() {
  const { tenantId, service } = useInvoiceAI();
  const invoiceCount = service.listInvoices(tenantId).length;
  const isEmpty = invoiceCount === 0;

  return (
    <InvoiceShell showChat={false}>
      <div className={styles.chatPage}>
        <div className={styles.chatPageIntro}>
          <h1 className={styles.chatPageTitle}>Chat with Invoice AI</h1>
          <p className={styles.chatPageSub}>
            Ask questions in plain language. Get instant answers about spend, approvals, tax, fraud alerts, and your portfolio.
          </p>
          {isEmpty ? (
            <div className={styles.empty} style={{ marginTop: 16 }}>
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
            <p className={styles.chatPageHint}>
              Tip: try &quot;What is our total spend?&quot; or &quot;Show pending approvals&quot; — or{' '}
              <Link href="/workspace/apps/invoice-ai/portfolio">browse your portfolio</Link> for visual results.
            </p>
          )}
        </div>
        <InvoiceChatPanel variant="full" />
      </div>
    </InvoiceShell>
  );
}
