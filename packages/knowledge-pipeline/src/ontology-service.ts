import { createId } from '@ai-pass/shared';

export type OntologyClass = {
  iri: string;
  label: string;
  comment?: string;
  parents: string[];
};

export type OntologyProperty = {
  iri: string;
  label: string;
  domain?: string;
  range?: string;
  kind: 'object' | 'datatype';
};

export type OntologyRecord = {
  id: string;
  tenantId: string;
  name: string;
  version: number;
  format: 'turtle' | 'json-ld' | 'owl-json' | 'open';
  source: 'uploaded' | 'auto' | 'seed' | 'extracted';
  classes: OntologyClass[];
  properties: OntologyProperty[];
  createdAt: string;
  updatedAt: string;
};

export type Triple = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  ontologyId: string;
  provenance?: { sourceText?: string; chunkId?: string; confidence: number };
  createdAt: string;
};

export type TriplePatch = {
  insert: Array<Omit<Triple, 'id' | 'createdAt'>>;
  delete: string[];
};

export type ExtractionJob = {
  id: string;
  ontologyId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  inputPreview: string;
  triplesExtracted: number;
  classesProposed: number;
  entityMerges: number;
  validationErrors: string[];
  createdAt: string;
  completedAt?: string;
};

export type ChangePlan = {
  id: string;
  ontologyId: string;
  title: string;
  status: 'planned' | 'applied' | 'rolled_back' | 'rejected';
  addedClasses: number;
  removedClasses: number;
  blastRadius: number;
  riskScore: 'low' | 'medium' | 'high';
  newConsequences: number;
  certificateId: string;
  proposedClasses: OntologyClass[];
  proposedProperties: OntologyProperty[];
  snapshotBefore?: { classes: OntologyClass[]; properties: OntologyProperty[] };
  createdAt: string;
  appliedAt?: string;
  rolledBackAt?: string;
};

export type ExplorerNode = {
  id: string;
  kind: 'class' | 'property' | 'entity' | 'triple';
  label: string;
  detail: string;
  neighbors: string[];
  activation?: number;
};

const SEED_CLASSES: OntologyClass[] = [
  { iri: 'aipass:Organization', label: 'Organization', parents: [] },
  { iri: 'aipass:Person', label: 'Person', parents: [] },
  { iri: 'aipass:Employee', label: 'Employee', parents: ['aipass:Person'] },
  { iri: 'aipass:DigitalTwin', label: 'Digital twin', parents: [] },
  { iri: 'aipass:EmployeeTwin', label: 'Employee twin', parents: ['aipass:DigitalTwin'] },
  { iri: 'aipass:Asset', label: 'Asset', parents: [] },
  { iri: 'aipass:Policy', label: 'Policy', parents: [] },
  { iri: 'aipass:Process', label: 'Process', parents: [] },
  { iri: 'aipass:Payment', label: 'Payment', parents: ['aipass:Process'] },
  { iri: 'aipass:SalesDeal', label: 'Sales deal', parents: ['aipass:Process'] },
  { iri: 'aipass:Plan', label: 'Plan', parents: ['aipass:Process'] },
];

const SEED_PROPERTIES: OntologyProperty[] = [
  { iri: 'aipass:owns', label: 'owns', domain: 'aipass:Organization', range: 'aipass:Asset', kind: 'object' },
  { iri: 'aipass:employs', label: 'employs', domain: 'aipass:Organization', range: 'aipass:Employee', kind: 'object' },
  { iri: 'aipass:hasTwin', label: 'has twin', domain: 'aipass:Employee', range: 'aipass:EmployeeTwin', kind: 'object' },
  { iri: 'aipass:hasRole', label: 'has role', domain: 'aipass:Employee', range: 'xsd:string', kind: 'datatype' },
  { iri: 'aipass:governedBy', label: 'governed by', domain: 'aipass:Process', range: 'aipass:Policy', kind: 'object' },
  { iri: 'aipass:amount', label: 'amount', domain: 'aipass:Payment', range: 'xsd:decimal', kind: 'datatype' },
  { iri: 'aipass:relatedTo', label: 'related to', kind: 'object' },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || 'entity';
}

