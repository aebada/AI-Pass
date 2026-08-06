#!/usr/bin/env python3
import os, pathlib

WS = pathlib.Path("/Volumes/All/Dev/AI-Pass/apps/web/app/workspace/model-hub")
API = pathlib.Path("/Volumes/All/Dev/AI-Pass/apps/web/app/api/model-hub")

FILES: dict[str, str] = {}

FILES["model-hub.module.css"] = r"""
.shell{display:flex;flex-direction:column;gap:20px}
.subnav{display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid #2a2a2e;padding-bottom:12px}
.subnavLink{padding:6px 12px;border-radius:6px;font-size:13px;text-decoration:none;color:#9ca3af}
.subnavLink:hover{color:#f3f4f6;background:rgba(99,102,241,.12)}
.subnavLinkActive{color:#c7d2fe;background:rgba(99,102,241,.2);font-weight:600}
.filters{display:flex;flex-wrap:wrap;gap:8px}
.filterInput,.filterSelect,.searchInput{padding:8px 12px;border-radius:8px;border:1px solid #2a2a2e;background:#0f0f12;color:#f3f4f6;font-size:13px}
.grid,.modelGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.card{border:1px solid #2a2a2e;border-radius:12px;padding:16px;background:#18181b;display:flex;flex-direction:column;gap:8px}
.cardTop,.cardHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.cardTitle{margin:0;font-size:15px;font-weight:600;color:#f9fafb}
.cardProvider{font-size:12px;color:#9ca3af;margin-top:4px}
.badge{font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(99,102,241,.25);color:#c7d2fe}
.badgeGreen{background:rgba(34,197,94,.25);color:#86efac}
.badges{display:flex;flex-wrap:wrap;gap:6px}
.cardDesc{margin:0;font-size:13px;color:#9ca3af;line-height:1.5}
.meta{display:flex;flex-wrap:wrap;gap:6px}
.tag{font-size:11px;padding:2px 8px;border-radius:6px;background:#27272a;color:#9ca3af}
.actions,.cardActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:8px}
.btn{font-size:12px;padding:6px 12px;border-radius:6px;text-decoration:none;border:1px solid #3f3f46;color:#f3f4f6;background:transparent;cursor:pointer}
.btnPrimary{font-size:12px;padding:6px 12px;border-radius:6px;text-decoration:none;border:1px solid #6366f1;background:#6366f1;color:#fff;cursor:pointer}
.stats{display:flex;gap:16px;flex-wrap:wrap}
.stat{padding:12px 16px;border-radius:10px;border:1px solid #2a2a2e;background:#18181b}
.statValue{font-size:24px;font-weight:700}
.statLabel{font-size:12px;color:#9ca3af}
.detailGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.empty{color:#9ca3af;padding:16px 0}
.notice{padding:12px 16px;border-radius:8px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);font-size:13px}
.gateCard{max-width:520px;padding:24px;border-radius:12px;border:1px solid #3f3f46;background:#18181b}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th,.table td{padding:8px 12px;border-bottom:1px solid #2a2a2e;text-align:left}
.modeGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:16px}
.modeBtn{padding:10px;border-radius:8px;border:1px solid #3f3f46;background:#18181b;color:#f3f4f6;cursor:pointer}
.modeBtnActive{border-color:#6366f1;background:rgba(99,102,241,.15)}
.keyRow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid #2a2a2e}
.keyInput{flex:1;min-width:200px;padding:8px 12px;border-radius:8px;border:1px solid #2a2a2e;background:#0f0f12;color:#f3f4f6}
.familyGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.familyCard{border:1px solid #2a2a2e;border-radius:12px;padding:16px;background:#18181b}
.familyName{margin:8px 0 4px;font-size:16px}
.familyPurpose{margin:0 0 8px;font-size:13px;color:#9ca3af}
.capRow{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
.capTag{font-size:10px;padding:2px 6px;border-radius:4px;background:#27272a;color:#a1a1aa}
.selectBtn{width:100%;padding:8px;border-radius:8px;border:none;background:#6366f1;color:#fff;cursor:pointer}
.providerList{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.providerChip{padding:6px 12px;border-radius:999px;border:1px solid #3f3f46;background:transparent;color:#9ca3af;cursor:pointer;font-size:12px}
.providerChipActive{border-color:#6366f1;color:#c7d2fe;background:rgba(99,102,241,.12)}
""".strip() + "\n"

