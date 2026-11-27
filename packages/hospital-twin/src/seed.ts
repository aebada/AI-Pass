import { PILOT_MODULES } from './ontology.js';
import { SeededRng } from './rng.js';
import type {
  Bed,
  Department,
  EDVisit,
  Encounter,
  Equipment,
  HospitalState,
  Patient,
  Procedure,
  PurchaseOrder,
  Room,
  Shift,
  StaffMember,
  StockItem,
  StockLevel,
  Supplier,
  Unit,
  WorkOrder,
} from './types.js';

const COMPLAINTS = ['chest_pain', 'trauma', 'fever', 'abdominal', 'respiratory', 'neuro', 'other'] as const;

function iso(base: Date, hoursOffset = 0): string {
  return new Date(base.getTime() + hoursOffset * 3_600_000).toISOString();
}

export function createBaselineHospital(seed = 42): HospitalState {
  const rng = new SeededRng(seed);
  // Fixed Monday 08:00 UTC baseline for demos
  const clock = new Date('2026-11-23T08:00:00.000Z');

  const departments: Department[] = [
    { id: 'dep_ed', code: 'ED', name: 'Emergency Department', type: 'ED', staffedBeds: 30 },
    { id: 'dep_icu', code: 'ICU', name: 'Intensive Care', type: 'ICU', staffedBeds: 24 },
    { id: 'dep_cicu', code: 'CICU', name: 'Cardiac ICU', type: 'ICU', staffedBeds: 10 },
    { id: 'dep_med', code: 'MED', name: 'Medical Wards', type: 'Ward', staffedBeds: 120 },
    { id: 'dep_surg', code: 'SURG', name: 'Surgical Wards', type: 'Ward', staffedBeds: 80 },
    { id: 'dep_mat', code: 'MAT', name: 'Maternity', type: 'Ward', staffedBeds: 20 },
    { id: 'dep_ped', code: 'PED', name: 'Pediatrics', type: 'Ward', staffedBeds: 16 },
    { id: 'dep_or', code: 'OR', name: 'Operating Theatres', type: 'OR', staffedBeds: 0 },
    { id: 'dep_rad', code: 'RAD', name: 'Radiology', type: 'Radiology', staffedBeds: 0 },
    { id: 'dep_lab', code: 'LAB', name: 'Laboratory', type: 'Lab', staffedBeds: 0 },
    { id: 'dep_pharm', code: 'PHARM', name: 'Pharmacy', type: 'Pharmacy', staffedBeds: 0 },
  ];

  const unitPlans: Array<{ code: string; name: string; departmentId: string; specialty: string; beds: number; floor: number }> = [
    { code: 'ED-A', name: 'ED Zone A', departmentId: 'dep_ed', specialty: 'emergency', beds: 15, floor: 0 },
    { code: 'ED-B', name: 'ED Zone B', departmentId: 'dep_ed', specialty: 'emergency', beds: 15, floor: 0 },
    { code: 'ICU-1', name: 'ICU East', departmentId: 'dep_icu', specialty: 'icu', beds: 12, floor: 3 },
    { code: 'ICU-2', name: 'ICU West', departmentId: 'dep_icu', specialty: 'icu', beds: 12, floor: 3 },
    { code: 'CICU', name: 'Cardiac ICU', departmentId: 'dep_cicu', specialty: 'cardiac-icu', beds: 10, floor: 3 },
    { code: 'MED-4A', name: 'Medical 4A', departmentId: 'dep_med', specialty: 'medicine', beds: 30, floor: 4 },
    { code: 'MED-4B', name: 'Medical 4B', departmentId: 'dep_med', specialty: 'medicine', beds: 30, floor: 4 },
    { code: 'MED-5A', name: 'Medical 5A', departmentId: 'dep_med', specialty: 'medicine', beds: 30, floor: 5 },
    { code: 'MED-5B', name: 'Medical 5B', departmentId: 'dep_med', specialty: 'medicine', beds: 30, floor: 5 },
    { code: 'SURG-2A', name: 'Surgical 2A', departmentId: 'dep_surg', specialty: 'surgery', beds: 40, floor: 2 },
    { code: 'SURG-2B', name: 'Surgical 2B', departmentId: 'dep_surg', specialty: 'surgery', beds: 40, floor: 2 },
    { code: 'MAT-1', name: 'Maternity', departmentId: 'dep_mat', specialty: 'maternity', beds: 20, floor: 1 },
    { code: 'PED-1', name: 'Pediatrics', departmentId: 'dep_ped', specialty: 'pediatrics', beds: 16, floor: 1 },
  ];

  const units: Unit[] = [];
  const rooms: Room[] = [];
  const beds: Bed[] = [];

  for (const plan of unitPlans) {
    const unitId = `unit_${plan.code.toLowerCase()}`;
    units.push({
      id: unitId,
      code: plan.code,
      name: plan.name,
      departmentId: plan.departmentId,
      specialty: plan.specialty,
      staffedBeds: plan.beds,
      floor: plan.floor,
    });
    for (let i = 1; i <= plan.beds; i++) {
      const roomId = `room_${plan.code}_${Math.ceil(i / 2)}`;
      if (!rooms.find((r) => r.id === roomId)) {
        rooms.push({
          id: roomId,
          code: `${plan.code}-R${Math.ceil(i / 2)}`,
          unitId,
          roomType: plan.specialty.includes('icu')
            ? 'isolation'
            : plan.specialty === 'emergency'
              ? 'ed_bay'
              : i % 7 === 0
                ? 'isolation'
                : 'double',
        });
      }
      const isEd = plan.specialty === 'emergency';
      const roll = rng.next();
      let status: Bed['status'] = 'available';
      if (isEd) {
        status = roll < 0.55 ? 'occupied' : roll < 0.7 ? 'cleaning' : 'available';
      } else if (plan.specialty.includes('icu')) {
        status = roll < 0.82 ? 'occupied' : roll < 0.9 ? 'cleaning' : roll < 0.93 ? 'maintenance' : 'available';
      } else {
        status = roll < 0.78 ? 'occupied' : roll < 0.86 ? 'cleaning' : roll < 0.9 ? 'blocked' : 'available';
      }
      beds.push({
        id: `bed_${plan.code}_${i}`,
        code: `${plan.code}-${String(i).padStart(2, '0')}`,
        roomId,
        unitId,
        bedType: isEd ? 'ED' : plan.specialty.includes('icu') ? 'ICU' : plan.specialty === 'pediatrics' ? 'pediatric' : 'standard',
        status,
        lastStatusChange: iso(clock, -rng.int(1, 48)),
      });
    }
  }

  const patients: Patient[] = [];
  const encounters: Encounter[] = [];
  const edVisits: EDVisit[] = [];

  const occupiedBeds = beds.filter((b) => b.status === 'occupied');
  for (const bed of occupiedBeds) {
    const token = `PT-${rng.int(10000, 99999)}`;
    patients.push({
      token,
      ageBand: rng.pick(['0-17', '18-44', '45-64', '65-79', '80+']),
      sexCode: rng.pick(['F', 'M', 'X']),
    });
    const isEd = bed.bedType === 'ED';
    const encId = `enc_${rng.hex(8)}`;
    const triage = rng.pick([1, 2, 3, 4, 5] as const);
    const enc: Encounter = {
      id: encId,
      patientToken: token,
      type: isEd ? 'ED' : 'inpatient',
      status: isEd ? (rng.chance(0.3) ? 'waiting' : 'in-treatment') : rng.chance(0.12) ? 'discharge-ordered' : 'admitted',
      admitTs: iso(clock, -rng.int(2, 120)),
      currentLocationId: bed.unitId,
      bedId: bed.id,
      acuity: triage,
      expectedLOSHours: isEd ? rng.int(2, 12) : rng.int(24, 168),
      departmentId: units.find((u) => u.id === bed.unitId)?.departmentId,
      unitId: bed.unitId,
    };
    bed.occupiedByEncounterId = encId;
    encounters.push(enc);

    if (isEd) {
      const arrival = iso(clock, -rng.int(1, 8));
      const triageTs = iso(new Date(arrival), rng.next() * 0.4);
      const seenTs = enc.status === 'waiting' ? undefined : iso(new Date(triageTs), rng.next() * 1.5);
      edVisits.push({
        id: `ed_${encId}`,
        encounterId: encId,
        arrivalTs: arrival,
        triageTs,
        seenTs,
        triageLevel: triage,
        chiefComplaintCategory: rng.pick([...COMPLAINTS]),
        boarding: enc.status === 'awaiting-bed' || rng.chance(0.08),
      });
    }
  }

  // Extra historical discharges and ED visits for metrics
  for (let i = 0; i < 40; i++) {
    const token = `PT-H${rng.int(1000, 9999)}`;
    patients.push({ token, ageBand: rng.pick(['18-44', '45-64', '65-79']), sexCode: rng.pick(['F', 'M']) });
    const admit = iso(clock, -rng.int(24, 240));
    const discharge = iso(new Date(admit), rng.int(24, 120));
    encounters.push({
      id: `enc_hist_${i}`,
      patientToken: token,
      type: 'inpatient',
      status: 'discharged',
      admitTs: admit,
      dischargeTs: discharge,
      expectedLOSHours: hoursBetween(admit, discharge),
      departmentId: 'dep_med',
      unitId: 'unit_med-4a',
    });
  }

  for (let i = 0; i < 60; i++) {
    const token = `PT-EDH${rng.int(1000, 9999)}`;
    patients.push({ token, ageBand: rng.pick(['18-44', '45-64', '65-79']), sexCode: rng.pick(['F', 'M']) });
    const encId = `enc_edh_${i}`;
    const arrival = iso(clock, -rng.int(1, 72));
    const triageTs = iso(new Date(arrival), rng.next() * 0.5);
    const seenTs = iso(new Date(triageTs), rng.next() * 2);
    const depart = iso(new Date(seenTs), rng.int(1, 8));
    const lwbs = rng.chance(0.04);
    encounters.push({
      id: encId,
      patientToken: token,
      type: 'ED',
      status: lwbs ? 'left-without-being-seen' : 'discharged',
      admitTs: arrival,
      dischargeTs: depart,
      acuity: rng.pick([2, 3, 4, 5]),
      departmentId: 'dep_ed',
      unitId: 'unit_ed-a',
    });
    edVisits.push({
      id: `edh_${i}`,
      encounterId: encId,
      arrivalTs: arrival,
      triageTs,
      seenTs: lwbs ? undefined : seenTs,
      decisionTs: lwbs ? undefined : iso(new Date(seenTs), 0.5),
      departTs: depart,
      triageLevel: rng.pick([2, 3, 4, 5]),
      chiefComplaintCategory: rng.pick([...COMPLAINTS]),
      boarding: rng.chance(0.1),
    });
  }

  const equipment: Equipment[] = [];
  const eqSpecs: Array<{ type: Equipment['equipmentType']; count: number; critical: boolean; loc: string }> = [
    { type: 'CT', count: 2, critical: true, loc: 'dep_rad' },
    { type: 'MRI', count: 1, critical: true, loc: 'dep_rad' },
    { type: 'X-ray', count: 3, critical: false, loc: 'dep_rad' },
    { type: 'ultrasound', count: 2, critical: false, loc: 'dep_rad' },
    { type: 'ventilator', count: 18, critical: true, loc: 'dep_icu' },
    { type: 'dialysis', count: 4, critical: true, loc: 'dep_icu' },
    { type: 'monitor', count: 40, critical: false, loc: 'dep_icu' },
    { type: 'infusion_pump', count: 50, critical: false, loc: 'dep_med' },
  ];
  for (const spec of eqSpecs) {
    for (let i = 1; i <= spec.count; i++) {
      equipment.push({
        id: `eq_${spec.type}_${i}`,
        code: `${spec.type.toUpperCase()}-${i}`,
        equipmentType: spec.type,
        status: rng.chance(0.04) && spec.critical ? 'down' : rng.chance(0.06) ? 'maintenance' : 'working',
        locationId: spec.loc,
        critical: spec.critical,
        lastService: iso(clock, -rng.int(24, 720)),
      });
    }
  }

  const workOrders: WorkOrder[] = equipment
    .filter((e) => e.status !== 'working')
    .map((e, idx) => ({
      id: `wo_${idx}`,
      assetId: e.id,
      type: e.status === 'maintenance' ? 'preventive' : 'repair',
      openedTs: iso(clock, -rng.int(2, 72)),
      priority: e.critical ? 'critical' : 'medium',
      status: rng.pick(['open', 'assigned', 'in-progress'] as const),
    }));

  const items: StockItem[] = [
    { id: 'item_o2', sku: 'O2-BULK', name: 'Medical oxygen', category: 'oxygen', reorderPoint: 48, leadTimeDays: 2, criticality: 'critical', dailyUse: 12 },
    { id: 'item_ppe', sku: 'PPE-N95', name: 'N95 respirators', category: 'consumable', reorderPoint: 200, leadTimeDays: 5, criticality: 'high', dailyUse: 80 },
    { id: 'item_abx', sku: 'ABX-CEF', name: 'Ceftriaxone vials', category: 'drug', reorderPoint: 40, leadTimeDays: 3, criticality: 'critical', dailyUse: 18 },
    { id: 'item_blood', sku: 'BLD-O', name: 'O-negative blood units', category: 'blood_product', reorderPoint: 8, leadTimeDays: 1, criticality: 'critical', dailyUse: 3 },
    { id: 'item_glove', sku: 'GLV-L', name: 'Exam gloves (L)', category: 'consumable', reorderPoint: 500, leadTimeDays: 7, criticality: 'medium', dailyUse: 400 },
  ];
  const stock: StockLevel[] = items.map((item) => ({
    itemId: item.id,
    locationId: item.category === 'oxygen' ? 'dep_fac' : 'dep_pharm',
    quantity: item.id === 'item_abx' ? item.reorderPoint + rng.int(5, 40) : item.reorderPoint + rng.int(10, 200),
    asOf: clock.toISOString(),
  }));

  const suppliers: Supplier[] = [
    { id: 'sup_med', name: 'MedSupply EU', leadTimeDays: 3, onTimeRate: 0.92 },
    { id: 'sup_gas', name: 'AirGas Clinical', leadTimeDays: 2, onTimeRate: 0.97 },
  ];
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po_1',
      supplierId: 'sup_med',
      itemId: 'item_ppe',
      qty: 2000,
      expectedDate: iso(clock, -24),
      status: 'confirmed',
    },
    {
      id: 'po_2',
      supplierId: 'sup_med',
      itemId: 'item_abx',
      qty: 200,
      expectedDate: iso(clock, 48),
      status: 'sent',
    },
  ];

  const staff: StaffMember[] = [];
  for (let i = 0; i < 80; i++) {
    staff.push({
      token: `ST-${1000 + i}`,
      roleType: rng.pick(['physician', 'nurse', 'technician', 'support']),
      departmentId: rng.pick(departments).id,
    });
  }

  const shifts: Shift[] = units
    .filter((u) => u.specialty !== 'emergency' || true)
    .slice(0, 10)
    .map((u, idx) => {
      const required = u.specialty.includes('icu') ? 8 : 6;
      const present = required - (idx % 5 === 0 ? 1 : 0);
      return {
        id: `shift_${idx}`,
        departmentId: u.departmentId,
        unitId: u.id,
        start: iso(clock, 0),
        end: iso(clock, 12),
        roleType: 'nurse',
        requiredCount: required,
        rosteredCount: required,
        presentCount: present,
      };
    });

  const procedures: Procedure[] = Array.from({ length: 12 }, (_, i) => {
    const scheduled = iso(clock, i * 1.5);
    const late = rng.chance(0.25);
    return {
      id: `proc_${i}`,
      theatreId: `OR-${(i % 6) + 1}`,
      scheduledStart: scheduled,
      actualStart: iso(new Date(scheduled), late ? 0.3 : 0),
      actualEnd: iso(new Date(scheduled), 2 + rng.next()),
      status: rng.chance(0.08) ? 'cancelled' : 'completed',
    };
  });

  const orders = edVisits.slice(0, 40).flatMap((v, i) => {
    const ordered = v.arrivalTs;
    return [
      {
        id: `ord_lab_${i}`,
        encounterId: v.encounterId,
        orderType: 'lab' as const,
        orderedTs: ordered,
        resultTs: iso(new Date(ordered), rng.next() * 2),
        priority: rng.pick(['routine', 'urgent', 'stat'] as const),
      },
      {
        id: `ord_img_${i}`,
        encounterId: v.encounterId,
        orderType: 'imaging' as const,
        orderedTs: ordered,
        resultTs: iso(new Date(ordered), 0.5 + rng.next() * 3),
        priority: 'urgent' as const,
        modality: rng.pick(['CT', 'X-ray', 'ultrasound']),
      },
    ];
  });

  const cleaningTasks = beds
    .filter((b) => b.status === 'cleaning' || rng.chance(0.05))
    .slice(0, 25)
    .map((b, i) => {
      const requested = iso(clock, -rng.int(1, 6));
      const done = b.status !== 'cleaning' ? iso(new Date(requested), 0.5 + rng.next()) : undefined;
      return {
        id: `clean_${i}`,
        bedId: b.id,
        requestedTs: requested,
        startedTs: iso(new Date(requested), 0.1),
        doneTs: done,
      };
    });

  return {
    site: {
      id: 'hosp_demo_general',
      name: 'Demo General Hospital',
      timezone: 'Europe/Berlin',
      licensedBeds: 300,
      synthetic: true,
    },
    departments,
    units,
    rooms,
    beds,
    patients,
    encounters,
    edVisits,
    orders,
    procedures,
    staff,
    shifts,
    equipment,
    workOrders,
    items,
    stock,
    suppliers,
    purchaseOrders,
    cleaningTasks,
    alerts: [],
    simClock: clock.toISOString(),
    seed,
    scenarioTimeline: [{ ts: clock.toISOString(), event: 'Baseline loaded (Demo General Hospital, seed=' + seed + ')' }],
    modulesEnabled: [...PILOT_MODULES],
    dataQualityEvents: [],
    feedStale: {},
    oxygenHoursRemaining: 96,
  };
}

function hoursBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;
}
