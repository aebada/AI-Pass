'use client';

import Link from 'next/link';
import { buildFakeInvoiceDetection, parseStoredSignals } from '@ai-pass/invoice-ai';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { AuthenticityPanel } from '../components/AuthenticityPanel';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function FakeDetectionPage() {
  const { tenantId, service, version } = useInvoiceAI();
  void version;

  const alerts = service.listFakeInvoiceAlerts(tenantId);
  const invoices = service.listInvoices(tenantId);
  const suspiciousInvoices = invoices
    .map((invoice) => {
      const score = invoice.extractedFields?.deepfake_score?.value as number | undefined;
      const alert = alerts.find((a) => a.invoiceId === invoice.id);
      const resolvedScore = score ?? alert?.score;
      if (resolvedScore === undefined) return null;
      const signals = parseStoredSignals(invoice.extractedFields?.deepfake_signals?.value);
      if (signals.length === 0 && alert?.description) {
        signals.push(alert.description);
      }
      const detection = buildFakeInvoiceDetection(resolvedScore, signals);
      if (detection.verdict === 'Authentic') return null;
      return { invoice, detection };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.detection.authenticityScore - a.detection.authenticityScore);

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.card} style={{ marginBottom: 20 }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 8 }}>
          Fake invoice detection
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ai-text-muted)', margin: '0 0 16px' }}>
          AI document forensics scans uploads for tampering, font inconsistencies, and metadata
          mismatches. Risk thresholds: &lt;40% Authentic · 40–70% Suspicious · &gt;70% Likely Fake.
        </p>
        <div className={styles.uploadActions}>
          <Link href="/workspace/apps/invoice-ai/upload" className={styles.heroBtnPrimary}>
            Upload &amp; scan
          </Link>
          <Link href="/workspace/apps/invoice-ai/fraud" className={styles.heroBtn}>
            Fraud center
          </Link>
        </div>
      </section>

      <div className={styles.grid} style={{ marginBottom: 24 }}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Fake alerts</p>
          <p className={styles.statValue} style={{ color: alerts.length > 0 ? '#f85149' : undefined }}>
            {alerts.length}
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Suspicious documents</p>
          <p className={styles.statValue}>{suspiciousInvoices.length}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Scanned invoices</p>
          <p className={styles.statValue}>
            {invoices.filter((i) => i.extractedFields?.deepfake_score?.value !== undefined).length}
          </p>
        </div>
      </div>

      {suspiciousInvoices.length === 0 ? (
        <section className={styles.card}>
          <p className={styles.empty} style={{ margin: 0 }}>
            No suspicious invoices detected. Try uploading a file with &quot;fake&quot; in the name
            to see detection in action.
          </p>
        </section>
      ) : (
        suspiciousInvoices.map(({ invoice, detection }) => (
          <div key={invoice.id} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link
                href={`/workspace/apps/invoice-ai/invoices/${invoice.id}`}
                className={styles.linkBtn}
              >
                {invoice.invoiceNumber} — {invoice.vendorName}
              </Link>
              <span className={styles.badge} style={{ background: 'rgba(248,81,73,0.15)', color: '#f85149' }}>
                {invoice.status.replace(/_/g, ' ')}
              </span>
            </div>
            <AuthenticityPanel detection={detection} title="Scan result" />
          </div>
        ))
      )}
    </InvoiceShell>
  );
}
