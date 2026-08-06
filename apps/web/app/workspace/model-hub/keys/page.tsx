'use client';

import { useCallback, useState } from 'react';
import { listByoKeys, maskApiKey, removeByoKey, saveByoKey, type ModelProviderId } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

const PROVIDERS: ModelProviderId[] = ['openai', 'anthropic', 'gemini', 'deepseek', 'mistral', 'grok', 'ollama', 'openrouter'];

export default function KeysPage() {
  const [keys, setKeys] = useState(() => listByoKeys());
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const refresh = useCallback(() => setKeys(listByoKeys()), []);

  return (
    <>
      <p className={styles.cardDesc}>BYOK via <code>saveByoKey</code> and <code>listByoKeys</code> (browser localStorage).</p>
      {PROVIDERS.map((id) => {
        const stored = keys.find((k) => k.providerId === id);
        return (
          <div key={id} className={styles.keyRow}>
            <strong style={{ minWidth: 100 }}>{id}</strong>
            <input
              className={styles.keyInput}
              type="password"
              placeholder={stored?.hasKey ? '••••••••' : 'sk-...'}
              value={drafts[id] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [id]: e.target.value }))}
            />
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => {
                const v = drafts[id]?.trim();
                if (!v) return;
                saveByoKey(id, v);
                setDrafts((d) => ({ ...d, [id]: '' }));
                refresh();
              }}
            >
              Save
            </button>
            {stored?.hasKey && (
              <button type="button" className={styles.btn} onClick={() => { removeByoKey(id); refresh(); }}>
                Remove
              </button>
            )}
          </div>
        );
      })}
      <p className={styles.cardDesc} style={{ fontSize: 12 }}>Mask: {maskApiKey('sk-proj-abcdefghijklmnop')}</p>
    </>
  );
}
