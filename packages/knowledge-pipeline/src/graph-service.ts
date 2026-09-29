import { createId, type Entity, type GraphQuery, type GraphQueryResult, type Relationship, type SemanticEntity, type RelationshipEdge } from '@ai-pass/shared';
import {
  getEnterpriseGraph,
  getSemanticPlatform,
  loadSemanticLayer,
  type SemanticLayerSnapshot,
} from '@ai-pass/semantic-graph';

/** Knowledge graph — entities, relationships, hierarchies, full semantics layer */
export class GraphService {
  private entities = new Map<string, Entity>();
  private edges: Relationship[] = [];
  private graphs = new Map<string, { tenantId: string; name: string }>();
  private semanticSeeded = false;

  createGraph(tenantId: string, name: string): string {
    const id = `kg_${createId()}`;
    this.graphs.set(id, { tenantId, name });
    return id;
  }

  addEntity(entity: Omit<Entity, 'id'>): Entity {
    const entry: Entity = { ...entity, id: `ent_${createId()}` };
    this.entities.set(entry.id, entry);
    return entry;
  }

  addRelationship(edge: Omit<Relationship, 'id'>): Relationship {
    const entry: Relationship = { ...edge, id: `rel_${createId()}` };
    this.edges.push(entry);
    return entry;
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  listEntities(tenantId?: string): Entity[] {
    const all = [...this.entities.values()];
    if (!tenantId) return all;
    return all.filter((e) => !e.sourceId || e.properties?.tenantId === tenantId);
  }

  traverse(entityId: string, depth = 1): { entities: SemanticEntity[]; edges: RelationshipEdge[] } {
    const relatedEdges = this.edges.filter(
      (e) => e.subjectId === entityId || e.objectId === entityId
    );
    const entityIds = new Set<string>([entityId]);
    for (const e of relatedEdges) {
      entityIds.add(e.subjectId);
      entityIds.add(e.objectId);
    }
    return {
      entities: [...entityIds].map((id) => this.entities.get(id)).filter(Boolean) as SemanticEntity[],
      edges: depth > 0 ? relatedEdges : [],
    };
  }

  query(params: GraphQuery): GraphQueryResult {
    if (params.sparql) {
      // Pattern-query over seeded + runtime graph (not a full SPARQL engine)
      const layer = this.getSemanticLayer();
      const samplePaths = layer.layers.layers
        .find((l) => l.id === 'assertional')
        ?.edges.slice(0, 5)
        .map((e) => [`${e.from} -${e.predicate}-> ${e.to}`]) ?? [];
      return {
        entities: this.listEntities(params.tenantId).slice(0, 10),
        edges: this.edges.slice(0, 20),
        paths: samplePaths.length
          ? samplePaths
          : [['SPARQL pattern-query — use entityId traversal or SemanticPlatform.query()']],
      };
    }

    let edges = [...this.edges];
    if (params.entityId) {
      edges = edges.filter((e) => e.subjectId === params.entityId || e.objectId === params.entityId);
    }
    if (params.predicate) {
      edges = edges.filter((e) => e.predicate === params.predicate);
    }

    const entityIds = new Set<string>();
    for (const e of edges) {
      entityIds.add(e.subjectId);
      entityIds.add(e.objectId);
    }
    if (params.entityId) entityIds.add(params.entityId);

    const depth = params.depth ?? 1;
    if (depth > 1 && params.entityId) {
      for (let d = 1; d < depth; d++) {
        const expanded = this.edges.filter(
          (e) => entityIds.has(e.subjectId) || entityIds.has(e.objectId)
        );
        for (const e of expanded) {
          entityIds.add(e.subjectId);
          entityIds.add(e.objectId);
          edges.push(e);
        }
      }
    }

    const entities = [...entityIds]
      .map((id) => this.entities.get(id))
      .filter(Boolean) as Entity[];

    return { entities, edges: [...new Map(edges.map((e) => [e.id, e])).values()] };
  }

  getStats(): { entityCount: number; edgeCount: number; graphCount: number } {
    return {
      entityCount: this.entities.size,
      edgeCount: this.edges.length,
      graphCount: this.graphs.size,
    };
  }

  /** Seed assertional ABox from the enterprise semantic twin (idempotent) */
  seedSemanticTwin(tenantId = 'tenant_demo'): void {
    if (this.semanticSeeded) return;
    const { nodes, edges } = getEnterpriseGraph();
    const idMap = new Map<string, string>();

    for (const n of nodes) {
      const entry: Entity = {
        id: n.id,
        name: n.label,
        type: n.kind,
        sourceId: 'semantic_twin',
        ontologyRef: `aipass:${n.kind}`,
        confidence: 0.95,
        properties: {
          tenantId,
          summary: n.summary,
          industry: n.industry ?? '',
          ...(n.properties ?? {}),
        },
      };
      this.entities.set(entry.id, entry);
      idMap.set(n.id, entry.id);
    }

    for (const e of edges) {
      this.edges.push({
        id: e.id,
        subjectId: idMap.get(e.from) ?? e.from,
        predicate: e.predicate,
        objectId: idMap.get(e.to) ?? e.to,
        confidence: e.confidence,
        sourceId: 'semantic_twin',
      });
    }

    this.createGraph(tenantId, 'Enterprise Semantic Twin');
    this.semanticSeeded = true;
  }

  /** Full ontology / layers / rules / reasoner snapshot */
  getSemanticLayer(): SemanticLayerSnapshot {
    return loadSemanticLayer();
  }

  /** RDF/RDFS/OWL/SPARQL/SHACL + business rules — backed by @ai-pass/semantic-graph */
  getOntologySupport() {
    const platform = getSemanticPlatform();
    const caps = platform.getCapabilities();
    const ontology = platform.getOntology();
    const reasoner = platform.reason();
    const rules = platform.evaluateRules();

    return {
      rdf: caps.rdf,
      rdfs: caps.rdfs,
      owl: caps.owl,
      sparql: caps.sparql,
      shacl: caps.shacl,
      businessRules: caps.businessRules,
      graphRag: caps.graphRag,
      lineage: caps.lineage,
      layers: caps.layers,
      ontology: {
        classes: ontology.classCount,
        properties: ontology.propertyCount,
        axioms: ontology.axiomCount,
        shapes: ontology.shapeCount,
        namespaces: ontology.namespaces,
      },
      reasoner: {
        inferredEdges: reasoner.stats.inferredEdges,
        shapeViolations: reasoner.shapeViolations.length,
        axiomsApplied: reasoner.stats.axiomsApplied,
      },
      rules: {
        evaluated: rules.rulesEvaluated,
        failed: rules.failed,
        critical: rules.bySeverity.critical,
      },
      package: '@ai-pass/semantic-graph',
    };
  }
}

/** @deprecated Use GraphService */
export class KnowledgeGraph extends GraphService {}
