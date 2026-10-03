'use client';

import { FormEvent, useState } from 'react';
import { LAB_EMAIL } from '../../lib/hopn-lab';
import styles from '../research.module.css';

export function ContactForm() {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [message, setMessage] = useState('I would like a walkthrough of HOPN Lab and the interactive demo.');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent('HOPN Lab contact');
    const body = encodeURIComponent(`Name: ${name}\nOrganisation: ${org}\n\n${message}`);
    window.location.href = `mailto:${LAB_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Organisation
        <input value={org} onChange={(e) => setOrg(e.target.value)} />
      </label>
      <label>
        How can we help?
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </label>
      <button type="submit" className={styles.btnPrimary}>
        Open email to {LAB_EMAIL}
      </button>
    </form>
  );
}
