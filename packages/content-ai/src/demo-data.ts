import type { DetectionResult, HumanizeResult } from './types.js';
import { DEMO_TENANT_ID } from './types.js';

export { DEMO_TENANT_ID };

const SAMPLE_AI_TEXT =
  'Furthermore, it is important to note that artificial intelligence has become an indispensable tool in modern content creation. Moreover, organizations leverage these comprehensive solutions to facilitate seamless workflows across diverse teams. In today\'s ever-evolving digital landscape, the ability to utilize robust AI systems is paramount for maintaining competitive advantage.';

const SAMPLE_HUMAN_TEXT =
  'I wrote this myself after our team meeting last Tuesday. We decided to try a simpler approach — fewer buzzwords, more specifics. The client actually responded within an hour, which never happens when we send those templated decks.';

const SAMPLE_MIXED_TEXT =
  'Our Q3 results exceeded expectations. Revenue grew 12% year-over-year, driven primarily by enterprise subscriptions. The team worked incredibly hard, and I\'m proud of what we accomplished together. Furthermore, we continue to invest in product innovation to deliver comprehensive value to our customers.';

export const DEMO_DETECTIONS: DetectionResult[] = [
  {
    id: 'det_demo_1',
    tenantId: DEMO_TENANT_ID,
    userId: 'demo-user',
    text: SAMPLE_AI_TEXT,
    wordCount: 58,
    aiScore: 87,
    humanScore: 13,
    confidence: 0.91,
    modelHints: ['gpt-4o', 'high uniformity', 'transition phrases'],
    sentences: [
      { index: 0, text: SAMPLE_AI_TEXT.split('. ')[0] + '.', aiProbability: 92, label: 'ai' },
      { index: 1, text: SAMPLE_AI_TEXT.split('. ')[1] + '.', aiProbability: 88, label: 'ai' },
      { index: 2, text: SAMPLE_AI_TEXT.split('. ').slice(2).join('. '), aiProbability: 81, label: 'ai' },
    ],
    trustScore: 89,
    creditsUsed: 1,
    createdAt: '2026-06-28T10:00:00Z',
  },
  {
    id: 'det_demo_2',
    tenantId: DEMO_TENANT_ID,
    userId: 'demo-user',
    text: SAMPLE_HUMAN_TEXT,
    wordCount: 42,
    aiScore: 18,
    humanScore: 82,
    confidence: 0.88,
    modelHints: ['claude-3-5-sonnet', 'personal voice', 'informal markers'],
    sentences: [
      { index: 0, text: SAMPLE_HUMAN_TEXT.split('. ')[0] + '.', aiProbability: 15, label: 'human' },
      { index: 1, text: SAMPLE_HUMAN_TEXT.split('. ').slice(1).join('. '), aiProbability: 22, label: 'human' },
    ],
    trustScore: 86,
    creditsUsed: 1,
    createdAt: '2026-06-27T14:30:00Z',
  },
  {
    id: 'det_demo_3',
    tenantId: DEMO_TENANT_ID,
    userId: 'demo-user',
    text: SAMPLE_MIXED_TEXT,
    wordCount: 48,
    aiScore: 54,
    humanScore: 46,
    confidence: 0.72,
    modelHints: ['gemini-1.5-pro', 'mixed signals', 'corporate tone shift'],
    sentences: [
      { index: 0, text: 'Our Q3 results exceeded expectations.', aiProbability: 35, label: 'human' },
      { index: 1, text: 'Revenue grew 12% year-over-year, driven primarily by enterprise subscriptions.', aiProbability: 48, label: 'mixed' },
      { index: 2, text: "The team worked incredibly hard, and I'm proud of what we accomplished together.", aiProbability: 28, label: 'human' },
      { index: 3, text: 'Furthermore, we continue to invest in product innovation to deliver comprehensive value to our customers.', aiProbability: 85, label: 'ai' },
    ],
    trustScore: 78,
    creditsUsed: 1,
    createdAt: '2026-06-26T09:15:00Z',
  },
];

export const DEMO_HUMANIZATIONS: HumanizeResult[] = [
  {
    id: 'hum_demo_1',
    tenantId: DEMO_TENANT_ID,
    userId: 'demo-user',
    originalText: SAMPLE_AI_TEXT,
    humanizedText:
      "AI tools have changed how teams write content — there's no denying it. Companies use them to speed up drafts and keep projects moving. But the best results still come when someone reviews the output and adds a real point of view. That's what we're seeing across our customer base.",
    tone: 'professional',
    modelId: 'gpt-4o',
    providerId: 'openai',
    trustScore: 91,
    creditsUsed: 5,
    createdAt: '2026-06-28T11:00:00Z',
  },
  {
    id: 'hum_demo_2',
    tenantId: DEMO_TENANT_ID,
    userId: 'demo-user',
    originalText:
      'Furthermore, the implementation of machine learning algorithms facilitates the optimization of operational workflows. Moreover, stakeholders can leverage data-driven insights to enhance decision-making processes.',
    humanizedText:
      "We've been using ML to cut down on repetitive work — stuff that used to eat hours every week. The data side helps too; leadership can actually see what's working instead of guessing.",
    tone: 'casual',
    modelId: 'claude-3-5-sonnet',
    providerId: 'anthropic',
    trustScore: 88,
    creditsUsed: 5,
    createdAt: '2026-06-27T16:45:00Z',
  },
];

export const DEMO_SAMPLE_TEXTS = {
  ai: SAMPLE_AI_TEXT,
  human: SAMPLE_HUMAN_TEXT,
  mixed: SAMPLE_MIXED_TEXT,
} as const;
