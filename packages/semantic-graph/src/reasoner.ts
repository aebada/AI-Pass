import type { GraphEdge, GraphNode } from './types';
import { getEnterpriseGraph } from './enterprise-graph';
import {
  getOntologyAxioms,
  getOntologyClasses,
  getOntologyProperties,
  getShapeConstraints,
  isSubClassOf,
  type ShapeConstraint,
} from './ontology';

/** Lightweight OWL/RDFS-style reasoner over the enterprise twin */

export interface Inference {
  id: string;
  kind: 'subClassExpansion' | 'transitiveClosure' | 'inverse' | 'typeAssertion' | 'domainRange';
  edge: GraphEdge;
  justification: string;
  confidence: number;
}

export interface ShapeViolation {
  shapeId: string;
  targetId: string;
  targetLabel: string;
  severity: ShapeConstraint['severity'];
  message: string;
  property: string;
}

export interface ReasonerResult {
  inferredEdges: GraphEdge[];
  inferences: Inference[];
  shapeViolations: ShapeViolation[];
  stats: {
    assertedEdges: number;
    inferredEdges: number;
    classes: number;
    properties: number;
    axiomsApplied: number;
  };
}

const INVERSE_MAP: Record<string, string> = {
  operates: 'operated_by',
  hosts: 'hosted_by',
  governed_by: 'governs',
  requires: 'required_by',
  satisfied_by: 'satisfies',
  part_of: 'has_part',
  gates: 'gated_by',
  reads: 'read_by',
  writes: 'written_by',
  implements: 'implemented_by',
  constrained_by: 'constrains',
};

function countPredicate(edges: GraphEdge[], from: string, predicate: string): number {
  return edges.filter((e) => e.from === from && e.predicate === predicate).length;
}

