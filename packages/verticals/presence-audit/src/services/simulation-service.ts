import { createId, type Company, type SimulationResult } from '@ai-pass/shared';

export class SimulationService {
  private results: SimulationResult[] = [];

  simulate(
    company: Company,
    scenario: SimulationResult['scenario'],
    input: Record<string, unknown>,
  ): SimulationResult {
    const lifts: Record<SimulationResult['scenario'], { vis: number; rank: number; summary: string }> = {
      landing_page: {
        vis: 12,
        rank: 8,
        summary: `New landing page for "${input.topic ?? 'use case'}" could improve visibility by ~12%`,
      },
      faq: {
        vis: 8,
        rank: 5,
        summary: 'FAQ expansion addresses 3 missing prompt clusters',
      },
      structured_data: {
        vis: 6,
        rank: 4,
        summary: 'Schema.org markup improves entity recognition across providers',
      },
      positioning: {
        vis: 15,
        rank: 10,
        summary: `Repositioning vs ${company.competitors[0] ?? 'competitors'} strengthens recommendation signals`,
      },
    };

    const lift = lifts[scenario];
    const result: SimulationResult = {
      id: `sim_${createId()}`,
      companyId: company.id,
      scenario,
      input,
      predictedVisibilityLift: lift.vis,
      predictedRankingLift: lift.rank,
      summary: lift.summary,
      createdAt: new Date().toISOString(),
    };
    this.results.push(result);
    return result;
  }

  list(companyId: string): SimulationResult[] {
    return this.results.filter((r) => r.companyId === companyId);
  }
}
