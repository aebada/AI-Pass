import type { AgentService } from './agent-service.js';
import type { MonitoringService } from './monitoring-service.js';
import type { SkillService } from './skill-service.js';
import type { AnalyticsSummary } from '../types.js';

export class AnalyticsService {
  constructor(
    private agents: AgentService,
    private monitoring: MonitoringService,
    private skills: SkillService,
  ) {}

  getSummary(period = '30d'): AnalyticsSummary {
    const recent = this.monitoring.listRecent(1000);
    const agentCounts = new Map<string, number>();
    const skillCounts = new Map<string, number>();

    for (const exec of recent) {
      agentCounts.set(exec.agentId, (agentCounts.get(exec.agentId) ?? 0) + 1);
      for (const step of exec.steps) {
        if (step.skillId) skillCounts.set(step.skillId, (skillCounts.get(step.skillId) ?? 0) + 1);
      }
    }

    const topAgents = [...agentCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([agentId, count]) => ({
        agentId,
        name: this.agents.get(agentId)?.name ?? agentId,
        count,
      }));

    const topSkills = [...skillCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skillId, count]) => ({
        skillId,
        name: this.skills.get(skillId)?.name ?? skillId,
        count,
      }));

    const completed = recent.filter((e) => e.status === 'completed');

    return {
      period,
      totalExecutions: recent.length,
      uniqueAgents: agentCounts.size,
      creditsUsed: recent.reduce((s, e) => s + e.creditsUsed, 0),
      topAgents,
      topSkills,
      successRate: recent.length > 0 ? completed.length / recent.length : 0,
    };
  }
}
