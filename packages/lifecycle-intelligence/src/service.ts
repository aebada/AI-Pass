import { createId } from '@ai-pass/shared';
import { createDefaultProductOntology } from './ontology.js';
import { PRODUCT_LIFECYCLE_STAGES } from './stages.js';
import type {
  ChangeSet,
  DataMapping,
  Dataset,
  ErrorRootCause,
  GraphEdge,
  GraphNode,
  LifecycleStageSnapshot,
  MappingRule,
  ProductOntology,
  ProvenanceRef,
  RequirementIssue,
  StudioApp,
  TicketAnalysis,
  TraceAnswer,
} from './types.js';

function now() {
  return new Date().toISOString();
}

function dedupeKey(typeId: string, label: string, attrs: Record<string, unknown>) {
  const part =
    (attrs.partNumber as string) ||
    (attrs.reqId as string) ||
    (attrs.vin as string) ||
    (attrs.testId as string) ||
    (attrs.ticketId as string) ||
    label;
  return `${typeId}::${String(part).toLowerCase()}`;
}

export class LifecycleIntelligenceService {
  private ontologies = new Map<string, ProductOntology>();
  private datasets = new Map<string, Dataset>();
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];
  private dedupeIndex = new Map<string, string>(); // key -> nodeId
  private mappings = new Map<string, DataMapping>();
  private changeSets: ChangeSet[] = [];
  private apps: StudioApp[] = [];

  constructor() {
    const onto = createDefaultProductOntology();
    this.ontologies.set(onto.id, onto);
    const ds = this.createDataset({
      name: 'Demo vehicle program',
      productLine: 'Demo-EV',
      ontologyId: onto.id,
    });
    this.seedDemoGraph(ds.id, onto.id);
    this.apps.push(
      {
        id: `app_${createId()}`,
        name: 'Requirements Manager',
        kind: 'requirements',
        ontologyId: onto.id,
        widgets: ['requirement-list', 'gap-board', 'coverage-matrix'],
        stages: ['concept', 'requirements', 'aftermarket'],
        createdAt: now(),
      },
      {
        id: `app_${createId()}`,
        name: 'Product Explorer',
        kind: 'explorer',
        ontologyId: onto.id,
        widgets: ['nl-query', 'graph-path', 'provenance-panel'],
        stages: ['design', 'simulation', 'pilot', 'series'],
        createdAt: now(),
      },
      {
        id: `app_${createId()}`,
        name: 'Error Inspector',
        kind: 'inspector',
        ontologyId: onto.id,
        widgets: ['defect-inbox', 'root-cause-path', 'impact-blast'],
        stages: ['simulation', 'pilot', 'series', 'field'],
        createdAt: now(),
      },
      {
        id: `app_${createId()}`,
        name: 'Ticket Analyzer',
        kind: 'tickets',
        ontologyId: onto.id,
        widgets: ['ticket-inbox', 'ai-summary', 'resolution-tips', 'translate'],
        stages: ['field', 'aftermarket'],
        createdAt: now(),
      },
      {
        id: `app_${createId()}`,
        name: 'Build Your Own Solution',
        kind: 'studio',
        ontologyId: onto.id,
        widgets: ['ontology-editor', 'widget-gallery', 'agent-config'],
        stages: ['concept', 'design', 'series', 'aftermarket'],
        createdAt: now(),
      },
    );
  }

  // —— Ontology builder ——
  listOntologies(): ProductOntology[] {
    return [...this.ontologies.values()];
  }

  getOntology(id: string): ProductOntology | undefined {
    return this.ontologies.get(id);
  }

  createOntology(name: string): ProductOntology {
    const onto = createDefaultProductOntology(name);
    this.ontologies.set(onto.id, onto);
    return onto;
  }

  addEntityType(
    ontologyId: string,
    entity: Omit<ProductOntology['entities'][number], 'attributes'> & {
      attributes?: ProductOntology['entities'][number]['attributes'];
    },
  ): ProductOntology | null {
    const onto = this.ontologies.get(ontologyId);
    if (!onto) return null;
    if (onto.entities.some((e) => e.id === entity.id)) return onto;
    onto.entities.push({
      ...entity,
      attributes: entity.attributes ?? [],
    });
    onto.updatedAt = now();
    onto.version = bumpPatch(onto.version);
    return onto;
  }

  addRelationType(
    ontologyId: string,
    relation: ProductOntology['relations'][number],
  ): ProductOntology | null {
    const onto = this.ontologies.get(ontologyId);
    if (!onto) return null;
    if (onto.relations.some((r) => r.id === relation.id)) return onto;
    onto.relations.push(relation);
    onto.updatedAt = now();
    onto.version = bumpPatch(onto.version);
    return onto;
  }

  // —— Datasets / graph ——
  createDataset(params: {
    name: string;
    productLine: string;
    ontologyId: string;
  }): Dataset {
    const ds: Dataset = {
      id: `ds_${createId()}`,
      name: params.name,
      productLine: params.productLine,
      ontologyId: params.ontologyId,
      createdAt: now(),
    };
    this.datasets.set(ds.id, ds);
    return ds;
  }

  listDatasets(): Dataset[] {
    return [...this.datasets.values()];
  }

  upsertNode(params: {
    datasetId: string;
    typeId: string;
    label: string;
    attributes?: Record<string, string | number | boolean>;
    version?: string;
    provenance: ProvenanceRef;
  }): { node: GraphNode; created: boolean } {
    const attrs = params.attributes ?? {};
    const key = `${params.datasetId}::${dedupeKey(params.typeId, params.label, attrs)}`;
    const existingId = this.dedupeIndex.get(key);
    if (existingId) {
      const node = this.nodes.get(existingId)!;
      node.attributes = { ...node.attributes, ...attrs };
      node.version = params.version || node.version;
      node.provenance = [...node.provenance, params.provenance];
      return { node, created: false };
    }
    const node: GraphNode = {
      id: `n_${createId()}`,
      typeId: params.typeId,
      label: params.label,
      attributes: attrs,
      version: params.version || '1',
      provenance: [params.provenance],
      datasetId: params.datasetId,
    };
    this.nodes.set(node.id, node);
    this.dedupeIndex.set(key, node.id);
    return { node, created: true };
  }

  addEdge(params: {
    datasetId: string;
    typeId: string;
    fromId: string;
    toId: string;
    provenance: ProvenanceRef;
  }): GraphEdge {
    const edge: GraphEdge = {
      id: `e_${createId()}`,
      typeId: params.typeId,
      fromId: params.fromId,
      toId: params.toId,
      provenance: [params.provenance],
      datasetId: params.datasetId,
    };
    this.edges.push(edge);
    return edge;
  }

  listNodes(datasetId?: string): GraphNode[] {
    const all = [...this.nodes.values()];
    return datasetId ? all.filter((n) => n.datasetId === datasetId) : all;
  }

  listEdges(datasetId?: string): GraphEdge[] {
    return datasetId ? this.edges.filter((e) => e.datasetId === datasetId) : [...this.edges];
  }

  traverse(nodeId: string, depth = 2): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const seen = new Set<string>([nodeId]);
    const edgeOut: GraphEdge[] = [];
    let frontier = [nodeId];
    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const e of this.edges) {
          if (e.fromId !== id && e.toId !== id) continue;
          edgeOut.push(e);
          const other = e.fromId === id ? e.toId : e.fromId;
          if (!seen.has(other)) {
            seen.add(other);
            next.push(other);
          }
        }
      }
      frontier = next;
    }
    return {
      nodes: [...seen].map((id) => this.nodes.get(id)!).filter(Boolean),
      edges: edgeOut,
    };
  }

  // —— Agentic data mapping ——
  createMapping(params: {
    name: string;
    sourceSystem: string;
    sourceFormat?: DataMapping['sourceFormat'];
    targetApp?: string;
  }): DataMapping {
    const mapping: DataMapping = {
      id: `map_${createId()}`,
      name: params.name,
      sourceSystem: params.sourceSystem,
      sourceFormat: params.sourceFormat || 'json',
      targetApp: params.targetApp,
      rules: [],
      status: 'draft',
      createdAt: now(),
    };
    this.mappings.set(mapping.id, mapping);
    return mapping;
  }

  listMappings(): DataMapping[] {
    return [...this.mappings.values()];
  }

  suggestMappingRules(
    mappingId: string,
    sourceFields: string[],
  ): MappingRule[] {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) return [];
    const suggestions: MappingRule[] = [];
    for (const field of sourceFields) {
      const f = field.toLowerCase();
      let targetEntityType = 'Part';
      let targetAttribute: string | undefined = field;
      let transform: MappingRule['transform'] = 'identity';
      let confidence = 0.55;
      if (/(^|_)req|requirement/.test(f)) {
        targetEntityType = 'Requirement';
        targetAttribute = 'reqId';
        confidence = 0.9;
        transform = 'normalize';
      } else if (/part|pn|material/.test(f)) {
        targetEntityType = 'Part';
        targetAttribute = 'partNumber';
        confidence = 0.88;
      } else if (/vin|serial/.test(f)) {
        targetEntityType = 'VIN';
        targetAttribute = 'vin';
        confidence = 0.92;
      } else if (/test|tc[-_]?/.test(f)) {
        targetEntityType = 'TestCase';
        targetAttribute = 'testId';
        confidence = 0.85;
      } else if (/sw|software|firmware/.test(f)) {
        targetEntityType = 'SoftwareModule';
        targetAttribute = 'swId';
        confidence = 0.8;
      } else if (/defect|fault|dtc|error/.test(f)) {
        targetEntityType = 'Defect';
        targetAttribute = 'code';
        confidence = 0.84;
      } else if (/ticket|warranty|claim/.test(f)) {
        targetEntityType = 'Ticket';
        targetAttribute = 'ticketId';
        confidence = 0.82;
      } else {
        transform = 'ai_suggest';
        confidence = 0.45;
      }
      suggestions.push({
        id: `rule_${createId()}`,
        sourceField: field,
        targetEntityType,
        targetAttribute,
        transform,
        confidence,
        confirmedByEngineer: confidence >= 0.85,
      });
    }
    mapping.rules = [...mapping.rules, ...suggestions];
    return suggestions;
  }

  confirmRule(mappingId: string, ruleId: string, confirm = true): MappingRule | null {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) return null;
    const rule = mapping.rules.find((r) => r.id === ruleId);
    if (!rule) return null;
    rule.confirmedByEngineer = confirm;
    return rule;
  }

  publishMapping(mappingId: string): DataMapping | null {
    const mapping = this.mappings.get(mappingId);
    if (!mapping) return null;
    mapping.status = 'published';
    return mapping;
  }

  /** Run mapping over a batch of source records into the graph */
  ingestRecords(params: {
    datasetId: string;
    mappingId: string;
    records: Record<string, string | number | boolean>[];
  }): ChangeSet {
    const mapping = this.mappings.get(params.mappingId);
    if (!mapping) {
      throw new Error('Mapping not found');
    }
    let nodesAdded = 0;
    let edgesAdded = 0;
    let deduped = 0;
    const createdIds: string[] = [];

    for (const [idx, record] of params.records.entries()) {
      const provenance: ProvenanceRef = {
        sourceSystem: mapping.sourceSystem,
        sourceRecordId: String(record.id ?? record.partNumber ?? idx),
        ingestedAt: now(),
        mappingId: mapping.id,
      };
      const byType = new Map<string, string>();
      for (const rule of mapping.rules.filter((r) => r.confirmedByEngineer || r.confidence >= 0.8)) {
        const raw = record[rule.sourceField];
        if (raw === undefined || raw === null || raw === '') continue;
        const label = String(raw);
        const attrs: Record<string, string | number | boolean> = {};
        if (rule.targetAttribute) attrs[rule.targetAttribute] = raw;
        const { node, created } = this.upsertNode({
          datasetId: params.datasetId,
          typeId: rule.targetEntityType,
          label,
          attributes: attrs,
          provenance,
        });
        byType.set(rule.targetEntityType, node.id);
        if (created) {
          nodesAdded += 1;
          createdIds.push(node.id);
        } else {
          deduped += 1;
        }
      }
      // Heuristic structure links when both ends exist in one record
      const link = (
        typeId: string,
        fromType: string,
        toType: string,
      ) => {
        const fromId = byType.get(fromType);
        const toId = byType.get(toType);
        if (!fromId || !toId) return;
        this.addEdge({
          datasetId: params.datasetId,
          typeId,
          fromId,
          toId,
          provenance,
        });
        edgesAdded += 1;
      };
      link('satisfies', 'Part', 'Requirement');
      link('verifiedBy', 'Requirement', 'TestCase');
      link('runsOn', 'SoftwareModule', 'ECU');
      link('causedBy', 'Defect', 'Part');
      link('reportedIn', 'Defect', 'Ticket');
      link('instanceOf', 'VIN', 'Variant');
    }

    const cs: ChangeSet = {
      id: `cs_${createId()}`,
      datasetId: params.datasetId,
      mappingId: params.mappingId,
      nodesAdded,
      edgesAdded,
      deduped,
      createdAt: now(),
    };
    this.changeSets.unshift(cs);
    return cs;
  }

  listChangeSets(datasetId?: string): ChangeSet[] {
    return datasetId
      ? this.changeSets.filter((c) => c.datasetId === datasetId)
      : [...this.changeSets];
  }

  // —— Explorer / Requirements / Inspector ——
  explore(question: string, datasetId?: string): TraceAnswer {
    const q = question.toLowerCase();
    const nodes = this.listNodes(datasetId);
    const edges = this.listEdges(datasetId);

    const find = (typeId: string, pred: (n: GraphNode) => boolean) =>
      nodes.find((n) => n.typeId === typeId && pred(n));

    // Example: VIN + BCM/SW pattern
    if (q.includes('vin') || q.includes('bcm') || q.includes('sw')) {
      const vin = find('VIN', () => true);
      const ecu = find('ECU', (n) => /bcm/i.test(n.label) || /bcm/i.test(String(n.attributes.ecuId || '')));
      const sw = find('SoftwareModule', () => true);
      const defect = find('Defect', () => true);
      const path = [vin?.label, ecu?.label, sw?.label, defect?.label].filter(Boolean) as string[];
      const provenance = [
        ...(vin?.provenance || []),
        ...(ecu?.provenance || []),
        ...(sw?.provenance || []),
        ...(defect?.provenance || []),
      ].slice(0, 8);
      return {
        question,
        answer: path.length
          ? `Matched path ${path.join(' → ')}. Provenance spans ${provenance.length} source record(s).`
          : 'No matching VIN/ECU/SW path in the current dataset. Ingest PLM/test data or refine the question.',
        path: path.length ? path : ['(empty graph hop)'],
        provenance,
        confidence: path.length >= 3 ? 0.86 : 0.4,
      };
    }

    if (q.includes('requirement') || q.includes('req-')) {
      const req = find('Requirement', (n) =>
        q.includes(String(n.attributes.reqId || n.label).toLowerCase()) || true,
      );
      const tests = edges
        .filter((e) => e.typeId === 'verifiedBy' && e.fromId === req?.id)
        .map((e) => this.nodes.get(e.toId)?.label)
        .filter(Boolean);
      return {
        question,
        answer: req
          ? `Requirement ${req.label}: covered by ${tests.length ? tests.join(', ') : 'no linked tests yet'}.`
          : 'No requirements in dataset.',
        path: [req?.label, ...tests].filter(Boolean) as string[],
        provenance: req?.provenance || [],
        confidence: req ? 0.8 : 0.3,
      };
    }

    // Generic keyword hop
    const hit = nodes.find((n) => q.includes(n.label.toLowerCase()) || Object.values(n.attributes).some((v) => q.includes(String(v).toLowerCase())));
    if (hit) {
      const trav = this.traverse(hit.id, 2);
      return {
        question,
        answer: `Found ${hit.typeId} “${hit.label}” with ${trav.nodes.length - 1} related entities.`,
        path: trav.nodes.map((n) => n.label).slice(0, 8),
        provenance: hit.provenance,
        confidence: 0.72,
      };
    }

    return {
      question,
      answer: `Indexed ${nodes.length} entities / ${edges.length} links. Ask about a VIN, requirement, part, or defect code.`,
      path: [],
      provenance: [],
      confidence: 0.35,
    };
  }

  analyzeRequirements(datasetId?: string): RequirementIssue[] {
    const nodes = this.listNodes(datasetId);
    const edges = this.listEdges(datasetId);
    const reqs = nodes.filter((n) => n.typeId === 'Requirement');
    const issues: RequirementIssue[] = [];
    for (const req of reqs) {
      const covered = edges.some((e) => e.typeId === 'verifiedBy' && e.fromId === req.id);
      const satisfied = edges.some((e) => e.typeId === 'satisfies' && e.toId === req.id);
      if (!covered) {
        issues.push({
          id: `iss_${createId()}`,
          requirementId: req.id,
          severity: 'gap',
          summary: `${req.label} has no linked test case.`,
          linkedIds: [req.id],
        });
      }
      if (!satisfied) {
        issues.push({
          id: `iss_${createId()}`,
          requirementId: req.id,
          severity: 'risk',
          summary: `${req.label} is not yet satisfied by a part or software module.`,
          linkedIds: [req.id],
        });
      }
    }
    // Simple conflict: two requirements with same text priority clash stub
    const byText = new Map<string, GraphNode[]>();
    for (const r of reqs) {
      const t = String(r.attributes.text || r.label).toLowerCase();
      byText.set(t, [...(byText.get(t) || []), r]);
    }
    for (const [, group] of byText) {
      if (group.length < 2) continue;
      issues.push({
        id: `iss_${createId()}`,
        requirementId: group[0].id,
        severity: 'conflict',
        summary: `Duplicate / conflicting requirement wording across ${group.map((g) => g.label).join(', ')}.`,
        linkedIds: group.map((g) => g.id),
      });
    }
    return issues;
  }

  inspectError(ticketOrDefect: string, datasetId?: string): ErrorRootCause {
    const nodes = this.listNodes(datasetId);
    const edges = this.listEdges(datasetId);
    const needle = ticketOrDefect.toLowerCase();
    const defect =
      nodes.find(
        (n) =>
          (n.typeId === 'Defect' || n.typeId === 'Ticket') &&
          (n.label.toLowerCase().includes(needle) ||
            String(n.attributes.code || n.attributes.ticketId || '')
              .toLowerCase()
              .includes(needle)),
      ) || nodes.find((n) => n.typeId === 'Defect');

    if (!defect) {
      return {
        id: `rc_${createId()}`,
        ticketOrDefect,
        summary: 'No defect/ticket found in dataset.',
        rootComponentIds: [],
        rootRequirementIds: [],
        path: [],
      };
    }

    const trav = this.traverse(defect.id, 3);
    const parts = trav.nodes.filter((n) => ['Part', 'ECU', 'SoftwareModule'].includes(n.typeId));
    const reqs = trav.nodes.filter((n) => n.typeId === 'Requirement');
    const path = trav.nodes.map((n) => n.label).slice(0, 10);
    return {
      id: `rc_${createId()}`,
      ticketOrDefect,
      summary: `${defect.label} traces to ${parts.map((p) => p.label).join(', ') || 'unknown components'}${
        reqs.length ? ` and requirements ${reqs.map((r) => r.label).join(', ')}` : ''
      }.`,
      rootComponentIds: parts.map((p) => p.id),
      rootRequirementIds: reqs.map((r) => r.id),
      path,
    };
  }

  listStudioApps(): StudioApp[] {
    return [...this.apps];
  }

  createStudioApp(params: {
    name: string;
    kind: StudioApp['kind'];
    ontologyId: string;
    widgets?: string[];
    stages?: string[];
  }): StudioApp {
    const app: StudioApp = {
      id: `app_${createId()}`,
      name: params.name,
      kind: params.kind,
      ontologyId: params.ontologyId,
      widgets: params.widgets || ['table', 'graph', 'provenance'],
      stages: params.stages,
      createdAt: now(),
    };
    this.apps.push(app);
    return app;
  }

  /** Full product lifecycle board: concept → aftermarket */
  lifecycleBoard(datasetId?: string): LifecycleStageSnapshot[] {
    const nodes = this.listNodes(datasetId);
    const issues = this.analyzeRequirements(datasetId);
    const defects = nodes.filter((n) => n.typeId === 'Defect' || n.typeId === 'Ticket').length;
    return PRODUCT_LIFECYCLE_STAGES.map((stage) => {
      const domainSet = new Set(stage.ontologyDomains);
      const nodeCount = nodes.filter((n) => {
        // Approximate stage coverage by entity type family
        if (stage.id === 'concept' || stage.id === 'requirements') return n.typeId === 'Requirement';
        if (stage.id === 'design') return ['Part', 'ECU', 'SoftwareModule', 'Variant', 'Supplier'].includes(n.typeId);
        if (stage.id === 'simulation') return n.typeId === 'TestCase' || n.typeId === 'SimulationRun';
        if (stage.id === 'pilot' || stage.id === 'series') return n.typeId === 'ProcessStep' || n.typeId === 'VIN';
        if (stage.id === 'field' || stage.id === 'aftermarket') return n.typeId === 'Defect' || n.typeId === 'Ticket';
        return domainSet.size > 0;
      }).length;
      const openIssues =
        stage.phase === 'rd' ? issues.filter((i) => i.severity !== 'conflict').length : defects;
      return {
        stageId: stage.id,
        label: stage.label,
        phase: stage.phase,
        nodeCount,
        openIssues,
        status: openIssues > 2 ? 'attention' : nodeCount > 0 ? 'active' : 'idle',
      };
    });
  }

  analyzeTicket(ticketId: string, datasetId?: string, language = 'en'): TicketAnalysis {
    const root = this.inspectError(ticketId, datasetId);
    const ticketNode = this.listNodes(datasetId).find(
      (n) =>
        n.typeId === 'Ticket' &&
        (n.label.toLowerCase().includes(ticketId.toLowerCase()) ||
          String(n.attributes.ticketId || '').toLowerCase() === ticketId.toLowerCase()),
    );
    const id = ticketNode?.label || ticketId;
    return {
      id: `ta_${createId()}`,
      ticketId: id,
      summary:
        language === 'de'
          ? `Ticket ${id}: ${root.summary}`
          : language === 'ar'
            ? `تذكرة ${id}: ${root.summary}`
            : `Ticket ${id}: ${root.summary}`,
      suggestedResolution:
        root.rootComponentIds.length > 0
          ? `Verify ${root.path.slice(0, 3).join(' → ')}, confirm SW/HW revision match, and close with linked evidence.`
          : 'Ingest warranty/PLM links, then re-run Analyzer for a component-backed fix path.',
      language,
      linkedComponentIds: root.rootComponentIds,
      linkedRequirementIds: root.rootRequirementIds,
      path: root.path,
      confidence: root.path.length >= 3 ? 0.84 : 0.45,
    };
  }

  snapshot() {
    const datasets = this.listDatasets();
    return {
      features: [
        'product_ontology',
        'knowledge_graph',
        'agentic_mapping',
        'ingest_pipeline',
        'full_product_lifecycle',
        'requirements_manager',
        'product_explorer',
        'error_inspector',
        'ticket_analyzer',
        'ai_studio',
      ],
      stages: PRODUCT_LIFECYCLE_STAGES,
      lifecycleBoard: this.lifecycleBoard(datasets[0]?.id),
      ontologies: this.listOntologies(),
      datasets,
      stats: {
        nodes: this.nodes.size,
        edges: this.edges.length,
        mappings: this.mappings.size,
        changeSets: this.changeSets.length,
        apps: this.apps.length,
        stages: PRODUCT_LIFECYCLE_STAGES.length,
      },
      mappings: this.listMappings(),
      changeSets: this.listChangeSets().slice(0, 20),
      apps: this.listStudioApps(),
      sampleNodes: this.listNodes().slice(0, 40),
      sampleEdges: this.listEdges().slice(0, 60),
    };
  }

  private seedDemoGraph(datasetId: string, _ontologyId: string) {
    const prov = (sys: string, id: string): ProvenanceRef => ({
      sourceSystem: sys,
      sourceRecordId: id,
      ingestedAt: now(),
    });
    const req = this.upsertNode({
      datasetId,
      typeId: 'Requirement',
      label: 'REQ-221',
      attributes: { reqId: 'REQ-221', text: 'BCM must suppress B1234 under SW 4.2', priority: 'high' },
      provenance: prov('doors', 'REQ-221'),
    }).node;
    const tc = this.upsertNode({
      datasetId,
      typeId: 'TestCase',
      label: 'TC-118',
      attributes: { testId: 'TC-118', result: 'pass' },
      provenance: prov('test-mgmt', 'TC-118'),
    }).node;
    const ecu = this.upsertNode({
      datasetId,
      typeId: 'ECU',
      label: 'BCM',
      attributes: { ecuId: 'BCM', hwRev: 'B' },
      provenance: prov('teamcenter', 'BCM-REV-B'),
    }).node;
    const sw = this.upsertNode({
      datasetId,
      typeId: 'SoftwareModule',
      label: 'SW 4.2',
      attributes: { swId: 'BCM-SW', version: '4.2' },
      provenance: prov('git/plm', 'BCM-SW-4.2'),
    }).node;
    const part = this.upsertNode({
      datasetId,
      typeId: 'Part',
      label: 'Body controller assembly',
      attributes: { partNumber: 'A-BCM-100', revision: 'B' },
      provenance: prov('windchill', 'A-BCM-100'),
    }).node;
    const variant = this.upsertNode({
      datasetId,
      typeId: 'Variant',
      label: 'EV-LongRange',
      attributes: { variantCode: 'EV-LR' },
      provenance: prov('erp', 'EV-LR'),
    }).node;
    const vin = this.upsertNode({
      datasetId,
      typeId: 'VIN',
      label: 'WVWZZZ1JZXW000001',
      attributes: { vin: 'WVWZZZ1JZXW000001' },
      provenance: prov('mes', 'WVWZZZ1JZXW000001'),
    }).node;
    const defect = this.upsertNode({
      datasetId,
      typeId: 'Defect',
      label: 'B1234',
      attributes: { code: 'B1234', severity: 'high' },
      provenance: prov('quality', 'B1234'),
    }).node;
    const ticket = this.upsertNode({
      datasetId,
      typeId: 'Ticket',
      label: 'WR-90881',
      attributes: { ticketId: 'WR-90881' },
      provenance: prov('warranty', 'WR-90881'),
    }).node;
    const step = this.upsertNode({
      datasetId,
      typeId: 'ProcessStep',
      label: 'Final assembly station FA-12',
      attributes: { station: 'FA-12' },
      provenance: prov('mes', 'FA-12'),
    }).node;
    const sim = this.upsertNode({
      datasetId,
      typeId: 'SimulationRun',
      label: 'EMC-SIM-44',
      attributes: { runId: 'EMC-SIM-44' },
      provenance: prov('cae', 'EMC-SIM-44'),
    }).node;
    const supplier = this.upsertNode({
      datasetId,
      typeId: 'Supplier',
      label: 'Conti Tier-1',
      attributes: { supplierCode: 'CONTI-T1' },
      provenance: prov('erp', 'CONTI-T1'),
    }).node;

    const p = prov('seed', 'link');
    this.addEdge({ datasetId, typeId: 'verifiedBy', fromId: req.id, toId: tc.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'satisfies', fromId: part.id, toId: req.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'runsOn', fromId: sw.id, toId: ecu.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'consistsOf', fromId: part.id, toId: ecu.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'instanceOf', fromId: vin.id, toId: variant.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'producedAt', fromId: vin.id, toId: step.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'simulatedBy', fromId: ecu.id, toId: sim.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'suppliedBy', fromId: part.id, toId: supplier.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'causedBy', fromId: defect.id, toId: ecu.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'causedBy', fromId: defect.id, toId: sw.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'reportedIn', fromId: defect.id, toId: ticket.id, provenance: p });
    this.addEdge({ datasetId, typeId: 'causedBy', fromId: defect.id, toId: req.id, provenance: p });
  }
}

function bumpPatch(version: string): string {
  const parts = version.split('.').map((n) => Number(n) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join('.');
}

let shared: LifecycleIntelligenceService | null = null;

export function getLifecycleIntelligenceService(): LifecycleIntelligenceService {
  if (!shared) shared = new LifecycleIntelligenceService();
  return shared;
}
