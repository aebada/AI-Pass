import type { Offer } from '../types.js';

const FX_RATES: Record<string, number> = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  CHF: 1.05,
  SEK: 0.088,
};

export class OfferNormalizationService {
  normalize(offer: Offer, targetCurrency = 'EUR'): Offer {
    const sourceCurrency = String(offer.normalizedFields.currency?.value ?? offer.currency ?? 'EUR').toUpperCase();
    const rate = FX_RATES[sourceCurrency] ?? 1;
    const price = Number(offer.normalizedFields.price?.value ?? offer.totalPrice ?? 0);
    const normalizedPrice = Math.round(price * rate * 100) / 100;

    const deliveryRaw = offer.normalizedFields.delivery_days?.value ?? offer.deliveryDays;
    const deliveryDays = typeof deliveryRaw === 'string'
      ? this.parseDeliveryDays(deliveryRaw)
      : Number(deliveryRaw ?? 0);

    const normalizedFields = {
      ...offer.normalizedFields,
      price: {
        value: normalizedPrice,
        confidence: offer.normalizedFields.price?.confidence ?? 0.9,
        provenance: `normalized:${sourceCurrency}->${targetCurrency}`,
      },
      currency: { value: targetCurrency, confidence: 1, provenance: 'normalization' },
      delivery_days: {
        value: deliveryDays,
        confidence: offer.normalizedFields.delivery_days?.confidence ?? 0.85,
        provenance: offer.normalizedFields.delivery_days?.provenance,
      },
      lead_time: {
        value: deliveryDays,
        confidence: offer.normalizedFields.delivery_days?.confidence ?? 0.85,
        provenance: 'alias:delivery_days',
      },
    };

    return {
      ...offer,
      currency: targetCurrency,
      totalPrice: normalizedPrice,
      deliveryDays,
      normalizedFields,
      status: 'normalized',
    };
  }

  private parseDeliveryDays(value: string): number {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : 30;
  }
}
