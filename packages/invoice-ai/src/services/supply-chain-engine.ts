import { createId } from '@ai-pass/shared';
import type {
  OfferComparison,
  OfferComparisonRow,
  SupplyChainRecommendation,
  SupplyChainRuleResult,
  SupplyOffer,
  Tender,
  TenderComparison,
  TenderComparisonCell,
  TenderComparisonCriterion,
  UserRule,
  UserRuleConditionField,
} from '@ai-pass/shared/invoice-ai';

const DEFAULT_CRITERIA: TenderComparisonCriterion[] = [
  { id: 'price', label: 'Total price', weight: 0.35, higherIsBetter: false },
  { id: 'lead_time', label: 'Lead time (days)', weight: 0.2, higherIsBetter: false },
  { id: 'compliance', label: 'Compliance score', weight: 0.25, higherIsBetter: true },
  { id: 'vendor_risk', label: 'Vendor risk', weight: 0.2, higherIsBetter: false },
];

function normalizeValues(values: number[], higherIsBetter: boolean): Map<number, number> {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const scores = new Map<number, number>();
  for (const v of values) {
    const ratio = (v - min) / range;
    scores.set(v, higherIsBetter ? ratio : 1 - ratio);
  }
  return scores;
}

function ruleApplies(rule: UserRule, offer: SupplyOffer, tenderId?: string): boolean {
  if (rule.scope === 'tender' && rule.tenderId && rule.tenderId !== (tenderId ?? offer.tenderId ?? offer.rfqId)) {
    return false;
  }
  return true;
}

function getFieldValue(offer: SupplyOffer, field: UserRuleConditionField): number {
  switch (field) {
    case 'price':
      return offer.netAmount;
    case 'total':
      return offer.totalAmount;
    case 'lead_time':
      return offer.leadTimeDays;
    case 'vendor_risk':
      return offer.vendorRiskScore;
    case 'compliance':
      return offer.complianceScore;
    case 'po_match':
      return offer.poMatchScore;
    default:
      return 0;
  }
}

function evaluateCondition(offer: SupplyOffer, condition: UserRule['condition']): boolean {
  const value = getFieldValue(offer, condition.field);
  switch (condition.operator) {
    case 'lt':
      return value < condition.value;
    case 'lte':
      return value <= condition.value;
    case 'gt':
      return value > condition.value;
    case 'gte':
      return value >= condition.value;
    case 'eq':
      return value === condition.value;
    default:
      return false;
  }
}

/** Compare supplier offers, evaluate user rules, and produce recommendations */
export class SupplyChainEngine {
  compareOffers(offers: SupplyOffer[], rules: UserRule[] = []): OfferComparison {
    if (offers.length === 0) {
      throw new Error('No offers to compare');
    }

    const first = offers[0]!;
    const tenderId = first.tenderId ?? first.rfqId;
    const activeRules = rules.filter((r) => r.enabled);
    const { rows } = this.scoreOffers(offers, activeRules, tenderId);

    const ranked = [...rows]
      .sort((a, b) => {
        if (a.rejected !== b.rejected) return a.rejected ? 1 : -1;
        return b.compositeScore - a.compositeScore;
      })
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return {
      tenderId,
      rfqId: tenderId,
      rfqTitle: first.rfqTitle,
      category: first.category,
      projectName: first.projectName,
      purchaseOrderRef: first.purchaseOrderId,
      offers: ranked,
      comparedAt: new Date().toISOString(),
    };
  }

  buildTenderComparison(tender: Tender, offers: SupplyOffer[], rules: UserRule[] = []): TenderComparison {
    const tenderOffers = offers.filter((o) => o.tenderId === tender.id || o.rfqId === tender.id);
    const comparison = this.compareOffers(tenderOffers, rules);
    const criteria = DEFAULT_CRITERIA;

    const offerRows = tenderOffers.map((offer) => {
      const row = comparison.offers.find((r) => r.offerId === offer.id);
      const cells: TenderComparisonCell[] = criteria.map((criterion) => {
        const field = criterion.id as UserRuleConditionField;
        const rawValue = getFieldValue(offer, field);
        const allValues = tenderOffers.map((o) => getFieldValue(o, field));
        const norm = normalizeValues(allValues, criterion.higherIsBetter);
        return {
          offerId: offer.id,
          criterionId: criterion.id,
          rawValue,
          normalizedScore: Math.round((norm.get(rawValue) ?? 0) * 100),
        };
      });
      return {
        offerId: offer.id,
        vendorName: offer.vendorName,
        cells,
        totalScore: row?.compositeScore ?? 0,
      };
    });

    return {
      tenderId: tender.id,
      tenderTitle: tender.title,
      criteria,
      offers: offerRows.sort((a, b) => b.totalScore - a.totalScore),
      comparedAt: comparison.comparedAt,
    };
  }

