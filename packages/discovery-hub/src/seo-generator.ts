import { CATEGORY_LABELS } from '@ai-pass/marketplace-core';
import type { BestAiSlug, Category, SeoMetadata } from './types.js';
import { BEST_AI_PAGES } from './seed-data.js';

export class SEOGenerator {
  forBestAi(slug: BestAiSlug): SeoMetadata {
    const page = BEST_AI_PAGES.find((p) => p.slug === slug);
    if (!page) {
      return {
        title: 'Best AI Tools | AI Pass Discovery',
        description: 'Discover and compare the best AI tools for your team.',
        keywords: ['ai tools', 'best ai', 'ai pass'],
        canonicalPath: `/discover/best/${slug}`,
        ogType: 'website',
      };
    }
    return {
      title: page.seoTitle,
      description: page.seoDescription,
      keywords: ['ai tools', slug, 'best ai', 'ai pass discovery', page.title.toLowerCase()],
      canonicalPath: `/discover/best/${slug}`,
      ogType: 'website',
    };
  }

  forCategory(category: Category): SeoMetadata {
    return {
      title: category.seoTitle,
      description: category.seoDescription,
      keywords: [category.label.toLowerCase(), 'ai tools', category.slug, 'ai pass'],
      canonicalPath: `/discover/categories/${category.slug}`,
      ogType: 'website',
    };
  }

  forComparison(slug: string, title: string): SeoMetadata {
    return {
      title: `${title} | AI Pass Comparison`,
      description: `Side-by-side comparison — features, pricing, trust scores, and enterprise readiness.`,
      keywords: ['ai comparison', slug, 'vs', 'ai pass'],
      canonicalPath: `/discover/compare?slug=${slug}`,
      ogType: 'article',
    };
  }

  forTool(name: string, slug: string, category: string): SeoMetadata {
    const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;
    return {
      title: `${name} — ${label} AI Tool | AI Pass`,
      description: `Install ${name} on AI Pass. View features, trust score, reviews, and pricing.`,
      keywords: [name.toLowerCase(), slug, label.toLowerCase(), 'ai tool', 'ai pass'],
      canonicalPath: `/discover/tools/${slug}`,
      ogType: 'website',
    };
  }

  forDealsHub(): SeoMetadata {
    return {
      title: 'AI Deals Hub — Lifetime Deals & Discounts | AI Pass',
      description: 'Limited-time AI tool deals, bundles, enterprise packages, and lifetime offers.',
      keywords: ['ai deals', 'lifetime deal', 'ai discount', 'ai pass deals'],
      canonicalPath: '/discover/deals',
      ogType: 'website',
    };
  }

  forDiscoveryHome(): SeoMetadata {
    return {
      title: 'AI Pass Discovery — Find, Compare & Install AI Tools',
      description: 'The front door to AI Pass — discover trending AI tools, compare alternatives, and install in one click.',
      keywords: ['ai discovery', 'ai marketplace', 'ai tools', 'ai pass'],
      canonicalPath: '/discover',
      ogType: 'website',
    };
  }
}
