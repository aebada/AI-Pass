/** Tamper-evident audit trail (hash chain) for POC — SP-04. */

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  detail: string;
  prevHash: string;
  hash: string;
}

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export class AuditLog {
  private entries: AuditEntry[] = [];

  append(actor: string, action: string, detail: string): AuditEntry {
    const prevHash = this.entries.at(-1)?.hash ?? 'genesis';
    const ts = new Date().toISOString();
    const id = `aud_${this.entries.length + 1}`;
    const payload = `${prevHash}|${ts}|${actor}|${action}|${detail}`;
    const hash = fnv1a(payload);
    const entry: AuditEntry = { id, ts, actor, action, detail, prevHash, hash };
    this.entries.push(entry);
    return entry;
  }

  list(): AuditEntry[] {
    return [...this.entries];
  }

  verify(): { ok: boolean; breakAt?: string } {
    let prev = 'genesis';
    for (const e of this.entries) {
      if (e.prevHash !== prev) return { ok: false, breakAt: e.id };
      const payload = `${e.prevHash}|${e.ts}|${e.actor}|${e.action}|${e.detail}`;
      if (fnv1a(payload) !== e.hash) return { ok: false, breakAt: e.id };
      prev = e.hash;
    }
    return { ok: true };
  }

  /** Detect tampering if an entry body is altered after the fact. */
  detectTamper(mutated: AuditEntry[]): boolean {
    let prev = 'genesis';
    for (const e of mutated) {
      const payload = `${e.prevHash}|${e.ts}|${e.actor}|${e.action}|${e.detail}`;
      if (e.prevHash !== prev || fnv1a(payload) !== e.hash) return true;
      prev = e.hash;
    }
    return false;
  }
}
