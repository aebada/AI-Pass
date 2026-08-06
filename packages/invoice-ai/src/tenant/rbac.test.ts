import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canPerform, parseRoles, assertCanPerform } from './rbac.js';

describe('Invoice AI RBAC', () => {
  it('parseRoles reads x-user-roles header', () => {
    const headers = new Headers({ 'x-user-roles': 'approver,viewer' });
    assert.deepEqual(parseRoles(headers), ['approver', 'viewer']);
  });

  it('parseRoles defaults to finance_manager', () => {
    assert.deepEqual(parseRoles(new Headers()), ['finance_manager']);
  });

  it('approver can approve but not admin', () => {
    assert.equal(canPerform(['approver'], 'invoice.approve'), true);
    assert.equal(canPerform(['approver'], 'admin.read'), false);
  });

  it('viewer cannot approve or upload', () => {
    assert.equal(canPerform(['viewer'], 'invoice.approve'), false);
    assert.equal(canPerform(['viewer'], 'invoice.upload'), false);
    assert.equal(canPerform(['viewer'], 'invoice.read'), true);
  });

  it('tenant_admin can access admin metrics', () => {
    assert.equal(canPerform(['tenant_admin'], 'admin.read'), true);
    assert.equal(canPerform(['tenant_admin'], 'export.run'), true);
  });

  it('assertCanPerform throws for forbidden action', () => {
    assert.throws(() => assertCanPerform(['viewer'], 'invoice.approve'), /Forbidden/);
  });
});
