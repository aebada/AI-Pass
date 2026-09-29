import { complianceSummary, getComplianceGaps } from './compliance-ontology';
import { getLineages } from './decision-lineage';
import { getEnterpriseGraph, nodesForIndustry } from './enterprise-graph';
import { graphRagQuery, subgraphForAnswer } from './graph-rag';
import {
  businessRulesSummary,
  evaluateBusinessRules,
  getBusinessRules,
  type RuleEvaluationResult,
} from './business-rules';
import { buildLayeredGraph, type GraphLayerId, type LayeredGraph } from './layers';
import {
  getOntologyAxioms,
  getOntologyClasses,
  getOntologyProperties,
  getShapeConstraints,
  ontologySummary,
} from './ontology';
import { runReasoner, type ReasonerResult } from './reasoner';
import type { Industry } from './types';

/** Unified semantics layer facade — ontology + layers + rules + reasoner + Graph RAG */

export interface SemanticLayerSnapshot {
  ontology: {
    classCount: number;
    propertyCount: number;
    axiomCount: number;
    shapeCount: number;
    namespaces: ReturnType<typeof ontologySummary>['namespaces'];
    classes: ReturnType<typeof getOntologyClasses>;
    properties: ReturnType<typeof getOntologyProperties>;
    axioms: ReturnType<typeof getOntologyAxioms>;
    shapes: ReturnType<typeof getShapeConstraints>;
  };
  layers: LayeredGraph;
  reasoner: ReasonerResult;
  rules: {
    catalog: ReturnType<typeof getBusinessRules>;
    summary: ReturnType<typeof businessRulesSummary>;
    evaluation: RuleEvaluationResult;
  };
  compliance: ReturnType<typeof complianceSummary>;
  gaps: ReturnType<typeof getComplianceGaps>;
  graphStats: { nodes: number; edges: number; inferredEdges: number };
  capabilities: SemanticCapabilities;
}

export interface SemanticCapabilities {
  rdf: { supported: boolean; status: string };
  rdfs: { supported: boolean; status: string };
  owl: { supported: boolean; status: string };
  sparql: { supported: boolean; status: string };
  shacl: { supported: boolean; status: string };
  businessRules: { supported: boolean; status: string; count: number };
  graphRag: { supported: boolean; status: string };
  lineage: { supported: boolean; status: string };
  layers: GraphLayerId[];
}

export class SemanticPlatform {
  private cachedReasoner: ReasonerResult | null = null;

  getCapabilities(): SemanticCapabilities {
    const rules = businessRulesSummary();
    return {
      rdf: { supported: true, status: 'active' },
      rdfs: { supported: true, status: 'active' },
      owl: { supported: true, status: 'active' },
      sparql: { supported: true, status: 'pattern-query' },
      shacl: { supported: true, status: 'active' },
      businessRules: { supported: true, status: 'active', count: rules.enabled },
      graphRag: { supported: true, status: 'active' },
      lineage: { supported: true, status: 'active' },
      layers: ['conceptual', 'assertional', 'inferential', 'provenance', 'policy'],
    };
  }

  getOntology() {
    const summary = ontologySummary();
    return {
      classCount: summary.classes,
      propertyCount: summary.properties,
      axiomCount: summary.axioms,
      shapeCount: summary.shapes,
      namespaces: summary.namespaces,
      classes: getOntologyClasses(),
      properties: getOntologyProperties(),
      axioms: getOntologyAxioms(),
      shapes: getShapeConstraints(),
    };
  }

  reason(force = false): ReasonerResult {
    if (!this.cachedReasoner || force) {
      this.cachedReasoner = runReasoner();
    }
    return this.cachedReasoner;
  }

  getLayers(industry?: Industry): LayeredGraph {
    const reasoner = this.reason();
    const layered = buildLayeredGraph(reasoner.inferredEdges);
    if (!industry) return layered;
    const allow = new Set(nodesForIndustry(industry).map((n) => n.id));
    // keep conceptual class nodes
    for (const n of layered.layers.find((l) => l.id === 'conceptual')?.nodes ?? []) {
      allow.add(n.id);
    }
    return {
      ...layered,
      layers: layered.layers.map((layer) => {
        if (layer.id === 'conceptual') return layer;
        const nodes = layer.nodes.filter((n) => allow.has(n.id) || n.id.startsWith('cls_'));
        const ids = new Set(nodes.map((n) => n.id));
        const edges = layer.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
        return { ...layer, nodes, edges, nodeCount: nodes.length, edgeCount: edges.length };
      }),
    };
  }

  evaluateRules(industry?: Industry): RuleEvaluationResult {
    return evaluateBusinessRules(industry);
  }

  query(question: string, industry?: Industry) {
    const answer = graphRagQuery(question, industry);
    return {
      answer,
      subgraph: subgraphForAnswer(answer, industry),
      reasoner: this.reason(),
    };
  }

  snapshot(industry?: Industry): SemanticLayerSnapshot {
    const reasoner = this.reason();
    const graph = getEnterpriseGraph();
    return {
      ontology: this.getOntology(),
      layers: this.getLayers(industry),
      reasoner,
      rules: {
        catalog: getBusinessRules(industry),
        summary: businessRulesSummary(),
        evaluation: this.evaluateRules(industry),
      },
      compliance: complianceSummary(),
      gaps: getComplianceGaps(),
      graphStats: {
        nodes: graph.nodes.length,
        edges: graph.edges.length,
        inferredEdges: reasoner.inferredEdges.length,
      },
      capabilities: this.getCapabilities(),
    };
  }

  getLineage(industry?: Industry) {
    return getLineages(industry);
  }
}

let defaultPlatform: SemanticPlatform | null = null;

export function getSemanticPlatform(): SemanticPlatform {
  if (!defaultPlatform) defaultPlatform = new SemanticPlatform();
  return defaultPlatform;
}

export function resetSemanticPlatform(): void {
  defaultPlatform = null;
}

/** Convenience one-shot for UI / API */
export function loadSemanticLayer(industry?: Industry): SemanticLayerSnapshot {
  return getSemanticPlatform().snapshot(industry);
}
