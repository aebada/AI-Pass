export interface ScenarioStep {
  id: string;
  title: string;
  instructions: string;
  skillId?: string;
}

export interface SkillScenario {
  id: string;
  name: string;
  description: string;
  steps: ScenarioStep[];
  createdAt: string;
  updatedAt: string;
}

const SCENARIOS_KEY = 'ai-pass-skill-scenarios';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSkillScenarios(): SkillScenario[] {
  return readJson<SkillScenario[]>(SCENARIOS_KEY, []);
}

export function saveSkillScenarios(scenarios: SkillScenario[]): void {
  writeJson(SCENARIOS_KEY, scenarios);
}

export function createScenarioStep(partial?: Partial<ScenarioStep>): ScenarioStep {
  return {
    id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: partial?.title ?? 'New step',
    instructions: partial?.instructions ?? '',
    skillId: partial?.skillId,
  };
}

export function saveSkillScenario(input: {
  id?: string;
  name: string;
  description: string;
  steps: ScenarioStep[];
}): SkillScenario {
  const now = new Date().toISOString();
  const scenarios = loadSkillScenarios();
  const existing = input.id ? scenarios.find((s) => s.id === input.id) : undefined;

  const scenario: SkillScenario = {
    id: existing?.id ?? `scenario_${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    steps: input.steps,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = existing
    ? scenarios.map((s) => (s.id === scenario.id ? scenario : s))
    : [...scenarios, scenario];
  saveSkillScenarios(next);
  return scenario;
}

export function deleteSkillScenario(id: string): SkillScenario[] {
  const next = loadSkillScenarios().filter((s) => s.id !== id);
  saveSkillScenarios(next);
  return next;
}

export function getSkillScenario(id: string): SkillScenario | undefined {
  return loadSkillScenarios().find((s) => s.id === id);
}
