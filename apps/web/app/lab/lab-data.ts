export const LAB_DEMO_MAILTO =
  'mailto:info@aipass.space?subject=AI-Pass%20Intelligence%20Lab%20Demo';

export type LabProduct = {
  slug: 'flow' | 'realms' | 'cortex' | 'experts' | 'merit' | 'robotics' | 'ops-reality';
  name: string;
  eyebrow: string;
  tagline: string;
  summary: string;
  href: string;
  outcomes: string[];
};

/** Inspired by micro1 Flow/Realms/Cortex/Experts/Robotics + Scale GenAI loop + harness safety. */
export const LAB_PRODUCTS: LabProduct[] = [
  {
    slug: 'flow',
    name: 'Flow',
    eyebrow: 'Expert data production',
    tagline: 'Where domain experts create, review, and deliver complex datasets.',
    summary:
      'Human-in-the-loop pipelines with Flow Gen, Flow QC, and Flow Grader — plus live velocity, quality, cost, and error tracking across healthcare, legal, finance, STEM, and more.',
    href: '/lab/flow',
    outcomes: ['Flow Gen · QC · Grader', 'Task queues & review loops', 'Industry-ready datasets'],
  },
  {
    slug: 'merit',
    name: 'Merit',
    eyebrow: 'Pipeline performance',
    tagline: 'Quantify expert data quality, velocity, reliability, and cost in real time.',
    summary:
      'The control room for Flow and Realms: dashboards for error rates, cost per task, expert NPS, and SLA burn — so production never flies blind.',
    href: '/lab/merit',
    outcomes: ['Live quality meters', 'Cost & velocity SLAs', 'Expert performance'],
  },
  {
    slug: 'realms',
    name: 'Realms',
    eyebrow: 'Frontier evaluations & RL',
    tagline: 'Environments that train and stress-test agents on real work.',
    summary:
      'RL and evaluation environments grounded in operational workflows — invoices, SOPs, plant twins, tickets — not toy benchmarks.',
    href: '/lab/realms',
    outcomes: ['Custom RL environments', 'Frontier eval suites', 'Domain scenario packs'],
  },
  {
    slug: 'cortex',
    name: 'Cortex',
    eyebrow: 'Agent reliability',
    tagline: 'Evaluate, diagnose, improve, and monitor production agents.',
    summary:
      'Expert judgment on real workflows: rubrics, failure diagnosis, targeted training data, online evals, and continuous reliability monitoring.',
    href: '/lab/cortex',
    outcomes: ['Evaluation design', 'Failure diagnosis', 'Online monitoring'],
  },
  {
    slug: 'experts',
    name: 'Experts',
    eyebrow: 'Expert network + Scout',
    tagline: 'AI recruiter Scout sources and vets domain specialists at roadmap speed.',
    summary:
      'Scout (our AI recruiter) runs structured skill interviews, reuses certifications, and staffs Flow, Cortex, and Robotics with the right humans.',
    href: '/lab/experts',
    outcomes: ['Scout AI interviews', 'Skill certification reuse', 'Capacity on demand'],
  },
  {
    slug: 'robotics',
    name: 'Robotics',
    eyebrow: 'Embodied data',
    tagline: 'Training data and twin loops for physical-world AI.',
    summary:
      'Capture multimodal demos, annotate action-level labels, QC episodes, and replay against digital twins — the same Lab stack extended to hardware.',
    href: '/lab/robotics',
    outcomes: ['Multimodal capture', 'Action-level annotation', 'Sim-to-real feedback'],
  },
  {
    slug: 'ops-reality',
    name: 'Ops Reality',
    eyebrow: 'Company data partnerships',
    tagline: 'Turn operational workflows into twin environments — you keep ownership.',
    summary:
      'Connect 1–2 systems, extract anonymized Realms from SOPs and tickets, optional white-label harness. Not a raw-data dump marketplace.',
    href: '/lab/ops-reality',
    outcomes: ['Governed Connect intake', 'Anonymized realm packs', 'White-label option'],
  },
];

export const LAB_DOMAINS = [
  'Finance',
  'Medical',
  'Legal',
  'Coding',
  'STEM',
  'Vision',
  'Audio',
  'Robotics',
  'Manufacturing',
  'Defence',
  'Insurance',
  'Telecom',
];

/** Scale-inspired continuous improvement loop, owned as AI-Pass stages. */
export const LAB_PLATFORM_LOOP = [
  {
    title: 'Connect data',
    copy: 'ERP, CRM, docs, tickets, and APIs via AI-Pass Connect — data stays in your tenancy.',
    href: '/connect',
  },
  {
    title: 'Build + execute',
    copy: 'Twins, Company Harness agents, and long-running workflows with confirmation gates.',
    href: '/company-os',
  },
  {
    title: 'Evaluate + monitor',
    copy: 'Realms + Cortex + Merit: rubrics, traces, online evals, and semantic monitors.',
    href: '/lab/cortex',
  },
  {
    title: 'Learn + improve',
    copy: 'Human corrections in Flow become the next training and eval set — closed loop.',
    href: '/lab/flow',
  },
];

export const LAB_PIPELINE = [
  {
    title: 'Define the work',
    copy: 'Success criteria, rubrics, and domain constraints — tied to your agents and twins.',
  },
  {
    title: 'Produce expert data',
    copy: 'Flow Gen drafts, Flow QC flags issues, experts correct; Merit meters quality and cost.',
  },
  {
    title: 'Train & evaluate',
    copy: 'Realms stress agents in frontier environments; Cortex diagnoses failures and closes the loop.',
  },
  {
    title: 'Monitor in production',
    copy: 'Online evals and harness safety — irreversible actions stay behind human confirmation.',
  },
];

