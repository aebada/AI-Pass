'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';
import section from './home-sections.module.css';

const PLATFORM_LAYERS = [
  { name: 'AI Workspace', desc: 'Unified command center', href: '/workspace', icon: '◫' },
  { name: 'AI Playground', desc: 'Every model, one membership', href: '/workspace/playground', icon: '✦' },
  { name: 'Agent Studio', desc: 'Build autonomous agents', href: '/workspace/agents', icon: '🤖' },
  { name: 'Workflow Automation', desc: 'Business process orchestration', href: '/workspace/workflows', icon: '⟳' },
  { name: 'Knowledge Pipeline', desc: 'RAG and document intelligence', href: '/workspace/knowledge', icon: '📚' },
  { name: 'Analysis Studio', desc: 'Analytics and insights', href: '/workspace/analysis', icon: '📊' },
  { name: 'Marketplace', desc: 'Apps, skills, and packs', href: '/workspace/store', icon: '🛒' },
  { name: 'Enterprise Apps', desc: 'Invoice, HR, supply chain', href: '/workspace/apps', icon: '📦' },
  { name: 'AI Governance', desc: 'Policies and approvals', href: '/workspace/governance', icon: '🏛' },
  { name: 'Trust Engine', desc: 'Certify and monitor AI', href: '/workspace/trust', icon: '🛡' },
  { name: 'Compliance AI', desc: 'Regulatory automation', href: '/workspace/compliance', icon: '⚖' },
];

const MODELS = ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Grok', 'Mistral', 'Llama', 'OpenRouter'];

const AI_APPS = [
  {
    icon: '🧾',
    name: 'Invoice AI',
    problem: 'Manual AP processing slows finance teams and increases error rates.',
    value: 'Automate extraction, validation, fraud detection, and ERP sync.',
    demo: '/workspace/apps/invoice-ai',
    store: '/workspace/store',
  },
  {
    icon: '📦',
    name: 'Supply Chain AI',
    problem: 'Procurement teams struggle to evaluate supplier offers at scale.',
    value: 'AI-powered offer scoring, ranking, and negotiation intelligence.',
    demo: '/workspace/apps/supply-chain-ai',
    store: '/workspace/store',
  },
  {
    icon: '👥',
    name: 'HR AI',
    problem: 'Onboarding and policy Q&A consume HR bandwidth.',
    value: 'Automated employee workflows, screening, and policy assistance.',
    demo: '/workspace/apps',
    store: '/workspace/store',
  },
  {
    icon: '💬',
    name: 'Customer Support AI',
    problem: 'Support volume exceeds agent capacity across channels.',
    value: 'Multi-language voice and text agents with knowledge integration.',
    demo: '/workspace/apps/customer-support-ai',
    store: '/workspace/store/apps/customer-support-ai',
  },
  {
    icon: '📈',
    name: 'Sales AI',
    problem: 'Sales teams waste hours on manual outreach and proposal drafting.',
    value: 'Generate personalized emails, proposals, outreach campaigns, meeting preparation, and AI-powered sales workflows from one unified platform.',
    demo: '/workspace/apps/sales-ai',
    store: '/workspace/store/apps/sales-ai',
  },
  {
    icon: '⚖',
    name: 'Compliance AI',
    problem: 'Regulatory frameworks require continuous evidence and monitoring.',
    value: 'ISO, GDPR, and AI governance workflows with audit trails.',
    demo: '/workspace/apps/compliance-ai',
    store: '/workspace/store',
  },
  {
    icon: '👁',
    name: 'Presence Audit',
    problem: 'Brand visibility in AI search is invisible to marketing teams.',
    value: 'Audit and optimize presence across ChatGPT, Claude, Gemini, and more.',
    demo: '/workspace/apps/presence-audit',
    store: '/workspace/store',
  },
  {
    icon: '✍',
    name: 'Content AI',
    problem: 'Teams need to verify AI-generated content and humanize drafts at scale.',
    value: 'Detect AI probability, humanize with multi-model routing, Trust Engine scoring.',
    demo: '/workspace/apps/content-ai',
    store: '/workspace/store',
  },
];

type MarketTab = 'trending' | 'recent' | 'best' | 'enterprise' | 'collections';

