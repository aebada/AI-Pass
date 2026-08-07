# QA Testing Report — Enterprise AI Infrastructure Platform Redesign

**Document type:** QA results (GitHub)  
**Product:** AI-Pass public website + marketing IA  
**Branch:** `cursor/website-redesign-5d67`  
**PR:** https://github.com/aebada/AI-Pass/pull/10  
**Commit under test:** `0cd87bb` — *feat(web): reposition as Enterprise AI Infrastructure Platform*  
**Related prior QA:** [`docs/QA-WEBSITE-REDESIGN-2026-08-07.md`](./QA-WEBSITE-REDESIGN-2026-08-07.md)  
**Backlog:** [`docs/CURSOR_TASKS-ENTERPRISE-INFRA-REDESIGN.md`](./CURSOR_TASKS-ENTERPRISE-INFRA-REDESIGN.md)  

**Test date:** 2026-08-07  
**Tester:** Cursor cloud agent (static + HTTP verification)

---

## 1. Overall verdict

| Scope | Result |
|---|---|
| Repository source vs Phase A acceptance criteria | **PASS** |
| Scaffolded marketing / industry routes present | **PASS** |
| Production `https://aipass.space` matches `0cd87bb` | **FAIL** (not deployed) |
| Production site health (HTTP 200, CSS `text/css`) | **PASS** |

**Release recommendation:** Conditional PASS for source. Do **not** treat Phase A as live-complete until production is redeployed and §5 live checks pass.

---

## 2. Scope tested

### 2.1 Product positioning (brief §1)

| ID | Requirement | Repo result |
|---|---|---|
| POS-1 | Canonical positioning: **Enterprise AI Infrastructure Platform** | **PASS** (`layout.tsx` title/OG/Twitter) |
| POS-2 | Homepage communicates infrastructure / orchestration / secure enterprise AI | **PASS** |

### 2.2 Homepage (brief §2)

| ID | Check | Expected | Result |
|---|---|---|---|
| HP-1 | Hero headline | *Enterprise AI Infrastructure for Secure, Governed and Autonomous Business Operations* | **PASS** |
| HP-2 | Hero subtitle | *Build, orchestrate, govern and deploy enterprise AI securely across cloud and on-premises environments.* | **PASS** |
| HP-3 | Primary CTA | Book Enterprise Demo | **PASS** |
| HP-4 | Secondary CTA | Start Free | **PASS** |
| HP-5 | Sector strip | Government, Defence, Manufacturing, Banking, Healthcare | **PASS** |
| HP-6 | Enterprise messaging | Air-gapped / private cloud / hybrid / ISO 42001 / ISO 27001 / GDPR / NIS2 / SOC 2 | **PASS** |

### 2.3 Navigation (brief §3)

| ID | Check | Expected | Result |
|---|---|---|---|
| NAV-1 | Top-level items | Platform, Solutions, Industries, Marketplace, Developers, Resources, Pricing, Company | **PASS** |
| NAV-2 | Actions | Book Demo (primary), Start Free, Sign In | **PASS** (`PremiumNav` + `DEMO_MAILTO`) |
| NAV-3 | Platform menu entries | Dashboard, Workspace, Agent Studio, Workflow Engine, Knowledge Pipeline, LiveSync, Analysis Studio, Trust Engine, Compliance AI, AI Governance, Marketplace, Discovery Hub, Presence Audit, Wallet | **PASS** (present in `site-nav.ts`) |
| NAV-4 | Industries include Government & Defence | Present | **PASS** |

### 2.4 Business pages scaffold (brief §13–14)

| Route | Result |
|---|---|
| `/government` | **PASS** (page exists) |
| `/defence` | **PASS** |
| `/compliance` | **PASS** |
| `/security` | **PASS** |
| `/privacy` | **PASS** |
| `/architecture` | **PASS** |
| `/customers` | **PASS** |
| `/partners` | **PASS** |
| `/contact`, `/careers`, `/roadmap`, `/case-studies`, `/research`, `/integrations`, `/use-cases`, `/developers` | **PASS** |
| `/industries/*` (11 industry routes) | **PASS** |

Scaffolded page count matched in this pass: **42** related `page.tsx` files under marketing/industry paths.

### 2.5 Discovery Hub (brief §4 — partial)

| ID | Check | Result | Notes |
|---|---|---|---|
| DISC-1 | 50,000+ framing on Discovery home | **PASS** (partial) | Hero copy + metadata updated; full tool schema (benchmarks, trust score, etc.) still Phase B |
| DISC-2 | Futurepedia-class directory depth | **FAIL / NOT DONE** | Tracked in backlog Phase B |

