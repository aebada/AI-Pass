'use client';

import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { MODEL_CATALOG, PROVIDER_DEFINITIONS } from '@ai-pass/provider-hub';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './playground.module.css';

type Tab = 'chat' | 'compare' | 'benchmark' | 'runtime';

interface ModelWithAccess {
  id: string;
  displayName: string;
  providerId: string;
  providerName: string;
  tier: string;
  allowed: boolean;
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
  'openai',
  'anthropic',
  'gemini',
  'grok',
  'openrouter',
  'deepseek',
  'cerebras',
  'sambanova',
  'mistral',
  'groq',
  'qwen',
  'llama',
];

async function streamChatApi(
  prompt: string,
  modelId: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const res = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, modelId }),
  });

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
        const parsed = JSON.parse(data) as { type: string; content?: string; error?: string };
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

function PlaygroundContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('chat');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [compareModels, setCompareModels] = useState<string[]>(['gpt-4o-mini', 'gemini-flash']);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [compareResults, setCompareResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<PlatformState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [runtimeOutput, setRuntimeOutput] = useState('');

  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const refreshPlatform = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/v1/ai/models');
      if (res.ok) setPlatform(await res.json());
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshPlatform();
  }, [refreshPlatform]);

  useEffect(() => {
    if (searchParams.get('welcome') === '1' && isAuthenticated) {
      setToast('You have 500 free credits — start chatting!');
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams, isAuthenticated]);

  const modelsByProvider = useMemo(() => {
    const source = platform?.models ?? MODEL_CATALOG.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      providerId: m.providerId,
      providerName: m.providerName,
      tier: m.tier,
      allowed: true,
    }));

    const filtered = source.filter(
      (m) =>
        !search ||
        m.displayName.toLowerCase().includes(search.toLowerCase()) ||
        m.providerName.toLowerCase().includes(search.toLowerCase()),
    );

    const grouped = new Map<string, ModelWithAccess[]>();
    for (const m of filtered) {
      const list = grouped.get(m.providerId) ?? [];
      list.push(m);
      grouped.set(m.providerId, list);
    }

    const ordered: Array<{ providerId: string; providerName: string; models: ModelWithAccess[] }> = [];
    for (const id of PROVIDER_ORDER) {
      const models = grouped.get(id);
      if (models?.length) {
        const def = PROVIDER_DEFINITIONS.find((p) => p.id === id);
        ordered.push({ providerId: id, providerName: def?.name ?? id, models });
        grouped.delete(id);
      }
    }
    for (const [providerId, models] of grouped) {
      const def = PROVIDER_DEFINITIONS.find((p) => p.id === providerId);
      ordered.push({ providerId, providerName: def?.name ?? providerId, models });
    }
    return ordered;
  }, [platform, search]);

  const runChat = async () => {
    if (!input.trim() || !isAuthenticated) return;
    setLoading(true);
    setResponse('');
    try {
      await streamChatApi(input, selectedModel, setResponse);
      await refreshPlatform();
    } catch (err) {
      setResponse(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const runCompare = async () => {
    if (!input.trim() || !isAuthenticated) return;
    setLoading(true);
    const results: Record<string, string> = {};
    for (const modelId of compareModels) {
      try {
        results[modelId] = await streamChatApi(input, modelId, () => {});
      } catch (err) {
        results[modelId] = err instanceof Error ? err.message : 'Failed';
      }
    }
    setCompareResults(results);
    await refreshPlatform();
    setLoading(false);
  };

  const runBenchmark = () => {
    setLoading(true);
    setTimeout(() => {
      setCompareResults(
        Object.fromEntries(
          compareModels.map((id) => {
            const m = MODEL_CATALOG.find((e) => e.id === id);
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

  if (status === 'loading') {
    return (
      <WorkspaceLayoutClient title="AI Playground" subtitle="Loading…">
        <p className={styles.hint}>Loading session…</p>
      </WorkspaceLayoutClient>
    );
  }

  if (!isAuthenticated) {
    return (
      <WorkspaceLayoutClient
        title="AI Playground"
        subtitle="One membership — chat any model, compare responses, run benchmarks"
      >
        <div className={styles.signInGate}>
          <h2>Sign in with Google to get 500 free credits</h2>
          <p>Use GPT-4o Mini, Gemini Flash, and DeepSeek Free on the free tier. Upgrade anytime for premium models.</p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => signIn('google', { callbackUrl: '/workspace/playground?welcome=1' })}
          >
            Continue with Google
          </button>
          <p className={styles.hint}>
            Already have an account?{' '}
            <Link href="/login?callbackUrl=/workspace/playground%3Fwelcome%3D1">Sign in</Link>
          </p>
        </div>
      </WorkspaceLayoutClient>
    );
  }

  return (
    <WorkspaceLayoutClient
      title="AI Playground"
      subtitle="One membership — chat any model, compare responses, run benchmarks"
    >
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
          <input
            className={styles.search}
            placeholder="Search model catalog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.providerGroups}>
            {modelsByProvider.map((group) => (
              <div key={group.providerId} className={styles.providerGroup}>
                <h3 className={styles.providerLabel}>{group.providerName}</h3>
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
                          title={!m.allowed ? 'Upgrade to unlock' : undefined}
                        >
                          <span className={styles.modelName}>
                            {m.displayName}
                            {!m.allowed && <span className={styles.lockTag}>Upgrade to unlock</span>}
                          </span>
                          <span className={styles.modelMeta}>{m.tier}</span>
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
                {loading ? 'Streaming…' : `Send to ${MODEL_CATALOG.find((m) => m.id === selectedModel)?.displayName ?? selectedModel}`}
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
              {Object.entries(compareResults).map(([id, text]) => (
                <div key={id} className={styles.compareCard}>
                  <h4>{MODEL_CATALOG.find((m) => m.id === id)?.displayName ?? id}</h4>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'compare' && (
            <p className={styles.hint}>
              Selected: {compareModels.map((id) => MODEL_CATALOG.find((m) => m.id === id)?.displayName ?? id).join(', ') || 'none'}
            </p>
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
