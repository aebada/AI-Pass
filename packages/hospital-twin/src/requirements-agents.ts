/**
 * Development / QA agents that verify Hospital Sector Pack + Auth requirements.
 * Run via: pnpm --filter @ai-pass/hospital-twin exec tsx src/requirements-agents.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOLDEN_QUESTIONS } from './intents.js';
import { ALL_MODULES, ONTOLOGY_CLASSES, ONTOLOGY_RELATIONS, PILOT_MODULES, SYNTHETIC_BANNER } from './ontology.js';
import { ROLE_POLICIES, refuseIfNeeded } from './roles.js';
import { SCENARIOS } from './scenarios.js';
import { createHospitalTwinService } from './service.js';

export type CheckStatus = 'pass' | 'fail' | 'warn';

export interface RequirementCheck {
  id: string;
  agent: string;
  requirement: string;
  status: CheckStatus;
  detail: string;
}

export interface AgentReport {
  agent: string;
  checks: RequirementCheck[];
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function check(agent: string, id: string, requirement: string, ok: boolean, detail: string, warn = false): RequirementCheck {
  return {
    id,
    agent,
    requirement,
    status: ok ? 'pass' : warn ? 'warn' : 'fail',
    detail,
  };
}

function fileContains(rel: string, needle: string | RegExp): boolean {
  const full = path.join(ROOT, rel);
  if (!existsSync(full)) return false;
  const text = readFileSync(full, 'utf8');
  return typeof needle === 'string' ? text.includes(needle) : needle.test(text);
}

/** Ontology & pack structure agent */
export function runOntologyAgent(): AgentReport {
  const svc = createHospitalTwinService(42);
  const snap = svc.snapshot();
  const checks: RequirementCheck[] = [
    check('ontology', 'A-classes', 'Ontology has core hospital classes', ONTOLOGY_CLASSES.length >= 20, `${ONTOLOGY_CLASSES.length} classes`),
    check('ontology', 'A-relations', 'Ontology relations defined', ONTOLOGY_RELATIONS.length >= 15, `${ONTOLOGY_RELATIONS.length} relations`),
    check('ontology', 'A-beds', 'Demo hospital ~300 beds', snap.stats.beds >= 280 && snap.stats.beds <= 360, `${snap.stats.beds} beds`),
    check('ontology', 'A-banner', 'Synthetic banner (HR-9)', snap.banner === SYNTHETIC_BANNER, snap.banner),
    check('ontology', 'B1-pilot', 'Pilot modules enabled', PILOT_MODULES.every((m) => snap.modulesEnabled.includes(m)), snap.modulesEnabled.join(',')),
    check('ontology', 'B1-all', 'All module ids catalogued', ALL_MODULES.length >= 10, `${ALL_MODULES.length} modules`),
  ];
  return { agent: 'ontology', checks };
}

/** KPI / metrics agent */
export function runKpiAgent(): AgentReport {
  const kpis = createHospitalTwinService(42).snapshot().kpis;
  const ids = new Set(kpis.map((k) => k.id));
  const required = [
    'CAP-01', 'CAP-02', 'CAP-03', 'CAP-04', 'CAP-05',
    'ADM-01', 'ADM-05',
    'ED-01', 'ED-02', 'ED-03', 'ED-04', 'ED-05', 'ED-06', 'ED-07', 'ED-08', 'ED-09',
    'OR-01', 'DX-01', 'DX-02',
    'STF-01', 'SUP-01', 'SUP-02', 'SUP-03', 'SUP-04',
    'EQ-01', 'EQ-02', 'EQ-03', 'ALR-01',
  ];
  const missing = required.filter((id) => !ids.has(id));
  const withProv = kpis.filter((k) => k.provenance?.synthetic && k.provenance.definition);
  const checks: RequirementCheck[] = [
    check('kpi', 'B4-set', 'Certified KPI set present', missing.length === 0, missing.length ? `missing ${missing.join(',')}` : `${required.length} KPIs`),
    check('kpi', 'B4-provenance', 'Every KPI has provenance', withProv.length === kpis.length, `${withProv.length}/${kpis.length}`),
  ];
  return { agent: 'kpi', checks };
}

/** Scenario / simulator agent */
export function runSimulatorAgent(): AgentReport {
  const checks: RequirementCheck[] = [];
  checks.push(check('simulator', 'C-scenarios', 'Nine scenarios defined', SCENARIOS.length === 9, `${SCENARIOS.length} scenarios`));

  const base = createHospitalTwinService(42);
  const before = base.snapshot().kpis.find((k) => k.id === 'CAP-01')!.value;
  base.injectScenario('surge');
  const afterSurge = base.snapshot();
  checks.push(
    check(
      'simulator',
      'C-surge',
      'Surge raises ED waiting / alerts',
      (afterSurge.kpis.find((k) => k.id === 'ED-03')?.value ?? 0) > 0 && afterSurge.alerts.length > 0,
      `ED-03=${afterSurge.kpis.find((k) => k.id === 'ED-03')?.value} alerts=${afterSurge.alerts.length}`,
    ),
  );

  base.reset(42);
  const resetOcc = base.snapshot().kpis.find((k) => k.id === 'CAP-01')!.value;
  checks.push(check('simulator', 'C-reset', 'Reset returns baseline', resetOcc === before, `occ ${resetOcc} vs ${before}`));

  const eq = createHospitalTwinService(42);
  eq.injectScenario('equipment_failure');
  checks.push(
    check(
      'simulator',
      'C-equipment',
      'Equipment failure triggers EQ-02',
      (eq.snapshot().kpis.find((k) => k.id === 'EQ-02')?.value ?? 0) >= 1,
      `EQ-02=${eq.snapshot().kpis.find((k) => k.id === 'EQ-02')?.value}`,
    ),
  );

  const a = createHospitalTwinService(42).snapshot();
  const b = createHospitalTwinService(42).snapshot();
  checks.push(
    check('simulator', 'C-seed', 'Same seed → identical occupancy', a.kpis.find((k) => k.id === 'CAP-01')?.value === b.kpis.find((k) => k.id === 'CAP-01')?.value, 'seed 42'),
  );

  return { agent: 'simulator', checks };
}

