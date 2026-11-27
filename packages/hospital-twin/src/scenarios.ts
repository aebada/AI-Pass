import { SeededRng } from './rng.js';
import type { HospitalState, ScenarioDef, ScenarioId } from './types.js';

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'surge',
    name: 'ED surge',
    description: 'Mass-arrival at ED — arrivals ×3 for 3 simulated hours.',
    expectedEffects: ['ED waiting up', 'boarding alerts', 'ICU pressure'],
  },
  {
    id: 'flu_ramp',
    name: 'Flu season ramp',
    description: 'Medical ward occupancy climbs ~20% over a compressed week.',
    expectedEffects: ['Medical occupancy up', 'available beds down'],
  },
  {
    id: 'equipment_failure',
    name: 'CT failure',
    description: 'CT scanners go down; imaging turnaround and ED LOS rise.',
    expectedEffects: ['EQ-02 critical', 'imaging TAT up'],
  },
  {
    id: 'supply_shortage',
    name: 'Supply shortage',
    description: 'Critical antibiotic supplier delayed; stock-out risk rises.',
    expectedEffects: ['SUP-02 risk', 'late purchase order'],
  },
  {
    id: 'staffing_gap',
    name: 'ICU staffing gap',
    description: 'Night shift short 3 nurses in ICU.',
    expectedEffects: ['STF-01 critical', 'staffing alert'],
  },
  {
    id: 'slow_cleaning',
    name: 'Slow cleaning',
    description: 'Housekeeping shortage; bed turnaround grows.',
    expectedEffects: ['CAP-04 warn', 'boarding grows'],
  },
  {
    id: 'oxygen_drop',
    name: 'Oxygen reserve drop',
    description: 'Tank level falls faster than normal.',
    expectedEffects: ['SUP-04 critical'],
  },
  {
    id: 'feed_outage',
    name: 'ED feed outage',
    description: 'ED tracking feed stops; stale-data alert.',
    expectedEffects: ['data_feed_stale'],
  },
  {
    id: 'bad_data',
    name: 'Bad data',
    description: 'Illegal bed transition and duplicate patient token.',
    expectedEffects: ['data-quality events'],
  },
];

function bumpClock(state: HospitalState, hours: number) {
  state.simClock = new Date(new Date(state.simClock).getTime() + hours * 3_600_000).toISOString();
}

