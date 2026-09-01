'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { DEMO_MAILTO, FOOTER_COLUMNS } from '../lib/site-nav';
import pageStyles from '../page.module.css';
import styles from './demo.module.css';

type ScenarioId = 'route' | 'govern' | 'trust' | 'store' | 'savings';

type Scenario = {
  id: ScenarioId;
  label: string;
  title: string;
  value: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'route',
    label: '1 · Route',
    title: 'Dynamic AI routing',
    value: 'Cut inference cost while keeping privacy and compliance objectives.',
  },
  {
    id: 'govern',
    label: '2 · Govern',
    title: 'Approval before action',
    value: 'High-risk agent steps pause for human review — with full audit trail.',
  },
  {
    id: 'trust',
    label: '3 · Trust',
    title: 'Bronze → Platinum',
    value: 'Raise Trust, Risk, and Compliance scores as controls deepen.',
  },
  {
    id: 'store',
    label: '4 · Store',
    title: 'Enterprise App Store',
    value: 'Install only compliance-cleared apps into a private catalog.',
  },
  {
    id: 'savings',
    label: '5 · Savings',
    title: 'One wallet, measurable ROI',
    value: 'Replace fragmented provider spend with routed, metered infrastructure.',
  },
];

const LEVELS = ['bronze', 'silver', 'gold', 'platinum'] as const;