const MARKETPLACE_DATA: Record<MarketTab, { name: string; meta: string; rating: string }[]> = {
  trending: [
    { name: 'Invoice AI', meta: 'Finance · 12k installs', rating: '★ 4.9' },
    { name: 'Customer Support AI', meta: 'Support · 8.4k installs', rating: '★ 4.8' },
    { name: 'Compliance Guard', meta: 'Compliance · 6.2k installs', rating: '★ 4.9' },
    { name: 'Agent Toolkit OSS', meta: 'Developers · 5.1k installs', rating: '★ 4.7' },
  ],
  recent: [
    { name: 'Knowledge Pipeline Pack', meta: 'Added 3 days ago', rating: '★ 4.8' },
    { name: 'IoT Anomaly Detector', meta: 'Added 1 week ago', rating: '★ 4.6' },
    { name: 'Legal Contract AI', meta: 'Added 2 weeks ago', rating: '★ 4.9' },
    { name: 'Marketing Insights AI', meta: 'Added 2 weeks ago', rating: '★ 4.5' },
  ],
  best: [
    { name: 'Invoice AI', meta: 'Best for Finance', rating: '★ 4.9 · Certified' },
    { name: 'Supply Chain AI', meta: 'Best for Procurement', rating: '★ 4.8 · Certified' },
    { name: 'Compliance Guard', meta: 'Best for Governance', rating: '★ 4.9 · Certified' },
    { name: 'Sales Copilot', meta: 'Best for Revenue', rating: '★ 4.7' },
  ],
  enterprise: [
    { name: 'Invoice AI Enterprise', meta: 'SSO · Private cloud', rating: '★ 4.9' },
    { name: 'Compliance Guard Pro', meta: 'ISO 42001 ready', rating: '★ 4.9' },
    { name: 'Supply Chain AI', meta: 'ERP integrations', rating: '★ 4.8' },
    { name: 'Legal Contract AI', meta: 'Legal ops teams', rating: '★ 4.8' },
  ],
  collections: [
    { name: 'Finance & Procurement', meta: '4 apps · Enterprise', rating: 'Collection' },
    { name: 'Healthcare Compliance', meta: '2 apps · Regulated', rating: 'Collection' },
    { name: 'Developer Starter', meta: '3 skills · Open source', rating: 'Collection' },
    { name: 'Startup Stack', meta: '5 apps · Freemium', rating: 'Collection' },
  ],
};

const COMPARE_ROWS = [
  { feature: 'Core experience', traditional: 'Chat interface', aipass: 'Unified AI Workspace' },
  { feature: 'Automation', traditional: 'Manual prompts', aipass: 'Autonomous AI Agents' },
  { feature: 'Workflows', traditional: 'Copy-paste between tools', aipass: 'Visual Workflow Automation' },
  { feature: 'Models', traditional: 'Single vendor lock-in', aipass: 'Every model, one membership' },
  { feature: 'Apps', traditional: 'Point solutions', aipass: 'Integrated Enterprise Apps' },
  { feature: 'Governance', traditional: 'Afterthought', aipass: 'Trust Engine + Compliance AI' },
  { feature: 'Billing', traditional: 'Per-tool subscriptions', aipass: 'One Wallet, unified credits' },
  { feature: 'Marketplace', traditional: 'Fragmented app stores', aipass: 'Certified AI Marketplace' },
];

const ARCH_LAYERS = [
  'AI Workspace',
  'Provider Hub',
  'Agent Runtime',
  'Workflow Engine',
  'Knowledge Pipeline',
  'Marketplace',
  'Enterprise Apps',
  'Trust & Compliance',
];

/** Real model providers — used for integrations strip (never invent fake customer logos) */
const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'xAI', 'Mistral', 'Meta', 'OpenRouter'];

const ENTERPRISE_BADGES = [
  { icon: '🏛', label: 'AI Governance' },
  { icon: '⚖', label: 'Compliance AI' },
  { icon: '🛡', label: 'Trust Engine' },
  { icon: '📈', label: 'Monitoring' },
  { icon: '📋', label: 'Audit Trails' },
  { icon: '🔐', label: 'SSO / SAML' },
  { icon: '👤', label: 'RBAC' },
  { icon: '☁', label: 'Private Cloud' },
];

