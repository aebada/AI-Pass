import { app } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface IdeSettings {
  /** Override for the live workspace origin (no trailing slash). */
  webBaseUrl?: string;
  /** Last acknowledged update version (skip prompt until newer). */
  skippedUpdateVersion?: string;
  /** Open DevTools on launch (dev convenience). */
  openDevTools?: boolean;
}

const DEFAULTS: IdeSettings = {};

function settingsPath(): string {
  return join(app.getPath('userData'), 'ide-settings.json');
}

export function loadSettings(): IdeSettings {
  try {
    const path = settingsPath();
    if (!existsSync(path)) return { ...DEFAULTS };
    const raw = readFileSync(path, 'utf-8');
    return { ...DEFAULTS, ...(JSON.parse(raw) as IdeSettings) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(partial: Partial<IdeSettings>): IdeSettings {
  const next = { ...loadSettings(), ...partial };
  const dir = app.getPath('userData');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(settingsPath(), JSON.stringify(next, null, 2), 'utf-8');
  return next;
}
