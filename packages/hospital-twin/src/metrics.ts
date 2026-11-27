import type { Alert, HospitalState, KpiValue, Provenance } from './types.js';

const METRIC_VERSION = 'hospital-kpi-v0.1.0';

function provenance(definition: string, asOf: string, source = 'HIS/ED/ERP synthetic'): Provenance {
  return {
    sourceSystem: source,
    asOf,
    metricVersion: METRIC_VERSION,
    definition,
    synthetic: true,
  };
}

function statusOf(value: number, warn?: number, critical?: number, direction: KpiValue['direction'] = 'down_good'): KpiValue['status'] {
  if (warn == null && critical == null) return 'ok';
  if (direction === 'up_good') {
    if (critical != null && value <= critical) return 'critical';
    if (warn != null && value <= warn) return 'warn';
    return 'ok';
  }
  if (direction === 'down_good') {
    if (critical != null && value >= critical) return 'critical';
    if (warn != null && value >= warn) return 'warn';
    return 'ok';
  }
  return 'ok';
}

function kpi(
  id: string,
  name: string,
  value: number,
  unit: string,
  asOf: string,
  definition: string,
  opts: {
    warn?: number;
    critical?: number;
    direction?: KpiValue['direction'];
    dimensions?: Record<string, string>;
    source?: string;
  } = {},
): KpiValue {
  const direction = opts.direction ?? 'down_good';
  return {
    id,
    name,
    value: Number.isFinite(value) ? Math.round(value * 100) / 100 : 0,
    unit,
    direction,
    warn: opts.warn,
    critical: opts.critical,
    status: statusOf(value, opts.warn, opts.critical, direction),
    dimensions: opts.dimensions,
    provenance: provenance(definition, asOf, opts.source),
  };
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function hoursBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;
}

function minutesBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 60_000;
}

