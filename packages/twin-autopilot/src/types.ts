/** Instinct-parity twin autopilot capabilities — first-party AI-Pass. */

export type TwinKind = 'personal' | 'employee' | 'business' | 'robotics';

export type AutopilotFeatureId =
  | 'chat_channels'
  | 'cloud_computer'
  | 'secure_vault'
  | 'proactive_followups'
  | 'concierge_calls'
  | 'trusted_twins'
  | 'payment_gates'
  | 'group_coordination'
  | 'connectors'
  | 'approval_gates';

export type VaultCredentialRef = {
  id: string;
  label: string;
  service: string;
  /** Never store raw secrets here — pointer to host secret / vault backend */
  secretRef: string;
  twinId: string;
  createdAt: string;
};

export type TrustedTwinPeer = {
  id: string;
  displayName: string;
  /** Owner twin */
  twinId: string;
  /** Peer twin being trusted */
  peerTwinId: string;
  channel?: 'whatsapp' | 'sms' | 'in_app';
  approved: boolean;
  createdAt: string;
};

export type ConciergeCallRequest = {
  id: string;
  to: string;
  purpose: string;
  twinId: string;
  status: 'queued' | 'calling' | 'completed' | 'failed' | 'needs_approval' | 'stubbed';
  notes?: string;
  createdAt: string;
  completedAt?: string;
};

export type PaymentApproval = {
  id: string;
  twinId: string;
  amountCents: number;
  currency: string;
  merchant: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  createdAt: string;
  decidedAt?: string;
};

export type ProactiveTask = {
  id: string;
  twinId: string;
  title: string;
  reason: string;
  dueAt?: string;
  status: 'open' | 'notified' | 'done' | 'snoozed';
  channel?: 'whatsapp' | 'sms' | 'email' | 'in_app';
  createdAt: string;
};

export type CloudComputerSession = {
  id: string;
  twinId: string;
  status: 'ready' | 'busy' | 'offline' | 'stubbed';
  browser: boolean;
  lastActionAt?: string;
};

export type TwinAutopilotProfile = {
  id: string;
  kind: TwinKind;
  displayName: string;
  channels: Array<'whatsapp' | 'sms' | 'email' | 'voice'>;
  featuresEnabled: AutopilotFeatureId[];
  createdAt: string;
};
