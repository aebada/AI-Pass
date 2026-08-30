'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { useApp } from '../../../../components/premium/AppProviders';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useApp();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setResult(null);

      try {
        const form = new FormData();
        form.append('file', file);
        form.append('tenantId', DEMO_TENANT_ID);

        const res = await fetch('/api/v1/invoice-ai/upload', {
          method: 'POST',
          headers: {
            'x-user-id': user?.id ?? 'demo-user',
            'x-tenant-id': DEMO_TENANT_ID,
            'x-membership-tier': 'professional',
          },
          body: form,
        });

        if (res.ok) {
          const data = (await res.json()) as { invoice: { id: string; invoiceNumber: string } };
          setResult(`Uploaded ${data.invoice.invoiceNumber}`);
          setTimeout(() => router.push(`/workspace/apps/invoice-ai/invoices/${data.invoice.id}`), 1500);
        } else {
          const err = (await res.json()) as { error?: string };
          setResult(err.error ?? 'Upload failed');
        }
      } catch {
        setResult('Upload failed - static export mode uses demo data only');
      } finally {
        setUploading(false);
      }
    },
    [router, user?.id],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <InvoiceShell showChat={false}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Upload invoice</h2>
        <p style={{ fontSize: 13, color: 'var(--ai-text-muted)', marginBottom: 24 }}>
          Drag and drop PDF, image, or email attachment. OCR extraction runs via platform agents - credits tracked in AI Wallet.
        </p>

        <div
          className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {uploading ? (
            <p>Processing via Extraction Agent…</p>
          ) : (
            <>
              <p style={{ fontSize: 16, margin: '0 0 8px' }}>Drop invoice here</p>
              <p style={{ fontSize: 13, color: 'var(--ai-text-muted)', margin: 0 }}>
                or click to browse - PDF, PNG, JPG
              </p>
            </>
          )}
        </div>

        {result && (
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--ai-accent)' }}>{result}</p>
        )}
      </section>
    </InvoiceShell>
  );
}
