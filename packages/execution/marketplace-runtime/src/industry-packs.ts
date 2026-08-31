import type { IndustryPack } from './types.js';

/** Industry pack stubs — vertical AI solutions runnable via runtime-core */
export const INDUSTRY_PACKS: IndustryPack[] = [
  {
    id: 'pack_invoice_ai',
    name: 'Invoice AI',
    slug: 'invoice-ai',
    description: 'OCR, validation, and approval workflows for finance teams',
    category: 'finance',
    appIds: ['app_invoice_ai'],
    skillIds: ['skill_invoice_extract', 'skill_invoice_decision'],
    status: 'available',
    certified: true,
  },
  {
    id: 'pack_supply_chain',
    name: 'Supply Chain AI',
    slug: 'supply-chain',
    description: 'Procurement offer evaluation and supplier ranking',
    category: 'supply_chain',
    appIds: [],
    skillIds: ['skill_offer_parse', 'skill_supplier_score'],
    status: 'stub',
    certified: false,
  },
  {
    id: 'pack_customer_support',
    name: 'Customer Support AI',
    slug: 'customer-support',
    description: 'Voice + text multi-language support agent',
    category: 'customer_support',
    appIds: [],
    skillIds: ['skill_support_chat', 'skill_voice_transcribe'],
    status: 'stub',
    certified: false,
  },
  {
    id: 'pack_hr_ai',
    name: 'HR AI',
    slug: 'hr-ai',
    description: 'Resume screening, policy Q&A, and onboarding automation',
    category: 'hr',
    appIds: ['app_hr_ai'],
    skillIds: ['skill_resume_parse'],
    status: 'stub',
    certified: false,
  },
];

export class IndustryPackRegistry {
  private packs = new Map<string, IndustryPack>();

  constructor(seed: IndustryPack[] = INDUSTRY_PACKS) {
    for (const p of seed) this.packs.set(p.id, p);
  }

  get(id: string): IndustryPack | undefined {
    return this.packs.get(id);
  }

  list(): IndustryPack[] {
    return [...this.packs.values()];
  }
}

export const defaultIndustryPackRegistry = new IndustryPackRegistry();