FILES["components/ModelHubShell.tsx"] = """'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { ModelRecord } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

const NAV = [
  { href: '/workspace/model-hub', label: 'Catalog', exact: true },
  { href: '/workspace/model-hub/aipass', label: 'AI-Pass Models' },
  { href: '/workspace/model-hub/providers', label: 'Providers' },
  { href: '/workspace/model-hub/routing', label: 'Routing' },
  { href: '/workspace/model-hub/keys', label: 'API Keys' },
  { href: '/workspace/model-hub/benchmarks', label: 'Benchmarks' },
  { href: '/workspace/model-hub/fine-tuning', label: 'Fine-Tuning' },
] as const;

export function ModelHubNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.subnav} aria-label="Model Hub">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} className={`${styles.subnavLink} ${active ? styles.subnavLinkActive : ''}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ModelHubShell({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function ModelCard({ model }: { model: ModelRecord }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>{model.displayName}</h3>
        <span className={styles.badge}>{model.pricing.tier}</span>
      </div>
      <p className={styles.cardDesc}>{model.description}</p>
      <div className={styles.meta}>
        <span className={styles.tag}>{model.provider}</span>
        <span className={styles.tag}>{model.category}</span>
        {model.capabilities.slice(0, 3).map((cap) => (
          <span key={cap} className={styles.tag}>{cap}</span>
        ))}
      </div>
      <div className={styles.actions}>
        <Link href={`/workspace/model-hub/${model.id}`} className={styles.btnPrimary}>Details</Link>
        <Link href={`/workspace/playground?model=${encodeURIComponent(model.id)}`} className={styles.btn}>Launch</Link>
      </div>
    </article>
  );
}
"""

FILES["layout.tsx"] = """'use client';

import type { ReactNode } from 'react';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { ModelHubNav } from './components/ModelHubShell';
import styles from './model-hub.module.css';

export default function ModelHubLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceLayoutClient title="Model Hub" subtitle="One workspace. One membership. One AI wallet. All AI models.">
      <div className={styles.shell}>
        <ModelHubNav />
        {children}
      </div>
    </WorkspaceLayoutClient>
  );
}
"""

FILES["page.tsx"] = """'use client';

import { useMemo, useState } from 'react';
import {
  getModels,
  MODEL_REGISTRY_COUNT,
  MODEL_CATEGORIES,
  MODEL_CAPABILITIES,
  MODEL_PROVIDERS,
  type ModelCapability,
  type ModelCategory,
  type ModelCatalogFilters,
} from '@ai-pass/model-hub';
import { ModelCard } from './components/ModelHubShell';
import styles from './model-hub.module.css';

export default function ModelHubPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ModelCategory | ''>('');
  const [provider, setProvider] = useState('');
  const [capability, setCapability] = useState<ModelCapability | ''>('');

  const models = useMemo(() => {
    const filters: ModelCatalogFilters = {};
    if (category) filters.category = category;
    if (provider) filters.provider = provider;
    if (capability) filters.capability = capability;
    if (search.trim()) filters.query = search.trim();
    return getModels(filters);
  }, [search, category, provider, capability]);

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{MODEL_REGISTRY_COUNT}</div>
          <div className={styles.statLabel}>Models in registry</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{models.length}</div>
          <div className={styles.statLabel}>Matching filters</div>
        </div>
      </div>
      <div className={styles.filters}>
        <input className={styles.filterInput} placeholder="Search models…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={category} onChange={(e) => setCategory(e.target.value as ModelCategory | '')}>
          <option value="">All categories</option>
          {MODEL_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">All providers</option>
          {MODEL_PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={capability} onChange={(e) => setCapability(e.target.value as ModelCapability | '')}>
          <option value="">All capabilities</option>
          {MODEL_CAPABILITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className={styles.grid}>
        {models.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </>
  );
}
"""


