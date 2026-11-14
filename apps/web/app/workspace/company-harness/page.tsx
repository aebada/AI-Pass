'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import {
  HARNESS_AGENTS,
  HARNESS_LAYERS,
  HARNESS_SAFETY,
  HARNESS_MEMORY,
  HARNESS_OUTCOMES,
  HARNESS_TRIGGERS,
  type HarnessSession,
  fireTrigger,
  routeMessage,
} from '../../lib/company-harness';
import styles from './harness.module.css';

type ChatItem = { role: 'user' | 'agent'; text: string };

export default function CompanyHarnessPage() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatItem[]>([
    {
      role: 'agent',
      text: 'I am My AI-Pass — the company harness router. Tell me what to do. I hand work to specialist agents in the background.',
    },
  ]);
  const [sessions, setSessions] = useState<HarnessSession[]>([]);
  const [triggers, setTriggers] = useState(HARNESS_TRIGGERS);
  const [outcomes, setOutcomes] = useState(HARNESS_OUTCOMES);

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    const message = input.trim();
    if (!message) return;
    const routed = routeMessage(message);
    setChat((prev) => [...prev, { role: 'user', text: message }, { role: 'agent', text: routed.reply }]);
    setSessions((prev) => [
      routed.session,
      ...routed.handoffs.map((h, i) => ({
        id: `${routed.session.id}-${i}`,
        agentId: h.agentId,
        title: h.task,
        lastEvent: 'background hand-off',
        computer: 'awake' as const,
      })),
      ...prev,
    ]);
    setInput('');
  }

  function runTrigger(id: string) {
    const trigger = triggers.find((t) => t.id === id);
    if (!trigger || !trigger.enabled) return;
    const session = fireTrigger(trigger);
    setSessions((prev) => [session, ...prev]);
    setChat((prev) => [
      ...prev,
      {
        role: 'agent',
        text: `Trigger “${trigger.name}” fired. Woke ${HARNESS_AGENTS.find((a) => a.id === trigger.agentId)?.name ?? 'agent'} on its own session computer.`,
      },
    ]);
  }

  function advanceOutcome(id: string) {
    setOutcomes((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next =
          o.status === 'open' ? 'working' : o.status === 'working' ? 'verify' : o.status === 'verify' ? 'done' : 'done';
        return { ...o, status: next };
      }),
    );
  }

  return (
    <WorkspaceLayoutClient
      title="Company Harness"
      subtitle="Model harness for companies — always-on agents, company as code, one router that never blocks."
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <h2>Your company as an operating system</h2>
          <p>
            Talk to My AI-Pass. It routes to specialist agents on their own sessions. Triggers start
            work from schedules, webhooks, and connectors. Skills and memory live as company-as-code.
            Changes land only after a human approves.
          </p>
        </section>

        <section className={styles.steps} aria-label="How to use the harness">
          <article className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <h3>Talk to My AI-Pass</h3>
            <p>One inbox. It answers now and hands work off.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <h3>Let triggers run</h3>
            <p>Events start agents with nobody at the keyboard.</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <h3>Track outcomes</h3>
            <p>Goals with a definition of done and a verifier.</p>
          </article>
        </section>

        <section className={styles.panel}>
          <h3>1) My AI-Pass — talk once, swarm in parallel</h3>
          <div className={styles.chat}>
            <div className={styles.chatLog} aria-live="polite">
              {chat.map((item, i) => (
                <div key={`${item.role}-${i}`} className={item.role === 'user' ? styles.bubbleUser : styles.bubbleAgent}>
                  {item.text}
                </div>
              ))}
            </div>
            <form className={styles.chatRow} onSubmit={send}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Chase overdue invoices and refresh the enterprise pipeline brief"
                aria-label="Message My AI-Pass"
              />
              <button type="submit" className={styles.btn}>
                Send
              </button>
            </form>
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Agents in the harness</h3>
          <div className={styles.grid2}>
            {HARNESS_AGENTS.map((agent) => (
              <article key={agent.id} className={styles.card}>
                <strong>{agent.name}</strong>
                <p>{agent.job}</p>
                <p className={styles.meta}>Skills: {agent.skills.join(', ')}</p>
                <span className={styles.status}>{agent.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h3>2) Triggers — start work without waiting</h3>
          <div className={styles.list}>
            {triggers.map((t) => (
              <div key={t.id} className={styles.row}>
                <div>
                  <strong>{t.name}</strong>
                  <p className={styles.meta}>
                    {t.kind} · {t.filter} · → {HARNESS_AGENTS.find((a) => a.id === t.agentId)?.name}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() =>
                      setTriggers((prev) => prev.map((x) => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)))
                    }
                  >
                    {t.enabled ? 'On' : 'Off'}
                  </button>
                  <button type="button" className={styles.btnTiny} disabled={!t.enabled} onClick={() => runTrigger(t.id)}>
                    Fire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Live sessions</h3>
          {sessions.length === 0 ? (
            <p className={styles.meta}>No sessions yet. Send a message or fire a trigger.</p>
          ) : (
            <div className={styles.list}>
              {sessions.slice(0, 8).map((s) => (
                <div key={s.id} className={styles.row}>
                  <div>
                    <strong>{s.title}</strong>
                    <p className={styles.meta}>
                      {HARNESS_AGENTS.find((a) => a.id === s.agentId)?.name} · {s.lastEvent}
                    </p>
                  </div>
                  <span className={styles.status}>{s.computer}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <h3>3) Outcomes — definition of done</h3>
          <div className={styles.list}>
            {outcomes.map((o) => (
              <div key={o.id} className={styles.row}>
                <div>
                  <strong>{o.goal}</strong>
                  <p className={styles.meta}>Done when: {o.doneWhen}</p>
                  <span className={styles.status}>{o.status}</span>
                </div>
                <button
                  type="button"
                  className={styles.btnTiny}
                  disabled={o.status === 'done'}
                  onClick={() => advanceOutcome(o.id)}
                >
                  Advance
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Company as code — memory & skills</h3>
          <div className={styles.grid2}>
            {HARNESS_MEMORY.map((f) => (
              <article key={f.path} className={styles.card}>
                <strong>{f.title}</strong>
                <p className={styles.meta}>{f.path}</p>
                <p>{f.summary}</p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/workspace/connect" className={styles.btnGhost}>
              Connect company tools
            </Link>
            <Link href="/workspace/graph-builder" className={styles.btnGhost}>
              Build twin knowledge graph
            </Link>
            <Link href="/workspace/agents" className={styles.btn}>
              Open Agent Studio
            </Link>
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Harness layers</h3>
          <div className={styles.layers}>
            {HARNESS_LAYERS.map((layer) => (
              <div key={layer.title} className={styles.layer}>
                <strong>{layer.title}</strong>
                <span>{layer.copy}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Runtime safety</h3>
          <div className={styles.layers}>
            {HARNESS_SAFETY.map((item) => (
              <div key={item.id} className={styles.layer}>
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceLayoutClient>
  );
}
