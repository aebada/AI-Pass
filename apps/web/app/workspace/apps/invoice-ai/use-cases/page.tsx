'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DEMO_AUTOMATION_PACKS } from '@ai-pass/invoice-ai';
import { useInvoiceAI } from '../components/InvoiceAIProvider';
import { InvoiceShell } from '../components/InvoiceShell';
import styles from '../invoice-ai.module.css';
import { ModuleIcon } from '@ai-pass/ui';

export default function UseCasesPage() {
  const { useCases, activeUseCase, setActiveUseCase, createCustomUseCase, installPack } =
    useInvoiceAI();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customIndustry, setCustomIndustry] = useState('custom');
  const [message, setMessage] = useState<string | null>(null);

  const handleActivate = (id: string) => {
    setActiveUseCase(id);
    setMessage(`Activated: ${useCases.find((u) => u.id === id)?.name ?? id}`);
  };

  const handleCreateCustom = () => {
    if (!customName.trim()) return;
    const uc = createCustomUseCase({
      name: customName,
      description: customDesc || 'User-defined automation scenario',
      industry: customIndustry,
      complianceFrameworks: ['EU_VAT'],
    });
    setActiveUseCase(uc.id);
    setShowCustom(false);
    setCustomName('');
    setCustomDesc('');
    setMessage(`Created and activated custom use case: ${uc.name}`);
  };

  return (
    <InvoiceShell showChat={false}>
      {message && <p className={styles.bannerInfo}>{message}</p>}

      <section className={styles.card} style={{ marginBottom: 24 }}>
        <h2 className={styles.cardTitle}>Built-in scenarios</h2>
        <p className={styles.hint}>
          Choose a use case to configure OCR extraction, compliance rules, fraud detection, and
          bookkeeping automation for your workflow.
        </p>
        <div className={styles.packGrid}>
          {useCases.map((uc) => (
            <div
              key={uc.id}
              className={styles.packCard}
              style={{
                borderColor:
                  activeUseCase.id === uc.id ? 'var(--ai-accent, #58a6ff)' : undefined,
              }}
            >
              <h3>{uc.name}</h3>
              <p>{uc.description}</p>
              <div className={styles.packMeta}>
                {uc.industry}
                {uc.isCustom ? ' · custom' : ''}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                {uc.complianceFrameworks.map((fw) => (
                  <span key={fw} className={styles.badge}>
                    {fw}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className={activeUseCase.id === uc.id ? styles.btnSecondary : styles.btn}
                onClick={() => handleActivate(uc.id)}
                disabled={activeUseCase.id === uc.id}
              >
                {activeUseCase.id === uc.id ? 'Active' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.cardTitle} style={{ margin: 0 }}>
            Industry automation packs
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/workspace/apps/invoice-ai/supply-chain" className={styles.btnSecondary}>
              Supply Chain →
            </Link>
            <button type="button" className={styles.btn} onClick={() => setShowCustom(true)}>
              Create custom use case
            </button>
          </div>
        </div>
        <div className={styles.packGrid} style={{ marginTop: 16 }}>
          {DEMO_AUTOMATION_PACKS.map((pack) => (
            <div key={pack.id} className={styles.packCard}>
              <h3>{pack.name}</h3>
              <p>{pack.description}</p>
              <div className={styles.packMeta}>
                {pack.industry} · {pack.tier}
              </div>
              <button
                type="button"
                className={styles.btn}
                style={{ marginTop: 12 }}
                onClick={() => {
                  const uc = installPack(pack.id, pack.name, pack.industry);
                  setMessage(`Installed pack as use case: ${uc.name}`);
                }}
              >
                Install &amp; activate
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Capability matrix</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Capability</th>
              <th>Bookkeeping</th>
              <th>Tax</th>
              <th>Insurance</th>
              <th>Deepfake</th>
              <th>Legal</th>
              <th>Construction</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['OCR multi-format', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
              ['DATEV journal posting', 'yes', '—', '—', '—', '—', 'yes'],
              ['EU VAT / ZATCA / FTA', 'yes', 'yes', 'yes', '—', 'yes', 'yes'],
              ['PO + delivery note 3-way match', '—', '—', '—', '—', '—', 'yes'],
              ['AI account assignments', 'yes', '—', '—', '—', '—', 'yes'],
              ['Cash discount (Skonto)', 'yes', '—', '—', '—', '—', 'yes'],
              ['Claims coverage check', '—', '—', 'yes', '—', '—', '—'],
              ['Document authenticity', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
              ['Material consumption / CO₂', '—', '—', '—', '—', '—', 'yes'],
              ['Approval workflow', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i}>{cell === 'yes' ? <ModuleIcon name="check" size={14} /> : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showCustom && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Create custom use case</h2>
            <label className={styles.field}>
              Name
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Construction subcontractor invoices"
              />
            </label>
            <label className={styles.field}>
              Description
              <input
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="What should this scenario automate?"
              />
            </label>
            <label className={styles.field}>
              Industry
              <input
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                placeholder="custom"
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={() => setShowCustom(false)}>
                Cancel
              </button>
              <button type="button" className={styles.btnPrimary} onClick={handleCreateCustom}>
                Create &amp; activate
              </button>
            </div>
          </div>
        </div>
      )}
    </InvoiceShell>
  );
}
