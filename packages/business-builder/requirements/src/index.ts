import type { RequirementSpec } from './types.js';

export class RequirementsStore {
  private specs = new Map<string, RequirementSpec>();

  save(spec: RequirementSpec): RequirementSpec {
    const updated = { ...spec, updatedAt: new Date().toISOString() };
    this.specs.set(updated.id, updated);
    return updated;
  }

  get(id: string): RequirementSpec | undefined {
    return this.specs.get(id);
  }

  list(): RequirementSpec[] {
    return [...this.specs.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  remove(id: string): boolean {
    return this.specs.delete(id);
  }
}

export function createRequirementsPlatform() {
  return { store: new RequirementsStore() };
}

export * from './types.js';
export * from './parser.js';
