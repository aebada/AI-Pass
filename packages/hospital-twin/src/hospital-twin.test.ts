import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GOLDEN_QUESTIONS } from './intents.js';
import { createHospitalTwinService } from './service.js';
import { refuseIfNeeded } from './roles.js';

describe('Hospital System Twin', () => {
  it('same seed produces identical baseline occupancy', () => {
    const a = createHospitalTwinService(42).snapshot();
    const b = createHospitalTwinService(42).snapshot();
    assert.equal(a.kpis.find((k) => k.id === 'CAP-01')?.value, b.kpis.find((k) => k.id === 'CAP-01')?.value);
    assert.equal(a.stats.beds, b.stats.beds);
    assert.equal(a.banner.includes('Synthetic'), true);
  });

  it('builds ~300-bed demo hospital structure', () => {
    const snap = createHospitalTwinService(42).snapshot();
    assert.ok(snap.stats.beds >= 280);
    assert.ok(snap.ontologySummary.classes >= 20);
    assert.equal(snap.site.name, 'Demo General Hospital');
  });

  it('computes certified KPI set including CAP/ED/SUP/EQ', () => {
    const ids = new Set(createHospitalTwinService(42).snapshot().kpis.map((k) => k.id));
    for (const id of ['CAP-01', 'ED-05', 'SUP-04', 'EQ-02', 'STF-01', 'OR-01']) {
      assert.ok(ids.has(id), `missing ${id}`);
    }
  });

  it('surge scenario raises ED waiting / alerts', () => {
    const svc = createHospitalTwinService(42);
    const before = svc.snapshot().kpis.find((k) => k.id === 'ED-03')!.value;
    svc.injectScenario('surge');
    const after = svc.snapshot();
    assert.ok(after.kpis.find((k) => k.id === 'ED-03')!.value >= before);
    assert.ok(after.alerts.some((a) => a.ruleId.includes('ed') || a.scope === 'ED' || a.ruleId.includes('icu')));
    assert.equal(after.activeScenario, 'surge');
  });

  it('equipment failure triggers critical equipment alert', () => {
    const svc = createHospitalTwinService(42);
    svc.injectScenario('equipment_failure');
    const snap = svc.snapshot();
    assert.ok((snap.kpis.find((k) => k.id === 'EQ-02')?.value ?? 0) >= 1);
    assert.ok(snap.alerts.some((a) => a.ruleId === 'critical_equipment_down'));
  });

  it('supply shortage marks late PO / stock risk', () => {
    const svc = createHospitalTwinService(42);
    svc.injectScenario('supply_shortage');
    const snap = svc.snapshot();
    assert.ok((snap.kpis.find((k) => k.id === 'SUP-03')?.value ?? 0) >= 1);
  });

  it('oxygen drop and feed outage produce alerts', () => {
    const svc = createHospitalTwinService(42);
    svc.injectScenario('oxygen_drop');
    assert.ok(svc.snapshot().alerts.some((a) => a.ruleId === 'oxygen_reserve_low'));
    svc.reset();
    svc.injectScenario('feed_outage');
    assert.ok(svc.snapshot().alerts.some((a) => a.ruleId === 'data_feed_stale'));
  });

  it('reset returns to baseline', () => {
    const svc = createHospitalTwinService(42);
    const base = svc.snapshot().kpis.find((k) => k.id === 'CAP-01')!.value;
    svc.injectScenario('flu_ramp');
    svc.reset();
    assert.equal(svc.snapshot().kpis.find((k) => k.id === 'CAP-01')!.value, base);
    assert.equal(svc.snapshot().activeScenario, undefined);
  });

  it('golden 30 questions all answer for COO', () => {
    const svc = createHospitalTwinService(42);
    const suite = svc.runGoldenSuite('coo');
    assert.equal(suite.total, 30);
    assert.equal(suite.passed, 30);
    assert.equal(GOLDEN_QUESTIONS.length, 30);
  });

  it('pharmacy manager cannot see ICU staffing', () => {
    assert.ok(refuseIfNeeded('pharmacy_manager', 'staffing'));
    const ans = createHospitalTwinService(42).ask('Are we short on nurses tonight?', 'pharmacy_manager');
    assert.equal(ans.refused, true);
  });

  it('forecasts beat seasonal-naive flag', () => {
    const forecasts = createHospitalTwinService(42).snapshot().forecasts;
    assert.ok(forecasts.every((f) => f.beatsSeasonalNaive));
  });

  it('exposes digital twin visualizations for floors and beds', () => {
    const snap = createHospitalTwinService(42).snapshot();
    assert.ok(snap.twinVisuals.units.length >= 10);
    assert.ok(snap.twinVisuals.floors.length >= 3);
    assert.ok(snap.twinVisuals.units.every((u) => u.beds.length > 0));
    assert.ok(snap.twinVisuals.occupancyTrend.length === 24);
    assert.ok(snap.twinVisuals.equipment.length > 0);
  });
});
