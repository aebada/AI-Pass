import { createId } from '@ai-pass/shared';
import type { AgentChain } from '@ai-pass/shared';
import type { ExecutionService } from './execution-service.js';
import type { MultiAgentChain, MultiAgentResult, OrchestratorRole, Execution } from '../types.js';
import { checkMultiAgentGate } from '../integrations.js';
import type { MembershipTier } from '@ai-pass/shared';

export class MultiAgentOrchestrator {
  private chains = new Map<string, MultiAgentChain>();
  private legacyChains = new Map<string, AgentChain>();

  defineChain(chain: Omit<MultiAgentChain, 'id'>): MultiAgentChain {
    const entry: MultiAgentChain = { ...chain, id: `chain_${createId()}` };
    this.chains.set(entry.id, entry);
    return entry;
  }

  /** @deprecated Use defineChain with MultiAgentChain */
  defineLegacyChain(chain: Omit<AgentChain, 'id'>): AgentChain {
    const entry: AgentChain = { ...chain, id: `chain_${createId()}` };
    this.legacyChains.set(entry.id, entry);
    return entry;
  }

  getExecutionOrder(chainId: string): string[] {
    const chain = this.chains.get(chainId) ?? this.legacyChains.get(chainId);
    if (!chain) return [];
    if ('agents' in chain && Array.isArray(chain.agents) && typeof chain.agents[0] === 'string') {
      return chain.agents as string[];
    }
    const multi = chain as MultiAgentChain;
    return [...multi.agents].sort((a, b) => a.order - b.order).map((a) => a.agentId);
  }

  async run(
    chainId: string,
    input: Record<string, unknown>,
    execution: ExecutionService,
    membershipTier: MembershipTier = 'power',
  ): Promise<MultiAgentResult> {
    const gate = checkMultiAgentGate(membershipTier);
    if (!gate.allowed) throw new Error(gate.reason);

    const chain = this.chains.get(chainId);
    if (!chain) throw new Error(`Chain not found: ${chainId}`);

    const ordered = [...chain.agents].sort((a, b) => a.order - b.order);
    const outputs: Record<string, Execution> = {};
    let mergedInput = { ...input };
    let totalCredits = 0;

    for (const slot of ordered) {
      const result = await execution.execute({
        agentId: slot.agentId,
        input: mergedInput,
        membershipTier,
        skipGovernance: slot.role === 'evaluator',
      });
      outputs[slot.agentId] = result.execution;
      totalCredits += result.execution.creditsUsed;
      mergedInput = {
        ...mergedInput,
        [`${slot.role}_output`]: result.execution.output?.structured ?? result.execution.output,
      };
    }

    const merged = this.mergeOutputs(chain, outputs);
    return { chainId, outputs, merged, creditsUsed: totalCredits };
  }

  private mergeOutputs(
    chain: MultiAgentChain,
    outputs: Record<string, Execution>,
  ): Execution['output'] {
    const execs = Object.values(outputs);
    if (chain.mergeStrategy === 'supervisor') {
      const supervisor = chain.agents.find((a) => a.role === 'supervisor');
      const supExec = supervisor ? outputs[supervisor.agentId] : execs[execs.length - 1];
      return supExec?.output;
    }

    if (chain.mergeStrategy === 'vote') {
      const decisions = execs.map((e) => e.output?.decision).filter(Boolean);
      const pass = decisions.filter((d) => d === 'PASS').length;
      const fail = decisions.filter((d) => d === 'FAIL').length;
      const decision = pass > fail ? 'PASS' : fail > pass ? 'FAIL' : 'NEEDS_INFO';
      return {
        decision,
        confidence: execs.reduce((s, e) => s + (e.output?.confidence ?? 0), 0) / Math.max(execs.length, 1),
        evidence: execs.flatMap((e) => e.output?.evidence ?? []),
        reasons: execs.flatMap((e) => e.output?.reasons ?? []),
      };
    }

    return execs[execs.length - 1]?.output;
  }

  listRoles(): OrchestratorRole[] {
    return ['coordinator', 'planner', 'evaluator', 'supervisor', 'worker'];
  }
}
