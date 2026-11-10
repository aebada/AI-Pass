export type ActionType =
  | 'browser_navigate'
  | 'browser_click'
  | 'form_fill'
  | 'portal_login'
  | 'file_upload'
  | 'file_download'
  | 'screenshot'
  | 'desktop_automation_stub';

export type ActionMode = 'live' | 'simulation';

export interface ActionRequest {
  type: ActionType;
  target?: string;
  params?: Record<string, unknown>;
  mode?: ActionMode;
  userId: string;
  tenantId: string;
}

export interface ActionAuditEntry {
  id: string;
  actionType: ActionType;
  userId: string;
  tenantId: string;
  mode: ActionMode;
  approved: boolean;
  success: boolean;
  timestamp: string;
  details: Record<string, unknown>;
  rollbackAvailable: boolean;
}

export interface ActionSecurityPolicy {
  whitelist: ActionType[];
  requireApproval: ActionType[];
  simulationOnly: boolean;
  emergencyStop: boolean;
}

export const DEFAULT_ACTION_POLICY: ActionSecurityPolicy = {
  whitelist: [
    'browser_navigate',
    'browser_click',
    'form_fill',
    'portal_login',
    'file_upload',
    'file_download',
    'screenshot',
    'desktop_automation_stub',
  ],
  requireApproval: ['portal_login', 'file_upload', 'desktop_automation_stub'],
  simulationOnly: true,
  emergencyStop: false,
};
