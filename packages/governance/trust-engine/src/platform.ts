import type { TrustEnginePlatform } from './trust-engine.js';
import type { ValidationRun } from './types.js';
import { getTrustEngineInstance, resetTrustEngineInstance, setTrustEngineInstance } from './trust-engine.js';
import { seedTrustEngine } from './seed-data.js';

export type TrustEngine = TrustEnginePlatform & { listRuns: (systemId?: string) => ValidationRun[] };

export function getTrustEngine(): TrustEngine {
  let instance = getTrustEngineInstance();
  if (!instance) {
    instance = seedTrustEngine();
    setTrustEngineInstance(instance);
  }
  return instance;
}

export function resetTrustEngine(): void {
  resetTrustEngineInstance();
}
