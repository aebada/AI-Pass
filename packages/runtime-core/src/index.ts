export * from './types.js';
export { generateExecutionPlan } from './planner/index.js';
export { ToolRouter, defaultToolRouter, routeTool } from './router/index.js';
export type { RoutingPreferences, ToolRouteDecision } from './router/index.js';
export { ExecutionEngine, getExecutionEngine, createExecutionEngine } from './execution/index.js';
export type { ExecutionEngineOptions } from './execution/index.js';
export { Evaluator, defaultEvaluator } from './evaluator/index.js';
export type { EvaluationInput, EvaluationResult } from './evaluator/index.js';
export { OutputComposer, defaultOutputComposer } from './output/index.js';
export {
  RuntimeMonitoringService,
  defaultRuntimeMonitoring,
  recordPlanMetrics,
} from './monitoring/monitoring-service.js';
export type { RuntimeMonitoringSnapshot } from './monitoring/monitoring-service.js';

import { getExecutionEngine } from './execution/execution-engine.js';
import { defaultRuntimeMonitoring } from './monitoring/monitoring-service.js';

/** Platform singleton — wire into ModuleRegistry */
export interface RuntimePlatform {
  engine: ReturnType<typeof getExecutionEngine>;
  monitoring: typeof defaultRuntimeMonitoring;
}

let _platform: RuntimePlatform | null = null;

export function getRuntimePlatform(): RuntimePlatform {
  if (!_platform) {
    _platform = {
      engine: getExecutionEngine(),
      monitoring: defaultRuntimeMonitoring,
    };
  }
  return _platform;
}
