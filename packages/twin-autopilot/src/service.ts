import { createId } from '@ai-pass/shared';
import { getWhatsAppCloudClient } from '@ai-pass/messaging-connectors';
import { INSTINCT_PARITY_FEATURES } from './features.js';
import type {
  AutopilotFeatureId,
  CloudComputerSession,
  ConciergeCallRequest,
  PaymentApproval,
  ProactiveTask,
  TrustedTwinPeer,
  TwinAutopilotProfile,
  TwinKind,
  VaultCredentialRef,
} from './types.js';

const DEFAULT_FEATURES: AutopilotFeatureId[] = INSTINCT_PARITY_FEATURES.map((f) => f.id);

export class TwinAutopilotService {
  private profiles = new Map<string, TwinAutopilotProfile>();
  private vault = new Map<string, VaultCredentialRef>();
  private peers = new Map<string, TrustedTwinPeer>();
  private calls: ConciergeCallRequest[] = [];
  private payments: PaymentApproval[] = [];
  private tasks: ProactiveTask[] = [];
  private computers = new Map<string, CloudComputerSession>();

  createTwin(params: {
    kind: TwinKind;
    displayName: string;
    channels?: TwinAutopilotProfile['channels'];
  }): TwinAutopilotProfile {
    const profile: TwinAutopilotProfile = {
      id: `twin_${createId()}`,
      kind: params.kind,
      displayName: params.displayName,
      channels: params.channels ?? ['whatsapp', 'email'],
      featuresEnabled: [...DEFAULT_FEATURES],
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(profile.id, profile);
    this.computers.set(profile.id, {
      id: `cc_${createId()}`,
      twinId: profile.id,
      status: 'stubbed',
      browser: true,
    });
    return profile;
  }

  listTwins(): TwinAutopilotProfile[] {
    return [...this.profiles.values()];
  }

  getTwin(id: string): TwinAutopilotProfile | undefined {
    return this.profiles.get(id);
  }

  addVaultRef(params: {
    twinId: string;
    label: string;
    service: string;
    secretRef: string;
  }): VaultCredentialRef {
    const ref: VaultCredentialRef = {
      id: `vault_${createId()}`,
      twinId: params.twinId,
      label: params.label,
      service: params.service,
      secretRef: params.secretRef,
      createdAt: new Date().toISOString(),
    };
    this.vault.set(ref.id, ref);
    return ref;
  }

  listVault(twinId?: string): VaultCredentialRef[] {
    const all = [...this.vault.values()];
    return twinId ? all.filter((v) => v.twinId === twinId) : all;
  }

  addTrustedPeer(params: {
    twinId: string;
    displayName: string;
    peerTwinId: string;
    channel?: TrustedTwinPeer['channel'];
    approved?: boolean;
  }): TrustedTwinPeer {
    const peer: TrustedTwinPeer = {
      id: `peer_${createId()}`,
      twinId: params.twinId,
      peerTwinId: params.peerTwinId,
      displayName: params.displayName,
      approved: params.approved ?? false,
      channel: params.channel ?? 'in_app',
      createdAt: new Date().toISOString(),
    };
    this.peers.set(peer.id, peer);
    return peer;
  }

  approveTrustedPeer(peerId: string): TrustedTwinPeer | null {
    const peer = this.peers.get(peerId);
    if (!peer) return null;
    peer.approved = true;
    return peer;
  }

  listTrustedPeers(twinId?: string): TrustedTwinPeer[] {
    const all = [...this.peers.values()];
    return twinId ? all.filter((p) => p.twinId === twinId) : all;
  }

  async messageTrustedPeer(params: {
    fromTwinId: string;
    peerId: string;
    text: string;
    whatsappTo?: string;
  }): Promise<{ ok: boolean; stubbed?: boolean; error?: string; externalId?: string }> {
    const peer = this.peers.get(params.peerId);
    if (!peer || peer.twinId !== params.fromTwinId) {
      return { ok: false, error: 'Peer not found' };
    }
    if (!peer.approved) {
      return { ok: false, error: 'Peer not approved — Trusted Twin gate blocked send' };
    }
    if (peer.channel === 'whatsapp' && params.whatsappTo) {
      const result = await getWhatsAppCloudClient().sendText({
        to: params.whatsappTo,
        body: `[Twin coordination] ${params.text}`,
      });
      return {
        ok: result.success,
        stubbed: result.stubbed,
        error: result.error,
        externalId: result.externalId,
      };
    }
    return { ok: true, stubbed: true, externalId: `coord_${createId()}` };
  }

  requestConciergeCall(params: {
    twinId: string;
    to: string;
    purpose: string;
    autoApprove?: boolean;
  }): ConciergeCallRequest {
    const call: ConciergeCallRequest = {
      id: `call_${createId()}`,
      twinId: params.twinId,
      to: params.to,
      purpose: params.purpose,
      status: params.autoApprove ? 'stubbed' : 'needs_approval',
      notes: params.autoApprove
        ? 'Voice provider not configured — queued as stub after approval path'
        : 'Waiting for human approval before dial',
      createdAt: new Date().toISOString(),
    };
    this.calls.unshift(call);
    return call;
  }

  approveConciergeCall(callId: string): ConciergeCallRequest | null {
    const call = this.calls.find((c) => c.id === callId);
    if (!call) return null;
    call.status = 'stubbed';
    call.notes = 'Approved — stub dial (attach Twilio/Voice provider to go live)';
    call.completedAt = new Date().toISOString();
    return call;
  }

  listConciergeCalls(twinId?: string): ConciergeCallRequest[] {
    return twinId ? this.calls.filter((c) => c.twinId === twinId) : [...this.calls];
  }

  requestPayment(params: {
    twinId: string;
    amountCents: number;
    currency?: string;
    merchant: string;
  }): PaymentApproval {
    const payment: PaymentApproval = {
      id: `pay_${createId()}`,
      twinId: params.twinId,
      amountCents: params.amountCents,
      currency: params.currency || 'EUR',
      merchant: params.merchant,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.payments.unshift(payment);
    return payment;
  }

  decidePayment(paymentId: string, approve: boolean): PaymentApproval | null {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return null;
    payment.status = approve ? 'approved' : 'denied';
    payment.decidedAt = new Date().toISOString();
    return payment;
  }

  listPayments(twinId?: string): PaymentApproval[] {
    return twinId ? this.payments.filter((p) => p.twinId === twinId) : [...this.payments];
  }

  enqueueProactive(params: {
    twinId: string;
    title: string;
    reason: string;
    dueAt?: string;
    channel?: ProactiveTask['channel'];
  }): ProactiveTask {
    const task: ProactiveTask = {
      id: `task_${createId()}`,
      twinId: params.twinId,
      title: params.title,
      reason: params.reason,
      dueAt: params.dueAt,
      channel: params.channel ?? 'whatsapp',
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(task);
    return task;
  }

  async notifyProactive(taskId: string, whatsappTo?: string): Promise<ProactiveTask | null> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    if (task.channel === 'whatsapp' && whatsappTo) {
      await getWhatsAppCloudClient().sendText({
        to: whatsappTo,
        body: `AI-Pass twin follow-up: ${task.title}\n${task.reason}`,
      });
    }
    task.status = 'notified';
    return task;
  }

  listProactive(twinId?: string): ProactiveTask[] {
    return twinId ? this.tasks.filter((t) => t.twinId === twinId) : [...this.tasks];
  }

  getCloudComputer(twinId: string): CloudComputerSession | undefined {
    return this.computers.get(twinId);
  }

  snapshot() {
    return {
      features: INSTINCT_PARITY_FEATURES,
      twins: this.listTwins(),
      vault: this.listVault(),
      trustedPeers: this.listTrustedPeers(),
      conciergeCalls: this.listConciergeCalls(),
      payments: this.listPayments(),
      proactive: this.listProactive(),
      whatsapp: getWhatsAppCloudClient().getStatus(),
    };
  }
}

let shared: TwinAutopilotService | null = null;

export function getTwinAutopilotService(): TwinAutopilotService {
  if (!shared) {
    shared = new TwinAutopilotService();
    // Seed demo personal + employee twins for workspace UI
    shared.createTwin({ kind: 'personal', displayName: 'Personal twin' });
    shared.createTwin({ kind: 'employee', displayName: 'Employee twin' });
  }
  return shared;
}
