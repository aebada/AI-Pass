export const LAB_DEMO_MAILTO =
  'mailto:info@aipass.space?subject=AI-Pass%20Intelligence%20Lab%20Demo';

export type LabProduct = {
  slug: 'flow' | 'realms' | 'cortex' | 'experts' | 'robotics';
  name: string;
  eyebrow: string;
  tagline: string;
  summary: string;
  href: string;
  outcomes: string[];
};

export const LAB_PRODUCTS: LabProduct[] = [
  {
    slug: 'flow',
    name: 'Flow',
    eyebrow: 'Expert data production',
    tagline: 'Where domain experts create, review, and deliver complex datasets.',
    summary:
      'Human-in-the-loop pipelines with live velocity, quality, cost, and error tracking across healthcare, legal, finance, STEM, and more.',
    href: '/lab/flow',
    outcomes: ['Task queues & review loops', 'Quality scoring in real time', 'Industry-ready datasets'],
  },
  {
    slug: 'realms',
    name: 'Realms',
    eyebrow: 'Frontier evaluations & RL',
    tagline: 'Environments that train and stress-test agents on real work.',
    summary:
      'RL and evaluation environments grounded in operational workflows — not toy benchmarks — so labs can measure progress that matters.',
    href: '/lab/realms',
    outcomes: ['Custom RL environments', 'Frontier eval suites', 'Domain scenario packs'],
  },
  {
    slug: 'cortex',
    name: 'Cortex',
    eyebrow: 'Agent reliability',
    tagline: 'Evaluate, diagnose, improve, and monitor production agents.',
    summary:
      'Expert judgment on real workflows: rubrics, failure diagnosis, targeted training data, and continuous reliability monitoring.',
    href: '/lab/cortex',
    outcomes: ['Evaluation design', 'Failure diagnosis', 'Post-launch monitoring'],
  },
  {
    slug: 'experts',
    name: 'Experts',
    eyebrow: 'Expert network',
    tagline: 'Source and vet domain specialists at the speed of your roadmap.',
    summary:
      'AI-assisted recruitment and vetting so expert data, reviews, and robotics labeling stay staffed with the right humans.',
    href: '/lab/experts',
    outcomes: ['Domain expert sourcing', 'Vetting workflows', 'Capacity on demand'],
  },
  {
    slug: 'robotics',
    name: 'Robotics',
    eyebrow: 'Embodied data',
    tagline: 'Training data and twin loops for physical-world AI.',
    summary:
      'Capture, annotate, and replay robotics episodes alongside digital twins — the same Intelligence Lab stack, extended to hardware.',
    href: '/lab/robotics',
    outcomes: ['Episode capture', 'Expert annotation', 'Sim-to-real feedback'],
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
];

export const LAB_PIPELINE = [
  {
    title: 'Define the work',
    copy: 'Success criteria, rubrics, and domain constraints — tied to your agents and twins.',
  },
  {
    title: 'Produce expert data',
    copy: 'Flow runs human-in-the-loop creation and review with live quality and cost meters.',
  },
  {
    title: 'Train & evaluate',
    copy: 'Realms stress agents in frontier environments; Cortex diagnoses failures and closes the loop.',
  },
  {
    title: 'Monitor in production',
    copy: 'Re-score as models, prompts, and workflows change — reliability stays measurable.',
  },
];
