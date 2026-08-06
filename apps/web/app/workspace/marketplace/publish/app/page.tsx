'use client';

import { useState } from 'react';
import { Button } from '@ai-pass/ui';
import styles from '../../marketplace.module.css';

const STEPS = [
  'Application Info',
  'Technical Config',
  'Permissions',
  'Pricing',
  'AI Models Used',
  'Security Review',
  'Submit',
];

export default function PublishAppWizardPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    appType: 'hosted_saas',
    category: 'finance',
    permissions: 'documents.read,wallet.deduct',
    pricingModel: 'subscription',
    priceMonthly: '99',
    modelsUsed: 'gpt-4o',
  });

  async function submit() {
    const res = await fetch('/api/v1/marketplace/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        developerId: 'dev_ai_pass',
        appType: form.appType,
        category: form.category,
        pricingModel: form.pricingModel,
        priceMonthly: Number(form.priceMonthly) || undefined,
        riskLevel: 'medium',
        supportedPlatforms: ['web'],
        skillIds: [],
        modelsUsed: form.modelsUsed.split(',').map((s) => s.trim()),
        tags: [],
        permissions: form.permissions.split(',').map((s) => s.trim()),
        certified: false,
        enterpriseReady: false,
        openSource: false,
        featured: false,
        trending: false,
        sponsored: false,
        installCount: 0,
        rating: 0,
        reviewCount: 0,
        version: '0.1.0',
      }),
    });
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.wizard}>
        <h1 className={styles.heroTitle}>App Submitted</h1>
        <p className={styles.heroSub}>Your app is in the security review queue. You will be notified when approved.</p>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      <h1 className={styles.heroTitle}>Publish App — 7-Step Wizard</h1>
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
            <label htmlFor="name">App name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="desc">Description</label>
            <textarea id="desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="appType">Application type</label>
            <select id="appType" value={form.appType} onChange={(e) => setForm({ ...form, appType: e.target.value })}>
              <option value="hosted_saas">Hosted SaaS</option>
              <option value="github_app">GitHub App</option>
              <option value="external_app">External API</option>
              <option value="agent_pack">Agent Pack</option>
              <option value="automation_pack">Automation Pack</option>
              <option value="skill_pack">Skill Pack</option>
              <option value="enterprise_app">Enterprise</option>
              <option value="private_app">Private</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="finance">Finance</option>
              <option value="hr">HR</option>
              <option value="supply_chain">Supply Chain</option>
              <option value="customer_support">Customer Support</option>
              <option value="ai_agents">AI Agents</option>
            </select>
          </div>
        </>
      )}

      {step === 2 && (
        <div className={styles.formGroup}>
          <label htmlFor="permissions">Permissions (comma-separated)</label>
          <input id="permissions" value={form.permissions} onChange={(e) => setForm({ ...form, permissions: e.target.value })} />
        </div>
      )}

      {step === 3 && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="pricing">Pricing model</label>
            <select id="pricing" value={form.pricingModel} onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="subscription">Subscription</option>
              <option value="pay_per_use">Pay per use</option>
              <option value="enterprise_license">Enterprise license</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="price">Monthly price (USD)</label>
            <input id="price" type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })} />
          </div>
          <p className={styles.heroSub}>Revenue share: 70% developer / 30% platform</p>
        </>
      )}

      {step === 4 && (
        <div className={styles.formGroup}>
          <label htmlFor="models">AI models used (comma-separated)</label>
          <input id="models" value={form.modelsUsed} onChange={(e) => setForm({ ...form, modelsUsed: e.target.value })} />
        </div>
      )}

      {step === 5 && (
        <p className={styles.heroSub}>
          Security pipeline will run: static analysis, dependency scan, permission review, and AI safety check.
          Critical-risk apps require manual approval.
        </p>
      )}

      {step === 6 && (
        <p className={styles.heroSub}>Review your submission and publish to the marketplace catalog.</p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
        {step < STEPS.length - 1 && (
          <Button variant="primary" onClick={() => setStep(step + 1)}>Next</Button>
        )}
        {step === STEPS.length - 1 && (
          <Button variant="primary" onClick={submit}>Submit for Review</Button>
        )}
      </div>
    </div>
  );
}