/**
 * Ontology studio core — inspired by OntoCast (triple extraction),
 * NVIDIA Auto Ontology (discover/ground/validate), Open Ontologies
 * (plan / blast radius / certificate), OntoBricks (catalog → graph),
 * and neuron-style explorers (browse activations / neighbors).
 */
export class OntologyService {
  private ontologies = new Map<string, OntologyRecord>();
  private triples: Triple[] = [];
  private jobs: ExtractionJob[] = [];
  private plans: ChangePlan[] = [];
  private certificates = new Map<string, { id: string; planId: string; asserted: number; certified: number; rejected: number; proof: string }>();

  seed(tenantId = 'default'): OntologyRecord {
    const existing = [...this.ontologies.values()].find((o) => o.tenantId === tenantId && o.source === 'seed');
    if (existing) return existing;
    return this.createOntology({
      tenantId,
      name: 'AI-Pass core twin',
      format: 'owl-json',
      source: 'seed',
      classes: SEED_CLASSES,
      properties: SEED_PROPERTIES,
    });
  }

  createOntology(params: {
    tenantId: string;
    name: string;
    format?: OntologyRecord['format'];
    source?: OntologyRecord['source'];
    classes?: OntologyClass[];
    properties?: OntologyProperty[];
    turtle?: string;
  }): OntologyRecord {
    const parsed = params.turtle ? this.parseTurtleLite(params.turtle) : { classes: [], properties: [] };
    const now = new Date().toISOString();
    const record: OntologyRecord = {
      id: `onto_${createId()}`,
      tenantId: params.tenantId,
      name: params.name,
      version: 1,
      format: params.format ?? (params.turtle ? 'turtle' : 'owl-json'),
      source: params.source ?? 'uploaded',
      classes: [...(params.classes ?? []), ...parsed.classes],
      properties: [...(params.properties ?? []), ...parsed.properties],
      createdAt: now,
      updatedAt: now,
    };
    this.ontologies.set(record.id, record);
    return record;
  }

  listOntologies(tenantId?: string): OntologyRecord[] {
    const all = [...this.ontologies.values()];
    return tenantId ? all.filter((o) => o.tenantId === tenantId) : all;
  }

  getOntology(id: string): OntologyRecord | undefined {
    return this.ontologies.get(id);
  }

