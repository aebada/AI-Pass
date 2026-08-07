## Related documents

- Latest Enterprise Infrastructure QA (Phase A + live gap): [`docs/QA-ENTERPRISE-INFRA-REDESIGN-2026-08-07.md`](./QA-ENTERPRISE-INFRA-REDESIGN-2026-08-07.md)
- Implementation backlog: [`docs/CURSOR_TASKS-ENTERPRISE-INFRA-REDESIGN.md`](./CURSOR_TASKS-ENTERPRISE-INFRA-REDESIGN.md)

---

# QA Testing Report — AI-Pass Marketing Website

**Document type:** QA results  
**Product:** AI-Pass public website (`https://aipass.space`)  
**Branch under test:** `cursor/website-redesign-5d67`  
**PR:** https://github.com/aebada/AI-Pass/pull/10  
**Commits covered:**
- `fa8ee49` — redesign: 9-section homepage + collapsed nav  
- `c03ea86` — positioning: productivity/cost infrastructure, Defence/Gov, on-prem, compliance  

**Note:** Superseded for Phase A enterprise-infra scope by `QA-ENTERPRISE-INFRA-REDESIGN-2026-08-07.md` (commit `0cd87bb`). Keep this file for historical positioning QA.

**Test date:** 2026-08-07  
**Environments:**
| Environment | URL / path | Build under test |
|---|---|---|
| Source (repo) | `apps/web/app/*` on branch tip `c03ea86` | Positioning + redesign |
| Static export | `apps/web/out/` | Built from `c03ea86` |
| Production | https://aipass.space | **Not updated** to `c03ea86` at time of QA |

**Overall verdict**

| Scope | Result |
|---|---|
| Repository / static export vs acceptance criteria | **PASS** |
| Production live site vs latest positioning requirements | **FAIL** (deploy of `c03ea86` did not complete) |
| Production site health (HTTP / CSS) | **PASS** (site up; CSS served as `text/css`) |

---

## 1. Scope of testing

### 1.1 Positioning requirements (requested 2026-08-07)

| ID | Requirement |
|---|---|
| P1 | Position brand as infrastructure that boosts **productivity** and **cost reduction** |
| P2 | Remain **industry-agnostic** (no vertical lock-in as primary homepage framing) |
| P3 | Make **Defence and Government** support very clear |
| P4 | Make **on-premises** support clear for Defence/Government (P3) |
| P5 | Make **integrated AI compliance** in the infrastructure very clear |

### 1.2 Redesign brief (prior work on same branch)

| ID | Requirement (summary) |
|---|---|
| R1 | Max 5 primary nav items: Platform, Solutions, Marketplace, Pricing, Docs |
| R2 | Homepage rebuilt to a short section set (hero → outcomes → CTA) |
| R3 | No emoji as functional icons on marketing homepage / nav chrome |
| R4 | Investor / market-size content not on homepage |
| R5 | CTA hierarchy: primary filled + secondary outline; Sign In as text link |

---

## 2. Test method

1. **Static source inspection** of `HomePageContent.tsx`, `site-nav.ts`, `layout.tsx`, `Icons.tsx`  
2. **Static export inspection** of `apps/web/out/index.html` after `scripts/build-web-static.sh`  
3. **Live HTTP checks** against `https://aipass.space/` (HTML string presence + CSS content-type)  
4. **Deploy attempt review** (FTP extract helper + remote zip) recorded during the same session  

No browser automation suite (Playwright/Cypress) was run in this pass. Results are content/structure and production HTTP verification.

---

## 3. Results — repository / static export (`c03ea86`)

### 3.1 Positioning (P1–P5)

| ID | Check | Expected | Result | Evidence |
|---|---|---|---|---|
| P1 | Hero headline | Productivity/cost infrastructure claim | **PASS** | `AI infrastructure that cuts cost` in `HomePageContent.tsx` / `out/index.html` |
| P1 | Framing section | Internal productivity & cost-control positioning | **PASS** | Section “From tool sprawl to an infrastructure department”; comparison rows for Productivity / Cost |
| P2 | Industry-agnostic homepage | No Finance/Manufacturing/Healthcare industry-card grid | **PASS** | Outcomes pillars: Productivity lift / Cost reduction / Industry-agnostic |
| P3 | Defence & Government | Dedicated visible section + nav | **PASS** | Section `#defence-gov`; nav item `Defence & Government` |
| P4 | On-premises | Explicit on-prem copy tied to Defence/Gov | **PASS** | Pillar “On-premises structures”; Enterprise tier “On-premises / private cloud” |
| P5 | Compliance in infrastructure | Dedicated claim + platform step | **PASS** | H2 “AI compliance integrated into the infrastructure”; platform tab “Compliance” |

### 3.2 Navigation & chrome

| ID | Check | Expected | Result | Notes |
|---|---|---|---|---|
| R1 | Top-level nav count/labels | Exactly Platform, Solutions, Marketplace, Pricing, Docs | **PASS** | `SITE_NAV` in `site-nav.ts` |
| R1b | Solutions dropdown | Defence & Government, On-Premises, Productivity & Cost, Any organization, Browse use cases | **PASS** | |
| R3 | Emoji icons on homepage | None | **PASS** | Unicode emoji scan on `HomePageContent.tsx` = 0 |
| R3b | Theme toggle icons | SVG, not emoji | **PASS** | `PremiumNav` uses `IconSun` / `IconMoon` |
| R4 | Investor market content on homepage | Absent (`$150B`, CAGR, IPO, etc.) | **PASS** | |
| R5 | CTA styles | Primary + secondary; Sign In as text | **PASS** | `btnPrimary` / `btnSecondary` / `btnText` |

