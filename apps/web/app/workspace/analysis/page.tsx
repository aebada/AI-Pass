'use client';

import { useMemo, useState } from 'react';
import { defaultWorkspaceService } from '@ai-pass/platform-core';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';

const LAYERS = [
  {
    title: 'Signal intake',
    copy: 'Collector events, employee twins, apps, and documents land in one analysis fabric.',
  },
  {
    title: 'Ontology grounding',
    copy: 'Terms are matched to your classes and properties so scores stay domain-true.',
  },
  {
    title: 'Graph hops',
    copy: 'Every recommendation walks provenance hops — who, what rule, which source.',
  },
  {
    title: 'Action gate',
    copy: 'Payments and irreversible moves stay confirmation-gated after analysis.',
  },
];

const SAMPLE_SCORES = [
  { label: 'Invoice payment risk', score: 82, action: 'Hold for dual approval', tone: 'warning' as const },
  { label: 'Sales follow-up priority', score: 91, action: 'Route to AE twin', tone: 'success' as const },
  { label: 'Employee workload balance', score: 64, action: 'Suggest reassignment', tone: 'default' as const },
  { label: 'Production SOP drift', score: 77, action: 'Open quality hop path', tone: 'warning' as const },
];

export default function AnalysisPage() {
  const insights = defaultWorkspaceService.getDashboard().insights;
  const [query, setQuery] = useState('Which payments need a human gate this week?');
  const [result, setResult] = useState<string | null>(null);

  const ranked = useMemo(
    () =>
      SAMPLE_SCORES.map((row) => ({
        ...row,
        boost: query.toLowerCase().includes('payment') && row.label.toLowerCase().includes('payment') ? 8 : 0,
      })).sort((a, b) => b.score + b.boost - (a.score + a.boost)),
    [query],
  );

  return (
    <WorkspaceLayoutClient
      title="AI Analysis Layer"
      subtitle="Score twin signals, ground them in ontology, and gate actions with explainable hops"
    >
      <div style={{ display: 'grid', gap: 16 }}>
        <Card padding="md">
          <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Ask the analysis layer</h3>
          <p style={{ margin: '0 0 12px', color: workspaceTokens.colors.textMuted, fontSize: 13 }}>
            Analysis reads digital twins for people, apps, and machines — then returns ranked actions under policy.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: 240,
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${workspaceTokens.colors.border}`,
              }}
            />
            <button
              type="button"
              onClick={() =>
                setResult(
                  `Grounded on employee + business twins. Top action: ${ranked[0]?.action}. Confidence ${ranked[0]?.score}%.`,
                )
              }
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: workspaceTokens.colors.accent,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Analyze
            </button>
          </div>
          {result ? (
            <p style={{ margin: '12px 0 0', fontSize: 14, fontWeight: 600 }}>{result}</p>
          ) : null}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {LAYERS.map((layer) => (
            <Card key={layer.title} padding="md">
              <strong style={{ fontSize: 14 }}>{layer.title}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '6px 0 0' }}>{layer.copy}</p>
            </Card>
          ))}
        </div>

        <Card padding="md">
          <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Ranked twin actions</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {ranked.map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${workspaceTokens.colors.border}`,
                  background: workspaceTokens.colors.bgElevated,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: workspaceTokens.colors.textMuted }}>{row.action}</div>
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    color:
                      row.tone === 'success'
                        ? workspaceTokens.colors.success
                        : row.tone === 'warning'
                          ? workspaceTokens.colors.warning
                          : workspaceTokens.colors.accent,
                  }}
                >
                  {row.score + row.boost}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {insights.map((i) => (
            <Card key={i.id} padding="md">
              <div style={{ fontSize: 24, fontWeight: 700, color: workspaceTokens.colors.accent }}>{i.metric}</div>
              <strong style={{ fontSize: 14 }}>{i.title}</strong>
              <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>{i.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}
