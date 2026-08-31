import type { RequirementSpec } from '@ai-pass/requirements';
import { compileRequirementSpec, buildSolutionPreview, type SolutionPreview, type SolutionSpec } from './compiler.js';

export class SolutionCompiler {
  compile(spec: RequirementSpec): { solution: SolutionSpec; preview: SolutionPreview } {
    const solution = compileRequirementSpec(spec);
    const preview = buildSolutionPreview(spec, solution);
    return { solution, preview };
  }
}

export class SolutionStore {
  private solutions = new Map<string, SolutionSpec>();

  save(solution: SolutionSpec): SolutionSpec {
    const updated = { ...solution, updatedAt: new Date().toISOString() };
    this.solutions.set(updated.id, updated);
    return updated;
  }

  get(id: string): SolutionSpec | undefined {
    return this.solutions.get(id);
  }

  list(): SolutionSpec[] {
    return [...this.solutions.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export function createBuilderPlatform() {
  return {
    compiler: new SolutionCompiler(),
    store: new SolutionStore(),
  };
}

export * from './compiler.js';