const TRUST_FEATURES = [
  { icon: '✓', label: 'AI-Pass Certified' },
  { icon: '🔍', label: 'Verification' },
  { icon: '📊', label: 'Trust Score' },
  { icon: '🏅', label: 'Certification' },
  { icon: '📡', label: 'Monitoring' },
  { icon: '⚠', label: 'Risk Assessment' },
];

const COMPLIANCE_FRAMEWORKS = [
  { label: 'ISO 27001', sub: 'Information Security' },
  { label: 'SOC 2', sub: 'Type II Ready' },
  { label: 'GDPR', sub: 'Data Protection' },
  { label: 'NIS2', sub: 'Network Security' },
  { label: 'ISO 42001', sub: 'AI Management' },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Explore the platform with open models',
    features: ['50 requests/day', 'Free & open models', 'Limited Playground', 'Browse Marketplace'],
    cta: 'Start Free',
    href: '/workspace',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    desc: 'Premium models for growing teams',
    features: ['GPT-5, Claude, Gemini', 'Agent Studio & Workflows', '5,000 monthly credits', 'Analysis Studio'],
    cta: 'View membership',
    href: '/workspace/membership',
    highlight: true,
  },
  {
    name: 'Power',
    price: '$149',
    period: '/mo',
    desc: 'All models, multi-agent orchestration',
    features: ['All frontier models', 'Multi-agent & automations', 'LiveSync Engine', '25,000 credits'],
    cta: 'Upgrade to Power',
    href: '/workspace/membership',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Governance, compliance, and private routing',
    features: ['Unlimited connections', 'BYOK hybrid', 'Compliance & SLA', 'Dedicated support'],
    cta: 'Book Enterprise Demo',
    href: 'mailto:hello@ai-pass.com?subject=Enterprise%20Demo',
    highlight: false,
  },
];

const INVESTOR_TOPICS = [
  { title: 'Vision', text: 'Become the operating system for enterprise AI - one platform replacing fragmented chatbots, point apps, and shadow AI.' },
  { title: 'Market Opportunity', text: '$150B+ enterprise AI software market growing 35% CAGR. Every Fortune 500 needs governed AI infrastructure.' },
  { title: 'Why Now', text: 'Model proliferation, regulatory pressure (EU AI Act, ISO 42001), and board-level AI mandates create urgent demand.' },
  { title: 'Platform Strategy', text: 'Land with workspace + playground, expand via marketplace apps, monetize through membership + wallet + enterprise SLA.' },
  { title: 'Competitive Advantages', text: 'Only unified OS combining models, agents, workflows, apps, governance, and marketplace in one membership.' },
  { title: 'Business Model', text: 'SaaS membership tiers + usage-based AI Wallet + marketplace revenue share + enterprise contracts.' },
  { title: 'Enterprise Focus', text: 'SSO, RBAC, private cloud, compliance frameworks, and trust certification built in - not bolted on.' },
  { title: 'Marketplace Economy', text: 'Developer ecosystem publishing apps, skills, and automation packs with certified distribution.' },
];

const ROADMAP = [
  { quarter: 'Q3 2026', text: 'Agent Studio GA, expanded provider catalog, ISO 42001 certification path' },
  { quarter: 'Q4 2026', text: 'Enterprise private cloud, advanced governance dashboards, 50+ marketplace apps' },
  { quarter: 'Q1 2027', text: 'Industry solution packs, partner ecosystem launch, global data residency' },
  { quarter: 'Q2 2027', text: 'Autonomous workflow marketplace, AI agent economy, IPO readiness' },
];

const CUSTOMER_STORIES = [
  { industry: 'Finance', quote: 'Invoice AI reduced our AP processing time by 73% while improving fraud detection accuracy.', author: 'CFO, Global Financial Services' },
  { industry: 'Manufacturing', quote: 'Supply Chain AI transformed how we evaluate supplier proposals - from days to minutes.', author: 'VP Procurement, ManufactureX' },
  { industry: 'Government', quote: 'AI Pass gave us governed AI access across departments without shadow IT risk.', author: 'CIO, GovTech Agency' },
  { industry: 'Healthcare', quote: 'Compliance AI keeps our document workflows HIPAA-ready with full audit trails.', author: 'Compliance Director, HealthNet' },
  { industry: 'Automotive', quote: 'One membership for every model let our R&D teams compare frontier AI without vendor lock-in.', author: 'Head of AI, AutoCorp' },
];

