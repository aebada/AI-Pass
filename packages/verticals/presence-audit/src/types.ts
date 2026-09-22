import type { Company, CompanyProfile } from '@ai-pass/shared';

export const DEMO_TENANT_ID = 'tenant_demo_ai_pass';

export function companyToProfile(company: Company): CompanyProfile {
  return {
    id: company.id,
    name: company.name,
    website: company.website,
    categories: [company.industry, ...company.products.slice(0, 2)],
    targetMarket: company.countries.join(', ') || 'Global',
    competitors: company.competitors,
    valuePropositions: [company.valueProposition],
    keyFacts: [company.brandDescription, ...company.services.slice(0, 3)],
    createdAt: company.createdAt,
  };
}
