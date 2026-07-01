'use client';

import { useState } from 'react';
import { Badge, Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { useMarketplacePlatform } from '../../../components/marketplace/marketplace-client';
import styles from '../marketplace.module.css';

const STEPS = ['Basic Info', 'Technical', 'Pricing', 'Certification', 'Publish'];

export default function SubmitWizardPage() {
  const platform = useMarketplacePlatform();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'finance',
    appType: 'hosted_saas',
    pricingModel: 'subscription',
    priceMonthly: 49,
    permissions: 'wallet.deduct',
  });
  const [published, setPublished] = useState<string | null>(null);

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function publish() {
    const app = platform.apps.register({
      name: form.name || 'Untitled App',
      slug: (form.name || 'untitled').toLowerCase().replace(/\s+/g, '-'),
      description: form.description || 'No description',
      developerId: 'dev_ai_pass',
      appType: form.appType as never,
      category: form.category as never,
      pricingModel: form.pricingModel as never,
      priceMonthly: form.priceMonthly,
      riskLevel: 'medium',
      supportedPlatforms: ['web'],
      skillIds: [],
      modelsUsed: ['gpt-4o'],
      tags: [],
      permissions: form.permissions.split(',').map((p) => p.trim()),
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
    });
    setPublished(app.id);
  }

  return (
    <WorkspaceLayoutClient
      title="App Submission Wizard"
      subtitle="Publish your app to the AI Pass Marketplace"
    >
      <div className={styles.wizardSteps}>
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`${styles.wizardStep} ${i === step ? styles.wizardStepActive : ''}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <Card padding="lg">
        {published ? (
          <div>
            <Badge variant="success">Published!</Badge>
            <p className={styles.cardMeta}>App ID: {published}</p>
          </div>
        ) : (
          <div className={styles.wizardForm}>
            {step === 0 && (
              <>
                <div className={styles.formField}>
                  <label htmlFor="name">App Name</label>
                  <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="desc">Description</label>
                  <textarea id="desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className={styles.formField}>
                  <label htmlFor="type">App Type</label>
                  <select id="type" value={form.appType} onChange={(e) => setForm({ ...form, appType: e.target.value })}>
                    <option value="hosted_saas">Hosted SaaS</option>
                    <option value="automation_pack">Automation Pack</option>
                    <option value="agent_pack">Agent Pack</option>
                    <option value="skill_pack">Skill Pack</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label htmlFor="perms">Permissions (comma-separated)</label>
                  <input id="perms" value={form.permissions} onChange={(e) => setForm({ ...form, permissions: e.target.value })} />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className={styles.formField}>
                  <label htmlFor="pricing">Pricing Model</label>
                  <select id="pricing" value={form.pricingModel} onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}>
                    <option value="free">Free</option>
                    <option value="subscription">Subscription</option>
                    <option value="pay_per_use">Pay Per Use</option>
                    <option value="enterprise_license">Enterprise</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label htmlFor="price">Monthly Price (USD)</label>
                  <input id="price" type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: Number(e.target.value) })} />
                </div>
              </>
            )}
            {step === 3 && (
              <p className={styles.cardMeta}>
                Submit for Trust Engine certification review. Certified apps receive enterprise-ready badges.
              </p>
            )}
            {step === 4 && (
              <p className={styles.cardMeta}>Ready to publish to the marketplace catalog.</p>
            )}

            <div className={styles.cardActions}>
              {step > 0 && (
                <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button variant="primary" onClick={next}>Next</Button>
              ) : (
                <Button variant="primary" onClick={publish}>Publish</Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </WorkspaceLayoutClient>
  );
}
