/** Content AI agents for Agent Studio */
export const CONTENT_AI_AGENTS = [
  {
    name: 'Detection Agent',
    description: 'Analyzes text for AI-generated probability with sentence-level highlights',
    type: 'content_detection',
    agentType: 'Document' as const,
    skillIds: ['skill_content_detect'],
    inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
    outputSchema: {
      type: 'object',
      properties: { aiScore: { type: 'number' }, sentences: { type: 'array' } },
    },
    riskLevel: 'low' as const,
    status: 'active' as const,
  },
  {
    name: 'Humanization Agent',
    description: 'Rewrites AI text to sound natural while preserving meaning',
    type: 'content_humanize',
    agentType: 'Document' as const,
    skillIds: ['skill_content_humanize'],
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' }, tone: { type: 'string' } },
    },
    outputSchema: { type: 'object', properties: { humanizedText: { type: 'string' } } },
    riskLevel: 'medium' as const,
    status: 'active' as const,
  },
  {
    name: 'Quality Review Agent',
    description: 'Reviews humanized output for meaning preservation and trust score',
    type: 'content_quality_review',
    agentType: 'Document' as const,
    skillIds: ['skill_content_detect', 'skill_content_humanize'],
    inputSchema: {
      type: 'object',
      properties: { original: { type: 'string' }, rewritten: { type: 'string' } },
    },
    outputSchema: { type: 'object', properties: { trustScore: { type: 'number' }, passed: { type: 'boolean' } } },
    riskLevel: 'medium' as const,
    status: 'active' as const,
  },
];
