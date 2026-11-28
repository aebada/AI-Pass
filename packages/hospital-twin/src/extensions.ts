/** Tenant extensions: add floors/units and supply-chain records to the live twin. */
import type {
  Bed,
  DepartmentType,
  HospitalState,
  PurchaseOrder,
  StockItem,
  Supplier,
  Unit,
} from './types.js';

export interface AddFloorUnitInput {
  floor: number;
  code: string;
  name: string;
  specialty?: string;
  beds: number;
  departmentType?: DepartmentType;
}

export interface AddSupplyItemInput {
  sku: string;
  name: string;
  category: StockItem['category'];
  quantity: number;
  reorderPoint?: number;
  leadTimeDays?: number;
  criticality?: StockItem['criticality'];
  dailyUse?: number;
  supplierName?: string;
}

function slug(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '-').replace(/-+/g, '-');
}

export function addFloorUnit(state: HospitalState, input: AddFloorUnitInput): Unit {
  const code = slug(input.code || `FL${input.floor}-U`);
  if (state.units.some((u) => u.code === code)) {
    throw new Error(`Unit code ${code} already exists`);
  }
  const beds = Math.max(1, Math.min(80, Math.floor(input.beds) || 10));
  const deptType = input.departmentType ?? 'Ward';
  let dept = state.departments.find((d) => d.type === deptType);
  if (!dept) {
    dept = {
      id: `dep_ext_${deptType.toLowerCase()}`,
      code: deptType.slice(0, 4).toUpperCase(),
      name: `${deptType} (extended)`,
      type: deptType,
      staffedBeds: 0,
    };
    state.departments.push(dept);
  }
  const unitId = `unit_${code.toLowerCase()}`;
  const unit: Unit = {
    id: unitId,
    code,
    name: input.name.trim() || code,
    departmentId: dept.id,
    specialty: (input.specialty || 'general').toLowerCase(),
    staffedBeds: beds,
    floor: input.floor,
  };
  state.units.push(unit);
  dept.staffedBeds += beds;
  state.site.licensedBeds += beds;

  for (let i = 1; i <= beds; i += 1) {
    const roomId = `room_${code}_${Math.ceil(i / 2)}`;
    if (!state.rooms.find((r) => r.id === roomId)) {
      state.rooms.push({
        id: roomId,
        code: `${code}-R${Math.ceil(i / 2)}`,
        unitId,
        roomType: 'double',
      });
    }
    const status: Bed['status'] = i % 5 === 0 ? 'available' : i % 7 === 0 ? 'cleaning' : 'occupied';
    state.beds.push({
      id: `bed_${code}_${i}`,
      code: `${code}-${String(i).padStart(2, '0')}`,
      roomId,
      unitId,
      bedType: unit.specialty.includes('icu') ? 'ICU' : 'standard',
      status,
      lastStatusChange: state.simClock,
    });
  }

  state.scenarioTimeline.push({
    ts: state.simClock,
    event: `Extended twin: unit ${code} on floor ${input.floor} (${beds} beds)`,
  });
  return unit;
}

export function addSupplyItem(state: HospitalState, input: AddSupplyItemInput): StockItem {
  const sku = slug(input.sku || `SKU-${state.items.length + 1}`);
  if (state.items.some((i) => i.sku === sku)) {
    throw new Error(`SKU ${sku} already exists`);
  }
  const id = `item_ext_${sku.toLowerCase()}`;
  const item: StockItem = {
    id,
    sku,
    name: input.name.trim() || sku,
    category: input.category,
    reorderPoint: input.reorderPoint ?? Math.max(5, Math.floor(input.quantity / 4)),
    leadTimeDays: input.leadTimeDays ?? 5,
    criticality: input.criticality ?? 'medium',
    dailyUse: input.dailyUse ?? Math.max(1, Math.floor(input.quantity / 30)),
  };
  state.items.push(item);
  state.stock.push({
    itemId: id,
    locationId: item.category === 'oxygen' ? 'dep_fac' : 'dep_pharm',
    quantity: Math.max(0, input.quantity),
    asOf: state.simClock,
  });

  let supplier = state.suppliers[0];
  if (input.supplierName?.trim()) {
    const existing = state.suppliers.find(
      (s) => s.name.toLowerCase() === input.supplierName!.trim().toLowerCase(),
    );
    if (existing) {
      supplier = existing;
    } else {
      supplier = {
        id: `sup_ext_${state.suppliers.length + 1}`,
        name: input.supplierName.trim(),
        leadTimeDays: item.leadTimeDays,
        onTimeRate: 0.9,
      };
      state.suppliers.push(supplier);
    }
  }

  if (input.quantity <= item.reorderPoint) {
    const po: PurchaseOrder = {
      id: `po_ext_${state.purchaseOrders.length + 1}`,
      supplierId: supplier.id,
      itemId: id,
      qty: item.reorderPoint * 2,
      expectedDate: new Date(new Date(state.simClock).getTime() + item.leadTimeDays * 86_400_000).toISOString(),
      status: 'draft',
    };
    state.purchaseOrders.push(po);
  }

  state.scenarioTimeline.push({
    ts: state.simClock,
    event: `Extended supply: ${item.name} (${sku}) qty=${input.quantity}`,
  });
  return item;
}

export function listExtensions(state: HospitalState): {
  floors: number[];
  units: { code: string; name: string; floor: number; beds: number }[];
  supply: { sku: string; name: string; quantity: number; category: string }[];
  suppliers: { id: string; name: string }[];
} {
  return {
    floors: [...new Set(state.units.map((u) => u.floor))].sort((a, b) => a - b),
    units: state.units.map((u) => ({
      code: u.code,
      name: u.name,
      floor: u.floor,
      beds: u.staffedBeds,
    })),
    supply: state.items.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: state.stock.find((s) => s.itemId === item.id)?.quantity ?? 0,
      category: item.category,
    })),
    suppliers: state.suppliers.map((s) => ({ id: s.id, name: s.name })),
  };
}
