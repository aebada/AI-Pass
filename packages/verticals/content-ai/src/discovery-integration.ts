/** Discovery Hub listing for Content AI */
export function toDiscoveryListing() {
  return {
    toolSlug: 'content-ai',
    toolName: 'Content AI',
    tagline: 'Detect AI. Humanize with Confidence.',
    discoveryRoute: '/discover',
    appRoute: '/workspace/apps/content-ai',
    category: 'marketing',
    tags: ['writing', 'marketing', 'sales', 'compliance', 'education'],
    trustBadgeEligible: true,
    pricingModel: 'freemium' as const,
    headline: 'AI Detector & Humanizer',
    subtitle:
      'Professional AI content detection and humanization — integrated with AI-Pass Trust Engine and multi-model Provider Hub.',
  };
}