  /** OntoCast-inspired: ontology-guided semantic triple extraction from text. */
  extractTriples(params: {
    ontologyId: string;
    text: string;
    allowOntologyGrowth?: boolean;
  }): { job: ExtractionJob; patch: TriplePatch; ontology: OntologyRecord } {
    const ontology = this.requireOntology(params.ontologyId);
    const job: ExtractionJob = {
      id: `ext_${createId()}`,
      ontologyId: ontology.id,
      status: 'running',
      inputPreview: params.text.slice(0, 240),
      triplesExtracted: 0,
      classesProposed: 0,
      entityMerges: 0,
      validationErrors: [],
      createdAt: new Date().toISOString(),
    };
    this.jobs.unshift(job);

    const sentences = params.text
      .split(/[\n.]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);

    const insert: TriplePatch['insert'] = [];
    const classIndex = new Map(ontology.classes.map((c) => [c.label.toLowerCase(), c]));
    const propIndex = new Map(ontology.properties.map((p) => [p.label.toLowerCase(), p]));
    const seenSubjects = new Map<string, string>();
    let classesProposed = 0;
    let merges = 0;

    for (const sentence of sentences) {
      const relationMatch =
        sentence.match(/(.+?)\s+(owns|employs|governed by|related to|pays|sells|plans|uses)\s+(.+)/i) ??
        sentence.match(/(.+?)\s+is\s+a\s+(.+)/i);

      if (!relationMatch) continue;

      if (/is\s+a/i.test(sentence) && relationMatch.length >= 3) {
        const subjectRaw = relationMatch[1].trim();
        const typeRaw = relationMatch[2].trim();
        const subject = this.canonicalEntity(subjectRaw, seenSubjects, () => {
          merges += 1;
        });
        let typeClass = classIndex.get(typeRaw.toLowerCase());
        if (!typeClass && params.allowOntologyGrowth !== false) {
          typeClass = {
            iri: `aipass:${slugify(typeRaw)}`,
            label: typeRaw,
            parents: [],
          };
          ontology.classes.push(typeClass);
          classIndex.set(typeRaw.toLowerCase(), typeClass);
          classesProposed += 1;
        }
        if (typeClass) {
          insert.push({
            subject,
            predicate: 'rdf:type',
            object: typeClass.iri,
            ontologyId: ontology.id,
            provenance: { sourceText: sentence, confidence: 0.82 },
          });
        }
        continue;
      }

      const subjectRaw = relationMatch[1].trim();
      const predicateRaw = relationMatch[2].trim().toLowerCase();
      const objectRaw = relationMatch[3].trim();
      const subject = this.canonicalEntity(subjectRaw, seenSubjects, () => {
        merges += 1;
      });
      const object = this.canonicalEntity(objectRaw, seenSubjects, () => {
        merges += 1;
      });
      let prop = propIndex.get(predicateRaw);
      if (!prop) {
        prop = {
          iri: `aipass:${slugify(predicateRaw)}`,
          label: predicateRaw,
          kind: 'object',
        };
        if (params.allowOntologyGrowth !== false) {
          ontology.properties.push(prop);
          propIndex.set(predicateRaw, prop);
          classesProposed += 1;
        }
      }
      insert.push({
        subject,
        predicate: prop.iri,
        object,
        ontologyId: ontology.id,
        provenance: { sourceText: sentence, confidence: 0.78 },
      });
    }

    const validationErrors = this.validateAgainstShapes(ontology, insert);
    const accepted = insert.filter((_, i) => !validationErrors.some((e) => e.includes(`#${i}`)));

    const created = accepted.map((t) => this.addTriple(t));
    ontology.version += 1;
    ontology.updatedAt = new Date().toISOString();
    ontology.source = ontology.source === 'seed' ? 'seed' : 'extracted';

    job.status = validationErrors.length && created.length === 0 ? 'failed' : 'completed';
    job.triplesExtracted = created.length;
    job.classesProposed = classesProposed;
    job.entityMerges = merges;
    job.validationErrors = validationErrors;
    job.completedAt = new Date().toISOString();

    return {
      job,
      patch: { insert: accepted, delete: [] },
      ontology,
    };
  }

  /** NVIDIA Auto Ontology inspired: discover ontology from catalog / metadata rows. */
  autoOntologyFromCatalog(params: {
    tenantId: string;
    name: string;
    tables: Array<{ name: string; columns: string[]; description?: string }>;
  }): OntologyRecord {
    const classes: OntologyClass[] = params.tables.map((table) => ({
      iri: `auto:${slugify(table.name)}`,
      label: table.name,
      comment: table.description ?? `Auto-discovered from catalog table ${table.name}`,
      parents: ['aipass:Asset'],
    }));
    const properties: OntologyProperty[] = params.tables.flatMap((table) =>
      table.columns.slice(0, 8).map((column) => ({
        iri: `auto:${slugify(table.name)}_${slugify(column)}`,
        label: column,
        domain: `auto:${slugify(table.name)}`,
        range: 'xsd:string',
        kind: 'datatype' as const,
      })),
    );
    // Link tables that share column names
    for (let i = 0; i < params.tables.length; i++) {
      for (let j = i + 1; j < params.tables.length; j++) {
        const shared = params.tables[i].columns.filter((c) =>
          params.tables[j].columns.map((x) => x.toLowerCase()).includes(c.toLowerCase()),
        );
        if (shared.length) {
          properties.push({
            iri: `auto:rel_${slugify(params.tables[i].name)}_${slugify(params.tables[j].name)}`,
            label: `related via ${shared[0]}`,
            domain: `auto:${slugify(params.tables[i].name)}`,
            range: `auto:${slugify(params.tables[j].name)}`,
            kind: 'object',
          });
        }
      }
    }
    return this.createOntology({
      tenantId: params.tenantId,
      name: params.name,
      source: 'auto',
      format: 'open',
      classes,
      properties,
    });
  }

