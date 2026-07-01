import type { AgentDecision } from '@ai-pass/shared';
import type { Offer, Score, ScoringTemplate, Supplier } from '../types.js';

export const DEFAULT_SCORING_TEMPLATES: ScoringTemplate[] = [
  {
    id: 'balanced',
    name: 'Balanced Procurement',
    weights: { price: 0.25, delivery: 0.15, risk: 0.15, quality: 0.15, warranty: 0.1, esg: 0.1, compliance: 0.05, payment: 0.05 },
  },
  {
    id: 'cost_focused',
    name: 'Cost Focused',
    weights: { price: 0.4, delivery: 0.15, risk: 0.1, quality: 0.1, warranty: 0.05, esg: 0.05, compliance: 0.1, payment: 0.05 },
  },
  {
    id: 'esg_priority',
    name: 'ESG Priority',
    weights: { price: 0.15, delivery: 0.1, risk: 0.1, quality: 0.15, warranty: 0.1, esg: 0.3, compliance: 0.05, payment: 0.05 },
  },
];

export class ScoringEngine {
  score(params: {
    offer: Offer;
    supplier: Supplier;
    template?: ScoringTemplate;
    budgetCap?: number;
  }): { total: number; scores: Score[]; decision: AgentDecision } {
    const template = params.template ?? DEFAULT_SCORING_TEMPLATES[0];
    const price = Number(params.offer.normalizedFields.price?.value ?? params.offer.totalPrice ?? 999999);
    const delivery = Number(params.offer.normalizedFields.delivery_days?.value ?? params.offer.deliveryDays ?? 60);
    const quality = Number(params.offer.normalizedFields.quality_score?.value ?? 50);
    const warranty = Number(params.offer.normalizedFields.warranty_months?.value ?? 12);
    const esg = Number(params.offer.normalizedFields.esg_score?.value ?? params.supplier.esgScore);
    const risk = params.supplier.riskScore;
    const compliance = params.supplier.certifications.length * 20;
    const payment = params.offer.normalizedFields.payment_terms?.value === 'Net 30' ? 80 : 60;

    const dimensions: Array<{ dimension: Score['dimension']; raw: number; rationale: string }> = [
      {
        dimension: 'price',
        raw: params.budgetCap ? Math.max(0, 100 - (price / params.budgetCap) * 100) : Math.max(0, 100 - price / 5000),
        rationale: `Price ${price} vs budget`,
      },
      { dimension: 'delivery', raw: Math.max(0, 100 - delivery), rationale: `${delivery} day lead time` },
      { dimension: 'risk', raw: Math.max(0, 100 - risk), rationale: `Supplier risk score ${risk}` },
      { dimension: 'quality', raw: quality, rationale: `Quality score ${quality}` },
      { dimension: 'warranty', raw: Math.min(100, warranty * 4), rationale: `${warranty} month warranty` },
      { dimension: 'esg', raw: esg, rationale: `ESG score ${esg}` },
      { dimension: 'compliance', raw: Math.min(100, compliance), rationale: `${params.supplier.certifications.length} certifications` },
      { dimension: 'payment', raw: payment, rationale: String(params.offer.normalizedFields.payment_terms?.value ?? 'standard') },
    ];

    const scores: Score[] = dimensions.map((d) => {
      const weight = template.weights[d.dimension];
      return {
        dimension: d.dimension,
        raw: Math.round(d.raw * 10) / 10,
        weight,
        weighted: Math.round(d.raw * weight * 10) / 10,
        rationale: d.rationale,
      };
    });

    const total = Math.round(scores.reduce((s, sc) => s + sc.weighted, 0) * 10) / 10;
    let decision: AgentDecision = 'PASS';
    if (total < 35 || risk > 70) decision = 'FAIL';
    else if (total < 55) decision = 'NEEDS_INFO';

    return { total, scores, decision };
  }
}