  evaluateTender(
    tender: Tender,
    offers: SupplyOffer[],
    rules: UserRule[] = [],
  ): SupplyChainRecommendation & { comparison: OfferComparison; matrix: TenderComparison } {
    const tenderOffers = offers.filter((o) => o.tenderId === tender.id || o.rfqId === tender.id);
    const recommendation = this.generateRecommendation(tenderOffers, rules);
    const comparison = this.compareOffers(tenderOffers, rules);
    const matrix = this.buildTenderComparison(tender, tenderOffers, rules);

    return {
      ...recommendation,
      tenderId: tender.id,
      rfqId: tender.id,
      comparison,
      matrix,
    };
  }

  awardTender(
    tender: Tender,
    offerId: string,
    offers: SupplyOffer[],
  ): { tender: Tender; offers: SupplyOffer[]; awarded: SupplyOffer } {
    const awarded = offers.find((o) => o.id === offerId);
    if (!awarded) throw new Error(`Offer ${offerId} not found`);

    const updatedTender: Tender = { ...tender, status: 'awarded', awardedOfferId: offerId };
    const updatedOffers = offers.map((o) => {
      if (o.tenderId !== tender.id && o.rfqId !== tender.id) return o;
      if (o.id === offerId) return { ...o, status: 'selected' as const };
      return { ...o, status: 'rejected' as const };
    });

    return { tender: updatedTender, offers: updatedOffers, awarded };
  }

  parseOfferFromFileName(params: {
    tenantId: string;
    tender: Tender;
    fileName: string;
    vendorName?: string;
  }): SupplyOffer {
    const lower = params.fileName.toLowerCase();
    const vendorName =
      params.vendorName ??
      (lower.includes('beton')
        ? 'Beton AG Munich'
        : lower.includes('bremer')
          ? 'Bremer Transporte'
          : lower.includes('nordic')
            ? 'Nordic Office GmbH'
            : lower.includes('acme')
              ? 'Acme Supplies GmbH'
              : `Supplier ${params.fileName.split('.')[0]}`);

    const vendorId = vendorName.includes('Beton')
      ? 'vnd_concrete'
      : vendorName.includes('Bremer')
        ? 'vnd_gravel'
        : vendorName.includes('Acme')
          ? 'vnd_001'
          : vendorName.includes('Nordic')
            ? 'vnd_office_nordic'
            : `vnd_${createId().slice(0, 6)}`;

    const baseTotal = 8000 + (params.fileName.length % 7) * 1200;
    const leadTime = lower.includes('express') ? 7 : lower.includes('standard') ? 14 : 21;

    return {
      id: `offer_${createId()}`,
      tenantId: params.tenantId,
      tenderId: params.tender.id,
      rfqId: params.tender.id,
      rfqTitle: params.tender.title,
      category: params.tender.project.toLowerCase().includes('office') ? 'office_supplies' : 'concrete',
      vendorId,
      vendorName,
      quoteNumber: `Q-${params.fileName.replace(/\.[^.]+$/, '').slice(0, 12).toUpperCase()}`,
      netAmount: Math.round(baseTotal * 0.84),
      vatAmount: Math.round(baseTotal * 0.16),
      totalAmount: baseTotal,
      currency: 'EUR',
      leadTimeDays: leadTime,
      paymentTerms: 'Net 30',
      vendorRiskScore: lower.includes('rapid') ? 72 : 12,
      complianceScore: lower.includes('cert') ? 92 : 78 + (params.fileName.length % 15),
      poMatchScore: 70 + (params.fileName.length % 25),
      validityDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      items: [
        {
          description: params.tender.title,
          quantity: 1,
          unit: 'lot',
          unitPrice: Math.round(baseTotal * 0.84),
        },
      ],
      status: 'parsed',
      receivedAt: new Date().toISOString(),
      projectName: params.tender.project,
    };
  }

  generateRecommendation(
    offers: SupplyOffer[],
    rules: UserRule[] = [],
  ): SupplyChainRecommendation {
    const comparison = this.compareOffers(offers, rules);
    const activeRules = rules.filter((r) => r.enabled);
    const ruleResults = this.evaluateAllRules(offers, activeRules, comparison.tenderId);
    const eligible = comparison.offers.filter((o) => !o.rejected);
    const warnings = comparison.offers.flatMap((o) => o.ruleViolations);

    if (eligible.length === 0) {
      return {
        tenderId: comparison.tenderId,
        rfqId: comparison.rfqId,
        bestOfferId: '',
        bestVendorName: '',
        decision: 'reject_all',
        confidence: 0.95,
        rationale: 'All offers rejected by user-defined rules. Review vendor risk and compliance thresholds.',
        warnings,
        ruleResults,
        generatedAt: new Date().toISOString(),
      };
    }

    const best = eligible[0]!;
    const runnerUp = eligible[1];
    const needsRevision = eligible.some((o) =>
      o.ruleViolations.some((v) => v.includes('revision')),
    );

    let decision: SupplyChainRecommendation['decision'] = 'select';
    let rationale = `${best.vendorName} ranked #1 with composite score ${best.compositeScore.toFixed(1)} — best balance of price (€${best.price.toLocaleString()}), ${best.leadTimeDays}d lead time, and vendor score ${best.vendorScore}.`;

    if (needsRevision && best.poMatchScore < 85) {
      decision = 'revision';
      rationale = `${best.vendorName} is top-ranked but PO match (${best.poMatchScore}%) needs revision before award.`;
    } else if (runnerUp && best.compositeScore - runnerUp.compositeScore < 3) {
      rationale += ` Close call vs ${runnerUp.vendorName} (€${runnerUp.price.toLocaleString()}, ${runnerUp.leadTimeDays}d) — consider negotiation.`;
    }

    const confidence = Math.min(
      0.98,
      0.65 + best.compositeScore / 200 + (eligible.length > 1 ? 0.05 : 0),
    );

    return {
      tenderId: comparison.tenderId,
      rfqId: comparison.rfqId,
      bestOfferId: best.offerId,
      bestVendorName: best.vendorName,
      runnerUpOfferId: runnerUp?.offerId,
      runnerUpVendorName: runnerUp?.vendorName,
      decision,
      confidence: Math.round(confidence * 100) / 100,
      rationale,
      warnings,
      ruleResults,
      generatedAt: new Date().toISOString(),
    };
  }

