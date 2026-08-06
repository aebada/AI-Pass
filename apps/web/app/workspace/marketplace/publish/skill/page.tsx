'use client';

import { useState } from 'react';
import { Button } from '@ai-pass/ui';
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS } from '@ai-pass/marketplace-core';
import styles from '../../marketplace.module.css';

const STEPS = ['Skill Info', 'Schema', 'Permissions & Models', 'Pricing', 'Security', 'Submit'];

export default function PublishSkillWizardPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'parsing' as (typeof SKILL_CATEGORIES)[number],
    creditCost: '10',
    permissions: 'wallet.deduct',
    models: 'gpt-4o',
    dependencies: '',
  });

  async function submit() {
    const res = await fetch('/api/v1/marketplace/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        version: '0.1.0',
        developerId: 'dev_ai_pass',
        category: form.category,
        riskLevel: 'medium',
        planTierRequired: 'free',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        creditCost: Number(form.creditCost),
        deterministic: false,
        explainabilityRequired: false,
        permissions: form.permissions.split(',').map((s) => s.trim()),
        compatibleModels: form.models.split(',').map((s) => s.trim()),
        dependencies: form.dependencies ? form.dependencies.split(',').map((s) => s.trim()) : [],
        platforms: ['web'],
        tags: [],
        modelsUsed: form.models.split(',').map((s) => s.trim()),
        lifecycleStatus: 'review',
        certified: false,
        featured: false,
        trending: false,
        installCount: 0,
        rating: 0,
        reviewCount: 0,
      }),
    });
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.wizard}>
        <h1 className={styles.heroTitle}>Skill Submitted</h1>
        <p className={styles.heroSub}>Your skill entered the review pipeline and will appear after certification.</p>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      <h1 className={styles.heroTitle}>Publish Skill Wizard</h1>
      <div className={styles.wizardSteps}>
        {STEPS.map((label, i) => (
          <span key={label} className={`${styles.wizardStep} ${i === step ? styles.wizardStepActive : ''}`}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="name">Skill name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="desc">Description</label>
            <textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cat">Category</label>
            <select id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}>
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{SKILL_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {step === 1 && (
        <p className={styles.heroSub}>Input/output JSON Schema will be validated by the Skills Registry on publish.</p>
      )}

      {step === 2 && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="permissions">Permissions</label>
            <input id="permissions" value={form.permissions} onChange={(e) => setForm({ ...form, permissions: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="models">Compatible models</label>
            <input id="models" value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="deps">Dependencies (skill IDs)</label>
            <input id="deps" value={form.dependencies} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} />
          </div>
        </>
      )}

      {step === 3 && (
        <div className={styles.formGroup}>
          <label htmlFor="credits">Credit cost per execution</label>
          <input id="credits" type="number" value={form.creditCost} onChange={(e) => setForm({ ...form, creditCost: e.target.value })} />
        </div>
      )}

      {step === 4 && (
        <p className={styles.heroSub}>Security pipeline checks permissions, dependencies, and AI safety for skill risk level.</p>
      )}

      {step === 5 && (
        <p className={styles.heroSub}>Submit skill for marketplace listing. Wallet integration is automatic on execution.</p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
        {step < STEPS.length - 1 && <Button variant="primary" onClick={() => setStep(step + 1)}>Next</Button>}
        {step === STEPS.length - 1 && <Button variant="primary" onClick={submit}>Publish Skill</Button>}
      </div>
    </div>
  );
}
