'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTrustEngine } from '@ai-pass/trust-engine';
import type { CertificationLevel } from '@ai-pass/shared';
import { Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

const STEPS = ['Basic Info', 'AI System Scope', 'Validation Inputs', 'Certification Level', 'Review & Submit'];

export default function CertificationWizardPage() {
  const router = useRouter();
  const engine = getTrustEngine();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('AI Pass Labs');
  const [productName, setProductName] = useState('');
  const [systemType, setSystemType] = useState('marketplace_app');
  const [industry, setIndustry] = useState('finance');
  const [useCase, setUseCase] = useState('');
  const [modelsUsed, setModelsUsed] = useState('gpt-4o');
  const [highRisk, setHighRisk] = useState(false);
  const [level, setLevel] = useState<CertificationLevel>('silver');
  const [systemId, setSystemId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    try {
      setError(null);
      let sid = systemId;
      if (!sid) {
        const sys = engine.systems.register({
          companyName,
          productName,
          systemType: systemType as 'marketplace_app',
          industry,
          useCase,
          deploymentType: 'cloud',
          modelsUsed: modelsUsed.split(',').map((m) => m.trim()),
          highRiskDomain: highRisk,
        });
        sid = sys.id;
        setSystemId(sid);
      }

      const run = engine.validate({
        systemId: sid,
        certificationLevel: level,
        userId: 'demo-user',
        tenantId: 'tenant_acme',
        tier: 'enterprise',
      });
      setRunId(run.id);

      engine.certify({
        systemId: sid,
        level,
        validationRunId: run.id,
        userId: 'demo-user',
        tenantId: 'tenant_acme',
        tier: 'enterprise',
      });

      router.push(`/workspace/trust/systems/${sid}`);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <WorkspaceLayoutClient title="Certification Wizard" subtitle="5-step AI system certification">
      <div className={styles.wizard}>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <span key={s} className={`${styles.step} ${i === step ? styles.stepActive : ''}`}>{i + 1}. {s}</span>
          ))}
        </div>

        <Card padding="lg">
          {step === 0 && (
            <div className={styles.formGrid}>
              <div className={styles.field}><label>Company name</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
              <div className={styles.field}><label>Product name</label><input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Invoice AI" /></div>
            </div>
          )}
          {step === 1 && (
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>System type</label>
                <select value={systemType} onChange={(e) => setSystemType(e.target.value)}>
                  <option value="agent">Agent</option>
                  <option value="app">App</option>
                  <option value="workflow">Workflow</option>
                  <option value="marketplace_app">Marketplace App</option>
                  <option value="enterprise_system">Enterprise System</option>
                </select>
              </div>
              <div className={styles.field}><label>Industry</label><input value={industry} onChange={(e) => setIndustry(e.target.value)} /></div>
              <div className={styles.field}><label>Use case</label><textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} rows={3} /></div>
            </div>
          )}
          {step === 2 && (
            <div className={styles.formGrid}>
              <div className={styles.field}><label>Models used (comma-separated)</label><input value={modelsUsed} onChange={(e) => setModelsUsed(e.target.value)} /></div>
              <label><input type="checkbox" checked={highRisk} onChange={(e) => setHighRisk(e.target.checked)} /> High-risk domain</label>
            </div>
          )}
          {step === 3 && (
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Certification level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value as CertificationLevel)}>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <p><strong>{productName}</strong> by {companyName}</p>
              <p>Type: {systemType} · Level: {level} · Models: {modelsUsed}</p>
              {runId && <p>Validation run: {runId}</p>}
              {error && <p style={{ color: '#ef4444' }}>{error}</p>}
            </div>
          )}
        </Card>

        <div className={styles.navRow}>
          <Button variant="secondary" size="sm" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 4 ? (
            <Button variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button variant="primary" size="sm" onClick={submit}>Submit certification</Button>
          )}
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}