  /** Open Ontologies inspired: plan a change, report blast radius, issue certificate. */
  planChange(params: {
    ontologyId: string;
    title: string;
    classes?: OntologyClass[];
    properties?: OntologyProperty[];
  }): ChangePlan {
    const ontology = this.requireOntology(params.ontologyId);
    const proposedClasses = params.classes ?? [];
    const proposedProperties = params.properties ?? [];
    const existingIris = new Set([...ontology.classes.map((c) => c.iri), ...ontology.properties.map((p) => p.iri)]);
    const addedClasses = proposedClasses.filter((c) => !existingIris.has(c.iri)).length;
    const removedClasses = 0;
    const affectedTriples = this.triples.filter((t) => t.ontologyId === ontology.id).length;
    const blastRadius = proposedProperties.length * Math.max(1, Math.floor(affectedTriples / 4));
    const newConsequences = addedClasses * 12 + proposedProperties.length * 7 + blastRadius;
    const riskScore: ChangePlan['riskScore'] =
      blastRadius > 40 || addedClasses > 8 ? 'high' : blastRadius > 10 || addedClasses > 3 ? 'medium' : 'low';

    const certificateId = `cert_${createId()}`;
    const plan: ChangePlan = {
      id: `plan_${createId()}`,
      ontologyId: ontology.id,
      title: params.title,
      status: 'planned',
      addedClasses,
      removedClasses,
      blastRadius,
      riskScore,
      newConsequences,
      certificateId,
      proposedClasses,
      proposedProperties,
      snapshotBefore: {
        classes: ontology.classes.map((c) => ({ ...c, parents: [...c.parents] })),
        properties: ontology.properties.map((p) => ({ ...p })),
      },
      createdAt: new Date().toISOString(),
    };
    this.plans.unshift(plan);
    this.certificates.set(certificateId, {
      id: certificateId,
      planId: plan.id,
      asserted: proposedClasses.length + proposedProperties.length,
      certified: Math.max(0, proposedClasses.length + proposedProperties.length - (riskScore === 'high' ? 1 : 0)),
      rejected: riskScore === 'high' ? 1 : 0,
      proof: `OOCert.plan_sound(${plan.id}) blast=${blastRadius} consequences=${newConsequences}`,
    });
    return plan;
  }

  applyPlan(planId: string): ChangePlan {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    if (plan.status !== 'planned') throw new Error(`Plan is ${plan.status}`);
    const ontology = this.requireOntology(plan.ontologyId);
    const classIris = new Set(ontology.classes.map((c) => c.iri));
    const propIris = new Set(ontology.properties.map((p) => p.iri));
    for (const c of plan.proposedClasses) {
      if (!classIris.has(c.iri)) {
        ontology.classes.push(c);
        classIris.add(c.iri);
      }
    }
    for (const p of plan.proposedProperties) {
      if (!propIris.has(p.iri)) {
        ontology.properties.push(p);
        propIris.add(p.iri);
      }
    }
    ontology.version += 1;
    ontology.updatedAt = new Date().toISOString();
    plan.status = 'applied';
    plan.appliedAt = new Date().toISOString();
    return plan;
  }

