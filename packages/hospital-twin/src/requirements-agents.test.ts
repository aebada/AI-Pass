import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runAllRequirementAgents } from './requirements-agents.js';

describe('Development requirement agents', () => {
  it('all requirement agents pass', () => {
    const report = runAllRequirementAgents();
    const failures = report.agents
      .flatMap((a) => a.checks)
      .filter((c) => c.status === 'fail')
      .map((c) => `${c.agent}/${c.id}: ${c.detail}`);
    assert.equal(report.failed, 0, failures.join('\n'));
    assert.ok(report.passed >= 20, `expected >=20 checks, got ${report.passed}`);
  });
});