/** Infer subclass type edges, transitive part_of, and inverse relations */
export function runReasoner(): ReasonerResult {
  const { nodes, edges } = getEnterpriseGraph();
  const axioms = getOntologyAxioms();
  const properties = getOntologyProperties();
  const inferences: Inference[] = [];
  const inferred: GraphEdge[] = [];
  const seen = new Set(edges.map((e) => `${e.from}|${e.predicate}|${e.to}`));

  const push = (inf: Inference) => {
    const key = `${inf.edge.from}|${inf.edge.predicate}|${inf.edge.to}`;
    if (seen.has(key)) return;
    seen.add(key);
    inferred.push(inf.edge);
    inferences.push(inf);
  };

  // 1) Type assertions via rdf:type for subclass expansion
  let axCount = 0;
  for (const node of nodes) {
    const parents = getOntologyClasses()
      .filter((c) => c.id !== node.kind && isSubClassOf(node.kind, c.id))
      .map((c) => c.id);
    for (const parent of parents) {
      axCount += 1;
      push({
        id: `inf_type_${node.id}_${parent}`,
        kind: 'typeAssertion',
        edge: {
          id: `inf_e_type_${node.id}_${parent}`,
          from: node.id,
          to: `cls_${parent}`,
          predicate: 'rdf:type',
          confidence: 1,
        },
        justification: `${node.kind} ⊑ ${parent} ⇒ ${node.label} rdf:type ${parent}`,
        confidence: 1,
      });
    }
  }

  // 2) Transitive closure of part_of
  const partOf = edges.filter((e) => e.predicate === 'part_of');
  const transitiveProp = properties.find((p) => p.id === 'part_of' && p.transitive);
  if (transitiveProp || axioms.some((a) => a.kind === 'transitive' && a.subject === 'part_of')) {
    const adj = new Map<string, string[]>();
    for (const e of partOf) {
      const list = adj.get(e.from) ?? [];
      list.push(e.to);
      adj.set(e.from, list);
    }
    for (const start of adj.keys()) {
      const stack = [...(adj.get(start) ?? [])];
      const visited = new Set<string>();
      while (stack.length) {
        const cur = stack.pop()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        if (!partOf.some((e) => e.from === start && e.to === cur)) {
          axCount += 1;
          push({
            id: `inf_trans_${start}_${cur}`,
            kind: 'transitiveClosure',
            edge: {
              id: `inf_e_part_${start}_${cur}`,
              from: start,
              to: cur,
              predicate: 'part_of',
              confidence: 0.9,
            },
            justification: `Transitive closure of part_of: ${start} ⇝ ${cur}`,
            confidence: 0.9,
          });
        }
        for (const next of adj.get(cur) ?? []) stack.push(next);
      }
    }
  }

  // Also close sensor → bom → product → (implicit part path already one hop);
  // add assembled_at inheritance: if A part_of B and B assembled_at L ⇒ A assembled_at L (weak)
  for (const e of edges.filter((x) => x.predicate === 'part_of')) {
    const assembled = edges.find((x) => x.from === e.to && x.predicate === 'assembled_at');
    if (assembled) {
      axCount += 1;
      push({
        id: `inf_asm_${e.from}_${assembled.to}`,
        kind: 'domainRange',
        edge: {
          id: `inf_e_asm_${e.from}_${assembled.to}`,
          from: e.from,
          to: assembled.to,
          predicate: 'assembled_at',
          confidence: 0.85,
        },
        justification: `${e.from} part_of ${e.to} ∧ ${e.to} assembled_at ${assembled.to}`,
        confidence: 0.85,
      });
    }
  }

  // 3) Inverse edges
  for (const e of edges) {
    const inv = INVERSE_MAP[e.predicate];
    if (!inv) continue;
    axCount += 1;
    push({
      id: `inf_inv_${e.id}`,
      kind: 'inverse',
      edge: {
        id: `inf_e_inv_${e.id}`,
        from: e.to,
        to: e.from,
        predicate: inv,
        confidence: e.confidence,
      },
      justification: `Inverse of ${e.predicate}: ${e.to} ${inv} ${e.from}`,
      confidence: e.confidence,
    });
  }

  // 4) Subclass expansion marker edges on conceptual layer (Agent→System already asserted)
  for (const ax of axioms.filter((a) => a.kind === 'subClassOf')) {
    axCount += 1;
    push({
      id: `inf_sc_${ax.subject}_${ax.object}`,
      kind: 'subClassExpansion',
      edge: {
        id: `inf_e_sc_${ax.subject}_${ax.object}`,
        from: `cls_${ax.subject}`,
        to: `cls_${ax.object}`,
        predicate: 'rdfs:subClassOf',
        confidence: 1,
      },
      justification: ax.comment ?? `${ax.subject} rdfs:subClassOf ${ax.object}`,
      confidence: 1,
    });
  }

  const shapeViolations = validateShapes(nodes, edges);

  return {
    inferredEdges: inferred,
    inferences,
    shapeViolations,
    stats: {
      assertedEdges: edges.length,
      inferredEdges: inferred.length,
      classes: getOntologyClasses().length,
      properties: properties.length,
      axiomsApplied: axCount,
    },
  };
}

export function validateShapes(
  nodes: GraphNode[] = getEnterpriseGraph().nodes,
  edges: GraphEdge[] = getEnterpriseGraph().edges,
): ShapeViolation[] {
  const shapes = getShapeConstraints();
  const out: ShapeViolation[] = [];

  for (const shape of shapes) {
    const targets = nodes.filter(
      (n) => n.kind === shape.targetClass || isSubClassOf(n.kind, shape.targetClass),
    );
    for (const t of targets) {
      const count = countPredicate(edges, t.id, shape.property);
      if (shape.minCount != null && count < shape.minCount) {
        // High-risk shape only for agents that look high-risk
        if (shape.id === 'sh_high_risk_human') {
          const readsHigh = edges.some((e) => {
            if (e.from !== t.id || e.predicate !== 'reads') return false;
            const asset = nodes.find((n) => n.id === e.to);
            return asset?.properties?.risk === 'high';
          });
          if (!readsHigh && t.id !== 'agent_claims') continue;
        }
        out.push({
          shapeId: shape.id,
          targetId: t.id,
          targetLabel: t.label,
          severity: shape.severity,
          message: shape.message,
          property: shape.property,
        });
      }
      if (shape.maxCount != null && count > shape.maxCount) {
        out.push({
          shapeId: shape.id,
          targetId: t.id,
          targetLabel: t.label,
          severity: shape.severity,
          message: shape.message,
          property: shape.property,
        });
      }
    }
  }
  return out;
}
