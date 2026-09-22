import { createId } from '@ai-pass/shared';
import type { Offer, OfferField } from '../types.js';

export interface ParseResult {
  fields: OfferField[];
  confidence: number;
  source: OfferField['source'];
  creditsUsed: number;
}

/** Stub parser for PDF/Excel/CSV — deterministic, no direct provider calls */
export class OfferParsingService {
  parse(fileName: string, mimeType: string, supplierName?: string): ParseResult {
    const base = fileName.replace(/\.[^.]+$/, '').toLowerCase();
    const source: OfferField['source'] =
      mimeType.includes('pdf') ? 'pdf' : mimeType.includes('sheet') || base.endsWith('xlsx') ? 'excel' : 'csv';

    const price = 50000 + (base.length * 7919) % 200000;
    const deliveryDays = 14 + (base.length * 3) % 60;
    const quality = 60 + (base.length * 7) % 35;
    const warrantyMonths = 12 + (base.length % 24);

    const fields: OfferField[] = [
      { key: 'price', value: price, confidence: 0.91, source, validation: 'valid' },
      { key: 'currency', value: 'EUR', confidence: 0.98, source, validation: 'valid' },
      { key: 'delivery_days', value: deliveryDays, confidence: 0.85, source, validation: 'valid' },
      { key: 'quality_score', value: quality, confidence: 0.78, source, validation: 'needs_review' },
      { key: 'warranty_months', value: warrantyMonths, confidence: 0.82, source, validation: 'valid' },
      { key: 'payment_terms', value: 'Net 30', confidence: 0.88, source, validation: 'valid' },
      { key: 'supplier_name', value: supplierName ?? this.guessSupplier(base), confidence: 0.9, source, validation: 'valid' },
      { key: 'iso_9001', value: base.includes('nordic') || base.includes('global'), confidence: 0.75, source, validation: 'needs_review' },
      { key: 'esg_score', value: 55 + (base.length * 5) % 40, confidence: 0.7, source, validation: 'needs_review' },
      { key: 'risk_score', value: base.includes('rapid') ? 72 : 15 + (base.length * 3) % 40, confidence: 0.8, source, validation: 'valid' },
    ];

    const avgConfidence = fields.reduce((s, f) => s + f.confidence, 0) / fields.length;

    return {
      fields,
      confidence: Math.round(avgConfidence * 100) / 100,
      source,
      creditsUsed: source === 'pdf' ? 18 : source === 'excel' ? 12 : 8,
    };
  }

  toOffer(params: {
    eventId: string;
    supplierId: string;
    supplierName: string;
    fileName: string;
    mimeType: string;
    parseResult: ParseResult;
  }): Offer {
    const normalizedFields: Offer['normalizedFields'] = {};
    for (const f of params.parseResult.fields) {
      normalizedFields[f.key] = {
        value: f.value,
        confidence: f.confidence,
        provenance: `${params.parseResult.source}:${params.fileName}`,
      };
    }

    return {
      id: `offer_${createId()}`,
      eventId: params.eventId,
      supplierId: params.supplierId,
      supplierName: params.supplierName,
      fileName: params.fileName,
      mimeType: params.mimeType,
      fields: params.parseResult.fields,
      normalizedFields,
      currency: String(normalizedFields.currency?.value ?? 'EUR'),
      totalPrice: Number(normalizedFields.price?.value ?? 0),
      deliveryDays: Number(normalizedFields.delivery_days?.value ?? 0),
      status: 'parsed',
      uploadedAt: new Date().toISOString(),
      parsedAt: new Date().toISOString(),
    };
  }

  private guessSupplier(base: string): string {
    if (base.includes('nordic')) return 'Nordic Components AB';
    if (base.includes('global')) return 'GlobalTech Solutions';
    if (base.includes('med')) return 'MedSupply Europe';
    if (base.includes('rapid')) return 'Rapid Logistics Ltd';
    return 'Unknown Supplier';
  }
}
