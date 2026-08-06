import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_TENANT_ID } from '../demo-data.js';
import {
  resolveInvoiceAITenantId,
  shouldSeedDemoData,
} from '../tenant/resolve-tenant.js';
import { getInvoiceAIService, resetInvoiceAIServiceRegistry } from './service-registry.js';

describe('InvoiceAIServiceRegistry', () => {
  beforeEach(() => {
    resetInvoiceAIServiceRegistry();
  });

  it('new tenant service has zero invoices', () => {
    const service = getInvoiceAIService('tenant_new_user_123');
    assert.equal(service.listInvoices('tenant_new_user_123').length, 0);
    assert.equal(service.listVendors('tenant_new_user_123').length, 0);
  });

  it('demo tenant has seeded data when demo mode is active', () => {
    const prev = process.env.NEXT_PUBLIC_INVOICE_AI_DEMO;
    process.env.NEXT_PUBLIC_INVOICE_AI_DEMO = '1';
    try {
      resetInvoiceAIServiceRegistry();
      const service = getInvoiceAIService(DEMO_TENANT_ID);
      assert.ok(service.listInvoices(DEMO_TENANT_ID).length >= 5);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_INVOICE_AI_DEMO;
      else process.env.NEXT_PUBLIC_INVOICE_AI_DEMO = prev;
    }
  });

  it('demo@example.com maps to demo tenant with seeded data', () => {
    resetInvoiceAIServiceRegistry();
    const tenantId = resolveInvoiceAITenantId({
      id: 'user_abc',
      email: 'demo@example.com',
      workspace: 'default',
    });
    assert.equal(tenantId, DEMO_TENANT_ID);
    const service = getInvoiceAIService(tenantId, { email: 'demo@example.com' });
    assert.ok(service.listInvoices(DEMO_TENANT_ID).length >= 5);
  });

  it('resolveInvoiceAITenantId uses user id for generic workspace', () => {
    const tenantId = resolveInvoiceAITenantId({
      id: 'usr_42',
      email: 'alice@company.com',
      workspace: 'default',
    });
    assert.equal(tenantId, 'tenant_usr_42');
  });

  it('shouldSeedDemoData is false for new tenants without demo env', () => {
    const prev = process.env.NEXT_PUBLIC_INVOICE_AI_DEMO;
    delete process.env.NEXT_PUBLIC_INVOICE_AI_DEMO;
    try {
      assert.equal(shouldSeedDemoData('tenant_usr_42'), false);
      assert.equal(shouldSeedDemoData(DEMO_TENANT_ID), false);
    } finally {
      if (prev !== undefined) process.env.NEXT_PUBLIC_INVOICE_AI_DEMO = prev;
    }
  });
});
