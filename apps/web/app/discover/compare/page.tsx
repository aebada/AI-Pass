import type { Metadata } from 'next';
import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'Compare AI Tools | AI Pass Discovery Hub',
  description: 'Side-by-side comparison of features, pricing, latency, context, benchmarks, security, and deployment.',
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const hub = getDiscoveryHub();
  const tools = hub.discovery.listTools();

  const idsParam = first(sp.ids);
  const a = first(sp.a);
  const b = first(sp.b);
  const ids = idsParam
    ? idsParam.split(',').map((s) => s.trim()).filter(Boolean)
    : a && b
      ? [a, b]
      : [];

  const comparison = ids.length >= 2 ? hub.compareMany(ids) : undefined;
  const compared = comparison
    ? (comparison.toolIds ?? [comparison.toolAId, comparison.toolBId])
        .map((id) => hub.discovery.getTool(id))
        .filter(Boolean)
    : [];

  return (
    <>
      <h1 className={styles.heroTitle}>Compare AI Tools</h1>
      <p className={styles.heroSub}>
        Compare features, pricing, latency, context window, benchmarks, languages, APIs, deployment, security, and compliance.
      </p>

      <form action="/discover/compare" method="get" className={styles.searchBar}>
        <select name="a" defaultValue={ids[0] ?? ''} className={styles.searchInput}>
          <option value="">Tool A</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select name="b" defaultValue={ids[1] ?? ''} className={styles.searchInput}>
          <option value="">Tool B</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select name="ids" defaultValue="" className={styles.searchInput}>
          <option value="">Optional third (via ids)</option>
          {tools.map((t) => (
            <option key={`c-${t.id}`} value={[ids[0], ids[1], t.id].filter(Boolean).join(',')}>
              + {t.name}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.btnPrimary}>Compare</button>
      </form>

      {!comparison && (
        <p className={styles.cardMeta}>
          Examples:{' '}
          <Link href="/discover/compare?a=ext_claude&b=ext_gpt">Claude vs GPT</Link>
          {' · '}
          <Link href="/discover/compare?ids=ext_llama,ext_mistral,ext_deepseek">Llama vs Mistral vs DeepSeek</Link>
          {' · '}
          <Link href="/discover/compare?a=app_invoice_ai&b=app_compliance_guard">Invoice AI vs Compliance Guard</Link>
        </p>
      )}

      {comparison && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{comparison.title}</h2>
          <p className={styles.heroSub}>{comparison.summary}</p>
          <p className={styles.cardMeta}>
            {compared.map((t) => t!.name).join(' · ')}
          </p>
          <div className={styles.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Dimension</th>
                  {compared.map((t) => (
                    <th key={t!.id} style={{ textAlign: 'left', padding: '0.5rem' }}>
                      <Link href={`/discover/tools/${t!.slug}`}>{t!.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.dimensions.map((d) => (
                  <tr key={d.key}>
                    <td style={{ padding: '0.5rem', opacity: 0.8 }}>{d.label}</td>
                    {(d.values ?? [d.valueA, d.valueB]).map((v, i) => (
                      <td key={`${d.key}-${i}`} style={{ padding: '0.5rem' }}>
                        {String(v)}
                        {d.winner === 'a' && i === 0 ? ' ✓' : ''}
                        {d.winner === 'b' && i === 1 ? ' ✓' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
