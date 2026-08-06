import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TASK_TYPE_MAP,
  TOKEN_ESTIMATES,
  buildRouteResult,
  hubTaskForInvoiceTask,
} from './ai-router-logic.js';

const mockDecision = {
  model: {
    id: 'gpt-4o',
    providerId: 'openai' as const,
    providerName: 'OpenAI',
    model: 'gpt-4o',
    displayName: 'GPT-4o',
    description: 'Test',
    speed: 'balanced' as const,
    quality: 'great' as const,
    tier: 'standard' as const,
    contextLength: 128000,
    inputCostPer1M: 2.5,
    outputCostPer1M: 10,
    availability: 'available' as const,
    bestUseCases: ['vision'],
    tags: [],
  },
  provider: {
    id: 'openai' as const,
    name: 'OpenAI',
    description: 'Test',
    authModes: ['managed' as const],
    website: 'https://openai.com',
    supportsStreaming: true,
    supportsTools: true,
    backendProvider: 'openai' as const,
  },
  reason: 'Task-optimized for vision',
  fallbackModelIds: ['gpt-4o-mini'],
};

describe('AIRouter selection logic', () => {
  it('maps extraction to vision hub task', () => {
    assert.equal(hubTaskForInvoiceTask('extraction'), 'vision');
  });

  it('maps fraud to reasoning hub task', () => {
    assert.equal(hubTaskForInvoiceTask('fraud'), 'reasoning');
  });

  it('maps chat to chat hub task', () => {
    assert.equal(hubTaskForInvoiceTask('chat'), 'chat');
  });

  it('uses higher token estimates for extraction than chat', () => {
    assert.ok(TOKEN_ESTIMATES.extraction.input > TOKEN_ESTIMATES.chat.input);
    assert.ok(TOKEN_ESTIMATES.extraction.output > TOKEN_ESTIMATES.chat.output);
  });

  it('buildRouteResult computes cost from model pricing', () => {
    const result = buildRouteResult(mockDecision, 'extraction');
    assert.equal(result.estimatedInputTokens, 4000);
    assert.equal(result.estimatedOutputTokens, 800);
    assert.ok(result.estimatedCostUsd > 0);
    assert.equal(result.decision.model.id, 'gpt-4o');
  });

  it('covers all invoice task types in task map', () => {
    const tasks = ['extraction', 'validation', 'fraud', 'compliance', 'chat'] as const;
    for (const task of tasks) {
      assert.ok(TASK_TYPE_MAP[task], `missing map for ${task}`);
    }
  });
});
