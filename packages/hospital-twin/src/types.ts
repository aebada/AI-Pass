/** Hospital System Twin — sector pack types (synthetic ops twin, not clinical CDS). */

export type BedStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'cleaning'
  | 'blocked'
  | 'maintenance';

export type EncounterStatus =
  | 'registered'
  | 'waiting'
  | 'in-treatment'
  | 'awaiting-bed'
  | 'admitted'
  | 'discharge-ordered'
  | 'discharged'
  | 'left-without-being-seen';

export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export type DepartmentType =
  | 'ED'
  | 'ICU'
  | 'OR'
  | 'Ward'
  | 'Radiology'
  | 'Lab'
  | 'Pharmacy'
  | 'Outpatient'
  | 'Facilities';

export type RoleId =
  | 'ceo'
  | 'medical_director'
  | 'nursing_supervisor'
  | 'ed_lead'
  | 'coo'
  | 'pharmacy_manager'
  | 'maintenance_lead'
  | 'wall_display'
  | 'admin';

export type AlertSeverity = 'info' | 'warn' | 'critical';

export type ScenarioId =
  | 'surge'
  | 'flu_ramp'
  | 'equipment_failure'
  | 'supply_shortage'
  | 'staffing_gap'
  | 'slow_cleaning'
  | 'oxygen_drop'
  | 'feed_outage'
  | 'bad_data';

export type ModuleId =
  | 'capacity'
  | 'admissions'
  | 'ed'
  | 'or'
  | 'icu'
  | 'supply'
  | 'staffing'
  | 'equipment'
  | 'diagnostics'
  | 'facilities'
  | 'quality';

export interface HospitalSite {
  id: string;
  name: string;
  timezone: string;
  licensedBeds: number;
  synthetic: true;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  type: DepartmentType;
  staffedBeds: number;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  specialty: string;
  staffedBeds: number;
  floor: number;
}

export interface Room {
  id: string;
  code: string;
  unitId: string;
  roomType: 'single' | 'double' | 'isolation' | 'OR' | 'procedure' | 'ed_bay';
}

export interface Bed {
  id: string;
  code: string;
  roomId: string;
  unitId: string;
  bedType: 'standard' | 'ICU' | 'isolation' | 'pediatric' | 'ED';
  status: BedStatus;
  lastStatusChange: string;
  occupiedByEncounterId?: string;
}

export interface Patient {
  token: string;
  ageBand: string;
  sexCode: 'F' | 'M' | 'X';
}

export interface Encounter {
  id: string;
  patientToken: string;
  type: 'ED' | 'inpatient' | 'outpatient' | 'surgical';
  status: EncounterStatus;
  admitTs?: string;
  dischargeTs?: string;
  currentLocationId?: string;
  bedId?: string;
  acuity?: TriageLevel;
  disposition?: string;
  expectedLOSHours?: number;
  departmentId?: string;
  unitId?: string;
}

export interface EDVisit {
  id: string;
  encounterId: string;
  arrivalTs: string;
  triageTs?: string;
  seenTs?: string;
  decisionTs?: string;
  departTs?: string;
  triageLevel: TriageLevel;
  chiefComplaintCategory: string;
  boarding: boolean;
}

export interface Order {
  id: string;
  encounterId: string;
  orderType: 'lab' | 'imaging' | 'med' | 'procedure';
  orderedTs: string;
  resultTs?: string;
  priority: 'routine' | 'urgent' | 'stat';
  modality?: string;
}

export interface Procedure {
  id: string;
  theatreId: string;
  scheduledStart: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface StaffMember {
  token: string;
  roleType: 'physician' | 'nurse' | 'technician' | 'support';
  departmentId: string;
}

export interface Shift {
  id: string;
  departmentId: string;
  unitId?: string;
  start: string;
  end: string;
  roleType: string;
  requiredCount: number;
  rosteredCount: number;
  presentCount: number;
}

export interface Equipment {
  id: string;
  code: string;
  equipmentType:
    | 'ventilator'
    | 'monitor'
    | 'infusion_pump'
    | 'MRI'
    | 'CT'
    | 'X-ray'
    | 'ultrasound'
    | 'dialysis';
  status: 'working' | 'down' | 'maintenance';
  locationId: string;
  critical: boolean;
  lastService: string;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  type: 'repair' | 'preventive';
  openedTs: string;
  closedTs?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'closed';
}

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: 'drug' | 'consumable' | 'blood_product' | 'oxygen';
  reorderPoint: number;
  leadTimeDays: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  dailyUse: number;
}

export interface StockLevel {
  itemId: string;
  locationId: string;
  quantity: number;
  asOf: string;
}

