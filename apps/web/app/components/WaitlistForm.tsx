'use client';

import { FormEvent, useState } from 'react';
import styles from './demo-booking.module.css';

const INTERESTS = [
  'Personal digital twin',
  'Company / business twin',
  'Robotics and production agents',
  'Policy routing and audit',
  'Design partner pilot',
];

const REGIONS = ['EU', 'UK', 'US', 'MENA', 'Other'];

export function WaitlistForm({ source = 'waitlist-page' }: { source?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [role, setRole] = useState('');
  const [interest, setInterest] = useState(INTERESTS[0]);
  const [region, setRegion] = useState('EU');
  const [useCase, setUseCase] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'fallback'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (hp) return;
    if (!consent) {
      setError('Please agree so we can contact you about the waiting list.');
      return;
    }
    setStatus('sending');
    setError('');
    const payload = {
      name,
      email,
      organisation: org,
      role,
      interest,
      region,
      useCase,
      consent,
      company_website: hp,
      source,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/waitlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus('ok');
        return;
      }
      const body = await res.json().catch(() => null);
      if (body?.error === 'consent') {
        setError('Please agree so we can contact you about the waiting list.');
        setStatus('idle');
        return;
      }
    } catch {
      // static hosts may not run PHP; fall through to mailto
    }

    const subject = encodeURIComponent(`Waiting list · ${org || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nOrganisation: ${org}\nRole: ${role}\nInterest: ${interest}\nRegion: ${region}\n\n${useCase}`,
    );
    window.location.href = `mailto:contact@aipass.space?subject=${subject}&body=${body}`;
    setStatus('fallback');
  }

  if (status === 'ok' || status === 'fallback') {
    return (
      <div className={styles.done} role="status">
        <strong>You are on the waiting list.</strong>
        <p>
          {status === 'ok'
            ? 'We will email your work address when a design-partner or early-access slot opens.'
            : 'Your mail app opened with the request. If it did not, email contact@aipass.space.'}
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
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
          Role
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Founder, plant lead, IT…"
            autoComplete="organization-title"
          />
        </label>
        <label>
          Interest
          <select value={interest} onChange={(e) => setInterest(e.target.value)}>
            {INTERESTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data region
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.wide}>
          What should agents do for you? (optional)
          <textarea
            rows={3}
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder="Personal routines, plant quality agents, robotics cell, invoice approvals…"
          />
        </label>
        <label className={styles.wide} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.65rem' }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: '0.2rem' }}
          />
          <span style={{ fontWeight: 500 }}>
            I agree that AI-Pass may contact me about the waiting list and early access. Unticked by
            default.
          </span>
        </label>
      </div>
      <label className={styles.hp} aria-hidden="true">
        Company website
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Joining…' : 'Join the waiting list'}
      </button>
      <p className={styles.fine}>No credit card. No spam. Early access for personal, business and robotics twins.</p>
    </form>
  );
}