### 3.3 Metadata

| Check | Expected | Result |
|---|---|---|
| `<title>` / OG / Twitter | Match infrastructure positioning | **PASS** in source (`layout.tsx`) — “AI-Pass — AI infrastructure that cuts cost” |

### 3.4 Build

| Check | Result | Notes |
|---|---|---|
| `scripts/build-web-static.sh` | **PASS** | Static export produced at `apps/web/out/` |
| Export contains new hero string | **PASS** | Present in `out/index.html` |
| Web redesign files typecheck | **PASS** | No TS errors in HomePage / Icons / site-nav (pre-existing errors elsewhere in monorepo remain) |

---

## 4. Results — production (`https://aipass.space`)

Tested: 2026-08-07 (HTTP GET homepage + first CSS asset).

| Check | Expected (for `c03ea86`) | Live result | Status |
|---|---|---|---|
| Homepage HTTP | 200 | 200 | **PASS** |
| CSS content-type | `text/css` | `text/css` | **PASS** |
| New hero | “AI infrastructure that cuts cost” | Not present | **FAIL** |
| Old hero still live | Should be replaced | “One workspace for every AI model” present | **FAIL** (stale vs branch) |
| Defence & Government section | Present | Not present | **FAIL** |
| On-premises positioning | Present | Not present | **FAIL** |
| Industry-agnostic outcomes | Present | Finance / Manufacturing / Healthcare industry cards still present | **FAIL** |
| Document title | New positioning title | “AI-Pass — The Enterprise AI Operating System” | **FAIL** |

**Production conclusion:** Site is healthy, but **does not reflect** the positioning commit `c03ea86`. Live content matches an older/other marketing build.

---

## 5. Deploy attempt results (same session)

Goal: publish `apps/web/out` from `c03ea86` to Hostinger.

| Step | Result | Detail |
|---|---|---|
| Static build | **PASS** | Export ready; zip ~7.4 MB |
| Litterbox upload | **FAIL** | HTTP 500 from litterbox host |
| Filebin upload | **PASS** | Bin uploaded (~7.7 MB) |
| FTP upload of `aipass-extract.php` | **PASS** (after retries) | Control OK; PASV data channel flaky; succeeded on retry |
| Extract probe (`?` without token) | **PASS** | Returned `FORBIDDEN` (PHP live) |
| Remote extract from filebin URL | **FAIL** | `ZIP_OPEN_FAIL` — PHP downloaded non-zip content (filebin redirects to signed S3 URL; `file_get_contents` without redirect follow / signed URL handling) |
| Production content after attempt | **Unchanged** | Confirmed by live string checks |

**Root cause (deploy):** Extract helper cannot reliably open the zip when the host URL redirects (filebin → storage.filebin.net). Need either (a) extract PHP that follows redirects, or (b) a direct non-redirect zip URL, or (c) successful full FTP mirror from a network that supports PASV data channels.

---

## 6. Defects & gaps

| Severity | ID | Description | Status |
|---|---|---|---|
| **Blocker (release)** | D1 | Production not on `c03ea86` positioning build | Open — redeploy required |
| Medium | D2 | Hostinger deploy from cloud agent unreliable (FTP PASV timeouts; zip hosts redirect) | Open — harden extract PHP or deploy from machine with working FTP |
| Low | D3 | No automated browser E2E for nav accordion / sticky compress / playground | Open — manual or Playwright follow-up |
| Info | D4 | Monorepo `tsc` still reports unrelated package/app errors | Pre-existing; not introduced by marketing redesign files |

---

## 7. Acceptance matrix (summary)

| Requirement | Repo / export | Production |
|---|---|---|
| P1 Productivity & cost infrastructure | PASS | FAIL (not deployed) |
| P2 Industry-agnostic | PASS | FAIL (not deployed) |
| P3 Defence & Government | PASS | FAIL (not deployed) |
| P4 On-premises for P3 | PASS | FAIL (not deployed) |
| P5 Integrated AI compliance | PASS | FAIL (not deployed) |
| R1–R5 redesign structural rules | PASS | Partial / unknown vs live (live is a different build) |
| Site availability & CSS integrity | N/A | PASS |

**Release recommendation:** Do **not** mark positioning requirements as production-complete until D1 is closed with a successful Hostinger publish and the live checks in §4 flip to PASS.

---

## 8. Suggested retest after next deploy

1. Hard-refresh `https://aipass.space/` (or purge CDN if enabled).  
2. Confirm title contains `AI infrastructure that cuts cost`.  
3. Confirm first viewport hero matches that claim; subcopy mentions Defence/Government on-premises and compliance.  
4. Confirm `#outcomes` has no Finance/Manufacturing/Healthcare cards.  
5. Confirm `#defence-gov` shows Defence & Government + On-premises + Integrated AI compliance.  
6. Confirm `#trust` H2 is “AI compliance integrated into the infrastructure”.  
7. Confirm nav Solutions contains Defence & Government / On-Premises.  
8. Confirm `/_next/static/css/*.css` still returns `Content-Type: text/css`.  
9. Spot-check mobile hamburger: Start Free remains visible; no emoji theme toggle.

---

## 9. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| QA (automated agent pass) | Cursor cloud agent | 2026-08-07 | **Conditional PASS** — source/export accepted; production blocked on deploy (D1) |
| Product / owner | _pending_ | | |
| Engineering | _pending_ | | |

---

*Generated from verification of branch `cursor/website-redesign-5d67` (@ `c03ea86`) and live HTTP checks against `https://aipass.space`.*
