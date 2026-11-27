import type { ModuleId } from './types.js';

export const PACK_ID = 'hospital';
export const PACK_VERSION = '0.1.0';

export const ONTOLOGY_CLASSES = [
  { id: 'Hospital', extends: 'Site', notes: 'root' },
  { id: 'Building', extends: 'Location', notes: 'hierarchy' },
  { id: 'Floor', extends: 'Location', notes: 'hierarchy' },
  { id: 'Department', extends: 'Location', notes: 'ED ICU OR Ward Radiology Lab Pharmacy Outpatient' },
  { id: 'Ward', extends: 'Location', notes: 'staffedBeds specialty' },
  { id: 'Room', extends: 'Location', notes: 'roomType' },
  { id: 'Bed', extends: 'Asset', notes: 'status state machine' },
  { id: 'Patient', extends: 'Person', notes: 'pseudonym token only — HR-4' },
  { id: 'Encounter', extends: 'Process', notes: 'ED inpatient outpatient surgical' },
  { id: 'EDVisit', extends: 'Encounter', notes: 'timestamps drive ED metrics' },
  { id: 'Order', extends: 'Order', notes: 'lab imaging med procedure metadata only' },
  { id: 'Procedure', extends: 'Process', notes: 'OR metrics' },
  { id: 'StaffMember', extends: 'Person', notes: 'pseudonymous' },
  { id: 'Shift', extends: 'Process', notes: 'staffing coverage' },
  { id: 'Equipment', extends: 'Asset', notes: 'availability MTTR' },
  { id: 'WorkOrder', extends: 'Order', notes: 'maintenance' },
  { id: 'Item', extends: 'Item', notes: 'drug consumable blood oxygen' },
  { id: 'StockLevel', extends: 'Metric', notes: 'asOf quantity' },
  { id: 'Supplier', extends: 'Organization', notes: 'leadTime onTimeRate' },
  { id: 'PurchaseOrder', extends: 'Order', notes: 'supply chain' },
  { id: 'Transport', extends: 'Process', notes: 'porters' },
  { id: 'CleaningTask', extends: 'Process', notes: 'bed turnaround' },
  { id: 'Alert', extends: 'Alert', notes: 'ops alerts' },
] as const;

export const ONTOLOGY_RELATIONS = [
  'Bed LOCATED_IN Room',
  'Room LOCATED_IN Unit',
  'Unit PART_OF Department',
  'Department PART_OF Floor',
  'Floor PART_OF Building',
  'Encounter OCCUPIES Bed',
  'Encounter AT Location',
  'EDVisit HAS_ORDER Order',
  'Order PERFORMED_BY Equipment',
  'StaffMember ASSIGNED_TO Shift',
  'Shift ASSIGNED_TO Unit',
  'Equipment LOCATED_IN Room',
  'WorkOrder FOR Equipment',
  'Item STOCKED_AT Location',
  'Item SUPPLIED_BY Supplier',
  'PurchaseOrder FOR Item',
  'CleaningTask FOR Bed',
  'Alert ABOUT Entity',
] as const;

export const PILOT_MODULES: ModuleId[] = [
  'capacity',
  'admissions',
  'ed',
  'supply',
  'equipment',
  'staffing',
];

export const ALL_MODULES: ModuleId[] = [
  'capacity',
  'admissions',
  'ed',
  'or',
  'icu',
  'supply',
  'staffing',
  'equipment',
  'diagnostics',
  'facilities',
  'quality',
];

export const SYNTHETIC_BANNER = 'Synthetic data. Not a real hospital.';
