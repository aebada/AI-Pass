'use client';

import Link from 'next/link';
import { FormEvent, useId, useState } from 'react';
import { CONTACT_EMAIL, mailtoContactRequest, type ContactIntent } from '../../lib/site-config';
import pageStyles from '../../page.module.css';
import section from '../../home-sections.module.css';
import { ModuleIcon } from '@ai-pass/ui';

const TRUST_SIGNALS = [
  { icon: 'zap', label: 'Response within 1 business day' },
  { icon: 'check', label: 'No commitment required' },
  { icon: 'lock', label: 'Enterprise-grade privacy' },
];

type ContactCTASectionProps = {
  id?: string;
  compact?: boolean;
};

export function ContactCTASection({ id = 'contact', compact = false }: ContactCTASectionProps) {
  const formId = useId();
  const [intent, setIntent] = useState<ContactIntent>('demo');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const href = mailtoContactRequest(intent, {
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      message: message.trim() || undefined,
    });
    window.location.href = href;
  };

  const isCallback = intent === 'callback';

  return (
    <section
      className={`${section.section} ${compact ? section.sectionCompact : section.sectionAlt}`}
      id={id}
      aria-labelledby={`${formId}-heading`}
    >
      <div className={section.container}>
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Talk to us</span>
          <h2 className={section.sectionTitle} id={`${formId}-heading`}>
            Book a demo or request a call
          </h2>
          <p className={section.sectionDesc}>
            Tell us about your team — we&apos;ll tailor a walkthrough or schedule a callback.
            Prefer email? Reach us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={section.contactEmailInline}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>

        <div className={section.contactLayout}>
          <div className={section.contactPanel}>
            <div
              className={section.contactIntentTabs}
              role="tablist"
              aria-label="Contact request type"
            >
              <button
                type="button"
                role="tab"
                id={`${formId}-tab-demo`}
                aria-selected={!isCallback}
                aria-controls={`${formId}-panel`}
                className={`${section.contactIntentTab} ${!isCallback ? section.contactIntentTabActive : ''}`}
                onClick={() => setIntent('demo')}
              >
                Book a demo
              </button>
              <button
                type="button"
                role="tab"
                id={`${formId}-tab-callback`}
                aria-selected={isCallback}
                aria-controls={`${formId}-panel`}
                className={`${section.contactIntentTab} ${isCallback ? section.contactIntentTabActive : ''}`}
                onClick={() => setIntent('callback')}
              >
                Request a call
              </button>
            </div>

            <form
              id={`${formId}-panel`}
              role="tabpanel"
              aria-labelledby={isCallback ? `${formId}-tab-callback` : `${formId}-tab-demo`}
              className={section.contactForm}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={section.contactFormRow}>
                <div className={section.contactField}>
                  <label htmlFor={`${formId}-name`}>Name</label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className={section.contactField}>
                  <label htmlFor={`${formId}-email`}>Work email</label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div className={section.contactFormRow}>
                <div className={section.contactField}>
                  <label htmlFor={`${formId}-company`}>Company</label>
                  <input
                    id={`${formId}-company`}
                    type="text"
                    name="organization"
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
                {isCallback && (
                  <div className={section.contactField}>
                    <label htmlFor={`${formId}-phone`}>Phone number</label>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      name="tel"
                      autoComplete="tel"
                      required={isCallback}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                )}
              </div>

              <div className={section.contactField}>
                <label htmlFor={`${formId}-message`}>
                  {isCallback ? 'Best time to call (optional)' : 'What would you like to see? (optional)'}
                </label>
                <textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isCallback
                      ? 'e.g. Weekdays after 2pm CET'
                      : 'e.g. Invoice AI workflow and governance controls'
                  }
                />
              </div>

              <button
                type="submit"
                className={`${pageStyles.btnPrimary} ${section.contactSubmit}`}
                aria-label={isCallback ? 'Submit callback request via email' : 'Submit demo request via email'}
              >
                {isCallback ? 'Request a call' : 'Book a demo'}
              </button>

              <p className={section.contactFormNote}>
                Opens your email client with a pre-filled message to {CONTACT_EMAIL}. No account required.
              </p>
            </form>
          </div>

          <aside className={section.contactAside} aria-label="Why reach out">
            <h3 className={section.contactAsideTitle}>What to expect</h3>
            <ul className={section.contactAsideList}>
              <li>30-minute tailored walkthrough of workspace, apps, and governance</li>
              <li>Answers on security, compliance, and deployment options</li>
              <li>No pressure — explore the free tier anytime</li>
            </ul>
            <div className={section.contactTrustGrid} role="list" aria-label="Trust signals">
              {TRUST_SIGNALS.map((signal) => (
                <div key={signal.label} className={section.contactTrustItem} role="listitem">
                  <span className={section.contactTrustIcon} aria-hidden>
                    <ModuleIcon name={signal.icon} size={16} />
                  </span>
                  <span>{signal.label}</span>
                </div>
              ))}
            </div>
            <Link href="/about#contact" className={section.contactMoreLink}>
              More contact options →
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
