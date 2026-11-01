'use client';

import Link from 'next/link';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { MarketingThemeLock } from './components/MarketingThemeLock';
import { HeroGraph } from './components/HeroGraph';
import { LandingProof } from './components/LandingProof';
import { FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';

const DEMO_MAILTO =
  'mailto:contact@aipass.space?subject=Enterprise%20AI%20Infrastructure%20Demo';

const TRUST = [
  'Manufacturing',
  'Banking',
  'Healthcare',
  'Government',
  'Defence',
  'Logistics',
  'Retail',
  'Energy',
];

const CONNECTIONS = [
  { title: 'All apps', copy: 'CRM, ERP, inbox, calendar, wallet, MES, and the tools your teams already open every day.' },
  { title: 'All solutions', copy: 'Sales, finance, ops, quality, and support share one twin instead of separate copilots.' },
  { title: 'All interactions', copy: 'Chats, approvals, tickets, and sensor events become memory the agent can reason over.' },
];

const BRING_YOUR_OWN = [
  {
    title: 'Your ontology',
    copy: 'Upload or define classes, properties, and constraints so the twin speaks your domain language.',
  },
  {
    title: 'Your knowledge',
    copy: 'Add SOPs, policies, manuals, tickets, and expert notes. Agents only act on what you encode.',
  },
  {
    title: 'Your graphs',
    copy: 'Import existing knowledge graphs or grow one live — nodes, edges, attributes, and provenance stay yours.',
  },
  {
    title: 'Your sources',
    copy: 'Connect files, databases, SharePoint, APIs, and streams. Sync into the twin without a rewrite.',
  },
];

const ACTIONS = [
  { title: 'Payments', copy: 'Draft transfers, match invoices, and hold until a human confirms the money move.' },
  { title: 'Sales', copy: 'Follow deals, prepare quotes, and route next steps with role walls on customer data.' },
  { title: 'Planning', copy: 'Sync calendars, capacity, and renewals so the twin proposes work you can accept or edit.' },
  { title: 'Operations', copy: 'Open shop-floor and logistics actions with an audit path back to lots, SOPs, and owners.' },
];

const STEPS = [
  {
    n: '01',
    title: 'Connect the stack',
    copy: 'Apps, solutions, and live interactions feed one digital twin — not another isolated chatbot.',
  },
  {
    n: '02',
    title: 'Build the twin',
    copy: 'People, policies, machines, and money flows become a knowledge graph agents can traverse.',
  },
  {
    n: '03',
    title: 'Act with a gate',
    copy: 'Agents draft, route, approve, and execute. Payments and irreversible moves still need confirmation.',
  },
];

const TWINS = [
  {
    title: 'Personal twin',
    copy: 'Learns consented routines, drafts replies, protects focus time, and prepares admin work for your approval.',
    actions: ['Triage inbox', 'Propose calendar slots', 'Prepare forms', 'Track renewals'],
    image: '/marketing/twin-personal.jpg',
    alt: 'Person at a desk with a personal digital twin overlay',
  },
  {
    title: 'Employee twin',
    copy: 'Every employee is part of AI-Pass: role, skills, approvals, and workload live in the twin so agents assist people — not replace accountability.',
    actions: ['Role & permission map', 'Workload balance', 'Skill routing', 'Handoff with audit'],
    image: '/marketing/twin-employees.jpg',
    alt: 'Employees at work with personal digital twins connected to company systems',
  },
  {
    title: 'Business twin',
    copy: 'Company agents act on invoices, CRM and ops with role walls, budgets and an audit path for every decision.',
    actions: ['Invoice intake', 'Approval routing', 'Deal follow-ups', 'Budget alerts'],
    image: '/marketing/twin-business.jpg',
    alt: 'Operations team in a control room reviewing agent action queues',
  },
  {
    title: 'Robotics & production',
    copy: 'Shop-floor agents bind sensors, lots and SOPs so quality and cell decisions stay explainable and replayable.',
    actions: ['Quality hop path', 'Cell status briefs', 'SOP checks', 'Escalation to humans'],
    image: '/marketing/twin-robotics.jpg',
    alt: 'Industrial robot and production cell on a manufacturing floor',
  },
];

const TWIN_EVERYTHING = [
  { title: 'People', copy: 'Employees, contractors, and customers with consent and role walls.' },
  { title: 'Apps & workflows', copy: 'CRM, ERP, inbox, calendar, MES, wallet — every interaction that matters.' },
  { title: 'Assets & robots', copy: 'Machines, lots, cells, and sensors bound to SOPs and owners.' },
  { title: 'Money & plans', copy: 'Payments, sales, capacity, and renewals with a confirmation gate.' },
];

const PILLARS = [
  {
    title: 'Explainable',
    copy: 'Every decision is a hop list: node, predicate, source, confidence. No orphan labels.',
  },
  {
    title: 'Deterministic',
    copy: 'Same graph and same contract produce the same decision. Sampling stays for drafts only.',
  },
  {
    title: 'Role-based',
    copy: 'Quality, plant, audit, and operator each see the slice their job is allowed to act on.',
  },
  {
    title: 'Organization rules',
    copy: 'If a second source is required, the answer will not publish without it.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    who: 'Evaluate the infrastructure layer',
    features: ['Core workspace access', 'Limited daily requests', 'Discovery browsing', 'Community support'],
    cta: 'Start free',
    href: '/login',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    who: 'Teams running governed AI daily',
    features: ['Multi-model routing', 'Agent Studio basics', 'AI Wallet credits', 'Email support'],
    cta: 'Choose Professional',
    href: '/workspace/membership',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    who: 'Government, Defence, and on-prem',
    features: ['Air-gapped / private cloud', 'SSO · SCIM · SAML', 'Trust & compliance packs', 'Dedicated success'],
    cta: 'Talk to sales',
    href: DEMO_MAILTO,
    popular: false,
  },
];

const COMPLIANCE = ['ISO 42001', 'ISO 27001', 'GDPR', 'NIS2', 'SOC 2 Type II ready'];

export default function HomePageContent() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />

      <main>
        <section className={`${styles.hero} hero-presence`} aria-labelledby="hero-heading">
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroInner}>
            <p className={styles.brandMark}>AI-Pass</p>
            <p className={styles.eyebrow}>Digital twins for everything</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Twins for people, apps, and machines.
              <span className={styles.heroTitleAccent}> Agents that can act.</span>
            </h1>
            <p className={styles.heroSub}>
              AI-Pass builds a digital twin for everything — including every employee — by connecting
              apps, solutions, and interactions so agents can run payments, sales, planning, and ops
              under your rules.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/waitlist" className={styles.btnPrimary}>
                Join the waiting list
              </Link>
              <Link href="/book-demo" className={styles.btnSecondary}>
                Book a demo
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.heroPhoto}
              src="/marketing/connect-apps-twin.jpg"
              alt="Enterprise apps connected into a central digital twin"
              width={1600}
              height={900}
            />
          </div>
        </section>

        <section className={styles.logoStrip} aria-label="Industries we support">
          {TRUST.map((name) => (
            <span key={name} className={styles.logoItem}>
              {name}
            </span>
          ))}
        </section>

        <section className={styles.section} aria-labelledby="connect-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How agents get smart</p>
            <h2 id="connect-heading">Connect everything. Build the twin.</h2>
            <p className={styles.sectionSub}>
              Intelligence is not another prompt. It is context from the full stack — then a twin
              that knows what the agent is allowed to do.
            </p>
          </div>
          <div className={styles.connectGrid}>
            {CONNECTIONS.map((item) => (
              <article key={item.title} className={styles.connectCard}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.bandVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/agent-actions.jpg"
              alt="Professional approving agent actions across payments, sales, and planning"
              width={1600}
              height={900}
            />
          </div>
        </section>

        <section className={styles.section} id="smart-collector" aria-labelledby="collector-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Smart collector</p>
            <h2 id="collector-heading">Download the app that feeds the twin</h2>
            <p className={styles.sectionSub}>
              Collect consented interactions across apps and workflows. The twin learns what users
              actually do — so agents can plan, sell, pay, and operate with real context.
            </p>
          </div>
          <div className={styles.bringPanel}>
            <div className={styles.bringCopy}>
              <h3>IDE, desktop, mobile, and extension</h3>
              <ul className={styles.pointList}>
                <li>Open the IDE in your browser today</li>
                <li>Desktop and mobile apps collect live interactions</li>
                <li>Browser extension covers web apps you already use</li>
                <li>Everything lands in your ontology and knowledge graph</li>
              </ul>
              <div className={styles.heroCtas} style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <Link href="/downloads" className={styles.btnPrimary}>
                  Download apps &amp; IDE
                </Link>
                <Link href="/ide" className={styles.btnSecondary}>
                  Open IDE
                </Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.bandVisualInline}
              src="/marketing/smart-collector-app.jpg"
              alt="Smart collector on phone and laptop feeding the digital twin"
              width={1200}
              height={675}
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="actions-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>What the twin unlocks</p>
            <h2 id="actions-heading">Agents that take real action</h2>
            <p className={styles.sectionSub}>
              Once apps and interactions sit in the twin, agents can move work forward — with a
              confirmation gate for money and irreversible steps.
            </p>
          </div>
          <div className={styles.actionGrid}>
            {ACTIONS.map((item) => (
              <article key={item.title} className={styles.actionCard}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="bring-knowledge" aria-labelledby="bring-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Bring your own</p>
            <h2 id="bring-heading">Add your ontology, knowledge, and graphs</h2>
            <p className={styles.sectionSub}>
              The twin is yours. Import domain models, documents, and existing graphs — then agents
              reason and act on what you added, under your rules.
            </p>
          </div>
          <div className={styles.actionGrid}>
            {BRING_YOUR_OWN.map((item) => (
              <article key={item.title} className={styles.actionCard}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.bringPanel}>
            <div className={styles.bringCopy}>
              <h3>Start with what you already have</h3>
              <ul className={styles.pointList}>
                <li>Ontology files and custom entity types</li>
                <li>Knowledge bases, PDFs, wikis, and policy packs</li>
                <li>Existing graphs — merge or run side by side</li>
                <li>Live connectors for CRM, ERP, and ops data</li>
              </ul>
              <div className={styles.heroCtas} style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <Link href="/workspace/knowledge/ontology" className={styles.btnPrimary}>
                  Open ontology studio
                </Link>
                <Link href="/demo" className={styles.btnSecondary}>
                  Try the graph demo
                </Link>
              </div>
            </div>
            <div className={styles.bringVisual} aria-hidden>
              <HeroGraph />
            </div>
          </div>
        </section>

        <section className={styles.section} id="twins-heading" aria-labelledby="twins-title">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Digital twins</p>
            <h2 id="twins-title">A twin for everything — including employees</h2>
            <p className={styles.sectionSub}>
              Personal, employee, business, and robotics twins share one engine. People stay in the
              loop; agents act inside role walls and confirmation gates.
            </p>
          </div>
          <div className={styles.actionGrid} style={{ marginBottom: '1.5rem' }}>
            {TWIN_EVERYTHING.map((item) => (
              <article key={item.title} className={styles.actionCard}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.twinGrid}>
            {TWINS.map((twin) => (
              <article key={twin.title} className={styles.twinCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={twin.image} alt={twin.alt} className={styles.twinImage} width={800} height={600} />
                <div className={styles.twinBody}>
                  <h3>{twin.title}</h3>
                  <p>{twin.copy}</p>
                  <p className={styles.twinActionsLabel}>Agent actions</p>
                  <ul className={styles.twinActions}>
                    {twin.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.graphSection} aria-labelledby="graph-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Knowledge graph</p>
            <h2 id="graph-heading">See the twin think in hops</h2>
            <p className={styles.sectionSub}>
              Every answer is a path through people, policies, machines, and money — not a black-box label.
            </p>
          </div>
          <HeroGraph />
          <div className={styles.proofWrap}>
            <LandingProof />
          </div>
          <div className={styles.heroCtas} style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
            <Link href="/demo" className={styles.btnPrimary}>
              Open the knowledge graph
            </Link>
            <Link href="/waitlist" className={styles.btnSecondary}>
              Join the waiting list
            </Link>
          </div>
        </section>

        <section className={styles.section} id="ai-analysis" aria-labelledby="analysis-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>AI analysis layer</p>
            <h2 id="analysis-heading">Understand the twin before agents act</h2>
            <p className={styles.sectionSub}>
              The analysis layer reads interactions, employees, apps, and graph hops — then scores
              risk, opportunity, and next best actions under your ontology and policies.
            </p>
          </div>
          <div className={styles.actionGrid}>
            <article className={styles.actionCard}>
              <h3>Signal intake</h3>
              <p>Apps, collector events, employee twins, and documents stream into one analysis fabric.</p>
            </article>
            <article className={styles.actionCard}>
              <h3>Graph reasoning</h3>
              <p>Hops across ontology, policy, and provenance explain why a recommendation exists.</p>
            </article>
            <article className={styles.actionCard}>
              <h3>Decision scores</h3>
              <p>Payments, sales, planning, and ops get ranked options with role walls and confidence.</p>
            </article>
            <article className={styles.actionCard}>
              <h3>Human gate</h3>
              <p>Critical moves stay confirmable. Analysis proposes; people and policy still decide.</p>
            </article>
          </div>
          <div className={styles.heroCtas} style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
            <Link href="/workspace/analysis" className={styles.btnPrimary}>
              Open Analysis Studio
            </Link>
            <Link href="/downloads" className={styles.btnSecondary}>
              Download collector
            </Link>
          </div>
        </section>

        <section className={styles.section} id="how-it-works" aria-labelledby="how-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="how-heading">From connections to confirmed actions</h2>
            <p className={styles.sectionSub}>
              We do not replace your people. We connect what they already use, encode the twin, then let agents act inside policy.
            </p>
          </div>
          <ol className={styles.stepGrid}>
            {STEPS.map((step) => (
              <li key={step.n} className={styles.step}>
                <span className={styles.stepNum}>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
          <div className={styles.bandVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/twin-hero-production.jpg"
              alt="Production line with collaborative robots powered by a digital twin"
              width={1600}
              height={900}
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="power-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Governed by design</p>
            <h2 id="power-heading">Explainable. Deterministic. Role-based.</h2>
            <p className={styles.sectionSub}>
              The answer is a path you can audit: who may see it, which rule fired, and which sources corroborate it.
            </p>
          </div>
          <div className={styles.pillarGrid}>
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className={styles.pillar}>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="pricing" aria-labelledby="pricing-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Pricing</p>
            <h2 id="pricing-heading">Plans that match how you operate</h2>
            <p className={styles.sectionSub}>
              Start free, scale with Professional, or deploy Enterprise with private-cloud and air-gapped options.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`${styles.priceCard} ${plan.popular ? styles.priceCardPopular : ''}`}
              >
                {plan.popular ? <span className={styles.popularBadge}>Most popular</span> : null}
                <h3>{plan.name}</h3>
                <p className={styles.priceWho}>{plan.who}</p>
                <p className={styles.priceAmount}>
                  {plan.price}
                  {plan.period ? <span>{plan.period}</span> : null}
                </p>
                <ul>
                  {plan.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {plan.href.startsWith('mailto:') ? (
                  <a href={plan.href} className={plan.popular ? styles.btnPrimary : styles.btnSecondary}>
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.href} className={plan.popular ? styles.btnPrimary : styles.btnSecondary}>
                    {plan.cta}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.compliance} aria-label="Compliance posture">
          {COMPLIANCE.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta">
          <h2 id="final-cta">Ready for agents that can act?</h2>
          <p>Join the waiting list for twin access, or book a demo of the knowledge graph.</p>
          <div className={styles.heroCtas}>
            <Link href="/waitlist" className={styles.btnOnPurple}>
              Join the waiting list
            </Link>
            <Link href="/book-demo" className={styles.btnGhostOnPurple}>
              Book a demo
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink />
          <p className={styles.footerTag}>Connect everything. Build the twin. Let agents act.</p>
        </div>
        <div className={styles.footerGrid}>
          {FOOTER_COLUMNS.slice(0, 5).map((column) => (
            <div key={column.title} className={styles.footerCol}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.slice(0, 6).map((link) => (
                  <li key={`${column.title}-${link.label}`}>
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
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} AI-Pass</span>
          <span>Secure · Governed · Deployable</span>
        </div>
      </footer>
    </div>
  );
}
