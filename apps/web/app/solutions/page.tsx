import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import styles from './solutions.module.css';

const CAPABILITIES = [
  {
    id: 'ai-builder',
    title: 'AI Form Builder',
    copy: 'Describe the intake in plain language, paste a prompt, upload a PDF or image, or paste a URL. AI drafts fields, pages, copy, validation, themes, and conditional logic — then you edit and publish.',
  },
  {
    id: 'ai-kits',
    title: 'AI quiz, survey, poll & test kits',
    copy: 'Generate scored quizzes, outcome flows, research surveys, skill tests, and quick polls with questions, scoring, and feedback already wired — then refine in the editor.',
  },
  {
    id: 'visual-editor',
    title: 'Visual builder & 50+ field types',
    copy: 'Drag-and-drop short and long text, email, phone, number, link, dropdown, multiselect, checkboxes, ranking, slider, rating, Likert, NPS, matrix, date/time ranges, file upload, signature, payments, and more across multi-page, multi-column layouts.',
  },
  {
    id: 'logic',
    title: 'Conditional logic, piping & calculations',
    copy: 'Show, hide, or skip fields and pages based on answers. Pipe earlier responses into later questions, score quizzes, run calculations, and catch dead ends with a visual branch map.',
  },
  {
    id: 'design',
    title: 'Design, themes & assets',
    copy: 'Brand colors, logos, fonts, backgrounds, spacing, radius, and button styles. Reuse logos, Open Graph images, and in-form media from a shared asset library.',
  },
  {
    id: 'publish',
    title: 'Publish, versions & scheduling',
    copy: 'Auto-save drafts, preview before go-live, keep draft and live versions separate, track publish history, schedule open/close windows, and unpublish without deleting data.',
  },
  {
    id: 'share',
    title: 'Share, QR, embeds & domains',
    copy: 'Ship via public link, QR code, inline embed, popup, email embed, or custom domain with SSL — so every channel gets the same governed form.',
  },
  {
    id: 'collaboration',
    title: 'Teams & collaboration',
    copy: 'Invite unlimited teammates, assign admin and builder roles, co-author in shared workspaces, allow multi-user collaborative responses, and keep forms owned by the org — not a personal login.',
  },
  {
    id: 'branding',
    title: 'White-label branding',
    copy: 'Remove third-party badges, set SEO titles and link previews, apply custom themes and logos, and serve forms that feel native to your product.',
  },
  {
    id: 'pdf',
    title: 'PDF & document generation',
    copy: 'Turn submissions into branded PDFs, invoices, contracts, or packets the moment a response lands.',
  },
  {
    id: 'resume',
    title: 'Save & resume, partials & offline',
    copy: 'Long intakes finish. Signed resume links, draft progress, partial response capture, nudge emails, and offline capture that syncs when connectivity returns.',
  },
  {
    id: 'notifications',
    title: 'Notifications & auto-responders',
    copy: 'Admin alerts, respondent confirmations, custom email templates with answer piping, Slack, in-app, and webhook alerts routed to the right team.',
  },
  {
    id: 'i18n',
    title: 'Multi-language & AI translation',
    copy: 'Localise forms instantly, including RTL, so global teams and citizens get the same governed experience.',
  },
  {
    id: 'spam',
    title: 'Spam protection & access control',
    copy: 'reCAPTCHA, smarter submission filters, hidden values for campaign tags, default prefills, and form-level open/close controls keep lists clean.',
  },
  {
    id: 'analytics',
    title: 'Analytics, responses & AI insights',
    copy: 'Completion rates, drop-off points, device and traffic breakdowns, CSV export, Sheets sync, and AI recommendations to raise conversion.',
  },
  {
    id: 'esign',
    title: 'Digital signatures',
    copy: 'Collect e-signatures inside the form flow for consent, HR paperwork, vendor onboarding, and approvals.',
  },
  {
    id: 'payments',
    title: 'Payments',
    copy: 'Native payment fields for orders, donations, event fees, and paid registrations — tied into wallet and audit trails.',
  },
  {
    id: 'workflows',
    title: 'Workflows & integrations',
    copy: 'Map submissions to Google Sheets, CRM, Airtable, Zapier/Make-class stacks, and AI-Pass agents with retries, column mapping, and execution history.',
  },
  {
    id: 'api-mcp',
    title: 'REST API & MCP for agents',
    copy: 'Pull submissions into warehouses and copilots, push prefilled URLs from CRM, and expose form data to Claude, ChatGPT, or custom agents over MCP — without stopping at CSV.',
  },
  {
    id: 'backend',
    title: 'HTML backend, embeds & webhooks',
    copy: 'Point existing HTML forms at AI-Pass, embed in minutes, or push every submission over webhooks to your automation stack.',
  },
  {
    id: 'privacy',
    title: 'Privacy-first AI',
    copy: 'Prompts, PDFs, and form content generate your solution — not someone else’s training set. Encryption, residency, audit, and deletion controls stay under AI-Pass governance.',
  },
  {
    id: 'templates',
    title: 'Templates library',
    copy: 'Start from lead capture, registration, application, quiz, survey, order, and industry packs. Duplicate forms, save your own templates, and tag for reuse.',
  },
  {
    id: 'completion',
    title: 'Thank-you, redirects & thank flows',
    copy: 'Customise completion messages, icons, and confetti — then redirect respondents to a landing page, booking calendar, or next workflow step.',
  },
] as const;

