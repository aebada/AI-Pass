'use client';

import { FormEvent, useState } from 'react';
import { ORG_ROLES, type OrgRole } from '../lib/demo-graph';
import styles from './demo-booking.module.css';

const INTERESTS = [
  'Explainable knowledge graph',
  'Deterministic decisions',
  'Role-based org rules',
  'On-prem / air-gapped',
  'Routing and spend control',
];

export function DemoBookingForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [role, setRole] = useState<OrgRole>('quality_engineer');
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'fallback'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (hp) return;
    setStatus('sending');
    setError('');
    const payload = {
      name,
      email,
      organisation: org,
      role,
      interest,
      notes,
      source: compact ? 'hero' : 'demo-page',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/book-demo.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus('ok');
        return;
      }
    } catch {
      // static hosts may not run PHP; fall through to mailto
    }

    const subject = encodeURIComponent(`Demo request · ${org || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nOrganisation: ${org}\nRole: ${role}\nInterest: ${interest}\n\n${notes}`,
    );
    window.location.href = `mailto:hello@ai-pass.com?subject=${subject}&body=${body}`;
    setStatus('fallback');
  }

  if (status === 'ok' || status === 'fallback') {
    return (
      <div className={styles.done} role="status">
        <strong>Request received.</strong>
        <p>
          {status === 'ok'
            ? 'We will follow up on the work email you entered. Meanwhile you can keep using the interactive graph.'
            : 'Your mail app opened with the request. If it did not, email hello@ai-pass.com.'}
        </p>
      </div>
    );
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={onSubmit}>
      <div className={styles.grid}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </label>
        <label>
          Work email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Organisation
          <input value={org} onChange={(e) => setOrg(e.target.value)} required autoComplete="organization" />
        </label>
        <label>
          Your role
          <select value={role} onChange={(e) => setRole(e.target.value as OrgRole)}>
            {ORG_ROLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.wide}>
          What should the demo prove?
          <select value={interest} onChange={(e) => setInterest(e.target.value)}>
            {INTERESTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.wide}>
          Context (optional)
          <textarea
            rows={compact ? 2 : 3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Plant, regulation, or the decision you need to explain."
          />
        </label>
      </div>
      <label className={styles.hp} aria-hidden>
        Company website
        <input value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Book a self-serve demo'}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
      <p className={styles.fine}>
        The form is the product path: role, org rules, then a walkthrough. No credit card.
      </p>
    </form>
  );
}
