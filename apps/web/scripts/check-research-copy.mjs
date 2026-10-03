#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const data = require('../app/lib/hopn-lab.json');

const root = new URL('../app/research', import.meta.url).pathname;
const forbidden = [
  'peer-reviewed',
  'state of the art',
  'state-of-the-art',
  'proven',
  'outperforms',
];
const privateNames = data.projects.filter((p) => p.public === false).map((p) => p.name);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts|css|json)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(root);
let failed = false;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  for (const phrase of forbidden) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(lower)) {
      console.error(`Forbidden phrase "${phrase}" in ${file}`);
      failed = true;
    }
  }
  if (text.includes('\u2014')) {
    console.error(`Em dash in ${file}`);
    failed = true;
  }
  const isData = file.endsWith('hopn-lab.json');
  if (!isData) {
    for (const name of privateNames) {
      if (text.includes(name)) {
        console.error(`Private project "${name}" rendered in ${file}`);
        failed = true;
      }
    }
  }
}

const publicNames = data.projects.filter((p) => p.public !== false).map((p) => p.name);
if (publicNames.includes('Swarmmind') || publicNames.includes('SAFE-CARE')) {
  console.error('Private projects leaked into public list');
  failed = true;
}

const navSource = readFileSync(new URL('../app/lib/site-nav.ts', import.meta.url), 'utf8');
if (!navSource.includes("label: 'Research'") || !navSource.includes('researchMenuItems()')) {
  console.error('Top menu is missing the Research dropdown');
  failed = true;
}

const menuSource = readFileSync(new URL('../app/lib/hopn-lab.ts', import.meta.url), 'utf8');
for (const token of [
  'researchMenuItems',
  'PROGRAM_ORDER',
  '/research',
  '/research/roadmap',
  '/research/evidence',
  '/demo',
  'mailto:contact@ehopn.com',
]) {
  if (!menuSource.includes(token)) {
    console.error(`Research menu helper is missing "${token}"`);
    failed = true;
  }
}
for (const id of ['route', 'ground', 'assure', 'foundation', 'physical']) {
  if (!data.programs.some((p) => p.id === id)) {
    console.error(`Program "${id}" missing from hopn-lab.json`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Research copy checks passed');
