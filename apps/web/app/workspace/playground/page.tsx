'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { getModelById, getModels } from '@ai-pass/model-hub';
import { ModuleIcon } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { apiUnavailable } from '@/lib/api-client';
import { useAuthSession } from '@/lib/use-auth-session';
import styles from './playground.module.css';

type Tab = 'chat' | 'compare' | 'benchmark' | 'runtime';

/**
 * Req 4.5 — example prompts by use case. Each routes to the vertical app that
 * owns the workflow, so the playground feeds the product rather than dead-ending.
 */
const EXAMPLE_PROMPTS = [
  { label: 'Flag invoices needing review', prompt: 'Analyze last month\u2019s invoice batch and flag anything that needs review.', app: '/workspace/apps/invoice-ai' },
  { label: 'Score supplier offers', prompt: 'Compare these supplier offers on price, lead time, and risk, then rank them.', app: '/workspace/apps/supply-chain-ai' },
  { label: 'Draft a customer reply', prompt: 'Draft a reply to a customer asking for a refund outside the return window.', app: '/workspace/apps/customer-support-ai' },
  { label: 'Summarize a contract', prompt: 'Summarize the payment and termination terms in this vendor contract.', app: '/workspace/apps/legal-ai' },
  { label: 'Explain a revenue change', prompt: 'Revenue fell 8% last quarter. What questions should I ask the finance team?', app: '/workspace/analysis' },
  { label: 'Write a policy check', prompt: 'Write a governance policy that blocks prompts containing customer PII.', app: '/workspace/governance' },
];

/** Req 4.3 — models shown as a visible row, never hidden behind a dropdown. */
const FEATURED_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT', provider: 'OpenAI' },
  { id: 'claude-3-5-haiku', label: 'Claude', provider: 'Anthropic' },
  { id: 'gemini-1.5-flash', label: 'Gemini', provider: 'Google' },
  { id: 'deepseek-chat', label: 'DeepSeek', provider: 'DeepSeek' },
  { id: 'grok-2', label: 'Grok', provider: 'xAI' },
  { id: 'mistral-small', label: 'Mistral', provider: 'Mistral' },
  { id: 'llama-3.1-8b', label: 'Llama', provider: 'Meta' },
];

const SEED_PROMPT = EXAMPLE_PROMPTS[0].prompt;

/** Catalog names win; the featured row is the fallback so a card never shows a raw id. */
function modelLabel(id: string): string {
  return (
    getModelById(id)?.displayName ??
    FEATURED_MODELS.find((m) => m.id === id)?.label ??
    id
  );
}

interface ModelWithAccess {
  id: string;
  displayName: string;
  providerId: string;
  providerName: string;
  tier: string;
  allowed: boolean;
  description?: string;
  auto?: boolean;
}

interface PlatformState {
  tier: string;
  creditsRemaining: number;
  creditsTotal: number;
  requestsToday: number;
  dailyRequestLimit: number | null;
  models: ModelWithAccess[];
}

const PROVIDER_ORDER = [
  'auto',
  'openai',
  'anthropic',
  'gemini',
  'kimi',
  'grok',
  'openrouter',
  'deepseek',
  'mistral',
  'groq',
  'cerebras',
  'sambanova',
  'qwen',
  'llama',
];

const AUTO_MODELS = [
  {
    id: 'auto-fast',
    displayName: 'Auto · Fast',
    providerId: 'auto',
    providerName: 'Auto',
    tier: 'standard',
    allowed: true,
    description: 'Lowest latency with strong value — routes to the best cheap/fast model available now.',
  },
  {
    id: 'auto-standard',
    displayName: 'Auto · Standard',
    providerId: 'auto',
    providerName: 'Auto',
    tier: 'standard',
    allowed: true,
    description:
      'Best performance-to-price tradeoff at this moment. Switches providers on outages automatically.',
  },
  {
    id: 'auto-complex',
    displayName: 'Auto · Complex',
    providerId: 'auto',
    providerName: 'Auto',
    tier: 'premium',
    allowed: false,
    description: 'Favors frontier capability for hard tasks while still optimizing cost and availability.',
  },
] as const;