FILES["[modelId]/page.tsx"] = """'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getModelById, trustLabel } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

export default function ModelDetailPage() {
  const params = useParams();
  const modelId = params.modelId as string;
  const model = getModelById(modelId);

  if (!model) {
    return (
      <div className={styles.empty}>
        <p>Model not found: {modelId}</p>
        <Link href="/workspace/model-hub" className={styles.btnPrimary}>Back to catalog</Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle} style={{ fontSize: 22 }}>{model.displayName}</h2>
          <div className={styles.cardProvider}>{model.provider} · {model.id}</div>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>{model.pricing.tier}</span>
          {model.certified && <span className={`${styles.badge} ${styles.badgeGreen}`}>Certified</span>}
          <span className={styles.badge}>{trustLabel(model.trust)}</span>
        </div>
      </div>
      <p className={styles.cardDesc}>{model.description}</p>
      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Capabilities</h3>
          <div className={styles.badges}>{model.capabilities.map((c) => <span key={c} className={styles.badge}>{c}</span>)}</div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Trust</h3>
          <p className={styles.cardDesc}>Trust {model.trust.trust} · Reliability {model.trust.reliability} · Latency {model.latencyMs}ms</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Pricing</h3>
          <p className={styles.cardDesc}>In {model.pricing.inputCreditsPer1K} / Out {model.pricing.outputCreditsPer1K} credits per 1K · Plan {model.minPlan}</p>
        </div>
      </div>
      <div className={styles.cardActions}>
        <Link href={`/workspace/playground?model=${model.id}`} className={styles.btnPrimary}>Launch</Link>
        <Link href="/workspace/model-hub/benchmarks" className={styles.btn}>Benchmarks</Link>
      </div>
    </>
  );
}
"""

FILES["routing/page.tsx"] = """'use client';

import { useMemo, useState } from 'react';
import { autoRoute, getModels, type AutoRouteRequest, type RoutingMode } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

const MODES: RoutingMode[] = ['balanced', 'best_quality', 'lowest_cost', 'fastest', 'most_private', 'enterprise_safe', 'manual'];

export default function RoutingPage() {
  const [mode, setMode] = useState<RoutingMode>('balanced');
  const [task, setTask] = useState('chat');
  const [preferred, setPreferred] = useState('gpt-4o');
  const [plan, setPlan] = useState<AutoRouteRequest['membership_plan']>('professional');
  const models = useMemo(() => getModels({ status: 'available' }), []);
  const result = useMemo(
    () => autoRoute({ mode, task, preferred_model_id: mode === 'manual' ? preferred : undefined, membership_plan: plan }),
    [mode, task, preferred, plan],
  );

  return (
    <>
      <p className={styles.notice}>Preview <code>autoRoute()</code> modes for Provider Hub routing.</p>
      <div className={styles.filters}>
        <select className={styles.filterSelect} value={task} onChange={(e) => setTask(e.target.value)}>
          <option value="chat">chat</option>
          <option value="code">code</option>
          <option value="reasoning">reasoning</option>
          <option value="vision">vision</option>
        </select>
        <select className={styles.filterSelect} value={plan} onChange={(e) => setPlan(e.target.value as AutoRouteRequest['membership_plan'])}>
          <option value="free">free</option>
          <option value="professional">professional</option>
          <option value="power">power</option>
          <option value="enterprise">enterprise</option>
        </select>
      </div>
      <div className={styles.modeGrid}>
        {MODES.map((m) => (
          <button key={m} type="button" className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      {mode === 'manual' && (
        <select className={styles.filterSelect} value={preferred} onChange={(e) => setPreferred(e.target.value)}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
      )}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{result.primary.displayName}</h3>
        <p className={styles.cardDesc}>{result.reason}</p>
        {result.fallbacks.length > 0 && (
          <p className={styles.cardDesc}>Fallbacks: {result.fallbacks.map((m) => m.displayName).join(', ')}</p>
        )}
      </div>
    </>
  );
}
"""