  rollbackPlan(planId: string): ChangePlan {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    if (plan.status !== 'applied') throw new Error('Only applied plans can roll back');
    const ontology = this.requireOntology(plan.ontologyId);
    if (plan.snapshotBefore) {
      ontology.classes = plan.snapshotBefore.classes.map((c) => ({ ...c, parents: [...c.parents] }));
      ontology.properties = plan.snapshotBefore.properties.map((p) => ({ ...p }));
      ontology.version += 1;
      ontology.updatedAt = new Date().toISOString();
    }
    plan.status = 'rolled_back';
    plan.rolledBackAt = new Date().toISOString();
    return plan;
  }

  verifyCertificate(certificateId: string): { ok: boolean; detail: string; certificate?: ReturnType<OntologyService['getCertificate']> } {
    const cert = this.certificates.get(certificateId);
    if (!cert) return { ok: false, detail: 'Certificate not found' };
    const forged = cert.rejected > 0 && cert.certified >= cert.asserted;
    if (forged) return { ok: false, detail: 'Checker refused forged proof', certificate: cert };
    return { ok: true, detail: cert.proof, certificate: cert };
  }

  getCertificate(id: string) {
    return this.certificates.get(id);
  }

  listPlans(ontologyId?: string): ChangePlan[] {
    return ontologyId ? this.plans.filter((p) => p.ontologyId === ontologyId) : this.plans;
  }

  listJobs(ontologyId?: string): ExtractionJob[] {
    return ontologyId ? this.jobs.filter((j) => j.ontologyId === ontologyId) : this.jobs;
  }

  listTriples(ontologyId?: string): Triple[] {
    return ontologyId ? this.triples.filter((t) => t.ontologyId === ontologyId) : this.triples;
  }

  /** OntoBricks-inspired: project ontology + triples into explorer graph nodes. */
  explore(params: { ontologyId: string; query?: string; limit?: number }): ExplorerNode[] {
    const ontology = this.requireOntology(params.ontologyId);
    const q = (params.query ?? '').toLowerCase().trim();
    const limit = params.limit ?? 48;
    const nodes: ExplorerNode[] = [];

    for (const c of ontology.classes) {
      if (q && !c.label.toLowerCase().includes(q) && !c.iri.toLowerCase().includes(q)) continue;
      nodes.push({
        id: c.iri,
        kind: 'class',
        label: c.label,
        detail: c.comment ?? `parents: ${c.parents.join(', ') || 'none'}`,
        neighbors: [...c.parents, ...ontology.properties.filter((p) => p.domain === c.iri).map((p) => p.iri)],
        activation: 0.55 + Math.min(0.4, c.parents.length * 0.08),
      });
    }
    for (const p of ontology.properties) {
      if (q && !p.label.toLowerCase().includes(q) && !p.iri.toLowerCase().includes(q)) continue;
      nodes.push({
        id: p.iri,
        kind: 'property',
        label: p.label,
        detail: `${p.kind}${p.domain ? ` · ${p.domain}` : ''}${p.range ? ` → ${p.range}` : ''}`,
        neighbors: [p.domain, p.range].filter(Boolean) as string[],
        activation: 0.45 + (p.kind === 'object' ? 0.2 : 0.05),
      });
    }
    for (const t of this.triples.filter((x) => x.ontologyId === ontology.id).slice(0, limit)) {
      if (q && !`${t.subject} ${t.predicate} ${t.object}`.toLowerCase().includes(q)) continue;
      nodes.push({
        id: t.id,
        kind: 'triple',
        label: `${t.subject} → ${t.object}`,
        detail: t.predicate,
        neighbors: [t.subject, t.predicate, t.object],
        activation: t.provenance?.confidence ?? 0.7,
      });
    }
    return nodes
      .sort((a, b) => (b.activation ?? 0) - (a.activation ?? 0))
      .slice(0, limit);
  }

