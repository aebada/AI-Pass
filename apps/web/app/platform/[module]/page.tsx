import Link from 'next/link';
import { PLATFORM_MODULES, type PlatformModuleId } from '@ai-pass/view';
import { createStorePlatform } from '@ai-pass/store';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import { createGovernancePlatform } from '@ai-pass/governance';
import { createKnowledgePipeline } from '@ai-pass/knowledge-pipeline';
import { LiveSyncEngine } from '@ai-pass/livesync';
import { createAgentStudio } from '@ai-pass/agent-studio';
import { createVerticalsPlatform } from '@ai-pass/verticals';
import { defaultCustomerSupportAIPlatform } from '@ai-pass/customer-support-ai';
import { defaultPresenceAuditPlatform, DEMO_COMPANY } from '@ai-pass/presence-audit';

const MODULE_LOADERS: Record<PlatformModuleId, () => Record<string, unknown>> = {
  workspace: () => ({ message: 'AI Pass Platform at /ide' }),
  requirements: () => ({ parser: 'parseRequirements', status: 'ready' }),
  'builder-studio': () => ({ compiler: 'SolutionCompiler', canvas: 'visual' }),
  solutions: () => ({ dashboard: 'My Solutions', storage: 'localStorage' }),
  'solution-marketplace': () => ({ templates: 4, verticals: ['invoice-ai', 'customer-support', 'supply-chain'] }),
  store: () => {
    const store = createStorePlatform();
    return { apps: store.registry.list().length, featured: store.registry.featured().map((a) => a.name) };
  },
  marketplace: () => {
    const mp = createMarketplacePlatform();
    return { skills: mp.skills.list().map((s) => s.name) };
  },
  'agent-studio': () => {
    const mp = createMarketplacePlatform();
    const studio = createAgentStudio(mp.skills, mp.executor);
    return { agents: studio.registry.list().length, status: 'ready' };
  },
  trust: () => ({ engine: 'ValidationOrchestrator', scoring: '5-dimension model' }),
  governance: () => {
    const gov = createGovernancePlatform();
    return {
      systems: gov.inventory.list().length,
      policies: gov.policies.list().length,
      pendingApprovals: gov.approvals.listPending().length,
      dashboard: gov.getDashboard(),
    };
  },
  'knowledge-pipeline': () => {
    const kp = createKnowledgePipeline();
    return { sources: kp.ingestion.listSources().length, status: 'ready' };
  },
  livesync: () => {
    const engine = new LiveSyncEngine({ autoStartWorker: false });
    return { ...engine.getHealth() };
  },
  'presence-audit': () => {
    const dashboard = defaultPresenceAuditPlatform.getDashboard(DEMO_COMPANY.tenantId);
    return { service: 'PresenceAuditPlatform', score: dashboard?.score.overall, status: 'ready' };
  },
  'invoice-ai': () => ({ packs: 2, engine: 'InvoiceAIEngine' }),
  'supply-chain': () => {
    const v = createVerticalsPlatform();
    return { events: v.supplyChain.events.list().length, engine: 'SupplyChainAIEngine' };
  },
  'customer-support': () => ({
    skills: defaultCustomerSupportAIPlatform.skills.list().length,
    agents: defaultCustomerSupportAIPlatform.agents.list().length,
    engine: 'CustomerSupportAIService',
  }),
};

export function generateStaticParams() {
  return PLATFORM_MODULES.filter((m) => m.id !== 'workspace').map((m) => ({ module: m.id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleId } = await params;
  const mod = PLATFORM_MODULES.find((m) => m.id === moduleId);
  const loader = MODULE_LOADERS[moduleId as PlatformModuleId];
  let snapshot: Record<string, unknown> = { error: 'Unknown module' };
  if (loader) {
    try {
      snapshot = loader();
    } catch (err) {
      snapshot = { error: err instanceof Error ? err.message : 'Module snapshot unavailable' };
    }
  }

  if (!mod) {
    return (
      <div style={{ padding: 32, color: '#e6edf3', background: '#0d1117', minHeight: '100vh' }}>
        <p>Module not found</p>
        <Link href="/platform" style={{ color: '#58a6ff' }}>Back to platform</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui' }}>
      <header style={{ padding: '24px 32px', borderBottom: '1px solid #21262d' }}>
        <Link href="/platform" style={{ color: '#58a6ff', textDecoration: 'none' }}>
          ← Platform
        </Link>
        <h1 style={{ margin: '12px 0 0', fontSize: 24 }}>
          {mod.icon} {mod.name}
        </h1>
        <p style={{ color: '#8b949e', marginTop: 8 }}>{mod.description}</p>
      </header>
      <section style={{ padding: 32 }}>
        <h2 style={{ fontSize: 14, color: '#8b949e' }}>Module Snapshot</h2>
        <pre
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 16,
            overflow: 'auto',
            fontSize: 13,
          }}
        >
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      </section>
    </div>
  );
}
