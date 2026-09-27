'use client';

import { useMemo, useState } from 'react';
import { applyMaskingWithReport, presets, type PresetName } from '@ai-pass/data-masking';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';

const SAMPLE = `{
  "user": {
    "fullName": "Anna Schneider",
    "email": "anna.schneider@example.com",
    "phone": "+49 170 1234567",
    "password": "SuperSecret!2026",
    "apiKey": "sk_live_ab12cd34ef56gh78ij90"
  },
  "notes": "Call Anna at +49 170 1234567 or anna.schneider@example.com"
}`;

export default function DataMaskingPage() {
  const [preset, setPreset] = useState<PresetName>('apiShare');
  const [input, setInput] = useState(SAMPLE);

  const { result, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(input) as unknown;
      return { result: applyMaskingWithReport(parsed, preset), error: null as string | null };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : 'Invalid JSON' };
    }
  }, [input, preset]);

  return (
    <WorkspaceLayoutClient title="Data Masking" subtitle="Secure API shares — mask names, passwords, secrets in one line">
      <ModuleScaffold
        title="Easy-to-apply masking layer"
        description="Drop applyMasking(payload) on any API response, webhook, or partner export before data leaves the trust boundary."
        moduleId="data-masking"
      >
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <section>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Policy</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as PresetName)}
              style={{ width: '100%', padding: '10px 12px', marginBottom: 12 }}
            >
              {Object.entries(presets).map(([key, p]) => (
                <option key={key} value={key}>{p.name} — {p.description}</option>
              ))}
            </select>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Input JSON</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={16}
              style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 13, padding: 12 }}
            />
            {error && <p style={{ color: '#b42318', marginTop: 8 }}>{error}</p>}
          </section>
          <section>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
              Masked output {result ? `(${result.hits.length} hits · ${result.policyId})` : ''}
            </label>
            <pre style={{
              margin: 0,
              padding: 12,
              background: 'var(--bg-elevated, #f6f7f9)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: 8,
              overflow: 'auto',
              minHeight: 280,
              fontSize: 13,
            }}>
              {result ? JSON.stringify(result.data, null, 2) : '—'}
            </pre>
            <div style={{ marginTop: 16, padding: 12, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Apply in one line</p>
              <code style={{ fontSize: 12, display: 'block', whiteSpace: 'pre-wrap' }}>
{`import { applyMasking } from '@ai-pass/data-masking';

// Before sharing via API / webhook / partner
return Response.json(applyMasking(payload));
// or: applyMasking(payload, 'external')`}
              </code>
            </div>
          </section>
        </div>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
