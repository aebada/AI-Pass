import type { RoleId } from './types.js';

export interface RolePolicy {
  id: RoleId;
  label: string;
  canSeePatientLevel: boolean;
  canSeeStaffNames: boolean;
  allowedScopes: Array<'all' | 'ed' | 'supply' | 'equipment' | 'staffing' | 'capacity' | 'config'>;
}

export const ROLE_POLICIES: RolePolicy[] = [
  {
    id: 'ceo',
    label: 'CEO / Executive',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['all'],
  },
  {
    id: 'medical_director',
    label: 'Medical Director',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['all', 'ed', 'capacity'],
  },
  {
    id: 'nursing_supervisor',
    label: 'Nursing Supervisor',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['capacity', 'staffing', 'ed'],
  },
  {
    id: 'ed_lead',
    label: 'ED Lead',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['ed', 'capacity'],
  },
  {
    id: 'coo',
    label: 'COO / Operations',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['all', 'supply', 'equipment', 'capacity', 'staffing'],
  },
  {
    id: 'pharmacy_manager',
    label: 'Supply / Pharmacy Manager',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['supply'],
  },
  {
    id: 'maintenance_lead',
    label: 'Maintenance Lead',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['equipment'],
  },
  {
    id: 'wall_display',
    label: 'Wall display',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['capacity', 'ed'],
  },
  {
    id: 'admin',
    label: 'Admin',
    canSeePatientLevel: false,
    canSeeStaffNames: false,
    allowedScopes: ['config'],
  },
];

export function canAccessScope(role: RoleId, scope: RolePolicy['allowedScopes'][number]): boolean {
  const policy = ROLE_POLICIES.find((r) => r.id === role);
  if (!policy) return false;
  if (policy.allowedScopes.includes('all')) return scope !== 'config' || role === 'admin';
  return policy.allowedScopes.includes(scope);
}

/** Pharmacy manager asking for ICU staffing detail → polite refusal (demo script D2.8). */
export function refuseIfNeeded(role: RoleId, intentId: string): string | null {
  if (role === 'pharmacy_manager' && (intentId === 'staffing' || intentId === 'handover')) {
    return 'Your Pharmacy Manager role can view supply and pharmacy stock, not ICU staffing detail. Switch role or request elevated access with a recorded purpose.';
  }
  if (role === 'wall_display' && intentId === 'drill') {
    return 'Wall display is read-only on pre-approved boards — identified drill-down is blocked.';
  }
  if (role === 'admin' && intentId !== 'overview' && intentId !== 'alerts') {
    return 'Admin configures the twin; operational data content is limited by default.';
  }
  return null;
}