FILES["keys/page.tsx"] = """'use client';

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
"""

FILES["fine-tuning/page.tsx"] = """'use client';

import Link from 'next/link';
import styles from '../model-hub.module.css';

export default function FineTuningPage() {
  const enterprise = false;
  if (!enterprise) {
    return (
      <div className={styles.gateCard}>
        <h2 className={styles.cardTitle}>Fine-Tuning Studio</h2>
        <p className={styles.cardDesc}>Enterprise plan required for governed fine-tuning pipelines.</p>
        <div className={styles.cardActions}>
          <Link href="/workspace/membership" className={styles.btnPrimary}>Upgrade to Enterprise</Link>
          <Link href="/workspace/model-hub" className={styles.btn}>Catalog</Link>
        </div>
      </div>
    );
  }
  return <p className={styles.notice}>Fine-tuning workspace coming soon.</p>;
}
"""

FILES["aipass/page.tsx"] = """'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AIPASS_MODELS } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

export default function AIPassModelsPage() {
  const router = useRouter();
  return (
    <>
      <p className={styles.notice}>
        AI-Pass family ({AIPASS_MODELS.length} models). Credits from <Link href="/workspace/wallet">AI Wallet</Link>.
      </p>
      <div className={styles.familyGrid}>
        {AIPASS_MODELS.map((m) => (
          <article key={m.id} className={styles.familyCard}>
            <h3 className={styles.familyName}>{m.displayName}</h3>
            <p className={styles.familyPurpose}>{m.purpose ?? m.description}</p>
            <div className={styles.capRow}>
              {m.capabilities.map((c) => (
                <span key={c} className={styles.capTag}>{c}</span>
              ))}
            </div>
            <button type="button" className={styles.selectBtn} onClick={() => router.push(`/workspace/playground?model=${encodeURIComponent(m.id)}`)}>
              Try in Playground
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
"""

FILES["providers/page.tsx"] = """'use client';

import { useMemo, useState } from 'react';
import { getModels, PROVIDER_DEFINITIONS } from '@ai-pass/model-hub';
import { ModelCard } from '../components/ModelHubShell';
import styles from '../model-hub.module.css';

export default function ProviderModelsPage() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [query, setQuery] = useState('');
  const models = useMemo(
    () => getModels({ category: 'provider', provider: selectedProvider || undefined, query: query || undefined }),
    [selectedProvider, query],
  );

  return (
    <>
      <div className={styles.providerList}>
        <button type="button" className={`${styles.providerChip} ${!selectedProvider ? styles.providerChipActive : ''}`} onClick={() => setSelectedProvider('')}>
          All
        </button>
        {PROVIDER_DEFINITIONS.filter((p) => p.id !== 'aipass').map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.providerChip} ${selectedProvider === p.name ? styles.providerChipActive : ''}`}
            onClick={() => setSelectedProvider(p.name)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <input className={styles.searchInput} placeholder="Search provider models…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className={styles.modelGrid}>
        {models.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
    </>
  );
}
"""