### 2.6 Not in this QA pass (Phases B–E)

Explicitly **not verified** as complete:

- AI Store → Enterprise App Store transformation (§5)
- Full AI Routing UI (§6)
- Governance center redesign (§7)
- Trust Engine certification tiers + scores UI (§8)
- Full enterprise identity (SSO/SCIM/Entra/LDAP/…) product UI (§9)
- Complete new design-system polish vs Anthropic/OpenAI/… (§10)
- Executive dashboard redesign (§11)
- Pricing calculators / feature matrix depth (§12)

These remain open in `CURSOR_TASKS-ENTERPRISE-INFRA-REDESIGN.md`.

---

## 3. Test method

1. Static inspection of `HomePageContent.tsx`, `site-nav.ts`, `layout.tsx`, `PremiumNav.tsx`  
2. Filesystem presence checks for scaffolded routes  
3. Live HTTP GET of `https://aipass.space/` + first `/_next/static/css/*.css` content-type check  
4. No Playwright/Cypress browser suite in this pass  

---

## 4. Repository results summary

| Area | Pass | Fail | N/A / deferred |
|---|---:|---:|---:|
| Positioning | 2 | 0 | 0 |
| Homepage hero/CTAs/sectors | 6 | 0 | 0 |
| Navigation IA | 4 | 0 | 0 |
| Business/industry scaffolds | 20+ | 0 | 0 |
| Discovery Hub depth | 1 partial | 1 | — |
| Phases B–E product depth | 0 | 0 | All deferred |

**Source verdict: PASS for Phase A foundation.**

---

## 5. Production live results (`https://aipass.space`)

| Check | Expected (`0cd87bb`) | Live | Status |
|---|---|---|---|
| HTTP status | 200 | 200 | **PASS** |
| CSS content-type | `text/css` | `text/css` | **PASS** |
| New hero headline | Present | Absent | **FAIL** |
| Old hero still present | Should be gone | “One workspace for every AI model” present | **FAIL** |
| Title contains Enterprise AI Infrastructure Platform | Present | “The Enterprise AI Operating System” | **FAIL** |
| Book Enterprise Demo on homepage | Present | Present (older build also has Book Demo) | **INFO** (not proof of new build) |

**Production conclusion:** Site is healthy but **does not serve** commit `0cd87bb`. Hostinger still on an older marketing build.

---

## 6. Defects

| Severity | ID | Description | Status |
|---|---|---|---|
| Blocker (release) | QA-E1 | Production not on `0cd87bb` | Open — redeploy required |
| Medium | QA-E2 | Cloud-agent Hostinger deploy path unreliable (FTP PASV / zip redirect `ZIP_OPEN_FAIL`) | Open — see prior QA deploy notes |
| Medium | QA-E3 | Discovery Hub / Store / Routing / Governance / Trust / Dashboard still Phase B–D | Open — backlog |
| Low | QA-E4 | Scaffolded business pages are thin marketing shells (need content depth) | Open — Phase D |
| Info | QA-E5 | Monorepo `tsc` has pre-existing errors outside marketing redesign files | Pre-existing |

---

## 7. Retest checklist after next production deploy

1. Hard-refresh / CDN purge `https://aipass.space/`  
2. Title = `AI-Pass — Enterprise AI Infrastructure Platform`  
3. Hero headline + subtitle match brief §2 exactly  
4. Primary CTA = Book Enterprise Demo; Secondary = Start Free  
5. Sector strip shows Government, Defence, Manufacturing, Banking, Healthcare  
6. Top nav shows 8 IA groups + Book Demo  
7. `/government` and `/defence` resolve  
8. CSS assets still return `text/css`  
9. Update this document’s §5 rows to PASS and bump sign-off  

---

## 8. Traceability

| Artifact | Location |
|---|---|
| This QA report | `docs/QA-ENTERPRISE-INFRA-REDESIGN-2026-08-07.md` |
| Prior positioning QA | `docs/QA-WEBSITE-REDESIGN-2026-08-07.md` |
| Implementation backlog | `docs/CURSOR_TASKS-ENTERPRISE-INFRA-REDESIGN.md` |
| PR | https://github.com/aebada/AI-Pass/pull/10 |
| Commit | `0cd87bb` |

---

## 9. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| QA (agent pass) | Cursor cloud agent | 2026-08-07 | **Conditional PASS** — Phase A source accepted; production blocked (QA-E1) |
| Product owner | _pending_ | | |
| Engineering | _pending_ | | |

---

*Committed to GitHub on branch `cursor/website-redesign-5d67` for PR #10.*
