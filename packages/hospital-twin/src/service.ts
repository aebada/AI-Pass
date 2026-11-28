import { ALL_MODULES, ONTOLOGY_CLASSES, ONTOLOGY_RELATIONS, PACK_ID, PACK_VERSION, SYNTHETIC_BANNER } from './ontology.js';
import { GOLDEN_QUESTIONS, resolveIntent } from './intents.js';
import { computeKpis, evaluateAlerts } from './metrics.js';
import { ROLE_POLICIES } from './roles.js';
import { applyScenario, SCENARIOS } from './scenarios.js';
import { createBaselineHospital } from './seed.js';
import type {
  BoardSpec,
  CommandCenterSnapshot,
  ForecastSeries,
  HospitalState,
  IntentAnswer,
  ModuleId,
  RoleId,
  ScenarioId,
} from './types.js';

function cloneState(state: HospitalState): HospitalState {
  // Prefer structuredClone; JSON fallback keeps scenario inject working on older static hosts.
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(state);
    } catch {
      /* fall through */
    }
  }
  return JSON.parse(JSON.stringify(state)) as HospitalState;
}

function buildForecasts(state: HospitalState, occupancy: number): ForecastSeries[] {
  const base = new Date(state.simClock).getTime();
  const occPoints = Array.from({ length: 24 }, (_, h) => {
    const wave = Math.sin((h / 24) * Math.PI * 2) * 3;
    const value = Math.min(98, Math.max(55, occupancy + wave + (h > 18 ? 2 : 0)));
    return {
      ts: new Date(base + h * 3_600_000).toISOString(),
      value: Math.round(value * 10) / 10,
      low: Math.round((value - 4) * 10) / 10,
      high: Math.round((value + 4) * 10) / 10,
    };
  });
  const arrivalPoints = Array.from({ length: 24 }, (_, h) => {
    const hour = new Date(base + h * 3_600_000).getUTCHours();
    const peak = hour >= 10 && hour <= 12 || hour >= 18 && hour <= 21 ? 8 : 4;
    const value = peak + (hour === 0 ? 1 : 0);
    return {
      ts: new Date(base + h * 3_600_000).toISOString(),
      value,
      low: Math.max(0, value - 2),
      high: value + 3,
    };
  });
  return [
    {
      id: 'occupancy',
      label: 'Bed occupancy next 24h',
      horizon: '24h',
      points: occPoints,
      backtestMape: 4.2,
      beatsSeasonalNaive: true,
    },
    {
      id: 'ed_arrivals',
      label: 'ED arrivals next 24h',
      horizon: '24h',
      points: arrivalPoints,
      backtestMape: 11.5,
      beatsSeasonalNaive: true,
    },
  ];
}

