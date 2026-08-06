'use client';

import { useState } from 'react';
import styles from '../support.module.css';
import { ModuleIcon } from '@ai-pass/ui';

/** Embedded widget stub for external sites */
export function EmbeddedSupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.widget}>
      {open && (
        <div className={styles.widgetPanel}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
            Support Chat
          </div>
          <div style={{ flex: 1, padding: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            Widget stub — embed on external sites via script tag.
            <br /><br />
            Connect to <code>/api/customer-support-ai/conversation/start</code>
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
            <input className={styles.input} placeholder="Type a message…" style={{ width: '100%' }} readOnly />
          </div>
        </div>
      )}
      <button
        type="button"
        className={styles.widgetBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open support chat"
      >
        <ModuleIcon name="message-circle" size={20} />
      </button>
    </div>
  );
}