export function DemoExperience() {
  const [scenario, setScenario] = useState<ScenarioId>('route');
  const [preferCost, setPreferCost] = useState(true);
  const [preferPrivacy, setPreferPrivacy] = useState(false);
  const [preferLocal, setPreferLocal] = useState(false);
  const [preferCompliance, setPreferCompliance] = useState(false);
  const [approval, setApproval] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [trustLevel, setTrustLevel] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [installGate, setInstallGate] = useState(false);
  const [savingsRunning, setSavingsRunning] = useState(false);
  const [savingsPct, setSavingsPct] = useState(0);
  const [tourPulse, setTourPulse] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTourPulse((n) => n + 1), 4000);
    return () => window.clearInterval(t);
  }, []);

  const routeModel = preferLocal
    ? { name: 'Ollama Llama 3.2', cost: 0, latency: 48, place: 'Air-gapped' }
    : preferPrivacy
      ? { name: 'Private VPC Claude', cost: 4.2, latency: 210, place: 'Private cloud' }
      : preferCompliance
        ? { name: 'GPT-5 Enterprise', cost: 9.8, latency: 320, place: 'Compliant region' }
        : preferCost
          ? { name: 'Gemini Flash', cost: 1.1, latency: 90, place: 'Cloud' }
          : { name: 'Claude Sonnet 4', cost: 6.4, latency: 180, place: 'Cloud' };

  const trustScore = 62 + trustLevel * 11;
  const riskScore = Math.max(12, 48 - trustLevel * 10);
  const complianceScore = 70 + trustLevel * 7;

  const fragmented = 18400;
  const routed = Math.round(fragmented * (1 - savingsPct / 100));
  const saved = fragmented - routed;

  function runSavings() {
    setSavingsRunning(true);
    setSavingsPct(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 4;
      if (n >= 34) {
        n = 34;
        window.clearInterval(id);
        setSavingsRunning(false);
      }
      setSavingsPct(n);
    }, 70);
  }

  function go(id: ScenarioId) {
    startTransition(() => setScenario(id));
  }

  const active = SCENARIOS.find((s) => s.id === scenario)!;

  return (
    <div className={pageStyles.page}>
      <PremiumNav variant="landing" />

      <header className={`${styles.hero} hero-presence`}>
        <p className={styles.eyebrow}>Interactive demo</p>
        <h1 className={styles.brand}>AI-Pass</h1>
        <p className={styles.headline}>See the infrastructure work — not a slide deck.</p>
        <p className={styles.sub}>
          Click through routing, governance, trust certification, the Enterprise App Store, and wallet
          savings. Built for Government, Defence, private cloud, hybrid, and air-gapped estates.
        </p>
        <div className={styles.heroCtas}>
          <button type="button" className={styles.btnPrimary} onClick={() => go('route')}>
            Start interactive tour
          </button>
          <a href={DEMO_MAILTO} className={styles.btnSecondary}>
            Book Enterprise Demo
          </a>
          <Link href="/login" className={styles.btnSecondary}>
            Start Free
          </Link>
        </div>
      </header>

      <section className={styles.stage} aria-label="Interactive platform demo">
        <nav className={styles.steps} aria-label="Demo scenarios">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.step} ${scenario === s.id ? styles.stepActive : ''} ${tourPulse % SCENARIOS.length === i && scenario !== s.id ? styles.stepHint : ''}`}
              onClick={() => go(s.id)}
            >
              <span className={styles.stepLabel}>{s.label}</span>
              <span className={styles.stepTitle}>{s.title}</span>
            </button>
          ))}
        </nav>

        <div className={styles.panelGrid}>
          <div className={`${styles.panel} reveal`} key={scenario}>
            <p className={styles.panelEyebrow}>{active.label}</p>
            <h2 className={styles.panelTitle}>{active.title}</h2>
            <p className={styles.panelValue}>{active.value}</p>

            {scenario === 'route' && (
              <div className={styles.interactive}>
                <p className={styles.prompt}>Tune routing objectives — selection updates live.</p>
                <div className={styles.toggles}>
                  {(
                    [
                      ['Cost', preferCost, setPreferCost],
                      ['Privacy', preferPrivacy, setPreferPrivacy],
                      ['Compliance', preferCompliance, setPreferCompliance],
                      ['Local / air-gapped', preferLocal, setPreferLocal],
                    ] as const
                  ).map(([label, value, setter]) => (
                    <button
                      key={label}
                      type="button"
                      className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
                      aria-pressed={value}
                      onClick={() => setter(!value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.resultTop}>
                    <strong>{routeModel.name}</strong>
                    <span>{routeModel.place}</span>
                  </div>
                  <dl className={styles.metrics}>
                    <div>
                      <dt>Est. $/1M</dt>
                      <dd>${routeModel.cost.toFixed(1)}</dd>
                    </div>
                    <div>
                      <dt>Latency</dt>
                      <dd>{routeModel.latency}ms</dd>
                    </div>
                    <div>
                      <dt>Mode</dt>
                      <dd>{preferLocal ? 'On-prem' : 'Routed'}</dd>
                    </div>
                  </dl>
                </div>
                <Link href="/workspace/providers" className={styles.inlineLink}>
                  Open full Routing Lab →
                </Link>
              </div>
            )}

            {scenario === 'govern' && (
              <div className={styles.interactive}>
                <div className={styles.approvalCard}>
                  <div className={styles.approvalMeta}>
                    <span className={styles.risk}>High risk</span>
                    <span>Finance Agent · Vendor payment $48,200</span>
                  </div>
                  <p className={styles.approvalBody}>
                    Policy G-ACT 091 requires dual approval before funds leave the treasury wallet.
                    Inventory: Invoice AI · Provider: Private VPC · Clearance: Restricted.
                  </p>
                  <div className={styles.approvalActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={approval !== 'pending'}
                      onClick={() => setApproval('approved')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      disabled={approval !== 'pending'}
                      onClick={() => setApproval('rejected')}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => setApproval('pending')}
                    >
                      Reset
                    </button>
                  </div>
                  {approval !== 'pending' && (
                    <p className={styles.approvalStatus} data-state={approval}>
                      {approval === 'approved'
                        ? 'Approved — execution resumed. Audit event written.'
                        : 'Rejected — agent halted. Risk register updated.'}
                    </p>
                  )}
                </div>
                <Link href="/workspace/governance" className={styles.inlineLink}>
                  Open Governance Center →
                </Link>
              </div>
            )}

            {scenario === 'trust' && (
              <div className={styles.interactive}>
                <p className={styles.prompt}>Advance certification level and watch scores move.</p>
                <div className={styles.ladder}>
                  {LEVELS.map((level, i) => (
                    <button
                      key={level}
                      type="button"
                      className={`${styles.level} ${styles[`level_${level}`]} ${trustLevel === i ? styles.levelActive : ''}`}
                      onClick={() => setTrustLevel(i)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <dl className={styles.scoreRow}>
                  <div>
                    <dt>Trust</dt>
                    <dd>{trustScore}</dd>
                  </div>
                  <div>
                    <dt>Risk</dt>
                    <dd>{riskScore}</dd>
                  </div>
                  <div>
                    <dt>Compliance</dt>
                    <dd>{complianceScore}%</dd>
                  </div>
                </dl>
                <Link href="/workspace/trust" className={styles.inlineLink}>
                  Open Trust Center →
                </Link>
              </div>
            )}

            {scenario === 'store' && (
              <div className={styles.interactive}>
                <div className={styles.storeCard}>
                  <div className={styles.storeHeader}>
                    <div className={styles.storeLogo} aria-hidden>
                      IN
                    </div>
                    <div>
                      <strong>Invoice AI</strong>
                      <p>Enterprise Ready · ISO 42001 · SOC 2</p>
                    </div>
                  </div>
                  <ul className={styles.storeList}>
                    <li>Private catalog gate</li>
                    <li>Wallet metering on every run</li>
                    <li>Trust Gold minimum for install</li>
                  </ul>
                  {!installed ? (
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => {
                        if (!installGate) {
                          setInstallGate(true);
                          return;
                        }
                        setInstalled(true);
                      }}
                    >
                      {installGate ? 'Confirm compliance install' : 'Install to estate'}
                    </button>
                  ) : (
                    <p className={styles.approvalStatus} data-state="approved">
                      Installed — available in Workspace with governance policies attached.
                    </p>
                  )}
                  {installGate && !installed && (
                    <p className={styles.prompt}>
                      Compliance check passed. Confirm to place Invoice AI in the private Enterprise App Store.
                    </p>
                  )}
                </div>
                <Link href="/workspace/store" className={styles.inlineLink}>
                  Open Enterprise App Store →
                </Link>
              </div>
            )}

            {scenario === 'savings' && (
              <div className={styles.interactive}>
                <p className={styles.prompt}>Simulate consolidating five provider bills into AI-Pass Wallet.</p>
                <div className={styles.savingsGrid}>
                  <div className={styles.savingsCol}>
                    <span>Fragmented spend</span>
                    <strong>${fragmented.toLocaleString()}</strong>
                  </div>
                  <div className={styles.savingsCol}>
                    <span>Routed + Wallet</span>
                    <strong>${routed.toLocaleString()}</strong>
                  </div>
                  <div className={styles.savingsColAccent}>
                    <span>Monthly savings</span>
                    <strong>${saved.toLocaleString()}</strong>
                    <em>{savingsPct}% via routing</em>
                  </div>
                </div>
                <div className={styles.barTrack} aria-hidden>
                  <div className={styles.barFill} style={{ width: `${savingsPct}%` }} />
                </div>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={runSavings}
                  disabled={savingsRunning}
                >
                  {savingsRunning ? 'Calculating…' : savingsPct > 0 ? 'Run again' : 'Calculate savings'}
                </button>
                <Link href="/workspace/membership" className={styles.inlineLink}>
                  Open pricing & ROI calculators →
                </Link>
              </div>
            )}
          </div>

          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Live value signals</h3>
            <ul className={styles.signalList}>
              <li>
                <span>Routing posture</span>
                <strong>{routeModel.place}</strong>
              </li>
              <li>
                <span>Governance</span>
                <strong>
                  {approval === 'pending' ? 'Awaiting review' : approval === 'approved' ? 'Cleared' : 'Blocked'}
                </strong>
              </li>
              <li>
                <span>Trust level</span>
                <strong style={{ textTransform: 'capitalize' }}>{LEVELS[trustLevel]}</strong>
              </li>
              <li>
                <span>Store</span>
                <strong>{installed ? '1 app installed' : 'Catalog gated'}</strong>
              </li>
              <li>
                <span>Est. monthly save</span>
                <strong>${saved.toLocaleString()}</strong>
              </li>
            </ul>
            <div className={styles.sidebarCta}>
              <p>Ready for a guided enterprise walkthrough?</p>
              <a href={DEMO_MAILTO} className={styles.btnPrimary}>
                Book Enterprise Demo
              </a>
              <Link href="/workspace" className={styles.btnSecondary}>
                Enter Workspace
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.valueStrip}>
        <h2 className={styles.valueTitle}>What the platform brings</h2>
        <div className={styles.valueGrid}>
          {[
            ['Lower AI cost', 'Multi-objective routing across cloud and local models.'],
            ['Governed execution', 'Approvals, inventory, risk, and audit in the path.'],
            ['Assured trust', 'Bronze→Platinum certification with live scores.'],
            ['Enterprise distribution', 'Private App Store for regulated estates.'],
            ['One economic plane', 'Wallet metering instead of five provider invoices.'],
            ['Sovereign ready', 'Private cloud, hybrid, and air-gapped patterns.'],
          ].map(([title, body]) => (
            <article key={title} className={styles.valueItem}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={pageStyles.footer}>
        <div className={pageStyles.footerTop}>
          <BrandLogoLink className={pageStyles.logo} logoClassName={pageStyles.logoImg} />
          <p className={pageStyles.footerTag}>Enterprise AI Infrastructure Platform</p>
        </div>
        <div className={pageStyles.footerGrid}>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className={pageStyles.footerCol}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={pageStyles.footerBottom}>
          <span>© {new Date().getFullYear()} AI-Pass</span>
        </div>
      </footer>
    </div>
  );
}
