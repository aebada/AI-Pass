export type GraphLayer =
  | 'conceptual'
  | 'assertional'
  | 'inferential'
  | 'provenance'
  | 'policy';

export type OrgRole = 'quality_engineer' | 'plant_manager' | 'auditor' | 'operator';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  layer: GraphLayer;
  x: number;
  y: number;
  attributes: Record<string, string | number | boolean>;
  metadata: {
    source: string;
    capturedAt: string;
    confidence: number;
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    ownerRole: OrgRole;
    version: string;
    checksum?: string;
  };
  visibleTo: OrgRole[];
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  predicate: string;
  attributes?: Record<string, string | number>;
  metadata?: { source: string; confidence: number };
}

export interface GraphQuestion {
  id: string;
  prompt: string;
  hopIds: string[];
  answer: string;
  deterministicRule: string;
  explanation: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  industry: string;
  summary: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  questions: GraphQuestion[];
}

export const ORG_ROLES: { id: OrgRole; label: string; blurb: string }[] = [
  {
    id: 'quality_engineer',
    label: 'Quality engineer',
    blurb: 'Sees sensors, parts, thresholds, and the full root-cause path.',
  },
  {
    id: 'plant_manager',
    label: 'Plant manager',
    blurb: 'Sees plant, line, work orders, and the decision — not raw MQTT payloads.',
  },
  {
    id: 'auditor',
    label: 'Auditor',
    blurb: 'Sees evidence, policy, MDR, and provenance. Cannot change the graph.',
  },
  {
    id: 'operator',
    label: 'Line operator',
    blurb: 'Sees the event, the unit, and the work order assigned to the shift.',
  },
];

const ALL_ROLES: OrgRole[] = ['quality_engineer', 'plant_manager', 'auditor', 'operator'];

function meta(
  source: string,
  capturedAt: string,
  confidence: number,
  classification: GraphNode['metadata']['classification'],
  ownerRole: OrgRole,
  version: string,
  checksum?: string,
): GraphNode['metadata'] {
  return { source, capturedAt, confidence, classification, ownerRole, version, checksum };
}

