'use client';

import Link from 'next/link';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';
import { ModuleIcon } from '@ai-pass/ui';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: 'rgba(63,185,80,0.2)', color: '#3fb950' },
  ordered: { bg: 'rgba(210,153,34,0.2)', color: '#d29922' },
  in_transit: { bg: 'rgba(56,139,253,0.2)', color: '#58a6ff' },
  matched: { bg: 'rgba(63,185,80,0.2)', color: '#3fb950' },
  signed: { bg: 'rgba(56,139,253,0.2)', color: '#58a6ff' },
  delivered: { bg: 'rgba(139,148,158,0.2)', color: '#8b949e' },
};

export default function ProcureToPayPage() {
  const { tenantId, service, version } = useInvoiceAI();
  void version;

  const stats = service.getProcureToPayStats(tenantId);
  const purchaseOrders = service.listPurchaseOrders(tenantId);
  const deliveryNotes = service.listDeliveryNotes(tenantId);
  const upcoming = service.listUpcomingDeliveries(tenantId);
  const materials = service.listMaterialConsumption(tenantId);
  const cashDiscounts = service.listCashDiscounts(tenantId);
  const totalCo2 = materials.reduce((s, m) => s + (m.co2Tonnes ?? 0), 0);

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.card} style={{ marginBottom: 24 }}>
        <h2 className={styles.cardTitle}>Procure-to-Pay — comstruct-style automation</h2>
        <p className={styles.hint}>
          Digital procurement, delivery notes, automatic invoice verification with PO matching,
          AI account assignments, and ERP-ready posting. Activate the Construction pack under Use Cases.
        </p>
      </section>

      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Posting-ready</p>
          <p className={styles.statValue}>{stats.postingReadyPercent}%</p>
          <p className={styles.statSub}>Invoices ready for ERP</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>PO match rate</p>
          <p className={styles.statValue}>{stats.poMatchRate}%</p>
          <p className={styles.statSub}>3-way match OK</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Cash discounts</p>
          <p className={styles.statValue}>{stats.openCashDiscounts}</p>
          <p className={styles.statSub}>Skonti available</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Upcoming deliveries</p>
          <p className={styles.statValue}>{stats.upcomingDeliveries}</p>
          <p className={styles.statSub}>Today&apos;s calendar</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Delivery notes</p>
          <p className={styles.statValue}>{deliveryNotes.length}</p>
          <p className={styles.statSub}>Digital, signed</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Material CO₂</p>
          <p className={styles.statValue}>{totalCo2} t</p>
          <p className={styles.statSub}>Across projects</p>
        </div>
      </div>

      <section className={styles.card} style={{ marginTop: 24 }}>
        <h3 className={styles.cardTitle}>Today&apos;s delivery calendar</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Project</th>
              <th>Vendor</th>
              <th>Material</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{d.projectName}</td>
                <td>{d.vendorName}</td>
                <td>{d.description}</td>
                <td>
                  {d.quantity} {d.unit}
                </td>
                <td>
                  <span
                    className={styles.badge}
                    style={STATUS_COLORS[d.status] ?? STATUS_COLORS.ordered}
                  >
                    {d.status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className={styles.stackOnMobile} style={{ marginTop: 24 }}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Purchase orders</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PO</th>
                <th>Project</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td>{po.poNumber}</td>
                  <td>{po.projectName}</td>
                  <td>{po.vendorName}</td>
                  <td>
                    {po.currency} {po.totalAmount.toLocaleString()}
                  </td>
                  <td>{po.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Digital delivery notes</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Number</th>
                <th>Flow</th>
                <th>Vendor</th>
                <th>Signed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveryNotes.map((dn) => (
                <tr key={dn.id}>
                  <td>{dn.deliveryNumber}</td>
                  <td>{dn.flowType.replace(/_/g, ' ')}</td>
                  <td>{dn.vendorName}</td>
                  <td>{dn.photoProof ? <><ModuleIcon name="check" size={14} /> photo</> : '—'}</td>
                  <td>
                    <span
                      className={styles.badge}
                      style={STATUS_COLORS[dn.status] ?? STATUS_COLORS.delivered}
                    >
                      {dn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className={styles.card} style={{ marginTop: 24 }}>
        <h3 className={styles.cardTitle}>Material consumption by project</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>CO₂ (t)</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id}>
                <td>{m.projectName}</td>
                <td>{m.category}</td>
                <td>
                  {m.quantity.toLocaleString()} {m.unit}
                </td>
                <td>{m.co2Tonnes ?? '—'}</td>
                <td>{m.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {cashDiscounts.length > 0 && (
        <section className={styles.card} style={{ marginTop: 24 }}>
          <h3 className={styles.cardTitle}>Cash discounts (Skonti) — don&apos;t miss deadlines</h3>
          {cashDiscounts.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--ai-border)',
                fontSize: 13,
              }}
            >
              <span>
                Invoice linked — {c.discountPercent}% (€{c.discountAmount}) by {c.deadline}
              </span>
              <span
                className={styles.badge}
                style={
                  c.status === 'expiring_soon'
                    ? { background: 'rgba(248,81,73,0.2)', color: '#f85149' }
                    : { background: 'rgba(63,185,80,0.2)', color: '#3fb950' }
                }
              >
                {c.daysRemaining} days left
              </span>
            </div>
          ))}
        </section>
      )}

      <p style={{ marginTop: 16, fontSize: 13 }}>
        <Link href="/workspace/apps/invoice-ai/use-cases">Activate Construction Procure-to-Pay pack →</Link>
        {' · '}
        <Link href="/workspace/apps/invoice-ai/upload">Upload invoice for 3-way match →</Link>
      </p>
    </InvoiceShell>
  );
}