const INDUSTRIES = [
  {
    title: 'HR & People',
    copy: 'Onboarding packets, policy acknowledgements, payroll setup, and welcome surveys with document collection.',
    href: '/industries',
  },
  {
    title: 'Marketing & Growth',
    copy: 'Lead gen, event registration, NPS, and campaign feedback with routing into CRM and attribution.',
    href: '/workspace/apps/sales-ai',
  },
  {
    title: 'Education',
    copy: 'Quizzes, course signups, parent consent, and feedback forms with scoring and multi-language support.',
    href: '/industries/education',
  },
  {
    title: 'IT & Operations',
    copy: 'Ticketing, access requests, incident intake, and equipment workflows with approval gates.',
    href: '/workspace/workflows',
  },
  {
    title: 'Healthcare',
    copy: 'Patient intake, consent, and appointment requests with encryption, audit, and residency controls.',
    href: '/industries/healthcare',
  },
  {
    title: 'Real Estate',
    copy: 'Applications, tenant onboarding, and inspection reports with e-sign and PDF packets.',
    href: '/industries',
  },
] as const;

const DIFFERENTIATORS = [
  {
    title: 'Governed by design',
    copy: 'Every form runs under AI-Pass policy, identity, and audit — not a detached consumer form SaaS.',
  },
  {
    title: 'Connected to the OS',
    copy: 'Submissions trigger agents, workflows, knowledge updates, and trust checks in the same workspace.',
  },
  {
    title: 'Enterprise ready',
    copy: 'SSO, roles, residency, encryption, and compliance posture for regulated teams from day one.',
  },
] as const;

export default function SolutionsPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <section className={styles.hero} aria-labelledby="solutions-hero">
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Solutions</p>
          <h1 id="solutions-hero" className={styles.heroTitle}>
            Every form, intake, and workflow modern builders ship — under enterprise AI control.
          </h1>
          <p className={styles.heroSub}>
            AI-Pass covers the full Formerr / Formester-class surface: prompt, PDF, image, and URL form
            generation; visual building; logic and piping; quizzes and surveys; design themes; share and
            embeds; teams; branding; PDFs; payments; analytics; e-sign; offline resume; notifications;
            workflows; REST/MCP; templates; and industry packs — then connects each submission to agents,
            governance, and trust.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/requirements" className={styles.btnPrimary}>
              Build a solution
            </Link>
            <Link href="/demo" className={styles.btnSecondary}>
              Try interactive demo
            </Link>
            <Link href="/workspace/solutions" className={styles.btnGhost}>
              Open My Solutions
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="capabilities-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Capability coverage</p>
          <h2 id="capabilities-heading" className={styles.sectionTitle}>
            Full form lifecycle, not a partial checklist
          </h2>
          <p className={styles.sectionDesc}>
            Mapped to the capabilities teams expect from modern AI form platforms — implemented as governed
            AI-Pass solutions.
          </p>
        </div>
        <div className={styles.capGrid}>
          {CAPABILITIES.map((cap) => (
            <article key={cap.id} id={cap.id} className={styles.capItem}>
              <h3 className={styles.capTitle}>{cap.title}</h3>
              <p className={styles.capCopy}>{cap.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="industries-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Industry solutions</p>
          <h2 id="industries-heading" className={styles.sectionTitle}>
            One builder. Every workflow.
          </h2>
          <p className={styles.sectionDesc}>
            Pre-shaped packs for the same verticals form platforms target — ready to customise under your policy.
          </p>
        </div>
        <div className={styles.industryGrid}>
          {INDUSTRIES.map((item) => (
            <Link key={item.title} href={item.href} className={styles.industryCard}>
              <h3 className={styles.industryTitle}>{item.title}</h3>
              <p className={styles.industryCopy}>{item.copy}</p>
              <span className={styles.industryLink}>Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="why-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Why AI-Pass</p>
          <h2 id="why-heading" className={styles.sectionTitle}>
            Form coverage plus the operating system underneath
          </h2>
        </div>
        <div className={styles.diffGrid}>
          {DIFFERENTIATORS.map((item) => (
            <article key={item.title} className={styles.diffItem}>
              <h3 className={styles.diffTitle}>{item.title}</h3>
              <p className={styles.diffCopy}>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.ctaSection}`} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className={styles.ctaTitle}>
          Ready to replace fragmented form tools?
        </h2>
        <p className={styles.ctaCopy}>
          Start from requirements, generate the solution, and deploy into a workspace with audit, wallet, and trust.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/requirements" className={styles.btnPrimary}>
            Start free
          </Link>
          <a href="mailto:info@aipass.space?subject=Enterprise%20Forms%20Demo" className={styles.btnSecondary}>
            Book enterprise demo
          </a>
        </div>
      </section>
    </div>
  );
}
