/** AI-Pass Graph Builder — OntoSmith-class: ontology-first, judged triple by triple */

export type PackId = 'open-domain' | 'legal-contract' | 'enterprise-twin' | 'bio-medical';

export type EntityType = {
  id: string;
  label: string;
  definition: string;
  boundary: string;
};

export type RelationType = {
  id: string;
  label: string;
  definition: string;
  domain: string;
  range: string;
};

export type DomainPack = {
  id: PackId;
  name: string;
  summary: string;
  entities: EntityType[];
  relations: RelationType[];
  approved: boolean;
};

export type Verdict = 'verified' | 'review' | 'rejected';

export type JudgedTriple = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  evidence: string;
  verdict: Verdict;
  confidence: number;
  seat: 'proposer' | 'judge' | 'escalation';
};

export type BuildStage =
  | 'ingest'
  | 'ner'
  | 'candidates'
  | 'gates'
  | 'route'
  | 'write'
  | 'index'
  | 'verify';

export const PIPELINE_STAGES: { id: BuildStage; label: string; copy: string }[] = [
  { id: 'ingest', label: 'Ingest', copy: 'Load documents into the build.' },
  { id: 'ner', label: 'NER', copy: 'Find mentions under the approved ontology.' },
  { id: 'candidates', label: 'Candidates', copy: 'Proposer suggests typed triples.' },
  { id: 'gates', label: 'Gates', copy: 'Schema and boundary checks.' },
  { id: 'route', label: 'Route', copy: 'Send each candidate to the judge seat.' },
  { id: 'write', label: 'Write', copy: 'Commit verified edges with evidence.' },
  { id: 'index', label: 'Index', copy: 'Sentence, graph, and vector arms.' },
  { id: 'verify', label: 'Verify', copy: 'Re-check hops against evidence spans.' },
];

export const SEATS = [
  {
    id: 'proposer',
    name: 'Proposer',
    copy: 'Suggests candidate triples. Fast and not trusted — everything is judged.',
  },
  {
    id: 'judge',
    name: 'Decision judge',
    copy: 'Weighs each candidate against its evidence span: verified or review.',
  },
  {
    id: 'escalation',
    name: 'Escalation',
    copy: 'Optional frontier seat for hard cases. Never writes triples alone.',
  },
];

export const DOMAIN_PACKS: DomainPack[] = [
  {
    id: 'enterprise-twin',
    name: 'Enterprise twin',
    summary: 'Employees, policies, payments, products — for AI-Pass digital twins.',
    approved: false,
    entities: [
      { id: 'Employee', label: 'Employee', definition: 'A person with a role inside the organization.', boundary: 'Not a contractor system account.' },
      { id: 'Policy', label: 'Policy', definition: 'A governing rule agents must respect.', boundary: 'Not a one-off email instruction.' },
      { id: 'Payment', label: 'Payment', definition: 'A money movement with amount and parties.', boundary: 'Not a forecast line.' },
      { id: 'Product', label: 'Product', definition: 'A sellable or manufacturable item.', boundary: 'Not a marketing slogan.' },
    ],
    relations: [
      { id: 'employs', label: 'employs', definition: 'Org employs a person.', domain: 'Organization', range: 'Employee' },
      { id: 'governedBy', label: 'governed by', definition: 'Process constrained by policy.', domain: 'Payment', range: 'Policy' },
      { id: 'owns', label: 'owns', definition: 'Org owns an asset or product.', domain: 'Organization', range: 'Product' },
    ],
  },
  {
    id: 'legal-contract',
    name: 'Legal contract',
    summary: 'Parties, defined terms, obligations — judged with clause evidence.',
    approved: false,
    entities: [
      { id: 'Party', label: 'Party', definition: 'A named contracting party.', boundary: 'Not a defined term.' },
      { id: 'DefinedTerm', label: 'Defined term', definition: 'A capitalized term with an explicit definition.', boundary: 'Not ordinary vocabulary.' },
      { id: 'Obligation', label: 'Obligation', definition: 'A duty one party owes another.', boundary: 'Not a recital.' },
    ],
    relations: [
      { id: 'defines', label: 'defines', definition: 'Document defines a term.', domain: 'Contract', range: 'DefinedTerm' },
      { id: 'obligates', label: 'obligates', definition: 'Party owes an obligation.', domain: 'Party', range: 'Obligation' },
    ],
  },
  {
    id: 'open-domain',
    name: 'Open domain',
    summary: 'General entities and relations for mixed corpora.',
    approved: false,
    entities: [
      { id: 'Person', label: 'Person', definition: 'A named individual.', boundary: 'Not an organization.' },
      { id: 'Organization', label: 'Organization', definition: 'A company, agency, or group.', boundary: 'Not a person.' },
      { id: 'Place', label: 'Place', definition: 'A geographic or facility location.', boundary: 'Not an event.' },
    ],
    relations: [
      { id: 'relatedTo', label: 'related to', definition: 'Generic typed link pending refinement.', domain: 'Entity', range: 'Entity' },
      { id: 'locatedIn', label: 'located in', definition: 'Entity located in a place.', domain: 'Entity', range: 'Place' },
    ],
  },
  {
    id: 'bio-medical',
    name: 'Bio-medical',
    summary: 'Conditions, treatments, and evidence-linked findings.',
    approved: false,
    entities: [
      { id: 'Condition', label: 'Condition', definition: 'A diagnosed or reported medical condition.', boundary: 'Not a drug name.' },
      { id: 'Treatment', label: 'Treatment', definition: 'An intervention or therapy.', boundary: 'Not a lab assay alone.' },
    ],
    relations: [
      { id: 'treats', label: 'treats', definition: 'Treatment addresses a condition.', domain: 'Treatment', range: 'Condition' },
    ],
  },
];

