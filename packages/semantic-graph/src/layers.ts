import type { GraphEdge, GraphNode } from './types';
import { getEnterpriseGraph } from './enterprise-graph';
import { getClassHierarchy, isSubClassOf } from './ontology';

/** Knowledge graph layers — conceptual, assertional, inferential, provenance, policy */
export type GraphLayerId =
  | 'conceptual'
  | 'assertional'
  | 'inferential'
  | 'provenance'
  | 'policy';

export interface GraphLayer {
  id: GraphLayerId;
  label: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface LayeredGraph {
  layers: GraphLayer[];
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
}

const LAYER_META: Record<GraphLayerId, { label: string; description: string }> = {
  conceptual: {
    label: 'Conceptual (TBox)',
    description: 'Ontology classes and schema-level relationships that define the business model.',
  },
  assertional: {
    label: 'Assertional (ABox)',
    description: 'Concrete enterprise entities and facts — orgs, agents, cases, plants, policies.',
  },
  inferential: {
    label: 'Inferential',
    description: 'Edges derived by the reasoner (subclass expansion, transitive part_of, inverses).',
  },
  provenance: {
    label: 'Provenance',
    description: 'Evidence and lineage links used for Graph RAG explanations and audit.',
  },
  policy: {
    label: 'Policy & compliance',
    description: 'Regulations, obligations, controls, and governance mappings.',
  },
};

function conceptualNodes(): GraphNode[] {
  const kinds = [
    'Organization', 'System', 'Agent', 'Model', 'Policy', 'Regulation',
    'Obligation', 'Control', 'DataAsset', 'Process', 'Product', 'Location',
    'Person', 'Decision', 'BusinessRule', 'FinancialCase', 'ClinicalRecord',
    'QualityEvent', 'IntelFragment',
  ] as const;
  return kinds.map((kind) => {
    const mappedKind =
      kind === 'FinancialCase' || kind === 'ClinicalRecord' || kind === 'QualityEvent' || kind === 'IntelFragment'
        ? 'DataAsset'
        : kind === 'BusinessRule'
          ? 'Policy'
          : kind;
    return {
      id: `cls_${kind}`,
      label: kind,
      kind: mappedKind as GraphNode['kind'],
      summary: `Ontology class ${kind} — ${getClassHierarchy(kind).join(' ⊑ ')}`,
      properties: { layer: 'conceptual', hierarchy: getClassHierarchy(kind).join('>') },
    };
  });
}

function conceptualEdges(): GraphEdge[] {
  const pairs: [string, string][] = [
    ['Agent', 'System'],
    ['System', 'Thing'],
    ['FinancialCase', 'DataAsset'],
    ['ClinicalRecord', 'DataAsset'],
    ['QualityEvent', 'DataAsset'],
    ['IntelFragment', 'DataAsset'],
    ['BusinessRule', 'Thing'],
    ['Decision', 'Thing'],
  ];
  return pairs
    .filter(([, parent]) => parent !== 'Thing')
    .map(([child, parent], i) => ({
      id: `tbox_${i}`,
      from: `cls_${child}`,
      to: `cls_${parent}`,
      predicate: 'subClassOf',
      confidence: 1,
    }));
}

function policyFilter(nodes: GraphNode[], edges: GraphEdge[]) {
  const policyKinds = new Set(['Policy', 'Regulation', 'Obligation', 'Control', 'Process']);
  const nodesP = nodes.filter((n) => policyKinds.has(n.kind));
  const ids = new Set(nodesP.map((n) => n.id));
  // keep org/system anchors for context
  for (const n of nodes) {
    if (n.id === 'org_apex' || n.id === 'sys_aipass') ids.add(n.id);
  }
  const nodesOut = nodes.filter((n) => ids.has(n.id));
  const edgesOut = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  return { nodes: nodesOut, edges: edgesOut };
}

function provenanceFilter(nodes: GraphNode[], edges: GraphEdge[]) {
  const provPred = new Set([
    'reads', 'references', 'matched_against', 'informed_by', 'localized_to',
    'part_of', 'assembled_at', 'writes', 'triggers',
  ]);
  const edgesP = edges.filter((e) => provPred.has(e.predicate));
  const ids = new Set<string>();
  for (const e of edgesP) {
    ids.add(e.from);
    ids.add(e.to);
  }
  return {
    nodes: nodes.filter((n) => ids.has(n.id)),
    edges: edgesP,
  };
}

/** Build layered views over the enterprise twin (+ optional inferred edges) */
export function buildLayeredGraph(inferredEdges: GraphEdge[] = []): LayeredGraph {
  const base = getEnterpriseGraph();
  const allNodes = base.nodes;
  const allEdges = [...base.edges, ...inferredEdges];

  const conceptual = {
    nodes: conceptualNodes(),
    edges: conceptualEdges(),
  };
  const policy = policyFilter(allNodes, base.edges);
  const provenance = provenanceFilter(allNodes, base.edges);
  const inferential = {
    nodes: allNodes.filter((n) =>
      inferredEdges.some((e) => e.from === n.id || e.to === n.id),
    ),
    edges: inferredEdges,
  };

  const layers: GraphLayer[] = (Object.keys(LAYER_META) as GraphLayerId[]).map((id) => {
    const meta = LAYER_META[id];
    const slice =
      id === 'conceptual' ? conceptual
      : id === 'assertional' ? { nodes: allNodes, edges: base.edges }
      : id === 'inferential' ? inferential
      : id === 'provenance' ? provenance
      : policy;
    return {
      id,
      label: meta.label,
      description: meta.description,
      nodeCount: slice.nodes.length,
      edgeCount: slice.edges.length,
      nodes: slice.nodes,
      edges: slice.edges,
    };
  });

  return { layers, allNodes, allEdges };
}

export function nodesOfType(typeName: string, includeSubclasses = true): GraphNode[] {
  const { nodes } = getEnterpriseGraph();
  return nodes.filter((n) =>
    includeSubclasses ? isSubClassOf(n.kind, typeName) || n.kind === typeName : n.kind === typeName,
  );
}