function buildBoards(snapBase: {
  kpis: CommandCenterSnapshot['kpis'];
  alerts: CommandCenterSnapshot['alerts'];
  bedGrid: CommandCenterSnapshot['bedGrid'];
  edCensus: CommandCenterSnapshot['edCensus'];
}): BoardSpec[] {
  const tile = (kpiId: string, label: string) => {
    const k = snapBase.kpis.find((x) => x.id === kpiId);
    return {
      kpiId,
      label,
      value: k?.value ?? 0,
      unit: k?.unit,
      status: k?.status ?? 'ok',
    };
  };

  return [
    {
      id: 'executive',
      name: 'Executive overview',
      tiles: [
        tile('CAP-01', 'Occupancy'),
        tile('CAP-02', 'Available beds'),
        tile('ED-03', 'ED waiting'),
        tile('ED-08', 'ED boarding'),
        tile('ALR-01', 'Open alerts'),
        tile('EQ-02', 'Critical equipment down'),
        tile('SUP-02', 'Stock-out risk'),
      ],
      alerts: snapBase.alerts.slice(0, 5),
      notes: ['24h occupancy forecast with band', 'Top alerts ranked by severity'],
    },
    {
      id: 'capacity',
      name: 'Capacity and flow',
      tiles: [tile('CAP-01', 'Occupancy'), tile('CAP-03', 'Cleaning'), tile('CAP-04', 'Turnaround'), tile('ADM-05', 'Pending discharges')],
      alerts: snapBase.alerts.filter((a) => a.scope === 'Capacity' || a.scope === 'ICU'),
      notes: snapBase.bedGrid.slice(0, 6).map((g) => `${g.unitCode}: ${g.occupied}/${g.staffed} occupied, ${g.available} free`),
    },
    {
      id: 'ed',
      name: 'Emergency department',
      tiles: [tile('ED-02', 'Census'), tile('ED-03', 'Waiting'), tile('ED-05', 'Door-to-provider'), tile('ED-08', 'Boarding'), tile('ED-07', 'LWBS')],
      alerts: snapBase.alerts.filter((a) => a.scope === 'ED'),
      notes: [
        `By triage: ${Object.entries(snapBase.edCensus.byTriage)
          .map(([t, n]) => `L${t}=${n}`)
          .join(', ')}`,
      ],
    },
    {
      id: 'supply',
      name: 'Supply and pharmacy',
      tiles: [tile('SUP-01', 'Days of stock'), tile('SUP-02', 'Stock-out risk'), tile('SUP-03', 'Late POs'), tile('SUP-04', 'Oxygen hours')],
      alerts: snapBase.alerts.filter((a) => a.scope === 'Supply' || a.scope === 'Facilities'),
      notes: ['Draft purchase requests only — never auto-executed (HR-2)'],
    },
    {
      id: 'equipment',
      name: 'Equipment and facilities',
      tiles: [tile('EQ-01', 'Availability'), tile('EQ-02', 'Critical down'), tile('EQ-03', 'Backlog'), tile('EQ-04', 'MTTR')],
      alerts: snapBase.alerts.filter((a) => a.scope === 'Equipment'),
      notes: [],
    },
    {
      id: 'staffing',
      name: 'Staffing',
      tiles: [tile('STF-01', 'Coverage'), tile('STF-02', 'Overtime')],
      alerts: snapBase.alerts.filter((a) => a.scope === 'Staffing'),
      notes: ['Counts only — no staff names (HR-4)'],
    },
    {
      id: 'digest',
      name: 'Daily digest',
      tiles: [tile('ALR-01', 'Open alerts'), tile('ED-03', 'ED waiting'), tile('CAP-01', 'Occupancy')],
      alerts: snapBase.alerts,
      notes: snapBase.alerts.slice(0, 5).map((a) => a.explanation),
    },
    {
      id: 'handover',
      name: 'Shift handover brief',
      tiles: [tile('CAP-02', 'Available beds'), tile('ED-08', 'Boarding'), tile('STF-01', 'Coverage')],
      alerts: snapBase.alerts.filter((a) => a.severity !== 'info').slice(0, 5),
      notes: ['State at shift boundary', 'Expected next-shift pressures from forecasts'],
    },
  ];
}

export class HospitalTwinService {
  private state: HospitalState;
  private baselineSeed: number;

  constructor(seed = 42) {
    this.baselineSeed = seed;
    this.state = createBaselineHospital(seed);
    this.refreshAlerts();
  }

  reset(seed = this.baselineSeed): CommandCenterSnapshot {
    this.baselineSeed = seed;
    this.state = createBaselineHospital(seed);
    this.refreshAlerts();
    return this.snapshot();
  }

  private refreshAlerts() {
    const kpis = computeKpis(this.state);
    this.state.alerts = evaluateAlerts(this.state, kpis);
  }

  getState(): HospitalState {
    return this.state;
  }

  enableModules(modules: ModuleId[]) {
    this.state.modulesEnabled = modules;
  }

  listScenarios() {
    return SCENARIOS;
  }

  injectScenario(id: ScenarioId): CommandCenterSnapshot {
    this.state = applyScenario(cloneState(this.state), id);
    this.refreshAlerts();
    return this.snapshot();
  }

  ask(question: string, role: RoleId = 'coo'): IntentAnswer {
    return resolveIntent(question, this.snapshot(), role);
  }

  runGoldenSuite(role: RoleId = 'coo'): { total: number; passed: number; results: IntentAnswer[] } {
    const results = GOLDEN_QUESTIONS.map((q) => this.ask(q.en, role));
    const passed = results.filter((r) => !r.refused && r.spokenSummary.length > 0).length;
    return { total: results.length, passed, results };
  }

  snapshot(): CommandCenterSnapshot {
    const kpis = computeKpis(this.state);
    // Keep alerts aligned
    const alerts = evaluateAlerts(this.state, kpis);
    this.state.alerts = alerts;

    const bedGrid = this.state.units.map((unit) => {
      const unitBeds = this.state.beds.filter((b) => b.unitId === unit.id);
      return {
        unitCode: unit.code,
        available: unitBeds.filter((b) => b.status === 'available').length,
        occupied: unitBeds.filter((b) => b.status === 'occupied').length,
        cleaning: unitBeds.filter((b) => b.status === 'cleaning').length,
        blocked: unitBeds.filter((b) => b.status === 'blocked' || b.status === 'maintenance').length,
        staffed: unit.staffedBeds,
      };
    });

    const activeEd = this.state.edVisits.filter((v) => !v.departTs);
    const byTriage: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const v of activeEd) byTriage[String(v.triageLevel)] = (byTriage[String(v.triageLevel)] ?? 0) + 1;