const AI_NEWS = [
  { slug: 'gpt-5-provider-update', title: 'GPT-5 Now Available in AI Pass Provider Hub', summary: 'All Professional and Power members can route requests to GPT-5 via unified wallet billing.', date: 'Jun 15, 2026' },
  { slug: 'invoice-ai-v21-launch', title: 'Invoice AI v2.1 - Fraud Detection Upgrade', summary: 'New anomaly scoring model reduces false positives by 34% in enterprise deployments.', date: 'Jun 10, 2026' },
  { slug: 'summer-deals-hub', title: 'Summer Deals Hub - 8 Limited-Time Offers', summary: 'Discovery Hub launches Deals Hub with lifetime deals, bundles, and enterprise packages.', date: 'Jun 1, 2026' },
];

const DEV_ITEMS = [
  { icon: '📤', title: 'Publish Apps', desc: 'List on the AI Store' },
  { icon: '⚙', title: 'AI Skills', desc: 'Agent capability packs' },
  { icon: '🏪', title: 'Marketplace', desc: 'Certified distribution' },
  { icon: '💰', title: 'Revenue Share', desc: 'Monetize your AI apps' },
  { icon: '📦', title: 'SDK', desc: 'Build on AI Pass' },
  { icon: '🔗', title: 'API', desc: 'OpenAPI integration' },
];

const CHAT_RESPONSES: Record<string, string> = {
  GPT: 'GPT-5 analysis: Invoice batch processed - 847 documents validated, 3 flagged for review. Estimated savings: $12,400/month.',
  Claude: 'Claude assessment: Strong pattern match on vendor invoices. Recommend auto-approval threshold at 95% confidence for recurring suppliers.',
  Gemini: 'Gemini insight: Cross-referenced ERP data - 2 duplicate submissions detected. Workflow routed to finance approval queue.',
  DeepSeek: 'DeepSeek report: Processing complete. OCR accuracy 99.2%. Three-way match validated against PO and receipt records.',
};

const DEMO_STEPS = [
  { icon: '🤖', label: 'Agent activated', detail: 'Invoice Analysis Agent assigned to task' },
  { icon: '⟳', label: 'Workflow running', detail: 'Extract → Validate → Match → Route pipeline' },
  { icon: '📊', label: 'Analysis complete', detail: '847 invoices processed, 3 exceptions flagged' },
];

function LiveDemoSection() {
  const [query, setQuery] = useState('');
  const [steps, setSteps] = useState<typeof DEMO_STEPS>([]);
  const [result, setResult] = useState('');
  const [running, setRunning] = useState(false);

  const runDemo = useCallback(() => {
    if (running) return;
    setRunning(true);
    setSteps([]);
    setResult('');
    const q = query.trim() || 'Analyze invoices';
    setQuery(q);

    DEMO_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        if (i === DEMO_STEPS.length - 1) {
          setTimeout(() => {
            setResult(`✓ "${q}" complete - 847 invoices analyzed, 3 flagged for review, $12,400/month savings identified. Results synced to ERP.`);
            setRunning(false);
          }, 600);
        }
      }, (i + 1) * 800);
    });
  }, [query, running]);

  return (
    <div className={section.demoBox}>
      <div className={section.demoInputRow}>
        <input
          className={section.demoInput}
          placeholder='Try "Analyze invoices"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runDemo()}
        />
        <button type="button" className={section.demoRunBtn} onClick={runDemo} disabled={running}>
          {running ? 'Running…' : 'Run'}
        </button>
      </div>
      <div className={section.demoSteps}>
        {steps.map((step, i) => (
          <div key={step.label} className={`${section.demoStep} ${section.demoStepActive}`} style={{ animationDelay: `${i * 0.1}s` }}>
            <span className={section.demoStepIcon}>{step.icon}</span>
            <div>
              <strong>{step.label}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{step.detail}</div>
            </div>
          </div>
        ))}
        {result && <div className={section.demoResult}>{result}</div>}
      </div>
    </div>
  );
}

