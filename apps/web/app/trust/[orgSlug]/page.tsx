import { defaultComplianceAIService } from '@ai-pass/compliance-ai';
import { DEMO_ORG_SLUG, DEMO_TRUST_CENTER } from '@ai-pass/compliance-ai';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [{ orgSlug: DEMO_ORG_SLUG }];
}


export default async function PublicTrustCenterPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const trustCenter =
    defaultComplianceAIService.trustCenter.getPublished(orgSlug) ??
    (orgSlug === DEMO_ORG_SLUG ? DEMO_TRUST_CENTER : undefined);

  if (!trustCenter || trustCenter.status !== 'published') {
    notFound();
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Trust Center</p>
        <h1 style={{ margin: '8px 0' }}>{trustCenter.orgName}</h1>
        <p style={{ fontSize: 15, color: '#444' }}>
          Trust Score: <strong>{trustCenter.trustScore}</strong> · {trustCenter.auditStatus}
        </p>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18 }}>Certifications & Frameworks</h2>
        <ul>
          {trustCenter.frameworks.map((f) => (
            <li key={f.code}>{f.code}: {f.status}</li>
          ))}
        </ul>
        {trustCenter.certifications.map((c) => (
          <p key={c.name} style={{ fontSize: 14 }}>
            {c.name} ({c.level}) — valid until {new Date(c.validUntil).toLocaleDateString()}
            {' · '}
            <a href={c.verificationUrl}>Verify</a>
          </p>
        ))}
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18 }}>Security & Privacy Commitments</h2>
        {trustCenter.commitments.map((c) => (
          <div key={c.id} style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, margin: '0 0 4px' }}>{c.title}</h3>
            <p style={{ fontSize: 14, color: '#555', margin: 0 }}>{c.description}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: 18 }}>AI Governance</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{trustCenter.aiGovernanceSummary}</p>
      </section>

      <footer style={{ marginTop: 48, fontSize: 12, color: '#888' }}>
        Published via Compliance AI · Verified by AI Pass Trust Engine
      </footer>
    </main>
  );
}
