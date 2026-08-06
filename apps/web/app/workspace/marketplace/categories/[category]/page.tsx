import { notFound } from 'next/navigation';
import { CATEGORY_LABELS, type MarketplaceCategory } from '@ai-pass/marketplace-core';
import { getMarketplace } from '@/src/lib/marketplace-server';
import { AppCard } from '../../components/MarketplaceComponents';
import styles from '../../marketplace.module.css';

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((category) => ({ category }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!(category in CATEGORY_LABELS)) notFound();

  const mp = getMarketplace();
  const apps = mp.search.getByCategory(category as MarketplaceCategory);
  const skills = mp.skills.list().filter((s) => s.tags.some((t) => t.includes(category.replace('_', '-'))));

  return (
    <div className={styles.marketplace}>
      <h1 className={styles.heroTitle}>{CATEGORY_LABELS[category as MarketplaceCategory]}</h1>
      <p className={styles.heroSub}>{apps.length} apps · {skills.length} related skills</p>
      <div className={styles.grid}>
        {apps.map((app) => <AppCard key={app.id} app={app} />)}
        {skills.map((skill) => (
          <div key={skill.id} className={styles.card}>
            <h3>{skill.name}</h3>
            <p className={styles.cardDesc}>{skill.description.slice(0, 100)}…</p>
          </div>
        ))}
      </div>
    </div>
  );
}
