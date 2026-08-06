import type { AutomationWorkflow, WorkflowEdge, WorkflowNode } from './types.js';

export class WorkflowGraph {
  constructor(private workflow: AutomationWorkflow) {}

  get nodes(): WorkflowNode[] {
    return this.workflow.nodes;
  }

  get edges(): WorkflowEdge[] {
    return this.workflow.edges;
  }

  getEntryNodes(): WorkflowNode[] {
    const targets = new Set(this.workflow.edges.map((e) => e.target));
    return this.workflow.nodes.filter((n) => !targets.has(n.id) || n.type === 'trigger');
  }

  getOutgoing(nodeId: string): WorkflowEdge[] {
    return this.workflow.edges.filter((e) => e.source === nodeId);
  }

  getIncoming(nodeId: string): WorkflowEdge[] {
    return this.workflow.edges.filter((e) => e.target === nodeId);
  }

  topologicalOrder(): WorkflowNode[] {
    const visited = new Set<string>();
    const order: WorkflowNode[] = [];
    const nodeMap = new Map(this.workflow.nodes.map((n) => [n.id, n]));

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      for (const edge of this.getIncoming(id)) {
        visit(edge.source);
      }
      const node = nodeMap.get(id);
      if (node) order.push(node);
    };

    for (const node of this.workflow.nodes) {
      visit(node.id);
    }
    return order;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const ids = new Set(this.workflow.nodes.map((n) => n.id));

    for (const edge of this.workflow.edges) {
      if (!ids.has(edge.source)) errors.push(`Edge source missing: ${edge.source}`);
      if (!ids.has(edge.target)) errors.push(`Edge target missing: ${edge.target}`);
    }

    if (this.workflow.nodes.length === 0) {
      errors.push('Workflow has no nodes');
    }

    return { valid: errors.length === 0, errors };
  }
}
