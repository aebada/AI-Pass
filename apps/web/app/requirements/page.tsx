'use client';

import { useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { parseRequirements, exportSpecJson, type RequirementSpec } from '@ai-pass/requirements';
import { Badge, Card } from '@ai-pass/ui';
import { BusinessShell, Button } from '../components/business/BusinessShell';
import styles from './requirements.module.css';

const WIZARD_STEPS = [
  { id: 1, label: 'Describe', desc: 'Title & requirements' },
  { id: 2, label: 'Review', desc: 'Parsed spec' },
  { id: 3, label: 'Studio', desc: 'Build solution' },
];

const SAMPLE = `We need a customer support system where support agents can manage tickets.
Customers submit issues via email and web portal. The system should auto-categorize tickets,
assign priority, and use AI to draft responses. High-priority tickets require manager approval.
Integrate with Salesforce CRM for customer context.`;

export default function RequirementsPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [industry, setIndustry] = useState('');
  const [parsed, setParsed] = useState<RequirementSpec | null>(null);
  const [step, setStep] = useState(1);

  function handleParse() {
    const spec = parseRequirements({
      title: title || 'Untitled Solution',
      description,
      naturalLanguage,
      industry: industry || undefined,
    });
    setParsed(spec);
    setStep(2);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-pass:last-requirement', JSON.stringify(spec));
    }
  }

  function handleExport() {
    if (!parsed) return;
    const blob = new Blob([exportSpecJson(parsed)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${parsed.title.replace(/\s+/g, '-').toLowerCase()}-spec.json`;
    a.click();
  }

  function handleContinue() {
    if (parsed) {
      localStorage.setItem('ai-pass:studio-spec', JSON.stringify(parsed));
      router.push('/studio');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 14,
    fontFamily: 'inherit',
  };

  return (
    <BusinessShell
      title="Requirements Wizard"
      subtitle="Capture your business need in plain language - AI Pass parses actors, data, workflows, and screens"
    >
      <nav className={styles.stepper} aria-label="Wizard progress">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${step >= s.id ? styles.stepCircleActive : ''} ${step === s.id ? styles.stepCircleCurrent : ''}`}>
              {step > s.id ? '✓' : s.id}
            </div>
            <div className={styles.stepMeta}>
              <span className={styles.stepLabel}>{s.label}</span>
              <span className={styles.stepDesc}>{s.desc}</span>
            </div>
            {i < WIZARD_STEPS.length - 1 && <div className={`${styles.stepLine} ${step > s.id ? styles.stepLineActive : ''}`} />}
          </div>
        ))}
      </nav>

      {step === 1 && (
        <div className={styles.formWrap}>
          <Card variant="glass" padding="lg">
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Solution Title</span>
              <input
                style={inputStyle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Customer Support Portal"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Brief Description</span>
              <input
                style={inputStyle}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One-line summary of the business goal"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Industry (optional)</span>
              <select style={inputStyle} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">Select industry</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="services">Professional Services</option>
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Business Requirements</span>
              <textarea
                style={{ ...inputStyle, minHeight: 180, resize: 'vertical' }}
                value={naturalLanguage}
                onChange={(e) => setNaturalLanguage(e.target.value)}
                placeholder="Describe who uses the system, what workflows they follow, what data is involved, and any integrations..."
              />
            </label>
            <div className={styles.actions}>
              <Button onClick={() => { setNaturalLanguage(SAMPLE); setTitle('Customer Support Portal'); setDescription('AI-powered ticket management'); }}>
                Load Sample
              </Button>
              <Button onClick={handleParse} disabled={!naturalLanguage.trim()}>
                Parse Requirements →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && parsed && (
        <div>
          <div className={styles.actions} style={{ marginBottom: 24 }}>
            <Button variant="secondary" onClick={() => setStep(1)}>← Edit</Button>
            <Button variant="secondary" onClick={handleExport}>Export JSON</Button>
            <Button onClick={handleContinue}>Open in Studio →</Button>
          </div>

          <div className={styles.reviewGrid}>
            <Card variant="glass" padding="md">
              <h3 className={styles.cardTitle}>Actors <Badge variant="default">{parsed.actors.length}</Badge></h3>
              {parsed.actors.map((a) => (
                <div key={a.id} className={styles.listItem}>
                  <strong>{a.name}</strong>
                  <div className={styles.listMeta}>{a.permissions.join(', ')}</div>
                </div>
              ))}
            </Card>
            <Card variant="glass" padding="md">
              <h3 className={styles.cardTitle}>Data Entities <Badge>{parsed.dataEntities.length}</Badge></h3>
              {parsed.dataEntities.map((e) => (
                <div key={e.id} className={styles.listItem}>
                  <strong>{e.name}</strong>
                  <div className={styles.listMeta}>{e.fields.map((f) => f.name).join(', ')}</div>
                </div>
              ))}
            </Card>
            <Card variant="glass" padding="md">
              <h3 className={styles.cardTitle}>Workflows <Badge>{parsed.workflows.length}</Badge></h3>
              {parsed.workflows[0]?.steps.map((s) => (
                <div key={s.id} className={styles.listItem}>
                  <strong>{s.name.slice(0, 40)}</strong>
                  {s.agentName && <Badge variant="success">{s.agentName}</Badge>}
                </div>
              ))}
            </Card>
            <Card variant="glass" padding="md">
              <h3 className={styles.cardTitle}>UI Screens <Badge>{parsed.uiScreens.length}</Badge></h3>
              {parsed.uiScreens.map((s) => (
                <div key={s.id} className={styles.listItem}>
                  <strong>{s.name}</strong>
                  <Badge variant="outline">{s.type}</Badge>
                </div>
              ))}
            </Card>
            <Card variant="glass" padding="md">
              <h3 className={styles.cardTitle}>Integrations <Badge>{parsed.integrations.length}</Badge></h3>
              {parsed.integrations.length === 0 ? (
                <p className={styles.listMeta}>None detected - add in Studio</p>
              ) : (
                parsed.integrations.map((i) => (
                  <div key={i.id} className={styles.listItem}>
                    <strong>{i.name}</strong> - {i.purpose}
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      )}
    </BusinessShell>
  );
}