  private scoreOffers(
    offers: SupplyOffer[],
    rules: UserRule[],
    tenderId?: string,
  ): { rows: OfferComparisonRow[]; rejectedIds: Set<string> } {
    const prices = offers.map((o) => o.netAmount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const rejectedIds = new Set<string>();
    const violations = new Map<string, string[]>();

    for (const offer of offers) {
      const offerViolations: string[] = [];
      for (const rule of rules) {
        if (!ruleApplies(rule, offer, tenderId)) continue;
        if (!evaluateCondition(offer, rule.condition)) continue;

        switch (rule.action) {
          case 'reject':
            rejectedIds.add(offer.id);
            offerViolations.push(`Rejected: ${rule.name}`);
            break;
          case 'warn':
            offerViolations.push(`Warning: ${rule.name}`);
            break;
          case 'require_revision':
            offerViolations.push(`Revision required: ${rule.name}`);
            break;
          case 'prefer':
            break;
        }
      }
      violations.set(offer.id, offerViolations);
    }

    const preferEligible = offers.filter(
      (o) =>
        !rejectedIds.has(o.id) &&
        rules.some(
          (r) =>
            ruleApplies(r, o, tenderId) &&
            r.action === 'prefer' &&
            evaluateCondition(o, r.condition),
        ),
    );
    const lowestPreferPrice =
      preferEligible.length > 0 ? Math.min(...preferEligible.map((o) => o.netAmount)) : null;

    const rows: OfferComparisonRow[] = offers.map((offer) => {
      const priceNorm = 1 - (offer.netAmount - minPrice) / priceRange;
      const leadNorm = 1 - Math.min(offer.leadTimeDays, 30) / 30;
      const riskNorm = 1 - offer.vendorRiskScore / 100;
      const complianceNorm = offer.complianceScore / 100;
      const poNorm = offer.poMatchScore / 100;

      let compositeScore =
        priceNorm * 30 + leadNorm * 20 + riskNorm * 20 + complianceNorm * 15 + poNorm * 15;

      if (
        lowestPreferPrice !== null &&
        offer.netAmount === lowestPreferPrice &&
        preferEligible.some((o) => o.id === offer.id)
      ) {
        compositeScore += 12;
      }

      const vendorScore = Math.round((riskNorm * 60 + complianceNorm * 40) * 100) / 100;

      return {
        offerId: offer.id,
        vendorName: offer.vendorName,
        quoteNumber: offer.quoteNumber,
        price: offer.netAmount,
        vatAmount: offer.vatAmount,
        total: offer.totalAmount,
        leadTimeDays: offer.leadTimeDays,
        vendorScore,
        complianceScore: offer.complianceScore,
        poMatchScore: offer.poMatchScore,
        paymentTerms: offer.paymentTerms,
        rank: 0,
        compositeScore: Math.round(compositeScore * 10) / 10,
        ruleViolations: violations.get(offer.id) ?? [],
        rejected: rejectedIds.has(offer.id),
      };
    });

    return { rows, rejectedIds };
  }

  private evaluateAllRules(
    offers: SupplyOffer[],
    rules: UserRule[],
    tenderId?: string,
  ): SupplyChainRuleResult[] {
    const results: SupplyChainRuleResult[] = [];
    for (const offer of offers) {
      for (const rule of rules) {
        if (!ruleApplies(rule, offer, tenderId)) continue;
        if (!evaluateCondition(offer, rule.condition)) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            offerId: offer.id,
            outcome: 'pass',
            message: `${rule.name} — not triggered`,
          });
          continue;
        }
        const outcome =
          rule.action === 'reject'
            ? 'fail'
            : rule.action === 'warn' || rule.action === 'require_revision'
              ? 'warn'
              : 'pass';
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          offerId: offer.id,
          outcome,
          message: `${rule.name} ${outcome === 'fail' ? 'failed' : outcome === 'warn' ? 'warning' : 'applied'} for ${offer.vendorName}`,
        });
      }
    }
    return results;
  }
}
