'use client';

import { exportJson, exportRowsToCsv } from './export-utils';
import styles from '../invoice-ai.module.css';

interface ExportButtonsProps {
  rows: Record<string, unknown>[];
  jsonPayload: unknown;
  baseName: string;
}

export function ExportButtons({ rows, jsonPayload, baseName }: ExportButtonsProps) {
  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.exportBar}>
      <button
        type="button"
        className={styles.btnSecondary}
        disabled={rows.length === 0}
        onClick={() => exportRowsToCsv(rows, `${baseName}-${stamp}.csv`)}
      >
        Export CSV
      </button>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={() => exportJson(jsonPayload, `${baseName}-${stamp}.json`)}
      >
        Export JSON
      </button>
    </div>
  );
}