  /** Ground a natural-language question against ontology terms (Auto Ontology grounding). */
  groundQuestion(ontologyId: string, question: string): {
    matchedClasses: OntologyClass[];
    matchedProperties: OntologyProperty[];
    suggestedPath: string[];
  } {
    const ontology = this.requireOntology(ontologyId);
    const tokens = question.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const matchedClasses = ontology.classes.filter((c) =>
      tokens.some((t) => c.label.toLowerCase().includes(t) || c.iri.toLowerCase().includes(t)),
    );
    const matchedProperties = ontology.properties.filter((p) =>
      tokens.some((t) => p.label.toLowerCase().includes(t) || p.iri.toLowerCase().includes(t)),
    );
    const suggestedPath = [
      ...matchedClasses.slice(0, 2).map((c) => c.iri),
      ...matchedProperties.slice(0, 2).map((p) => p.iri),
    ];
    return { matchedClasses, matchedProperties, suggestedPath };
  }

  getSupport() {
    return {
      ontocast: { tripleExtraction: true, patches: true, provenance: true, shaclLite: true },
      autoOntology: { discoverFromCatalog: true, ground: true, validate: true },
      openOntologies: { plan: true, blastRadius: true, apply: true, rollback: true, certificate: true },
      ontobricks: { catalogToGraph: true, explorer: true },
      neuronExplorer: { browseActivations: true, neighborExpand: true },
      formats: ['turtle', 'json-ld', 'owl-json', 'open'],
    };
  }

  private addTriple(input: Omit<Triple, 'id' | 'createdAt'>): Triple {
    const triple: Triple = {
      ...input,
      id: `trp_${createId()}`,
      createdAt: new Date().toISOString(),
    };
    this.triples.push(triple);
    return triple;
  }

  private requireOntology(id: string): OntologyRecord {
    const ontology = this.ontologies.get(id);
    if (!ontology) throw new Error('Ontology not found');
    return ontology;
  }

  private canonicalEntity(raw: string, seen: Map<string, string>, onMerge: () => void): string {
    const key = raw.toLowerCase().replace(/\s+/g, ' ').trim();
    const existing = seen.get(key);
    if (existing) {
      onMerge();
      return existing;
    }
    const iri = `ent:${slugify(raw)}`;
    seen.set(key, iri);
    return iri;
  }

  private validateAgainstShapes(
    ontology: OntologyRecord,
    insert: TriplePatch['insert'],
  ): string[] {
    const errors: string[] = [];
    const classIris = new Set(ontology.classes.map((c) => c.iri));
    insert.forEach((t, i) => {
      if (t.predicate === 'rdf:type' && !classIris.has(t.object)) {
        errors.push(`#${i} unknown type ${t.object}`);
      }
      if ((t.provenance?.confidence ?? 1) < 0.4) {
        errors.push(`#${i} confidence below SHACL-lite floor`);
      }
    });
    return errors;
  }

  /** Minimal Turtle parser for class / property declarations. */
  private parseTurtleLite(turtle: string): { classes: OntologyClass[]; properties: OntologyProperty[] } {
    const classes: OntologyClass[] = [];
    const properties: OntologyProperty[] = [];
    const lines = turtle.split(/\n+/);
    for (const line of lines) {
      const classMatch = line.match(/:?(\w+)\s+a\s+(owl:Class|rdfs:Class)/i);
      if (classMatch) {
        classes.push({ iri: `custom:${classMatch[1]}`, label: classMatch[1], parents: [] });
        continue;
      }
      const propMatch = line.match(/:?(\w+)\s+a\s+(owl:ObjectProperty|owl:DatatypeProperty|rdf:Property)/i);
      if (propMatch) {
        properties.push({
          iri: `custom:${propMatch[1]}`,
          label: propMatch[1],
          kind: /Datatype/i.test(propMatch[2]) ? 'datatype' : 'object',
        });
      }
    }
    return { classes, properties };
  }
}
