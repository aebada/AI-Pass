import type { Metadata } from 'next';
import { BEST_AI_SLUGS } from '@ai-pass/discovery-hub';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import { ToolCard } from '../../components/DiscoverComponents';
import Link from 'next/link';
import styles from '../../discover.module.css';
import { ModuleIcon } from '@ai-pass/ui';

export function generateStaticParams() {
  return BEST_AI_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const seo = hub.seo.forBestAi(slug as never);
  return { title: seo.title, description: seo.description, keywords: seo.keywords };
}

export default async function BestAiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getDiscoveryHub();
  const page = hub.getBestAiPage(slug);

  if (!page) {
    return <p className={styles.heroSub}>Best AI list not found.</p>;
  }

  const tools = page.toolIds
    .map((id) => hub.discovery.getTool(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <>
      <h1 className={styles.heroTitle}>{page.headline}</h1>
      <p className={styles.heroSub}>{page.description}</p>
      {page.membershipGate && (
        <p className={styles.cardMeta}><ModuleIcon name="lock" size={14} /> Premium list — requires {page.membershipGate} membership</p>
      )}
      <div className={styles.grid}>
        {tools.map((t) => <ToolCard key={t.id} tool={t} />)}
      </div>
      <p className={styles.cardMeta}>
        Compare tools on the <Link href="/discover/compare">comparison page</Link> or browse{' '}
        <Link href="/discover/categories">all categories</Link>.
      </p>
    </>
  );
}
