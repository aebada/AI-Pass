'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../connect.module.css';

type StatusPayload = {
  status: {
    configured: boolean;
    phoneNumberId?: string;
    graphVersion: string;
    sessions: number;
    inbox: number;
  };
  setup: {
    webhookPath: string;
    env: string[];
    docs: string;
  };
  inbox: { id: string; from: string; text?: string; timestamp: string }[];
};

export default function WhatsAppConnectPage() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/messaging/whatsapp/status');
      const json = (await res.json()) as StatusPayload;
      setStatus(json);
    } catch {
      setMsg('Could not load WhatsApp status.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function sendTest(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !text.trim()) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/v1/messaging/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to.trim(), text: text.trim() }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        stubbed?: boolean;
        externalId?: string;
        message?: string;
        error?: string;
      };
      if (json.success) {
        setMsg(
          json.stubbed
            ? `Stubbed (add Meta tokens to go live): ${json.message || ''}`
            : `Sent. id=${json.externalId}`,
        );
        setText('');
        await refresh();
      } else {
        setMsg(json.error || 'Send failed');
      }
    } catch {
      setMsg('Send request failed');
    } finally {
      setBusy(false);
    }
  }

  const configured = status?.status.configured;

  return (
    <WorkspaceLayoutClient
      title="WhatsApp twin channel"
      subtitle="Text your digital twin on WhatsApp — Instinct-style, no new app UI."
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <h2>Connect WhatsApp Cloud API</h2>
          <p>
            Like Instinct, the twin lives in the chats you already use. Meta WhatsApp Business Cloud
            API delivers inbound messages to AI-Pass and lets the twin reply, request approvals, and
            follow up.
          </p>
        </section>

        <section className={styles.steps} aria-label="Setup steps">
          <article className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <h3>Meta app</h3>
            <p>Create a WhatsApp product in Meta Developers and add a phone number.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <h3>Env secrets</h3>
            <p>Set access token, phone number id, and verify token on the host.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <h3>Webhook</h3>
            <p>
              Point Meta to{' '}
              <code>{status?.setup.webhookPath || '/api/v1/messaging/whatsapp/webhook'}</code>
            </p>
          </article>
        </section>

        <section className={styles.panel}>
          <h3>Connection status</h3>
          <p>
            {configured
              ? `Connected · phone ${status?.status.phoneNumberId} · Graph ${status?.status.graphVersion}`
              : 'Not configured yet — messages will stub until WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.'}
          </p>
          <p>
            Sessions: {status?.status.sessions ?? 0} · Inbox: {status?.status.inbox ?? 0}
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={() => void refresh()}>
              Refresh
            </button>
            <Link href="/workspace/connect" className={styles.btnGhost}>
              Back to Connect
            </Link>
            <a
              className={styles.btnGhost}
              href="https://developers.facebook.com/docs/whatsapp/cloud-api"
              target="_blank"
              rel="noreferrer"
            >
              Meta docs
            </a>
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Required environment</h3>
          <ul>
            {(status?.setup.env || [
              'WHATSAPP_ACCESS_TOKEN',
              'WHATSAPP_PHONE_NUMBER_ID',
              'WHATSAPP_VERIFY_TOKEN',
            ]).map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <h3>Send a twin message</h3>
          <form onSubmit={sendTest} className={styles.customForm}>
            <label>
              Recipient (E.164)
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="+491701234567"
                required
              />
            </label>
            <label>
              Message
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Your AI-Pass twin is online on WhatsApp."
                rows={3}
                required
              />
            </label>
            <button type="submit" className={styles.btn} disabled={busy}>
              {busy ? 'Sending…' : 'Send via WhatsApp API'}
            </button>
          </form>
          {msg ? <p className={styles.done}>{msg}</p> : null}
        </section>

        <section className={styles.panel}>
          <h3>Recent inbound</h3>
          {(status?.inbox?.length ?? 0) === 0 ? (
            <p>No inbound messages yet. Send a WhatsApp to your business number after webhook verify.</p>
          ) : (
            <ul>
              {status!.inbox.map((item) => (
                <li key={item.id}>
                  <strong>{item.from}</strong> — {item.text || '(non-text)'}{' '}
                  <span>({new Date(item.timestamp).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </WorkspaceLayoutClient>
  );
}