function PlaygroundDemoSection() {
  const [tab, setTab] = useState('GPT');
  const [messages, setMessages] = useState(0);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const send = () => {
    if (!input.trim() || messages >= 1) return;
    setMessages(1);
    setResponse(CHAT_RESPONSES[tab] ?? CHAT_RESPONSES.GPT);
    setInput('');
  };

  return (
    <div className={section.chatDemo}>
      <div className={section.chatTabs}>
        {['GPT', 'Claude', 'Gemini', 'DeepSeek'].map((m) => (
          <button
            key={m}
            type="button"
            className={`${section.chatTab} ${tab === m ? section.chatTabActive : ''}`}
            onClick={() => { setTab(m); setResponse(''); setMessages(0); }}
          >
            {m}
          </button>
        ))}
      </div>
      <div className={section.chatBody}>
        {response ? (
          <div className={`${section.chatBubble} ${section.chatBubbleAi}`}>{response}</div>
        ) : (
          <div className={section.chatBubble} style={{ color: 'var(--text-muted)' }}>
            Compare {tab} responses side-by-side. Send a message to see a demo response.
          </div>
        )}
      </div>
      <div className={section.chatInputRow}>
        <input
          className={section.demoInput}
          placeholder="Ask about invoice analysis…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={messages >= 1}
        />
        <button type="button" className={section.demoRunBtn} onClick={send} disabled={messages >= 1}>
          Send
        </button>
      </div>
      {messages >= 1 && (
        <p className={section.chatLimit}>
          Free demo limit reached.{' '}
          <Link href="/workspace" style={{ color: 'var(--accent)' }}>Sign up free</Link> for unlimited access.
        </p>
      )}
    </div>
  );
}

