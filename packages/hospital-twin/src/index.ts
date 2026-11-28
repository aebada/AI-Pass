export type {
  Alert,
  BoardSpec,
  CommandCenterSnapshot,
  ForecastSeries,
  HospitalState,
  IntentAnswer,
  KpiValue,
  ModuleId,
  RoleId,
  ScenarioDef,
  ScenarioId,
  TwinEquipmentVisual,
  TwinUnitVisual,
  TwinVisuals,
} from './types.js';

export {
  ALL_MODULES,
  ONTOLOGY_CLASSES,
  ONTOLOGY_RELATIONS,
  PACK_ID,
  PACK_VERSION,
  PILOT_MODULES,
  SYNTHETIC_BANNER,
} from './ontology.js';

export { GOLDEN_QUESTIONS, resolveIntent } from './intents.js';
export { ROLE_POLICIES, canAccessScope, refuseIfNeeded } from './roles.js';
export { SCENARIOS, applyScenario } from './scenarios.js';
export { createBaselineHospital } from './seed.js';
export { computeKpis, evaluateAlerts } from './metrics.js';
export { AuditLog } from './audit.js';
export {
  addFloorUnit,
  addSupplyItem,
  listExtensions,
} from './extensions.js';
export type { AddFloorUnitInput, AddSupplyItemInput } from './extensions.js';
export {
  HospitalTwinService,
  createHospitalTwinService,
  getHospitalTwinService,
} from './service.js';
export { runStoryAcceptance } from './story-acceptance.js';