/** Intent / golden questions agent */
export function runIntentAgent(): AgentReport {
  const svc = createHospitalTwinService(42);
  const suite = svc.runGoldenSuite('coo');
  const checks: RequirementCheck[] = [
    check('intent', 'D3-count', '30 golden questions', GOLDEN_QUESTIONS.length === 30, `${GOLDEN_QUESTIONS.length}`),
    check('intent', 'D3-pass', 'All 30 answer for COO', suite.passed === 30, `${suite.passed}/30`),
    check(
      'intent',
      'B9-refuse',
      'Pharmacy cannot see ICU staffing',
      Boolean(refuseIfNeeded('pharmacy_manager', 'staffing')) &&
        svc.ask('Are we short on nurses tonight?', 'pharmacy_manager').refused === true,
      'role gate',
    ),
    check('intent', 'B9-roles', 'Role matrix present', ROLE_POLICIES.length >= 8, `${ROLE_POLICIES.length} roles`),
  ];
  return { agent: 'intent', checks };
}

/** Surface / wiring agent (repo files) */
export function runSurfaceAgent(): AgentReport {
  const checks: RequirementCheck[] = [
    check(
      'surface',
      'UI-workspace',
      'Workspace Command Center page exists',
      existsSync(path.join(ROOT, 'apps/web/app/workspace/hospital-twin/page.tsx')),
      '/workspace/hospital-twin',
    ),
    check(
      'surface',
      'UI-marketing',
      'Marketing page exists',
      existsSync(path.join(ROOT, 'apps/web/app/hospital-twin/page.tsx')),
      '/hospital-twin',
    ),
    check(
      'surface',
      'NAV-module',
      'Module registered in platform-core',
      fileContains('packages/platform-core/src/modules.ts', "id: 'hospital-twin'"),
      'modules.ts',
    ),
    check(
      'surface',
      'NAV-site',
      'Site nav links Hospital System Twin',
      fileContains('apps/web/app/lib/site-nav.ts', 'Hospital System Twin'),
      'site-nav.ts',
    ),
    check(
      'surface',
      'DATA-products',
      'Data Products links to hospital twin',
      fileContains('apps/web/app/workspace/data-products/page.tsx', '/workspace/hospital-twin'),
      'data-products',
    ),
    check(
      'surface',
      'BUILD-mirror',
      'Static mirror does not overwrite dedicated index.html',
      fileContains('scripts/build-web-static.sh', 'skipped'),
      'build-web-static.sh',
    ),
  ];
  return { agent: 'surface', checks };
}

/** Auth / session agent */
export function runAuthAgent(): AgentReport {
  const checks: RequirementCheck[] = [
    check(
      'auth',
      'AUTH-redirect',
      'AuthRedirect sends signed-in users to /workspace',
      fileContains('apps/web/app/components/auth/AuthRedirect.tsx', "router.replace('/workspace')"),
      'AuthRedirect',
    ),
    check(
      'auth',
      'AUTH-login-default',
      'Login default callback is /workspace',
      fileContains('apps/web/app/login/page.tsx', "?? '/workspace'"),
      'login page',
    ),
    check(
      'auth',
      'AUTH-bridge',
      'LaravelAuthBridge tries /auth/me and /auth/me.php',
      fileContains('apps/web/app/components/auth/LaravelAuthBridge.tsx', '/auth/me.php'),
      'LaravelAuthBridge',
    ),
    check(
      'auth',
      'AUTH-nav',
      'PremiumNav shows signed-in state when user present',
      fileContains('apps/web/app/components/premium/PremiumNav.tsx', 'Go to Workspace') ||
        fileContains('apps/web/app/components/premium/PremiumNav.tsx', 'user.name'),
      'PremiumNav',
    ),
  ];
  return { agent: 'auth', checks };
}

export function runAllRequirementAgents(): {
  agents: AgentReport[];
  passed: number;
  failed: number;
  warned: number;
  ok: boolean;
} {
  const agents = [
    runOntologyAgent(),
    runKpiAgent(),
    runSimulatorAgent(),
    runIntentAgent(),
    runSurfaceAgent(),
    runAuthAgent(),
  ];
  const flat = agents.flatMap((a) => a.checks);
  const passed = flat.filter((c) => c.status === 'pass').length;
  const failed = flat.filter((c) => c.status === 'fail').length;
  const warned = flat.filter((c) => c.status === 'warn').length;
  return { agents, passed, failed, warned, ok: failed === 0 };
}

function main() {
  const report = runAllRequirementAgents();
  for (const agent of report.agents) {
    console.log(`\n## Agent: ${agent.agent}`);
    for (const c of agent.checks) {
      const mark = c.status === 'pass' ? 'PASS' : c.status === 'warn' ? 'WARN' : 'FAIL';
      console.log(`  [${mark}] ${c.id} — ${c.requirement} (${c.detail})`);
    }
  }
  console.log(`\nSummary: ${report.passed} passed, ${report.failed} failed, ${report.warned} warnings`);
  if (!report.ok) process.exit(1);
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) main();