export function computeKpis(state: HospitalState): KpiValue[] {
  const asOf = state.simClock;
  const staffed = state.beds.filter((b) => b.bedType !== 'ED').length || 1;
  const occupied = state.beds.filter((b) => b.status === 'occupied').length;
  const available = state.beds.filter((b) => b.status === 'available').length;
  const cleaning = state.beds.filter((b) => b.status === 'cleaning').length;
  const blocked = state.beds.filter((b) => b.status === 'blocked' || b.status === 'maintenance').length;

  const turnaroundMins = state.cleaningTasks
    .filter((t) => t.doneTs && t.requestedTs)
    .map((t) => minutesBetween(t.requestedTs, t.doneTs!));

  const pendingDischarges = state.encounters.filter((e) => e.status === 'discharge-ordered').length;
  const discharged = state.encounters.filter((e) => e.status === 'discharged' && e.admitTs && e.dischargeTs);
  const beforeNoon = discharged.filter((e) => new Date(e.dischargeTs!).getHours() < 12).length;
  const avgLosDays =
    discharged.length === 0
      ? 0
      : discharged.reduce((sum, e) => sum + hoursBetween(e.admitTs!, e.dischargeTs!) / 24, 0) / discharged.length;

  const activeEd = state.edVisits.filter((v) => !v.departTs);
  const waiting = activeEd.filter((v) => {
    const enc = state.encounters.find((e) => e.id === v.encounterId);
    return enc && (enc.status === 'registered' || enc.status === 'waiting');
  }).length;
  const boarding = activeEd.filter((v) => v.boarding).length;
  const doorToTriage = activeEd
    .concat(state.edVisits.filter((v) => v.departTs))
    .filter((v) => v.triageTs)
    .map((v) => minutesBetween(v.arrivalTs, v.triageTs!));
  const doorToProvider = state.edVisits.filter((v) => v.seenTs).map((v) => minutesBetween(v.arrivalTs, v.seenTs!));
  const edLos = state.edVisits.filter((v) => v.departTs).map((v) => minutesBetween(v.arrivalTs, v.departTs!));
  const lwbs = state.edVisits.filter((v) => {
    const enc = state.encounters.find((e) => e.id === v.encounterId);
    return enc?.status === 'left-without-being-seen';
  }).length;
  const lwbsRate = state.edVisits.length ? (lwbs / state.edVisits.length) * 100 : 0;
  const boardingTimes = state.edVisits
    .filter((v) => v.boarding && v.decisionTs && v.departTs)
    .map((v) => minutesBetween(v.decisionTs!, v.departTs!));

  const orAvailableMins = state.procedures.length * 240 || 1;
  const orActualMins = state.procedures.reduce((sum, p) => {
    if (!p.actualStart || !p.actualEnd) return sum;
    return sum + minutesBetween(p.actualStart, p.actualEnd);
  }, 0);
  const firstCases = state.procedures.filter((p) => p.actualStart && p.scheduledStart);
  const onTime = firstCases.filter((p) => new Date(p.actualStart!).getTime() <= new Date(p.scheduledStart).getTime() + 5 * 60_000).length;
  const cancellations = state.procedures.filter((p) => p.status === 'cancelled').length;

  const labOrders = state.orders.filter((o) => o.orderType === 'lab' && o.resultTs);
  const imagingOrders = state.orders.filter((o) => o.orderType === 'imaging' && o.resultTs);
  const labTat = labOrders.map((o) => minutesBetween(o.orderedTs, o.resultTs!));
  const imgTat = imagingOrders.map((o) => minutesBetween(o.orderedTs, o.resultTs!));

  const coverage =
    state.shifts.length === 0
      ? 100
      : (state.shifts.reduce((s, sh) => s + (sh.requiredCount ? sh.presentCount / sh.requiredCount : 1), 0) /
          state.shifts.length) *
        100;

  const criticalStock = state.items.filter((i) => i.criticality === 'critical' || i.criticality === 'high');
  const stockoutRisk = criticalStock.filter((item) => {
    const qty = state.stock.find((s) => s.itemId === item.id)?.quantity ?? 0;
    return qty <= item.reorderPoint;
  }).length;
  const daysOfStock = criticalStock.map((item) => {
    const qty = state.stock.find((s) => s.itemId === item.id)?.quantity ?? 0;
    return item.dailyUse > 0 ? qty / item.dailyUse : 99;
  });
  const minDays = daysOfStock.length ? Math.min(...daysOfStock) : 30;
  const latePos = state.purchaseOrders.filter((p) => p.status === 'late').length;

  const criticalEq = state.equipment.filter((e) => e.critical);
  const eqAvail = criticalEq.length
    ? (criticalEq.filter((e) => e.status === 'working').length / criticalEq.length) * 100
    : 100;
  const criticalDown = criticalEq.filter((e) => e.status === 'down').length;
  const openWo = state.workOrders.filter((w) => w.status !== 'closed');
  const backlog = openWo.filter((w) => hoursBetween(w.openedTs, asOf) > 24).length;
  const closedWo = state.workOrders.filter((w) => w.closedTs);
  const mttr =
    closedWo.length === 0
      ? 0
      : closedWo.reduce((s, w) => s + hoursBetween(w.openedTs, w.closedTs!), 0) / closedWo.length;

  const openAlerts = state.alerts.filter((a) => !a.closedTs).length;

  const icuBeds = state.beds.filter((b) => {
    const unit = state.units.find((u) => u.id === b.unitId);
    return unit?.specialty.toLowerCase().includes('icu');
  });
  const icuOcc = icuBeds.length
    ? (icuBeds.filter((b) => b.status === 'occupied').length / icuBeds.length) * 100
    : 0;

  return [
    kpi('CAP-01', 'Bed occupancy', (occupied / staffed) * 100, '%', asOf, 'occupied / staffed beds', {
      warn: 85,
      critical: 92,
    }),
    kpi('CAP-02', 'Available beds now', available, 'count', asOf, 'beds in status available', {
      warn: Math.max(1, Math.floor(staffed * 0.05)),
      critical: 0,
      direction: 'up_good',
    }),
    kpi('CAP-03', 'Beds awaiting cleaning', cleaning, 'count', asOf, 'beds in cleaning', { warn: 5, critical: 10 }),
    kpi('CAP-04', 'Bed turnaround time', median(turnaroundMins), 'min', asOf, 'median discharge→available', {
      warn: 60,
      critical: 90,
    }),
    kpi('CAP-05', 'Blocked or OOS beds', blocked, 'count', asOf, 'blocked or maintenance', { warn: 3, critical: 6 }),
    kpi('ADM-01', 'Admissions', state.encounters.filter((e) => e.admitTs).length, 'count', asOf, 'admissions in window'),
    kpi('ADM-02', 'Discharges', discharged.length, 'count', asOf, 'discharges in window'),
    kpi(
      'ADM-03',
      'Discharges before noon',
      discharged.length ? (beforeNoon / discharged.length) * 100 : 0,
      '%',
      asOf,
      'share of discharges before 12:00',
      { warn: 25, critical: 15, direction: 'up_good' },
    ),
    kpi('ADM-04', 'Average length of stay', avgLosDays, 'days', asOf, 'mean LOS discharged encounters'),
    kpi('ADM-05', 'Pending discharges', pendingDischarges, 'count', asOf, 'discharge-ordered not departed', {
      warn: 10,
      critical: 20,
    }),
    kpi('ED-01', 'ED arrivals', state.edVisits.length, 'count', asOf, 'ED arrivals in window'),
    kpi('ED-02', 'ED current census', activeEd.length, 'count', asOf, 'patients currently in ED'),
    kpi('ED-03', 'ED waiting count', waiting, 'count', asOf, 'registered/triaged not yet seen', {
      warn: 15,
      critical: 25,
    }),
    kpi('ED-04', 'Door-to-triage time', median(doorToTriage), 'min', asOf, 'median arrival→triage', {
      warn: 15,
      critical: 30,
    }),
    kpi('ED-05', 'Door-to-provider time', median(doorToProvider), 'min', asOf, 'median arrival→seen', {
      warn: 60,
      critical: 120,
    }),
    kpi('ED-06', 'ED length of stay', median(edLos), 'min', asOf, 'median arrival→departure', {
      warn: 240,
      critical: 360,
    }),
    kpi('ED-07', 'Left without being seen', lwbsRate, '%', asOf, 'LWBS share of visits', { warn: 3, critical: 6 }),
    kpi('ED-08', 'ED boarding', boarding, 'count', asOf, 'admitted patients still in ED', { warn: 5, critical: 10 }),
    kpi('ED-09', 'Boarding time', median(boardingTimes), 'min', asOf, 'median decision→departure for admits', {
      warn: 120,
      critical: 240,
    }),
    kpi('OR-01', 'OR utilization', (orActualMins / orAvailableMins) * 100, '%', asOf, 'actual / available minutes', {
      warn: 60,
      critical: 45,
      direction: 'up_good',
    }),
    kpi(
      'OR-02',
      'First-case on-time start',
      firstCases.length ? (onTime / firstCases.length) * 100 : 100,
      '%',
      asOf,
      'share on time',
      { warn: 80, critical: 60, direction: 'up_good' },
    ),
    kpi('OR-03', 'Cancellations on day', cancellations, 'count', asOf, 'OR cancellations', { warn: 2, critical: 5 }),
    kpi('DX-01', 'Lab turnaround', median(labTat), 'min', asOf, 'median order→result lab'),
    kpi('DX-02', 'Imaging turnaround', median(imgTat), 'min', asOf, 'median order→report imaging'),
    kpi('STF-01', 'Staffing coverage', coverage, '%', asOf, 'present / required per shift', {
      warn: 90,
      critical: 80,
      direction: 'up_good',
    }),
    kpi('STF-02', 'Overtime hours', Math.max(0, 100 - coverage) * 0.4, 'h', asOf, 'estimated overtime from coverage gaps'),
    kpi('SUP-01', 'Days of stock remaining', minDays, 'days', asOf, 'min critical item stock/daily use', {
      warn: 5,
      critical: 2,
      direction: 'up_good',
    }),
    kpi('SUP-02', 'Stock-out risk items', stockoutRisk, 'count', asOf, 'critical items under reorder point', {
      warn: 0,
      critical: 3,
    }),
    kpi('SUP-03', 'Open POs late', latePos, 'count', asOf, 'late purchase orders', { warn: 0, critical: 1 }),
    kpi('SUP-04', 'Oxygen reserve', state.oxygenHoursRemaining, 'h', asOf, 'remaining hours at current use', {
      warn: 72,
      critical: 24,
      direction: 'up_good',
      source: 'BMS/IoT synthetic',
    }),
    kpi('EQ-01', 'Equipment availability', eqAvail, '%', asOf, 'working / total critical equipment', {
      warn: 95,
      critical: 85,
      direction: 'up_good',
    }),
    kpi('EQ-02', 'Critical equipment down', criticalDown, 'count', asOf, 'ventilator/CT/MRI/dialysis down', {
      warn: 0,
      critical: 1,
    }),
    kpi('EQ-03', 'Maintenance backlog', backlog, 'count', asOf, 'open WOs older than SLA', { warn: 10, critical: 25 }),
    kpi('EQ-04', 'Mean time to repair', mttr, 'h', asOf, 'mean open→close work orders'),
    kpi('ALR-01', 'Open alerts', openAlerts, 'count', asOf, 'open operational alerts'),
    kpi('ICU-01', 'ICU occupancy', icuOcc, '%', asOf, 'ICU occupied / ICU beds', { warn: 85, critical: 92 }),
  ];
}