export const MANUFACTURING_GRAPH: DemoScenario = {
  id: 'manufacturing-twin',
  name: 'Manufacturing · Digital twin defect',
  industry: 'Manufacturing',
  summary:
    'Vibration event VE-991 is bound to a bearing, drive unit, lot, line, and plant. The answer is a path, not a label.',
  nodes: [
    {
      id: 've-991',
      label: 'VE-991',
      type: 'VibrationEvent',
      layer: 'assertional',
      x: 80,
      y: 70,
      attributes: { amplitudeMmS: 12.4, axis: 'radial', durationSec: 8.2, status: 'open' },
      metadata: meta('mqtt://plant-munich/line-3/s-441', '2026-10-03T14:22:11Z', 0.99, 'internal', 'quality_engineer', '1.3', 'sha256:ve991'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 's-441',
      label: 'Sensor S-441',
      type: 'VibrationSensor',
      layer: 'assertional',
      x: 240,
      y: 40,
      attributes: { model: 'IFM-VNB001', hz: 25600, calibrated: true, mount: 'housing' },
      metadata: meta('asset-register://sensors/s-441', '2026-09-12T08:00:00Z', 1, 'internal', 'quality_engineer', '4.0'),
      visibleTo: ['quality_engineer', 'auditor', 'operator'],
    },
    {
      id: 'skf-6205',
      label: 'Bearing SKF-6205',
      type: 'Part',
      layer: 'conceptual',
      x: 400,
      y: 70,
      attributes: { sku: 'SKF-6205-2RS', spec: 'ISO 15', expectedLifeH: 18000 },
      metadata: meta('plm://parts/skf-6205', '2025-11-02T10:00:00Z', 1, 'internal', 'quality_engineer', '2.1'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 'du-7',
      label: 'Drive Unit DU-7',
      type: 'Asset',
      layer: 'assertional',
      x: 560,
      y: 70,
      attributes: { serial: 'DU-7-88421', commissioned: '2024-03-18', criticality: 'A' },
      metadata: meta('erp://assets/du-7', '2026-01-09T12:00:00Z', 1, 'internal', 'plant_manager', '6.0'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 'bom-du7',
      label: 'BOM DU-7',
      type: 'BillOfMaterials',
      layer: 'conceptual',
      x: 560,
      y: 180,
      attributes: { revision: 'C', parts: 14, includesBearing: true },
      metadata: meta('plm://bom/du-7', '2025-08-21T09:30:00Z', 1, 'internal', 'quality_engineer', 'C'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'lot-l19920',
      label: 'Lot L-19920',
      type: 'Lot',
      layer: 'assertional',
      x: 400,
      y: 180,
      attributes: { qty: 48, received: '2026-08-04', quarantine: false },
      metadata: meta('wms://lots/L-19920', '2026-08-04T16:12:00Z', 0.97, 'internal', 'quality_engineer', '1.0'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'line-3',
      label: 'Munich Line 3',
      type: 'ProductionLine',
      layer: 'assertional',
      x: 720,
      y: 70,
      attributes: { shift: 'B', oee: 0.81, product: 'gearbox-2.4' },
      metadata: meta('mes://plants/munich/line-3', '2026-10-03T14:00:00Z', 1, 'internal', 'plant_manager', '9.4'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 'plant-munich',
      label: 'Plant Munich',
      type: 'Plant',
      layer: 'assertional',
      x: 880,
      y: 70,
      attributes: { siteCode: 'DE-MUC-01', timezone: 'Europe/Berlin', iso: 'ISO 9001' },
      metadata: meta('erp://sites/DE-MUC-01', '2024-01-01T00:00:00Z', 1, 'public', 'plant_manager', '1.0'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 'agent-qt',
      label: 'Quality Twin Agent',
      type: 'Agent',
      layer: 'inferential',
      x: 240,
      y: 180,
      attributes: { mode: 'deterministic', hops: 6, sampled: false },
      metadata: meta('agent://quality-twin', '2026-10-03T14:22:14Z', 0.94, 'internal', 'quality_engineer', '0.9.2'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'th-vib',
      label: 'TH-VIB-12.0',
      type: 'ThresholdRule',
      layer: 'policy',
      x: 80,
      y: 180,
      attributes: { metric: 'amplitudeMmS', operator: '>=', value: 12, action: 'localize_and_open_wo' },
      metadata: meta('policy://quality/TH-VIB-12.0', '2026-06-01T00:00:00Z', 1, 'confidential', 'auditor', '3'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'sop-vib',
      label: 'SOP-VIB-12',
      type: 'StandardOperatingProcedure',
      layer: 'policy',
      x: 80,
      y: 290,
      attributes: { title: 'Vibration localization', owner: 'Quality', steps: 7 },
      metadata: meta('qms://sop/SOP-VIB-12', '2026-04-18T00:00:00Z', 1, 'internal', 'quality_engineer', '5'),
      visibleTo: ['quality_engineer', 'auditor', 'operator'],
    },
    {
      id: 'pol-q04',
      label: 'POL-QUALITY-04',
      type: 'OrganizationPolicy',
      layer: 'policy',
      x: 240,
      y: 290,
      attributes: { rule: 'Decisions require two independent sources', appliesTo: 'quality_events' },
      metadata: meta('governance://policies/POL-QUALITY-04', '2025-12-01T00:00:00Z', 1, 'confidential', 'auditor', '2'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'wo-8841',
      label: 'WO-8841',
      type: 'WorkOrder',
      layer: 'assertional',
      x: 720,
      y: 180,
      attributes: { status: 'assigned', window: 'shift-B', skill: 'bearing-replace' },
      metadata: meta('cmms://wo/8841', '2026-10-03T14:22:20Z', 1, 'internal', 'plant_manager', '1'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 'ev-mqtt',
      label: 'MQTT evidence',
      type: 'Evidence',
      layer: 'provenance',
      x: 400,
      y: 290,
      attributes: { topic: 'line-3/s-441', broker: 'emqx-muc', retained: false },
      metadata: meta('mqtt://plant-munich/line-3/s-441', '2026-10-03T14:22:11Z', 0.99, 'restricted', 'quality_engineer', '1', 'sha256:mqtt-ve991'),
      visibleTo: ['quality_engineer', 'auditor'],
    },
    {
      id: 'ev-pdf',
      label: 'Inspection PDF',
      type: 'Evidence',
      layer: 'provenance',
      x: 560,
      y: 290,
      attributes: { file: 'insp-du7-2026-09.pdf', pages: 6, corroborated: true },
      metadata: meta('dms://quality/insp-du7-2026-09.pdf', '2026-09-18T11:40:00Z', 0.96, 'confidential', 'auditor', '1', 'sha256:pdf-du7'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'ev-erp',
      label: 'ERP export',
      type: 'Evidence',
      layer: 'provenance',
      x: 720,
      y: 290,
      attributes: { system: 'SAP', object: 'EQUI DU-7', corroborated: true },
      metadata: meta('erp://export/du-7', '2026-10-01T06:00:00Z', 0.98, 'confidential', 'auditor', '1', 'sha256:erp-du7'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'inv-1042',
      label: 'Invoice INV-1042',
      type: 'Invoice',
      layer: 'assertional',
      x: 880,
      y: 180,
      attributes: { currency: 'EUR', amount: 1840, line: 'SKF-6205 x48' },
      metadata: meta('erp://ap/INV-1042', '2026-08-02T09:12:00Z', 1, 'confidential', 'auditor', '1'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'meridian',
      label: 'Meridian GmbH',
      type: 'Supplier',
      layer: 'assertional',
      x: 880,
      y: 290,
      attributes: { vat: 'DE8123344', approved: true, site: 'Augsburg' },
      metadata: meta('erp://vendors/meridian', '2023-05-14T00:00:00Z', 1, 'internal', 'auditor', '3'),
      visibleTo: ['quality_engineer', 'auditor', 'plant_manager'],
    },
    {
      id: 'mdr-991',
      label: 'MDR-991',
      type: 'MasterDataRecord',
      layer: 'provenance',
      x: 400,
      y: 400,
      attributes: { event: 'VE-991', published: false, reviewer: 'pending' },
      metadata: meta('qms://mdr/991', '2026-10-03T14:22:22Z', 1, 'confidential', 'auditor', '0.1'),
      visibleTo: ['quality_engineer', 'auditor'],
    },
    {
      id: 'role-qe',
      label: 'Role · Quality engineer',
      type: 'HumanRole',
      layer: 'policy',
      x: 80,
      y: 400,
      attributes: { canDecide: true, canPublish: false, mustCiteSources: true },
      metadata: meta('iam://roles/quality_engineer', '2026-01-01T00:00:00Z', 1, 'internal', 'auditor', '1'),
      visibleTo: ALL_ROLES,
    },
    {
      id: 'role-op',
      label: 'Role · Operator',
      type: 'HumanRole',
      layer: 'policy',
      x: 240,
      y: 400,
      attributes: { canDecide: false, canCloseWo: true, seesRawMqtt: false },
      metadata: meta('iam://roles/operator', '2026-01-01T00:00:00Z', 1, 'internal', 'auditor', '1'),
      visibleTo: ALL_ROLES,
    },
  ],
  edges: [
    { id: 'e1', from: 've-991', to: 's-441', predicate: 'observed_by', attributes: { channel: 'radial' }, metadata: { source: 'mqtt', confidence: 0.99 } },
    { id: 'e2', from: 's-441', to: 'skf-6205', predicate: 'mounted_on', metadata: { source: 'asset-register', confidence: 1 } },
    { id: 'e3', from: 'skf-6205', to: 'du-7', predicate: 'installed_on', metadata: { source: 'bom+mes', confidence: 0.98 } },
    { id: 'e4', from: 'skf-6205', to: 'bom-du7', predicate: 'listed_in', metadata: { source: 'plm', confidence: 1 } },
    { id: 'e5', from: 'bom-du7', to: 'du-7', predicate: 'describes', metadata: { source: 'plm', confidence: 1 } },
    { id: 'e6', from: 'skf-6205', to: 'lot-l19920', predicate: 'from_lot', metadata: { source: 'wms', confidence: 0.97 } },
    { id: 'e7', from: 'du-7', to: 'line-3', predicate: 'located_at', metadata: { source: 'mes', confidence: 1 } },
    { id: 'e8', from: 'line-3', to: 'plant-munich', predicate: 'part_of', metadata: { source: 'erp', confidence: 1 } },
    { id: 'e9', from: 've-991', to: 'th-vib', predicate: 'fires', attributes: { observed: 12.4, threshold: 12 }, metadata: { source: 'rule-engine', confidence: 1 } },
    { id: 'e10', from: 'agent-qt', to: 've-991', predicate: 'explained', metadata: { source: 'quality-twin', confidence: 0.94 } },
    { id: 'e11', from: 'agent-qt', to: 'th-vib', predicate: 'applied_rule', metadata: { source: 'quality-twin', confidence: 1 } },
    { id: 'e12', from: 'th-vib', to: 'sop-vib', predicate: 'requires', metadata: { source: 'qms', confidence: 1 } },
    { id: 'e13', from: 'th-vib', to: 'pol-q04', predicate: 'governed_by', metadata: { source: 'governance', confidence: 1 } },
    { id: 'e14', from: 'agent-qt', to: 'wo-8841', predicate: 'opened', metadata: { source: 'cmms', confidence: 1 } },
    { id: 'e15', from: 'wo-8841', to: 'du-7', predicate: 'targets', metadata: { source: 'cmms', confidence: 1 } },
    { id: 'e16', from: 'ev-mqtt', to: 've-991', predicate: 'evidences', metadata: { source: 'mqtt', confidence: 0.99 } },
    { id: 'e17', from: 'ev-pdf', to: 'du-7', predicate: 'evidences', metadata: { source: 'dms', confidence: 0.96 } },
    { id: 'e18', from: 'ev-erp', to: 'du-7', predicate: 'evidences', metadata: { source: 'erp', confidence: 0.98 } },
    { id: 'e19', from: 'inv-1042', to: 'lot-l19920', predicate: 'procured', metadata: { source: 'erp', confidence: 1 } },
    { id: 'e20', from: 'inv-1042', to: 'meridian', predicate: 'issued_by', metadata: { source: 'erp', confidence: 1 } },
    { id: 'e21', from: 'lot-l19920', to: 'meridian', predicate: 'supplied_by', metadata: { source: 'wms', confidence: 1 } },
    { id: 'e22', from: 'mdr-991', to: 've-991', predicate: 'records', metadata: { source: 'qms', confidence: 1 } },
    { id: 'e23', from: 'role-qe', to: 'th-vib', predicate: 'may_apply', metadata: { source: 'iam', confidence: 1 } },
    { id: 'e24', from: 'role-op', to: 'wo-8841', predicate: 'may_execute', metadata: { source: 'iam', confidence: 1 } },
    { id: 'e25', from: 'pol-q04', to: 'ev-mqtt', predicate: 'requires_second_source', metadata: { source: 'governance', confidence: 1 } },
    { id: 'e26', from: 'pol-q04', to: 'ev-pdf', predicate: 'accepts_as_corroboration', metadata: { source: 'governance', confidence: 1 } },
  ],
  questions: [
    {
      id: 'localize',
      prompt: 'Where does vibration event VE-991 localize in the drive unit?',
      hopIds: ['e1', 'e2', 'e3', 'e7', 'e9'],
      answer:
        'VE-991 (12.4 mm/s) localizes to bearing SKF-6205 on Drive Unit DU-7 at Munich Line 3, lot L-19920.',
      deterministicRule: 'TH-VIB-12.0: if amplitudeMmS >= 12 then localize along mounted_on → installed_on → located_at.',
      explanation:
        'Same event, same graph, same rule: the Quality Twin Agent does not sample. It walks observed_by → mounted_on → installed_on and opens WO-8841. A human quality engineer role is the only role allowed to apply the threshold.',
    },
    {
      id: 'why-wo',
      prompt: 'Why was work order WO-8841 opened?',
      hopIds: ['e9', 'e11', 'e14', 'e15', 'e12'],
      answer: 'WO-8841 opened because VE-991 fired TH-VIB-12.0 and SOP-VIB-12 requires a bearing-replace window on shift B.',
      deterministicRule: 'Policy POL-QUALITY-04 plus TH-VIB-12.0.action = localize_and_open_wo.',
      explanation:
        'The work order is an organizational action, not a model guess. Operator can execute it. Auditor can see the rule and evidence. Plant manager sees the assignment, not the MQTT payload.',
    },
    {
      id: 'supplier',
      prompt: 'Which supplier lot sits under the suspect bearing?',
      hopIds: ['e6', 'e19', 'e20', 'e21'],
      answer: 'Bearing SKF-6205 on DU-7 comes from lot L-19920, procured on INV-1042 from Meridian GmbH.',
      deterministicRule: 'from_lot + procured + issued_by must all resolve. Missing edge = no claim.',
      explanation:
        'Role-based: operators do not see invoices. Quality and audit do. The answer is only published if two sources corroborate (ERP + WMS).',
    },
  ],
};

export const DEMO_SCENARIOS: DemoScenario[] = [MANUFACTURING_GRAPH];

export function graphStats(scenario: DemoScenario) {
  const layers = scenario.nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.layer] = (acc[node.layer] ?? 0) + 1;
    return acc;
  }, {});
  return {
    entities: scenario.nodes.length,
    relationships: scenario.edges.length,
    inferredAnswerHops: scenario.questions[0]?.hopIds.length ?? 0,
    layers,
    rules: scenario.nodes.filter((node) => node.layer === 'policy').length,
  };
}

export function nodesForRole(scenario: DemoScenario, role: OrgRole) {
  return scenario.nodes.filter((node) => node.visibleTo.includes(role));
}

export function edgesForRole(scenario: DemoScenario, role: OrgRole) {
  const visible = new Set(nodesForRole(scenario, role).map((node) => node.id));
  return scenario.edges.filter((edge) => visible.has(edge.from) && visible.has(edge.to));
}
