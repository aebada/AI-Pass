'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SolutionSpec } from '@ai-pass/builder';
import { BusinessShell, Button, Card, Badge, businessTheme } from '../components/business/BusinessShell';

export default function SolutionsPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<SolutionSpec[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ai-pass:solutions') ?? '[]') as SolutionSpec[];
      const last = localStorage.getItem('ai-pass:last-solution');
      const all = last ? [...stored, ...(stored.find((s) => s.id === JSON.parse(last).id) ? [] : [JSON.parse(last)])] : stored;
      setSolutions(all);
    } catch {
      setSolutions([]);
    }
  }, []);

  return (
    <BusinessShell
      title="My Solutions"
      subtitle="Manage, deploy, and share your business applications"
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Button onClick={() => router.push('/requirements')}>+ New Solution</Button>
        <Button variant="secondary" onClick={() => router.push('/studio')}>Open Studio</Button>
      </div>

      {solutions.length === 0 ? (
        <Card>
          <p style={{ color: businessTheme.muted, margin: '0 0 16px' }}>
            No solutions yet. Start by describing your business requirements.
          </p>
          <Button onClick={() => router.push('/requirements')}>Create Your First App</Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {solutions.map((sol) => (
            <Card key={sol.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{sol.name}</h3>
                <Badge color={sol.status === 'deployed' ? businessTheme.success : businessTheme.warning}>
                  {sol.status}
                </Badge>
              </div>
              <p style={{ color: businessTheme.muted, fontSize: 14, margin: '0 0 12px' }}>{sol.description}</p>
              <div style={{ fontSize: 12, color: businessTheme.muted, marginBottom: 16 }}>
                Platforms: {sol.platforms.join(', ')} · Risk: {sol.governance.riskLevel}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={() => {
                  localStorage.setItem('ai-pass:studio-spec', localStorage.getItem('ai-pass:last-requirement') ?? '');
                  router.push('/studio');
                }}>
                  Edit
                </Button>
                {sol.status === 'deployed' && (
                  <Link href={`/preview/${sol.id}`} style={{ color: businessTheme.accent, fontSize: 14, alignSelf: 'center' }}>
                    Preview →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Role-Based Access</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['business_admin', 'builder', 'viewer'] as const).map((role) => (
            <Badge key={role} color={role === 'business_admin' ? businessTheme.accent : businessTheme.muted}>
              {role.replace('_', ' ')}
            </Badge>
          ))}
        </div>
        <p style={{ color: businessTheme.muted, fontSize: 13, marginTop: 8 }}>
          Business admins approve deployments. Builders create solutions. Viewers access deployed apps only.
        </p>
      </section>
    </BusinessShell>
  );
}
