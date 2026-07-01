import Link from 'next/link';
import { CATEGORY_LABELS, MARKETPLACE_CATEGORIES } from '@ai-pass/marketplace-core';
import { getMarketplace } from '@/src/lib/marketplace-server';
import { CatalogSection } from './components/MarketplaceComponents';
import styles from './marketplace.module.css';

export default function MarketplaceHomePage() {
  const mp = getMarketplace();
  const sections = mp.catalog.getHomeSections();
  const collections = mp.catalog.getCollections();
  const industryPacks = mp.catalog.getIndustryPacks();
  const deals = mp.promotions.getDeals();

  return (
    <div className={styles.marketplace}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>AI-Pass Marketplace</h1>
        <p className={styles.heroSub}>
          Apps, agent packs, skill packs, and industry solutions — integrated with AI Wallet,
          Membership gates, and Trust Engine badges.
        </p>
        <form action="/workspace/marketplace/search" method="get" className={styles.searchBar}>
          <input name="q" className={styles.searchInput} placeholder="Search apps, skills, automations…" />
          <button type="submit">Search</button>
        </form>
        <div className={styles.links}>
          <Link href="/workspace/agents/studio">Agent Studio</Link>
          <Link href="/workspace/workflows/livesync">Workflow Engine</Link>
          <Link href="/workspace/knowledge">Knowledge Pipeline</Link>
          <Link href="/workspace/analysis">Analysis Studio</Link>
          <Link href="/workspace/wallet">AI Wallet</Link>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Categories</h2>
        <div className={styles.categoryGrid}>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <Link key={cat} href={`/workspace/marketplace/categories/${cat}`} className={styles.categoryChip}>
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </section>

      {sections.map((section) => (
        <CatalogSection
          key={section.id}
          title={section.title}
          apps={section.apps}
          skills={section.skills}
        />
      ))}

      {collections.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Collections</h2>
          <div className={styles.grid}>
            {collections.map((c) => (
              <div key={c.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{c.name}</h3>
                <p className={styles.cardDesc}>{c.description}</p>
                <p className={styles.cardMeta}>{c.appIds.length} apps · {c.skillIds.length} skills</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {industryPacks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Industry Packs</h2>
          <div className={styles.grid}>
            {industryPacks.map((p) => (
              <div key={p.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <p className={styles.cardDesc}>{p.description}</p>
                <p className={styles.cardMeta}>{CATEGORY_LABELS[p.industry]}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Deals</h2>
          <div className={styles.grid}>
            {deals.map((d) => (
              <div key={d.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{d.title}</h3>
                <p className={styles.cardDesc}>{d.description}</p>
                <p className={styles.cardMeta}>{d.discountPercent}% off {d.code ? `· Code: ${d.code}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