FILES["benchmarks/page.tsx"] = """'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BENCHMARK_SUITES, MODEL_REGISTRY, compareModels, getBenchmarkScores } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

function Content() {
  const searchParams = useSearchParams();
  const initial = searchParams.get('compare')?.split(',').filter(Boolean) ?? [];
  const [modelA, setModelA] = useState(initial[0] ?? 'gpt-4o');
  const [modelB, setModelB] = useState(initial[1] ?? 'claude-sonnet-4');
  const [suite, setSuite] = useState('mmlu');
  const comparison = useMemo(() => compareModels([modelA, modelB]), [modelA, modelB]);
  const scores = useMemo(() => getBenchmarkScores([modelA, modelB], suite), [modelA, modelB, suite]);

  return (
    <>
      <div className={styles.filters}>
        <select className={styles.filterSelect} value={modelA} onChange={(e) => setModelA(e.target.value)}>
          {MODEL_REGISTRY.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={modelB} onChange={(e) => setModelB(e.target.value)}>
          {MODEL_REGISTRY.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={suite} onChange={(e) => setSuite(e.target.value)}>
          {BENCHMARK_SUITES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <p className={styles.cardDesc}>{comparison.summary}</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dimension</th>
            {comparison.models.map((m) => (
              <th key={m.id}>{m.displayName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.dimensions.map((dim) => (
            <tr key={dim.key}>
              <td>{dim.label}</td>
              {comparison.models.map((m) => (
                <td key={m.id}>{String(dim.values[m.id])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.meta} style={{ marginTop: 12 }}>
        {scores.map((s) => (
          <span key={s.modelId}>{s.displayName}: {s.score}</span>
        ))}
      </div>
      <Link href="/workspace/model-hub" className={styles.btn} style={{ marginTop: 12, display: 'inline-block' }}>
        Back
      </Link>
    </>
  );
}

export default function BenchmarksPage() {
  return (
    <Suspense fallback={<div className={styles.empty}>Loading…</div>}>
      <Content />
    </Suspense>
  );
}
"""

API_FILES = {
  "catalog/route.ts": """import { getModels, getModelCount, MODEL_CATEGORIES } from '@ai-pass/model-hub';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const models = getModels({
    category: (url.searchParams.get('category') ?? undefined) as import('@ai-pass/model-hub').ModelCategory | undefined,
    provider: url.searchParams.get('provider') ?? undefined,
    capability: (url.searchParams.get('capability') ?? undefined) as import('@ai-pass/model-hub').ModelCapability | undefined,
    query: url.searchParams.get('q') ?? undefined,
  });
  return Response.json({ total: getModelCount(), count: models.length, categories: MODEL_CATEGORIES, models });
}
""",
  "route/route.ts": """import { autoRoute, type AutoRouteRequest, type RoutingMode } from '@ai-pass/model-hub';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AutoRouteRequest> & { preferred_model_id?: string };
  return Response.json(
    autoRoute({
      task: body.task ?? 'chat',
      mode: (body.mode ?? 'balanced') as RoutingMode,
      preferred_model_id: body.preferred_model_id,
      membership_plan: body.membership_plan,
    }),
  );
}
""",
  "keys/route.ts": """import { listByoKeys, maskApiKey, saveByoKey, testConnection, type ModelProviderId } from '@ai-pass/model-hub';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ keys: listByoKeys() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const provider = (body.providerId ?? body.provider ?? 'openai') as ModelProviderId;
  if (body.action === 'test') {
    return Response.json(await testConnection(provider, body.api_key ?? 'sk-stub-key-12345678'));
  }
  if (body.action === 'save' && body.api_key) {
    const entry = saveByoKey(provider, body.api_key, body.label);
    return Response.json({ ok: true, key: { ...entry, encrypted: undefined, preview: maskApiKey(body.api_key) } });
  }
  if (body.action === 'list') {
    return Response.json({ keys: listByoKeys() });
  }
  return Response.json({ error: 'Unsupported action' }, { status: 400 });
}
""",
}

def main():
    WS.mkdir(parents=True, exist_ok=True)
    API.mkdir(parents=True, exist_ok=True)
    written = []
    for rel, content in FILES.items():
        path = WS / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        written.append(str(path))
    for rel, content in API_FILES.items():
        path = API / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        written.append(str(path))
    print(len(written))
    for p in sorted(written):
        print(p)

if __name__ == '__main__':
    main()