export function evaluateAlerts(state: HospitalState, kpis: KpiValue[]): Alert[] {
  const byId = new Map(kpis.map((k) => [k.id, k]));
  const open: Alert[] = [];
  const asOf = state.simClock;

  const push = (
    ruleId: string,
    severity: Alert['severity'],
    title: string,
    explanation: string,
    scope: string,
    ownerRole: Alert['ownerRole'],
  ) => {
    open.push({
      id: `alr_${ruleId}_${scope.replace(/\W+/g, '_')}`.slice(0, 64),
      ruleId,
      severity,
      title,
      explanation,
      scope,
      openedTs: asOf,
      ownerRole,
    });
  };

  const icu = byId.get('ICU-01');
  if (icu && icu.status === 'critical') {
    push(
      'icu_capacity_critical',
      'critical',
      'ICU capacity critical',
      `ICU occupancy ${icu.value}% at or above critical threshold ${icu.critical}%.`,
      'ICU',
      'nursing_supervisor',
    );
  }

  const wait = byId.get('ED-03');
  const board = byId.get('ED-08');
  if (wait && wait.status !== 'ok') {
    const sev = wait.status === 'critical' || (board && board.status === 'critical') ? 'critical' : 'warn';
    push(
      'ed_overcrowding',
      sev,
      'ED overcrowding',
      `ED waiting count ${wait.value} (boarding ${board?.value ?? 0}).`,
      'ED',
      'ed_lead',
    );
  }
  if (board && board.status === 'critical') {
    push(
      'boarding_spike',
      'critical',
      'Boarding spike',
      `ED boarding ${board.value} exceeds critical ${board.critical}.`,
      'ED',
      'ed_lead',
    );
  }

  const turn = byId.get('CAP-04');
  if (turn && turn.status !== 'ok') {
    push(
      'bed_turnaround_slow',
      turn.status,
      'Bed turnaround slow',
      `Median bed turnaround ${turn.value} min.`,
      'Capacity',
      'nursing_supervisor',
    );
  }

  const stf = byId.get('STF-01');
  if (stf && stf.status === 'critical') {
    push(
      'staffing_gap',
      'critical',
      'Staffing gap',
      `Staffing coverage ${stf.value}% below critical ${stf.critical}%.`,
      'Staffing',
      'nursing_supervisor',
    );
  }

  const stock = byId.get('SUP-01');
  const risk = byId.get('SUP-02');
  if ((stock && stock.status !== 'ok') || (risk && risk.value > 0)) {
    push(
      'critical_stockout_risk',
      risk && risk.value > 0 ? 'critical' : 'warn',
      'Critical stock-out risk',
      `Min days of stock ${stock?.value ?? 0}; risk items ${risk?.value ?? 0}.`,
      'Supply',
      'pharmacy_manager',
    );
  }

  const late = byId.get('SUP-03');
  if (late && late.value > 0) {
    push(
      'late_supplier_order',
      'warn',
      'Late supplier order',
      `${late.value} purchase order(s) past expected date.`,
      'Supply',
      'pharmacy_manager',
    );
  }

  const eq = byId.get('EQ-02');
  if (eq && eq.value > 0) {
    const down = state.equipment.filter((e) => e.critical && e.status === 'down');
    push(
      'critical_equipment_down',
      'critical',
      'Critical equipment down',
      down.map((d) => `${d.code} (${d.equipmentType})`).join(', ') || `${eq.value} critical device(s) down`,
      'Equipment',
      'maintenance_lead',
    );
  }

  const o2 = byId.get('SUP-04');
  if (o2 && o2.status !== 'ok') {
    push(
      'oxygen_reserve_low',
      o2.status,
      'Oxygen reserve low',
      `Oxygen reserve ${o2.value} h remaining.`,
      'Facilities',
      'coo',
    );
  }

  if (state.feedStale.ed || state.feedStale.beds || state.feedStale.stock) {
    const stale = Object.entries(state.feedStale)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ');
    push(
      'data_feed_stale',
      'warn',
      'Data feed stale',
      `Source freshness SLA missed for: ${stale}. Answers may be out of date.`,
      'Data quality',
      'admin',
    );
  }

  for (const evt of state.dataQualityEvents) {
    push('bad_data', 'warn', 'Data quality event', evt, 'Data quality', 'admin');
  }

  return open;
}