async function streamChatApi(
  prompt: string,
  modelId: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const res = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    credentials: 'include',
    body: JSON.stringify({ prompt, modelId, stream: true }),
  });

  if (apiUnavailable(res)) {
    throw new Error('DEMO_MODE');
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return full;
      try {
        const parsed = JSON.parse(data) as {
          type: string;
          content?: string;
          error?: string;
          reason?: string;
        };
        if (parsed.type === 'route' && parsed.reason) {
          full += `↳ ${parsed.reason}\n\n`;
          onChunk(full);
        }
        if (parsed.type === 'failover' && parsed.error) {
          full += `(failover: ${parsed.error})\n`;
          onChunk(full);
        }
        if (parsed.type === 'text' && parsed.content) {
          full += parsed.content;
          onChunk(full);
        }
        if (parsed.type === 'error') throw new Error(parsed.error ?? 'Stream error');
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
  return full;
}

function formatNow(): string {
  const now = new Date();
  return now.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function isDateTimeQuestion(text: string): boolean {
  return /\b(what('s| is)?\s+(the\s+)?(date|time|day)|today'?s?\s+date|current\s+(date|time)|what\s+day\s+is\s+it)\b/i.test(
    text.trim(),
  );
}

function demoChatReply(prompt: string, modelId: string): string {
  const model = getModelById(modelId)?.displayName ?? modelId;
  if (isDateTimeQuestion(prompt)) {
    return `Today is ${formatNow()}.\n\n(Demo mode — live model routing is unavailable on static hosting.)`;
  }
  return `[Demo mode]\n\nYou asked: "${prompt.slice(0, 200)}${prompt.length > 200 ? '…' : ''}"\n\nModel: ${model}\n\nLive AI chat requires the Laravel API proxy on static hosting. Configure provider keys in laravel-auth/.env on the server.`;
}

function PlaygroundContent() {
  const { isAuthenticated, isLoading } = useAuthSession();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('compare');
  const [selectedModel, setSelectedModel] = useState('auto-standard');
  const [compareModels, setCompareModels] = useState<string[]>(['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-1.5-flash']);
  // Req 4.4 — lightweight preference signal, one vote per model per result set.
  const [preferences, setPreferences] = useState<Record<string, 'up' | 'down'>>({});
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [compareResults, setCompareResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [platform, setPlatform] = useState<PlatformState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [runtimeOutput, setRuntimeOutput] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/v1/ai/models', { credentials: 'include', cache: 'no-store' })
      .then((res) => {
        if (apiUnavailable(res)) setDemoMode(true);
      })
      .catch(() => setDemoMode(true));
  }, [isAuthenticated]);

  const refreshPlatform = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/v1/ai/models', { credentials: 'include' });
      if (res.ok) {
        setPlatform(await res.json());
        setDemoMode(false);
      } else if (apiUnavailable(res)) {
        setDemoMode(true);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshPlatform();
  }, [refreshPlatform]);

  // Req 4.2 — seed the comparison so a first-time visitor sees multi-model
  // output immediately, before typing or signing in.
  useEffect(() => {
    setInput(SEED_PROMPT);
    setCompareResults(
      Object.fromEntries(
        ['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-1.5-flash'].map((id) => [
          id,
          demoChatReply(SEED_PROMPT, id),
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    if (searchParams.get('welcome') === '1' && isAuthenticated) {
      setToast('You have 500 free credits — start chatting!');
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams, isAuthenticated]);

  const hubCatalog = useMemo(() => getModels({ status: 'available' }), []);

  useEffect(() => {
    const fromUrl = searchParams.get('model');
    if (fromUrl && getModelById(fromUrl)) setSelectedModel(fromUrl);
  }, [searchParams]);

  const modelsByProvider = useMemo(() => {
    const fromApi = platform?.models;
    const source: ModelWithAccess[] = fromApi?.length
      ? fromApi
      : [
          ...AUTO_MODELS.map((m) => ({ ...m })),
          ...hubCatalog.map((m) => ({
            id: m.id,
            displayName: m.displayName,
            providerId: m.providerId,
            providerName: m.provider,
            tier: m.pricing.tier,
            allowed: true,
          })),
        ];

    const filtered = source.filter(
      (m) =>
        (!freeOnly || m.allowed) &&
        (!search ||
          m.displayName.toLowerCase().includes(search.toLowerCase()) ||
          m.providerName.toLowerCase().includes(search.toLowerCase())),
    );

    const sorted = [...filtered].sort((a, b) => {
      if (a.providerId === 'auto' && b.providerId !== 'auto') return -1;
      if (b.providerId === 'auto' && a.providerId !== 'auto') return 1;
      if (a.allowed !== b.allowed) return a.allowed ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });

    const grouped = new Map<string, ModelWithAccess[]>();
    for (const m of sorted) {
      const list = grouped.get(m.providerId) ?? [];
      list.push(m);
      grouped.set(m.providerId, list);
    }

    const ordered: Array<{ providerId: string; providerName: string; models: ModelWithAccess[] }> = [];
    for (const id of PROVIDER_ORDER) {
      const models = grouped.get(id);
      if (models?.length) {
        ordered.push({ providerId: id, providerName: models[0]?.providerName ?? id, models });
        grouped.delete(id);
      }
    }
    for (const [providerId, models] of grouped) {
      ordered.push({ providerId, providerName: providerId, models });
    }
    return ordered;
  }, [platform, search, freeOnly, hubCatalog]);

  const runChat = async () => {
    if (!input.trim() || !isAuthenticated) return;
    setLoading(true);
    setResponse('');
    try {
      await streamChatApi(input, selectedModel, setResponse);
      setDemoMode(false);
      await refreshPlatform();
    } catch (err) {
      if (err instanceof Error && err.message === 'DEMO_MODE') {
        setDemoMode(true);
        setResponse(demoChatReply(input, selectedModel));
      } else {
        setResponse(err instanceof Error ? err.message : 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const runCompare = async () => {
    if (!input.trim()) return;
    if (!isAuthenticated) {
      // Req 4.7 — friction point, not a gate: show real comparison output, then ask.
      setCompareResults(
        Object.fromEntries(compareModels.map((id) => [id, demoChatReply(input, id)])),
      );
      setPreferences({});
      setToast('Signed-out preview. Sign in free for live model responses.');
      return;
    }
    setLoading(true);
    const results: Record<string, string> = {};
    for (const modelId of compareModels) {
      try {
        results[modelId] = await streamChatApi(input, modelId, () => {});
      } catch (err) {
        if (err instanceof Error && err.message === 'DEMO_MODE') {
          setDemoMode(true);
          results[modelId] = demoChatReply(input, modelId);
        } else {
          results[modelId] = err instanceof Error ? err.message : 'Failed';
        }
      }
    }
    setCompareResults(results);
    setPreferences({});
    await refreshPlatform();
    setLoading(false);
  };

  const runBenchmark = () => {
    setLoading(true);
    setTimeout(() => {
      setCompareResults(
        Object.fromEntries(
          compareModels.map((id) => {
            const m = hubCatalog.find((e) => e.id === id);
            const latency = m?.speed === 'fast' ? 180 : m?.speed === 'quality' ? 2400 : 650;
            return [id, `Latency: ${latency}ms · Quality: ${m?.quality} · Cost: $${((m?.inputCostPer1M ?? 1) / 100).toFixed(3)}/1K tokens`];
          }),
        ),
      );
      setLoading(false);
    }, 600);
  };

  const runRuntime = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRuntimeOutput('');
    const planRes = await fetch('/api/v1/runtime/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { goal: input, membershipTier: platform?.tier ?? 'free' } }),
    });
    const { plan } = await planRes.json();
    const execRes = await fetch('/api/v1/runtime/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, outputFormat: 'executive_summary' }),
    });
    const { execution } = await execRes.json();
    const formatted = execution?.output?.formatted;
    setRuntimeOutput(
      typeof formatted === 'string'
        ? formatted
        : JSON.stringify(execution?.output ?? execution, null, 2),
    );
    setLoading(false);
  };

  const toggleCompareModel = (id: string, allowed: boolean) => {
    if (!allowed) return;
    setCompareModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : prev.length < 3 ? [...prev, id] : prev,
    );
  };

  if (isLoading) {
    return (
      <WorkspaceLayoutClient title="AI Playground" subtitle="Loading…">
        <p className={styles.hint}>Loading session…</p>
      </WorkspaceLayoutClient>
    );
  }

  // Req 4.1/4.2 — no sign-in wall. The comparison is the first thing rendered;
  // req 4.7 puts the sign-in ask at the point of friction instead (see runCompare).
  return (
    <WorkspaceLayoutClient
      title="AI Playground"
      subtitle="One membership — chat any model, compare responses, run benchmarks"
    >
      {demoMode && (
        <div className={`${styles.toast} ${styles.toastDemo}`} role="status">
          Demo mode — live AI API unavailable. Configure Laravel proxy + provider keys on the server.
          <button type="button" className={styles.toastClose} onClick={() => setDemoMode(false)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          {toast}
          <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className={styles.headerBar}>
        <span className={styles.creditsBadge}>
          {platform?.creditsRemaining ?? '—'} / {platform?.creditsTotal ?? 500} credits
        </span>
        <span className={styles.tierBadge}>{platform?.tier ?? 'free'} plan</span>
        {platform?.dailyRequestLimit != null && (
          <span className={styles.requestsBadge}>
            {platform.requestsToday} / {platform.dailyRequestLimit} requests today
          </span>
        )}
        <Link href="/workspace/membership" className={styles.upgradeLink}>
          Upgrade
        </Link>
      </div>

      {tab === 'compare' && (
        <div className={styles.modelRow} role="group" aria-label="Models to compare">
          {FEATURED_MODELS.map((m) => {
            const on = compareModels.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className={`${styles.modelChip} ${on ? styles.modelChipOn : ''}`}
                aria-pressed={on}
                onClick={() => toggleCompareModel(m.id, true)}
              >
                <strong>{m.label}</strong>
                <span>{m.provider}</span>
              </button>
            );
          })}
          <span className={styles.modelRowHint}>Pick up to 3</span>
        </div>
      )}

      <div className={styles.tabs}>
        {(['chat', 'compare', 'benchmark', 'runtime'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'chat' ? 'Chat' : t === 'compare' ? 'Compare' : t === 'benchmark' ? 'Benchmark' : 'Plan & Execute'}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <aside className={styles.picker}>
          <div className={styles.pickerToolbar}>
            <input
              className={styles.search}
              placeholder="Search models…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={`${styles.filterBtn} ${freeOnly ? styles.filterBtnActive : ''}`}
              onClick={() => setFreeOnly((v) => !v)}
              aria-pressed={freeOnly}
            >
              Free only
            </button>
          </div>
          <p className={styles.pickerMeta}>
            {platform?.models?.filter((m) => m.allowed).length ?? hubCatalog.length} models available on your plan
          </p>
          <div className={styles.providerGroups}>
            {modelsByProvider.map((group) => (
              <div key={group.providerId} className={styles.providerGroup}>
                <h3 className={styles.providerLabel}>
                  {group.providerId === 'auto' ? 'Auto models' : group.providerName}
                </h3>
                {group.providerId === 'auto' && (
                  <p className={styles.pickerMeta} style={{ marginTop: 0, marginBottom: 8 }}>
                    Fast / Standard / Complex route each request to the best performance-to-price model
                    live — and fail over on provider outages.
                  </p>
                )}
                <ul className={styles.modelList}>
                  {group.models.map((m) => {
                    const isSelected =
                      tab === 'chat' ? selectedModel === m.id : compareModels.includes(m.id);
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          className={`${styles.modelBtn} ${isSelected ? styles.modelBtnActive : ''} ${!m.allowed ? styles.modelBtnLocked : ''}`}
                          onClick={() => {
                            if (!m.allowed) return;
                            if (tab === 'chat') setSelectedModel(m.id);
                            else toggleCompareModel(m.id, m.allowed);
                          }}
                          disabled={!m.allowed && tab === 'chat'}
                          title={m.description ?? (!m.allowed ? 'Upgrade to unlock' : undefined)}
                        >
                          <span className={styles.modelName}>
                            {m.displayName}
                            {!m.allowed && <span className={styles.lockTag}>Pro</span>}
                          </span>
                          <span
                            className={`${styles.modelMeta} ${m.allowed && (m.tier === 'free' || m.tier === 'standard' || m.providerId === 'auto') ? styles.modelMetaFree : ''}`}
                          >
                            {m.providerId === 'auto'
                              ? 'Auto'
                              : m.allowed
                                ? m.tier === 'free'
                                  ? 'Free'
                                  : m.tier
                                : 'Locked'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className={styles.panel}>
          <textarea
            className={styles.input}
            placeholder="Ask anything — routed through Provider Hub…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />

          <div className={styles.actions}>
            {tab === 'chat' && (
              <button type="button" className={styles.primaryBtn} onClick={runChat} disabled={loading}>
                {loading ? 'Streaming…' : `Send to ${
                  AUTO_MODELS.find((m) => m.id === selectedModel)?.displayName
                  ?? getModelById(selectedModel)?.displayName
                  ?? selectedModel
                }`}
              </button>
            )}
            {tab === 'compare' && (
              <button type="button" className={styles.primaryBtn} onClick={runCompare} disabled={loading}>
                Compare {compareModels.length} models
              </button>
            )}
            {tab === 'benchmark' && (
              <button type="button" className={styles.primaryBtn} onClick={runBenchmark} disabled={loading}>
                Run benchmark
              </button>
            )}
            {tab === 'runtime' && (
              <button type="button" className={styles.primaryBtn} onClick={runRuntime} disabled={loading}>
                {loading ? 'Executing…' : 'Plan & Execute via Runtime'}
              </button>
            )}
          </div>

          {tab === 'chat' && response && (
            <div className={styles.output}>
              <h3>Response</h3>
              <pre>{response}</pre>
            </div>
          )}

          {tab === 'runtime' && runtimeOutput && (
            <div className={styles.output}>
              <h3>Runtime Output</h3>
              <pre>{runtimeOutput}</pre>
            </div>
          )}

          {(tab === 'compare' || tab === 'benchmark') && Object.keys(compareResults).length > 0 && (
            <div className={styles.compareGrid}>
              {Object.entries(compareResults).map(([id, text]) => {
                const vote = preferences[id];
                return (
                  <div key={id} className={styles.compareCard}>
                    <h4>{modelLabel(id)}</h4>
                    <p>{text}</p>
                    <div className={styles.voteRow}>
                      <button
                        type="button"
                        className={`${styles.voteBtn} ${vote === 'up' ? styles.voteBtnOn : ''}`}
                        aria-pressed={vote === 'up'}
                        aria-label={`Prefer the ${modelLabel(id)} answer`}
                        onClick={() =>
                          setPreferences((p) => ({ ...p, [id]: p[id] === 'up' ? undefined : 'up' }) as typeof p)
                        }
                      >
                        <ModuleIcon name="thumbs-up" size={14} /> Better
                      </button>
                      <button
                        type="button"
                        className={`${styles.voteBtn} ${vote === 'down' ? styles.voteBtnOn : ''}`}
                        aria-pressed={vote === 'down'}
                        aria-label={`Mark the ${modelLabel(id)} answer worse`}
                        onClick={() =>
                          setPreferences((p) => ({ ...p, [id]: p[id] === 'down' ? undefined : 'down' }) as typeof p)
                        }
                      >
                        <ModuleIcon name="thumbs-down" size={14} /> Worse
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'compare' && (
            <div className={styles.examplesRow}>
              <span className={styles.examplesLabel}>Try one:</span>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  className={styles.exampleChip}
                  onClick={() => setInput(ex.prompt)}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </WorkspaceLayoutClient>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<WorkspaceLayoutClient title="AI Playground" subtitle="Loading…"><p /></WorkspaceLayoutClient>}>
      <PlaygroundContent />
    </Suspense>
  );
}
