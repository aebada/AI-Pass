'use client';

import { useState } from 'react';
import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function OffersPage() {
  const offers = defaultSupplyChainAIService.listOffers(undefined, DEMO_TENANT_ID);
  const events = defaultSupplyChainAIService.listEvents(DEMO_TENANT_ID).events;
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/v1/supply-chain-ai/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: form.get('eventId'),
        fileName: form.get('fileName'),
        mimeType: form.get('mimeType'),
        supplierName: form.get('supplierName'),
      }),
    });
    const data = await res.json();
    setMessage(data.offer ? `Uploaded: ${data.offer.supplierName} (confidence ${Math.round((data.parseConfidence ?? 0) * 100)}%)` : data.error);
    setUploading(false);
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Supplier Offers</h1>
        <p className={styles.muted}>Upload via drag-drop stub or manual entry</p>
      </header>

      <div className={styles.grid2}>
        <form onSubmit={handleUpload} className={styles.card}>
          <div className={styles.dropzone}>📄 Drop PDF / Excel / CSV (stub upload)</div>
          <div className={styles.formGroup} style={{ marginTop: 16 }}>
            <label>Event</label>
            <select name="eventId" required>
              {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>File Name</label>
            <input name="fileName" required placeholder="nordic-offer-q4.xlsx" />
          </div>
          <div className={styles.formGroup}>
            <label>MIME Type</label>
            <input name="mimeType" defaultValue="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
          </div>
          <div className={styles.formGroup}>
            <label>Supplier Name</label>
            <input name="supplierName" placeholder="Nordic Components AB" />
          </div>
          <button type="submit" className={styles.btnPrimary} disabled={uploading}>
            {uploading ? 'Parsing…' : 'Upload & Parse'}
          </button>
          {message && <p className={styles.muted} style={{ marginTop: 12 }}>{message}</p>}
        </form>

        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Uploaded Offers</h2>
          <table className={styles.table}>
            <thead>
              <tr><th>Supplier</th><th>Price</th><th>Delivery</th><th>Score</th><th>Status</th></tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.supplierName}</td>
                  <td>€{(o.totalPrice ?? 0).toLocaleString()}</td>
                  <td>{o.deliveryDays}d</td>
                  <td>{o.overallScore ?? '-'}</td>
                  <td>
                    <span className={o.status === 'PASS' ? styles.badgePass : o.status === 'FAIL' ? styles.badgeFail : styles.badgeInfo}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