export default function HomePageContent() {
  const [marketTab, setMarketTab] = useState<MarketTab>('trending');

  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Enterprise AI Operating System
          </div>
          <h1 className={styles.heroTitle}>The Enterprise AI Operating System</h1>
          <p className={section.heroSubhead}>
            One Workspace. One Membership. Every AI Model. Every Agent. Every Business Application.
          </p>
          <p className={section.heroDesc}>
            AI-Pass unifies AI models, autonomous agents, workflow automation, enterprise applications,
            governance, compliance, analytics, and AI marketplaces into one secure operating platform.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/workspace" className={`${styles.btnPrimary} ${styles.btnLarge}`}>
              Start Free
            </Link>
            <a href="mailto:hello@ai-pass.com?subject=Enterprise%20Demo" className={`${styles.btnSecondary} ${styles.btnLarge}`}>
              Book Enterprise Demo
            </a>
          </div>
        </div>
      </section>

      {/* Integrations — honest provider strip, no fake customer logos */}
      <section className={`${section.section} ${section.trustedSection}`} id="trusted" aria-labelledby="trusted-heading">
        <div className={section.container}>
          <div className={section.trustedHeader}>
            <span className={section.sectionLabel}>Integrations</span>
            <h2 id="trusted-heading" className={section.sectionTitle}>
              Built on the technologies enterprises trust
            </h2>
            <p className={section.sectionDesc}>
              Route work across leading model providers from one membership, wallet, and governance layer.
            </p>
          </div>
          <ul className={section.providerStrip} aria-label="Integrated AI providers">
            {PROVIDERS.map((name) => (
              <li key={name} className={section.providerWordmark}>{name}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Platform Overview */}
      <section className={`${section.section} ${section.sectionAlt}`} id="platform">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Platform</span>
          <h2 className={section.sectionTitle}>One operating system, every capability</h2>
          <p className={section.sectionDesc}>
            From workspace to governance - every module connected in a unified enterprise stack.
          </p>
        </div>
        <div className={section.platformStack}>
          {PLATFORM_LAYERS.map((layer) => (
            <Link key={layer.name} href={layer.href} className={section.platformLayer}>
              <span className={section.platformLayerIcon}>{layer.icon}</span>
              <div className={section.platformLayerBody}>
                <div className={section.platformLayerName}>{layer.name}</div>
                <div className={section.platformLayerDesc}>{layer.desc}</div>
              </div>
              <span className={section.platformLayerArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Playground */}
      <section className={section.section} id="playground">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>AI Playground</span>
          <h2 className={section.sectionTitle}>One Membership. Every AI Model.</h2>
          <p className={section.sectionDesc}>
            Compare frontier models side-by-side. No vendor lock-in. Unified billing through AI Wallet.
          </p>
        </div>
        <div className={section.chipRow}>
          {MODELS.map((m) => (
            <span key={m} className={section.chip}>{m}</span>
          ))}
        </div>
        <div className={section.centerCta}>
          <Link href="/workspace/playground" className={styles.btnPrimary}>Open AI Playground →</Link>
        </div>
      </section>

      {/* AI Apps */}
      <section className={`${section.section} ${section.sectionAlt}`} id="apps">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>AI Apps</span>
          <h2 className={section.sectionTitle}>Enterprise applications, ready to deploy</h2>
          <p className={section.sectionDesc}>
            Pre-built vertical AI apps that integrate with your workspace, workflows, and governance layer.
          </p>
        </div>
        <div className={section.appGrid}>
          {AI_APPS.map((app) => (
            <div key={app.name} className={section.appCard}>
              <div className={section.appCardIcon}>{app.icon}</div>
              <h3 className={section.appCardName}>{app.name}</h3>
              <p className={section.appCardProblem}><strong>Problem:</strong> {app.problem}</p>
              <p className={section.appCardValue}><strong>Value:</strong> {app.value}</p>
              <div className={section.appCardActions}>
                <Link href={app.demo} className={styles.btnSecondary}>View Demo</Link>
                <Link href={app.store} className={styles.btnPrimary}>Install</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace */}
      <section className={section.section} id="marketplace">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Marketplace</span>
          <h2 className={section.sectionTitle}>Discover certified AI tools and apps</h2>
        </div>
        <div className={section.marketTabs}>
          {([
            ['trending', 'Trending'],
            ['recent', 'Recently Added'],
            ['best', 'Best AI Tools'],
            ['enterprise', 'Enterprise Apps'],
            ['collections', 'Collections'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`${section.marketTab} ${marketTab === key ? section.marketTabActive : ''}`}
              onClick={() => setMarketTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={section.marketGrid}>
          {MARKETPLACE_DATA[marketTab].map((item) => (
            <div key={item.name} className={section.marketCard}>
              <div className={section.marketCardName}>{item.name}</div>
              <div className={section.marketCardMeta}>{item.meta}</div>
              <div className={section.marketCardRating}>{item.rating}</div>
            </div>
          ))}
        </div>
        <div className={section.centerCta}>
          <Link href="/workspace/store" className={styles.btnPrimary}>Browse AI Store →</Link>
        </div>
      </section>

      {/* Why AI-Pass */}
      <section className={`${section.section} ${section.sectionAlt}`} id="why">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Why AI-Pass</span>
          <h2 className={section.sectionTitle}>Beyond chatbots and point solutions</h2>
        </div>
        <div className={styles.compareWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Traditional AI</th>
                <th>AI-Pass</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.traditional}</td>
                  <td className={styles.compareHighlight}>{row.aipass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture */}
      <section className={section.section} id="architecture">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Architecture</span>
          <h2 className={section.sectionTitle}>Layered enterprise AI infrastructure</h2>
        </div>
        <div className={section.archDiagram}>
          {ARCH_LAYERS.map((layer, i) => (
            <div key={layer} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {i > 0 && <div className={section.archConnector} />}
              <div className={section.archLayer} style={{ width: getArchWidth(i) }}>{layer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Provider Hub */}
      <section className={`${section.section} ${section.sectionAlt}`} id="providers">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Provider Hub</span>
          <h2 className={section.sectionTitle}>One Membership. No vendor lock-in.</h2>
          <p className={section.sectionDesc}>
            Route to any frontier model through a unified provider hub with BYOK support.
          </p>
        </div>
        <div className={section.providerGrid}>
          {PROVIDERS.map((p) => (
            <div key={p} className={section.providerLogo}>{p}</div>
          ))}
        </div>
        <div className={section.centerCta}>
          <Link href="/workspace/providers" className={styles.btnSecondary}>Explore Provider Hub</Link>
        </div>
      </section>

      {/* Enterprise */}
      <section className={section.section} id="enterprise">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Enterprise</span>
          <h2 className={section.sectionTitle}>Built for regulated industries</h2>
          <p className={section.sectionDesc}>
            Governance, compliance, and security controls designed for enterprise deployment from day one.
          </p>
        </div>
        <div className={section.badgeGrid}>
          {ENTERPRISE_BADGES.map((b) => (
            <div key={b.label} className={section.badge}>
              <span className={section.badgeIcon}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className={`${section.section} ${section.sectionAlt}`} id="trust">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Trust</span>
          <h2 className={section.sectionTitle}>Certified AI you can deploy with confidence</h2>
        </div>
        <div className={section.badgeGrid}>
          {TRUST_FEATURES.map((f) => (
            <div key={f.label} className={section.badge}>
              <span className={section.badgeIcon}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
        <div className={section.centerCta}>
          <Link href="/workspace/trust" className={styles.btnSecondary}>Visit Trust Center</Link>
        </div>
      </section>

      {/* Compliance */}
      <section className={section.section} id="compliance">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Compliance</span>
          <h2 className={section.sectionTitle}>Framework-ready from day one</h2>
        </div>
        <div className={section.complianceGrid}>
          {COMPLIANCE_FRAMEWORKS.map((f) => (
            <div key={f.label} className={section.complianceBadge}>
              <div className={section.complianceBadgeLabel}>{f.label}</div>
              <div className={section.complianceBadgeSub}>{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Demo */}
      <section className={`${section.section} ${section.sectionAlt}`} id="demo">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Live Demo</span>
          <h2 className={section.sectionTitle}>See AI-Pass in action</h2>
          <p className={section.sectionDesc}>
            Type a business request and watch agents, workflows, and analysis execute automatically.
          </p>
        </div>
        <LiveDemoSection />
      </section>

      {/* Playground Demo */}
      <section className={section.section} id="try">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Try It</span>
          <h2 className={section.sectionTitle}>Compare models instantly</h2>
          <p className={section.sectionDesc}>Experience multi-model AI with a free demo message.</p>
        </div>
        <PlaygroundDemoSection />
        <div className={section.centerCta}>
          <Link href="/workspace/playground" className={styles.btnPrimary}>Get unlimited access →</Link>
        </div>
      </section>

      {/* Pricing */}
      <section className={`${section.section} ${section.sectionAlt}`} id="pricing">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Pricing</span>
          <h2 className={section.sectionTitle}>One Membership. Everything included.</h2>
          <p className={section.sectionDesc}>Universal AI subscription with unified wallet billing.</p>
        </div>
        <div className={styles.pricingGrid}>
          {PRICING.map((plan) => (
            <div key={plan.name} className={`${styles.pricingCard} ${plan.highlight ? styles.pricingFeatured : ''}`}>
              {plan.highlight && <span className={styles.pricingBadge}>Most popular</span>}
              <h3 className={styles.pricingName}>{plan.name}</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>{plan.price}</span>
                <span className={styles.pricingPeriod}>{plan.period}</span>
              </div>
              <p className={styles.pricingDesc}>{plan.desc}</p>
              <ul className={styles.pricingFeatures}>
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              {plan.href.startsWith('mailto:') ? (
                <a href={plan.href} className={plan.highlight ? styles.btnPrimary : styles.btnSecondary}>{plan.cta}</a>
              ) : (
                <Link href={plan.href} className={plan.highlight ? styles.btnPrimary : styles.btnSecondary}>{plan.cta}</Link>
              )}
            </div>
          ))}
        </div>
        <div className={section.walletCallout}>
          <strong>AI Wallet</strong> - Unified credits for models, apps, and marketplace purchases.
          Track usage, set budgets, and pay once across the entire platform.{' '}
          <Link href="/workspace/wallet" style={{ color: 'var(--accent)' }}>Learn about AI Wallet →</Link>
        </div>
        <div className={section.centerCta}>
          <Link href="/workspace/membership" className={styles.btnSecondary}>View all membership plans</Link>
        </div>
      </section>

      {/* Developers */}
      <section className={section.section} id="developers">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Developers</span>
          <h2 className={section.sectionTitle}>Build, publish, and monetize on AI-Pass</h2>
        </div>
        <div className={section.devGrid}>
          {DEV_ITEMS.map((item) => (
            <div key={item.title} className={section.devCard}>
              <div className={section.devCardIcon}>{item.icon}</div>
              <div className={section.devCardTitle}>{item.title}</div>
              <div className={section.devCardDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Investors */}
      <section className={`${section.section} ${section.sectionAlt}`} id="investors">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Investors</span>
          <h2 className={section.sectionTitle}>The platform defining enterprise AI</h2>
        </div>
        <div className={section.investorGrid}>
          {INVESTOR_TOPICS.map((topic) => (
            <div key={topic.title} className={section.investorCard}>
              <h3 className={section.investorCardTitle}>{topic.title}</h3>
              <p className={section.investorCardText}>{topic.text}</p>
            </div>
          ))}
        </div>
        <div className={section.roadmapList}>
          <h3 style={{ textAlign: 'center', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Roadmap</h3>
          {ROADMAP.map((item) => (
            <div key={item.quarter} className={section.roadmapItem}>
              <span className={section.roadmapQuarter}>{item.quarter}</span>
              <span className={section.roadmapText}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className={section.centerCta} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <a href="mailto:investors@ai-pass.com?subject=Investor%20Meeting" className={styles.btnPrimary}>Book Investor Meeting</a>
          <a href="#" className={styles.btnSecondary}>Download Investor Deck (PDF)</a>
          <Link href="/investors" className={styles.btnSecondary}>Full investor page →</Link>
        </div>
      </section>

      {/* Customer Stories */}
      <section className={section.section} id="stories">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Customer Stories</span>
          <h2 className={section.sectionTitle}>Outcomes across industries</h2>
        </div>
        <div className={section.storyGrid}>
          {CUSTOMER_STORIES.map((story) => (
            <div key={story.industry} className={section.storyCard}>
              <div className={section.storyIndustry}>{story.industry}</div>
              <p className={section.storyQuote}>&ldquo;{story.quote}&rdquo;</p>
              <div className={section.storyAuthor}>{story.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions anchor */}
      <section className={`${section.section} ${section.sectionAlt}`} id="solutions">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Solutions</span>
          <h2 className={section.sectionTitle}>Industry-specific AI operating systems</h2>
          <p className={section.sectionDesc}>
            Pre-configured app collections and compliance packs for every vertical.
          </p>
        </div>
        <div className={section.badgeGrid}>
          {['Finance', 'Manufacturing', 'Automotive', 'Healthcare', 'Government', 'Retail', 'Logistics', 'Insurance', 'Education'].map((s) => (
            <Link key={s} href={`/discover/categories/${s.toLowerCase().replace(' ', '_')}`} className={section.badge}>
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* AI News */}
      <section className={section.section} id="news">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>AI News</span>
          <h2 className={section.sectionTitle}>Latest from AI-Pass and the industry</h2>
        </div>
        <div className={section.newsGrid}>
          {AI_NEWS.map((article) => (
            <Link key={article.slug} href={`/discover/news/${article.slug}`} className={section.newsCard}>
              <div className={section.newsDate}>{article.date}</div>
              <h3 className={section.newsTitle}>{article.title}</h3>
              <p className={section.newsSummary}>{article.summary}</p>
            </Link>
          ))}
        </div>
        <div className={section.centerCta}>
          <Link href="/discover/news" className={styles.btnSecondary}>All AI News →</Link>
        </div>
      </section>

      {/* Final CTA */}
      <div className={styles.ctaBand}>
        <h2 className={styles.ctaBandTitle}>Your Enterprise AI Operating System awaits</h2>
        <p className={styles.ctaBandText}>
          One workspace. One membership. Every model, agent, and business application - governed and secure.
        </p>
        <div className={styles.ctaBandActions}>
          <Link href="/workspace" className={styles.btnPrimary}>Start Free</Link>
          <a href="mailto:hello@ai-pass.com?subject=Enterprise%20Demo" className={styles.btnSecondary}>Book Enterprise Demo</a>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={section.footerGridWide}>
          <div>
            <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} />
            <p className={styles.footerBrand}>The Enterprise AI Operating System.</p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className={styles.footerColTitle}>{col.title}</div>
              {col.links.map((link) =>
                link.external ? (
                  <a key={link.href + link.label} href={link.href} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href + link.label} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 AI-Pass. All rights reserved.</span>
          <Link href="/about" className={styles.footerLink}>About</Link>
          <Link href="/investors" className={styles.footerLink}>Investors</Link>
        </div>
      </footer>
    </div>
  );
}

function getArchWidth(index: number): string {
  const widths = ['100%', '92%', '84%', '76%', '68%', '60%', '52%', '44%'];
  return widths[index] ?? '100%';
}