export function applyScenario(state: HospitalState, scenarioId: ScenarioId): HospitalState {
  const rng = new SeededRng(state.seed + scenarioId.length * 17);
  state.activeScenario = scenarioId;
  state.scenarioTimeline.push({ ts: state.simClock, event: `Scenario started: ${scenarioId}` });

  switch (scenarioId) {
    case 'surge': {
      const edBeds = state.beds.filter((b) => b.bedType === 'ED');
      for (const bed of edBeds) {
        if (bed.status === 'available' || rng.chance(0.5)) {
          bed.status = 'occupied';
          bed.lastStatusChange = state.simClock;
        }
      }
      for (let i = 0; i < 45; i++) {
        const token = `PT-SURGE-${i}`;
        state.patients.push({ token, ageBand: '18-44', sexCode: rng.pick(['F', 'M']) });
        const encId = `enc_surge_${i}`;
        state.encounters.push({
          id: encId,
          patientToken: token,
          type: 'ED',
          status: 'waiting',
          admitTs: state.simClock,
          acuity: rng.pick([2, 3, 4]),
          departmentId: 'dep_ed',
          unitId: 'unit_ed-a',
        });
        state.edVisits.push({
          id: `ed_surge_${i}`,
          encounterId: encId,
          arrivalTs: state.simClock,
          triageTs: state.simClock,
          triageLevel: rng.pick([2, 3, 4]),
          chiefComplaintCategory: 'trauma',
          boarding: i < 12,
        });
      }
      // Pressure ICU
      for (const bed of state.beds.filter((b) => b.bedType === 'ICU' && b.status === 'available')) {
        bed.status = 'occupied';
        bed.lastStatusChange = state.simClock;
      }
      bumpClock(state, 3);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'Surge peak: ED arrivals ×3, boarding elevated' });
      break;
    }
    case 'flu_ramp': {
      const medBeds = state.beds.filter((b) => {
        const u = state.units.find((x) => x.id === b.unitId);
        return u?.specialty === 'medicine' && b.status === 'available';
      });
      const take = Math.ceil(medBeds.length * 0.55);
      medBeds.slice(0, take).forEach((b) => {
        b.status = 'occupied';
        b.lastStatusChange = state.simClock;
      });
      bumpClock(state, 24 * 7);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'Flu ramp: medical occupancy +~20%' });
      break;
    }
    case 'equipment_failure': {
      for (const eq of state.equipment.filter((e) => e.equipmentType === 'CT')) {
        eq.status = 'down';
        state.workOrders.push({
          id: `wo_ct_${eq.id}`,
          assetId: eq.id,
          type: 'repair',
          openedTs: state.simClock,
          priority: 'critical',
          status: 'open',
        });
      }
      for (const ord of state.orders.filter((o) => o.modality === 'CT' && o.resultTs)) {
        const start = new Date(ord.orderedTs).getTime();
        ord.resultTs = new Date(start + 5 * 3_600_000).toISOString();
      }
      bumpClock(state, 2);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'CT offline — imaging backlog growing' });
      break;
    }
    case 'supply_shortage': {
      const abx = state.stock.find((s) => s.itemId === 'item_abx');
      if (abx) abx.quantity = 12;
      const po = state.purchaseOrders.find((p) => p.itemId === 'item_abx');
      if (po) {
        po.status = 'late';
        po.expectedDate = new Date(new Date(state.simClock).getTime() - 36 * 3_600_000).toISOString();
      } else {
        state.purchaseOrders.push({
          id: 'po_late_abx',
          supplierId: 'sup_med',
          itemId: 'item_abx',
          qty: 200,
          expectedDate: new Date(new Date(state.simClock).getTime() - 36 * 3_600_000).toISOString(),
          status: 'late',
        });
      }
      bumpClock(state, 12);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'ABX stock critically low; PO late' });
      break;
    }
    case 'staffing_gap': {
      for (const shift of state.shifts.filter((s) => s.unitId?.includes('icu'))) {
        shift.presentCount = Math.max(0, shift.requiredCount - 3);
      }
      bumpClock(state, 1);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'ICU night shift short 3 nurses' });
      break;
    }
    case 'slow_cleaning': {
      for (const bed of state.beds.filter((b) => b.status === 'occupied').slice(0, 20)) {
        // discharge → cleaning stuck
        bed.status = 'cleaning';
        bed.occupiedByEncounterId = undefined;
        bed.lastStatusChange = state.simClock;
        state.cleaningTasks.push({
          id: `clean_slow_${bed.id}`,
          bedId: bed.id,
          requestedTs: new Date(new Date(state.simClock).getTime() - 2.5 * 3_600_000).toISOString(),
        });
      }
      for (const v of state.edVisits.filter((x) => !x.departTs).slice(0, 10)) {
        v.boarding = true;
      }
      bumpClock(state, 2);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'Cleaning delay: turnaround and boarding rising' });
      break;
    }
    case 'oxygen_drop': {
      state.oxygenHoursRemaining = 18;
      bumpClock(state, 1);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'Oxygen reserve dropped to 18h' });
      break;
    }
    case 'feed_outage': {
      state.feedStale = { ...state.feedStale, ed: true };
      bumpClock(state, 1);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'ED tracking feed stale' });
      break;
    }
    case 'bad_data': {
      const bed = state.beds.find((b) => b.status === 'available');
      if (bed) {
        bed.status = 'cleaning';
        state.dataQualityEvents.push(`Illegal bed transition: ${bed.code} available→cleaning without occupied`);
      }
      const dup = state.patients[0]?.token;
      if (dup) {
        state.patients.push({ token: dup, ageBand: '45-64', sexCode: 'X' });
        state.dataQualityEvents.push(`Duplicate patient token detected: ${dup}`);
      }
      bumpClock(state, 0.5);
      state.scenarioTimeline.push({ ts: state.simClock, event: 'Data-quality events injected' });
      break;
    }
  }

  return state;
}
