type ExportRow = Record<string, unknown>;

function escapeCsvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportRowsToCsv(rows: ExportRow[], filename: string): void {
  if (rows.length === 0) return;
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const header = keys.map(escapeCsvCell).join(',');
  const body = rows
    .map((row) => keys.map((key) => escapeCsvCell(row[key])).join(','))
    .join('\n');
  downloadBlob(`${header}\n${body}`, filename, 'text/csv;charset=utf-8');
}

export function exportJson(data: unknown, filename: string): void {
  downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json');
}
