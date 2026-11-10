import { createId } from '@ai-pass/shared';
import type { Supplier } from '../types.js';

export class SupplierService {
  private suppliers = new Map<string, Supplier>();

  create(params: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const supplier: Supplier = {
      ...params,
      id: `sup_${createId()}`,
      createdAt: new Date().toISOString(),
    };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  get(id: string): Supplier | undefined {
    return this.suppliers.get(id);
  }

  getByName(name: string): Supplier | undefined {
    return [...this.suppliers.values()].find((s) => s.name.toLowerCase() === name.toLowerCase());
  }

  list(tenantId: string): Supplier[] {
    return [...this.suppliers.values()].filter((s) => s.tenantId === tenantId);
  }

  seed(suppliers: Supplier[]): void {
    for (const s of suppliers) this.suppliers.set(s.id, s);
  }
}