/** micro1 Flow gen / qc / grader analogues */
export const FLOW_CAPABILITIES = [
  {
    id: 'gen',
    name: 'Flow Gen',
    copy: 'Expand expert seeds into drafts, variations, annotations, and new task material — always reviewed.',
  },
  {
    id: 'qc',
    name: 'Flow QC',
    copy: 'Flag contradictions, missing evidence, bad rubrics, or sensor mismatches beside the work.',
  },
  {
    id: 'grader',
    name: 'Flow Grader',
    copy: 'Score model outputs against explicit criteria or ground truth; separate task soundness from model failure.',
  },
  {
    id: 'stages',
    name: 'Review stages',
    copy: 'Claim → edit → review → sign-off with ownership, evidence attachments, and audit hops.',
  },
];

/** Scout = Zara analogue */
export const SCOUT_CAPABILITIES = [
  {
    title: 'Structured AI interviews',
    copy: '20–40 minute skill interviews with open-ended spoken answers, recorded for human review.',
  },
  {
    title: 'Skill certification reuse',
    copy: 'Fast-track or partial interviews when prior certifications already cover the role.',
  },
  {
    title: 'Domain-tailored prompts',
    copy: 'Questions keyed to role skills — nuclear, legal, oncology, shop-floor, finance, and more.',
  },
  {
    title: 'Recruiter review desk',
    copy: 'Humans match certified experts to Flow queues, Cortex benches, and Robotics packs.',
  },
];

export const MERIT_METRICS = [
  { label: 'Quality score', value: '98.2%', hint: 'Double-layer QA + expert acceptance' },
  { label: 'Velocity', value: '4.1k', hint: 'Tasks completed / day' },
  { label: 'Error rate', value: '0.7%', hint: 'Post-review defect rate' },
  { label: 'Cost / task', value: '$1.18', hint: 'Blended expert + model assist' },
  { label: 'Expert retention', value: '95%', hint: 'Active 30-day cohort' },
  { label: 'SLA burn', value: '12%', hint: 'Queues past target cycle' },
];

export const REALM_TYPES = [
  { name: 'Finance', evidence: 'Invoices, ledgers, policies' },
  { name: 'Research', evidence: 'Questions, sources, citations' },
  { name: 'Support', evidence: 'Tickets, macros, account history' },
  { name: 'Plant / MES', evidence: 'Machine twins, quality hops' },
  { name: 'Robotics', evidence: 'Demonstrations, sensors, depth' },
  { name: 'Cortex enterprise', evidence: 'Tools, docs, permissions' },
];

export const ROBOTICS_CAPABILITIES = [
  {
    title: 'Expert-demonstrated data',
    copy: 'POV and third-person capture of skilled work across household, industrial, and field settings.',
  },
  {
    title: 'Dataset structuring',
    copy: 'Labeling, tracking, 2D/3D annotation, QC, and evaluation into VLA-ready packs.',
  },
  {
    title: 'Action-level annotations',
    copy: 'Temporal segmentation, hand/object interactions, and step language for policy models.',
  },
  {
    title: 'Multimodal pipelines',
    copy: 'Synchronized stereo, IMU, and multi-camera streams tied back to digital twins.',
  },
  {
    title: 'Full-stack deployment lab',
    copy: 'Controlled environments to deploy robots, capture interaction, QC, and evaluate end-to-end.',
  },
  {
    title: 'Twin feedback',
    copy: 'Replay episodes against plant and employee twins before shop-floor write-back.',
  },
];

/** CrowdStrike SafeMind / harness-inspired safety — owned by Company Harness */
export const HARNESS_SAFETY_FEATURES = [
  {
    title: 'Runtime harness',
    copy: 'Context, memory, tools, permissions, orchestration, and model routing for long-running agents.',
  },
  {
    title: 'Confirmation gates',
    copy: 'Irreversible actions (payments, MES writes, customer messages) require human confirm.',
  },
  {
    title: 'Digital twin of the enterprise',
    copy: 'Assets, identities, connectors, and evidence graph — agents reason on shared state.',
  },
  {
    title: 'Red / blue eval loop',
    copy: 'Cortex stress-tests agents in Realms; failures become Flow tasks and harness policy updates.',
  },
  {
    title: 'Full audit trail',
    copy: 'Every tool call and confirmation hop is logged for Trust Engine and compliance.',
  },
  {
    title: 'Role walls',
    copy: 'SSO / SCIM aware permissions — agents inherit least privilege from Connect scopes.',
  },
];

export const FEATURE_INSPIRATION = [
  {
    source: 'micro1',
    adopted: [
      'Flow / Realms / Cortex / Experts / Robotics product surface',
      'Merit pipeline dashboard',
      'Flow Gen · QC · Grader',
      'Scout AI recruiter (Zara-class)',
      'Ops Reality (CDP-class, ownership retained)',
    ],
  },
  {
    source: 'Scale GenAI Platform',
    adopted: [
      'Connect → Build/Execute → Evaluate/Monitor → Learn/Improve loop',
      'Any-model routing inside harness',
      'Online evals and trace transparency',
    ],
  },
  {
    source: 'CrowdStrike SafeMind / Falcon',
    adopted: [
      'Runtime harness with safety controls',
      'Enterprise digital twin for agent reasoning',
      'Adversarial eval → defensive policy feedback',
    ],
  },
];
