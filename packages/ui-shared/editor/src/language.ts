const EXT_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  json: 'json',
  md: 'markdown',
  css: 'css',
  scss: 'scss',
  html: 'html',
  py: 'python',
  rs: 'rust',
  go: 'go',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
};

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? 'plaintext';
}