const SAMPLE_DOCS: Record<PackId, string> = {
  'enterprise-twin':
    'AI-Pass employs Alice Chen as Finance Controller. Payment RUN-442 to Supplier DU-7 is governed by Policy P-Pay-02. AI-Pass owns Product Twin Core.',
  'legal-contract':
    'The term of this Agreement shall be ten (10) years (the "Term"). Distributor shall deliver Samples to the Company. Party Acme Corp obligates notice within thirty days.',
  'open-domain':
    'Sabet was a long time aide to former Afghan Prime Minister Gulbuddin Hekmatyar. He returns to Paris and finds refuge with Quenu.',
  'bio-medical':
    'Drug X treats Condition Y in adults. Treatment protocol TP-9 addresses chronic Condition Y per trial evidence.',
};

/** Deterministic demo adjudicator — decision-model style gate on evidence overlap */
export function runJudgedBuild(pack: DomainPack, documentText?: string): {
  stages: BuildStage[];
  triples: JudgedTriple[];
  stats: { proposed: number; verified: number; review: number; rejected: number };
} {
  const text = (documentText?.trim() || SAMPLE_DOCS[pack.id]).replace(/\s+/g, ' ');
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const proposed: JudgedTriple[] = [];

  for (const rel of pack.relations) {
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      const hint = rel.label.toLowerCase();
      const words = sentence.match(/[A-Z][A-Za-z0-9_-]+(?:\s+[A-Z][A-Za-z0-9_-]+)*/g) ?? [];
      if (words.length < 2 && !lower.includes(hint.split(' ')[0]!)) continue;

      const subject = words[0] ?? pack.entities[0]?.label ?? 'Entity';
      const object = words[1] ?? pack.entities[1]?.label ?? 'Entity';
      const evidenceHit =
        lower.includes(hint.split(' ')[0]!) ||
        lower.includes(subject.toLowerCase()) ||
        pack.relations.some((r) => lower.includes(r.id.toLowerCase()));

      const confidence = evidenceHit ? 0.82 + (subject.length % 10) / 100 : 0.41;
      let verdict: Verdict = 'review';
      if (confidence >= 0.8 && evidenceHit) verdict = 'verified';
      if (confidence < 0.5) verdict = 'rejected';

      proposed.push({
        id: `${rel.id}-${proposed.length}`,
        subject,
        predicate: rel.label,
        object,
        evidence: sentence,
        verdict,
        confidence: Number(confidence.toFixed(2)),
        seat: verdict === 'review' ? 'escalation' : 'judge',
      });
    }
  }

  // Ensure at least a few demo triples from pack seed patterns
  if (proposed.length === 0) {
    const e0 = pack.entities[0]?.label ?? 'EntityA';
    const e1 = pack.entities[1]?.label ?? 'EntityB';
    const r0 = pack.relations[0]?.label ?? 'related to';
    proposed.push({
      id: 'seed-0',
      subject: e0,
      predicate: r0,
      object: e1,
      evidence: sentences[0] ?? text.slice(0, 160),
      verdict: 'verified',
      confidence: 0.88,
      seat: 'judge',
    });
  }

  const verified = proposed.filter((t) => t.verdict === 'verified').length;
  const review = proposed.filter((t) => t.verdict === 'review').length;
  const rejected = proposed.filter((t) => t.verdict === 'rejected').length;

  return {
    stages: PIPELINE_STAGES.map((s) => s.id),
    triples: proposed,
    stats: { proposed: proposed.length, verified, review, rejected },
  };
}

export function searchEvidence(triples: JudgedTriple[], query: string): JudgedTriple[] {
  const q = query.trim().toLowerCase();
  if (!q) return triples.filter((t) => t.verdict === 'verified').slice(0, 8);
  return triples
    .filter((t) => t.verdict !== 'rejected')
    .filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.object.toLowerCase().includes(q) ||
        t.predicate.toLowerCase().includes(q) ||
        t.evidence.toLowerCase().includes(q),
    )
    .slice(0, 12);
}
