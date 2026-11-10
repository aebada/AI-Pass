import { createId, type Entity, type GraphQuery, type GraphQueryResult, type Relationship, type SemanticEntity, type RelationshipEdge } from '@ai-pass/shared';

/** Knowledge graph — entities, relationships, hierarchies, ontology stubs */
export class GraphService {
  private entities = new Map<string, Entity>();
  private edges: Relationship[] = [];
  private graphs = new Map<string, { tenantId: string; name: string }>();

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
      return {
        entities: this.listEntities(params.tenantId).slice(0, 10),
        edges: this.edges.slice(0, 20),
        paths: [['SPARQL stub — use entityId traversal for live queries']],
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

  /** RDF/RDFS/OWL/SPARQL/SHACL extensibility stubs */
  getOntologySupport() {
    return {
      rdf: { supported: true, status: 'stub' },
      rdfs: { supported: true, status: 'stub' },
      owl: { supported: true, status: 'stub' },
      sparql: { supported: true, status: 'stub' },
      shacl: { supported: true, status: 'stub' },
    };
  }
}

/** @deprecated Use GraphService */
export class KnowledgeGraph extends GraphService {}