export interface Supplier {
  id: string;
  name: string;
  leadTimeDays: number;
  onTimeRate: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  itemId: string;
  qty: number;
  expectedDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'late' | 'cancelled';
}

export interface CleaningTask {
  id: string;
  bedId: string;
  requestedTs: string;
  startedTs?: string;
  doneTs?: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  title: string;
  explanation: string;
  scope: string;
  openedTs: string;
  ackTs?: string;
  closedTs?: string;
  ownerRole: RoleId;
}

export interface KpiValue {
  id: string;
  name: string;
  value: number;
  unit: string;
  direction: 'up_good' | 'down_good' | 'neutral';
  warn?: number;
  critical?: number;
  status: 'ok' | 'warn' | 'critical';
  dimensions?: Record<string, string>;
  provenance: Provenance;
}

export interface Provenance {
  sourceSystem: string;
  asOf: string;
  metricVersion: string;
  definition: string;
  synthetic: true;
}

export interface ForecastPoint {
  ts: string;
  value: number;
  low: number;
  high: number;
}

export interface ForecastSeries {
  id: string;
  label: string;
  horizon: string;
  points: ForecastPoint[];
  backtestMape: number;
  beatsSeasonalNaive: boolean;
}

export interface BoardTile {
  kpiId: string;
  label: string;
  value: number | string;
  unit?: string;
  status: 'ok' | 'warn' | 'critical';
}

export interface BoardSpec {
  id: string;
  name: string;
  tiles: BoardTile[];
  alerts: Alert[];
  notes: string[];
}

export interface IntentAnswer {
  intentId: string;
  question: string;
  spokenSummary: string;
  boardId?: string;
  kpis: KpiValue[];
  alerts?: Alert[];
  provenance: Provenance[];
  refused?: boolean;
  refusalReason?: string;
}

export interface ScenarioDef {
  id: ScenarioId;
  name: string;
  description: string;
  expectedEffects: string[];
}

export interface HospitalState {
  site: HospitalSite;
  departments: Department[];
  units: Unit[];
  rooms: Room[];
  beds: Bed[];
  patients: Patient[];
  encounters: Encounter[];
  edVisits: EDVisit[];
  orders: Order[];
  procedures: Procedure[];
  staff: StaffMember[];
  shifts: Shift[];
  equipment: Equipment[];
  workOrders: WorkOrder[];
  items: StockItem[];
  stock: StockLevel[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  cleaningTasks: CleaningTask[];
  alerts: Alert[];
  simClock: string;
  seed: number;
  activeScenario?: ScenarioId;
  scenarioTimeline: { ts: string; event: string }[];
  modulesEnabled: ModuleId[];
  dataQualityEvents: string[];
  feedStale: Partial<Record<'ed' | 'beds' | 'stock', boolean>>;
  oxygenHoursRemaining: number;
}

export interface TwinUnitVisual {
  unitId: string;
  unitCode: string;
  unitName: string;
  floor: number;
  specialty: string;
  staffedBeds: number;
  occupancyPct: number;
  alertCount: number;
  beds: { id: string; code: string; status: BedStatus }[];
}

export interface TwinEquipmentVisual {
  id: string;
  code: string;
  equipmentType: string;
  status: 'working' | 'down' | 'maintenance';
  critical: boolean;
  unitCode: string;
  floor: number;
}

export interface TwinVisuals {
  floors: number[];
  units: TwinUnitVisual[];
  equipment: TwinEquipmentVisual[];
  occupancyTrend: { label: string; value: number; low: number; high: number }[];
  edArrivalTrend: { label: string; value: number }[];
}

export interface CommandCenterSnapshot {
  banner: string;
  site: HospitalSite;
  simClock: string;
  seed: number;
  activeScenario?: ScenarioId;
  scenarioTimeline: { ts: string; event: string }[];
  modulesEnabled: ModuleId[];
  kpis: KpiValue[];
  alerts: Alert[];
  boards: BoardSpec[];
  forecasts: ForecastSeries[];
  twinVisuals: TwinVisuals;
  bedGrid: { unitCode: string; available: number; occupied: number; cleaning: number; blocked: number; staffed: number }[];
  edCensus: {
    total: number;
    waiting: number;
    boarding: number;
    byTriage: Record<string, number>;
  };
  roles: RoleId[];
  scenarios: ScenarioDef[];
  ontologySummary: { classes: number; relations: number; modules: ModuleId[] };
  pack: { id: string; version: string };
  stats: {
    beds: number;
    encounters: number;
    edVisits: number;
    equipment: number;
    stockItems: number;
    openAlerts: number;
  };
}
