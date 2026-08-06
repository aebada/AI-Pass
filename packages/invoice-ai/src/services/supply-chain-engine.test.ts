import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SupplyChainEngine } from './supply-chain-engine.js';
import { DEMO_SUPPLY_OFFERS, DEFAULT_SUPPLY_CHAIN_RULES } from '../demo-data.js';

describe('SupplyChainEngine', () => {
  const engine = new SupplyChainEngine();
  const concreteOffers = DEMO_SUPPLY_OFFERS.filter((o) => o.rfqId === 'tnd_tunnel_241');

  it('compares offers and ranks by composite score', () => {
    const comparison = engine.compareOffers(concreteOffers, DEFAULT_SUPPLY_CHAIN_RULES);
    assert.equal(comparison.offers.length, 4);
    assert.equal(comparison.offers[0]!.rank, 1);
    assert.ok(comparison.offers[0]!.compositeScore >= comparison.offers[1]!.compositeScore);
  });

  it('rejects high-risk vendor via rules', () => {
    const comparison = engine.compareOffers(concreteOffers, DEFAULT_SUPPLY_CHAIN_RULES);
    const rapid = comparison.offers.find((o) => o.vendorName.includes('Rapid'));
    assert.ok(rapid?.rejected);
  });

  it('recommends best eligible offer', () => {
    const rec = engine.generateRecommendation(concreteOffers, DEFAULT_SUPPLY_CHAIN_RULES);
    assert.equal(rec.decision, 'select');
    assert.equal(rec.bestVendorName, 'Heidelberg Materials Süd');
    assert.ok(rec.confidence > 0.5);
  });
});