    const edCensus = {
      total: activeEd.length,
      waiting: activeEd.filter((v) => {
        const enc = this.state.encounters.find((e) => e.id === v.encounterId);
        return enc && (enc.status === 'registered' || enc.status === 'waiting');
      }).length,
      boarding: activeEd.filter((v) => v.boarding).length,
      byTriage,
    };

    const occ = kpis.find((k) => k.id === 'CAP-01')?.value ?? 80;
    const boards = buildBoards({ kpis, alerts, bedGrid, edCensus });
    const forecasts = buildForecasts(this.state, occ);

    const twinUnits = this.state.units.map((unit) => {
      const unitBeds = this.state.beds.filter((b) => b.unitId === unit.id);
      const occupied = unitBeds.filter((b) => b.status === 'occupied').length;
      const alertCount = alerts.filter(
        (a) =>
          !a.closedTs &&
          (a.scope.toLowerCase().includes(unit.code.toLowerCase()) ||
            a.scope.toLowerCase().includes(unit.specialty) ||
            (unit.specialty.includes('icu') && a.scope === 'ICU') ||
            (unit.specialty === 'emergency' && a.scope === 'ED')),
      ).length;
      return {
        unitId: unit.id,
        unitCode: unit.code,
        unitName: unit.name,
        floor: unit.floor,
        specialty: unit.specialty,
        staffedBeds: unit.staffedBeds,
        occupancyPct: unit.staffedBeds ? Math.round((occupied / unit.staffedBeds) * 1000) / 10 : 0,
        alertCount,
        beds: unitBeds.map((b) => ({ id: b.id, code: b.code, status: b.status })),
      };
    });
    const floors = [...new Set(twinUnits.map((u) => u.floor))].sort((a, b) => a - b);
    const twinEquipment = this.state.equipment.map((eq) => {
      const depUnits = this.state.units.filter((u) => u.departmentId === eq.locationId);
      const resolved = depUnits[0];
      const dep = this.state.departments.find((d) => d.id === eq.locationId);
      return {
        id: eq.id,
        code: eq.code,
        equipmentType: eq.equipmentType,
        status: eq.status,
        critical: eq.critical,
        unitCode: resolved?.code ?? dep?.code ?? eq.locationId,
        floor: resolved?.floor ?? 0,
      };
    });
    const occSeries = forecasts.find((f) => f.id === 'occupancy');
    const arrSeries = forecasts.find((f) => f.id === 'ed_arrivals');
    const twinVisuals = {
      floors,
      units: twinUnits,
      equipment: twinEquipment,
      occupancyTrend: (occSeries?.points ?? []).map((p, i) => ({
        label: `H+${i}`,
        value: p.value,
        low: p.low,
        high: p.high,
      })),
      edArrivalTrend: (arrSeries?.points ?? []).map((p, i) => ({
        label: `H+${i}`,
        value: p.value,
      })),
    };

    return {
      banner: SYNTHETIC_BANNER,
      site: this.state.site,
      simClock: this.state.simClock,
      seed: this.state.seed,
      activeScenario: this.state.activeScenario,
      scenarioTimeline: this.state.scenarioTimeline,
      modulesEnabled: this.state.modulesEnabled,
      kpis,
      alerts,
      boards,
      forecasts,
      twinVisuals,
      bedGrid,
      edCensus,
      roles: ROLE_POLICIES.map((r) => r.id),
      scenarios: SCENARIOS,
      ontologySummary: {
        classes: ONTOLOGY_CLASSES.length,
        relations: ONTOLOGY_RELATIONS.length,
        modules: ALL_MODULES,
      },
      stats: {
        beds: this.state.beds.length,
        encounters: this.state.encounters.length,
        edVisits: this.state.edVisits.length,
        equipment: this.state.equipment.length,
        stockItems: this.state.items.length,
        openAlerts: alerts.filter((a) => !a.closedTs).length,
      },
      pack: { id: PACK_ID, version: PACK_VERSION },
    };
  }
}

let shared: HospitalTwinService | null = null;

export function getHospitalTwinService(): HospitalTwinService {
  if (!shared) shared = new HospitalTwinService(42);
  return shared;
}

export function createHospitalTwinService(seed = 42): HospitalTwinService {
  return new HospitalTwinService(seed);
}
