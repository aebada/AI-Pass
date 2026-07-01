import styles from './StatusBar.module.css';

interface StatusBarProps {
  activeFile?: string;
  model: string;
  provider: string;
  language?: string;
  line?: number;
  encoding?: string;
}

export function StatusBar({
  activeFile,
  model,
  provider,
  language = 'TypeScript',
  line = 1,
  encoding = 'UTF-8',
}: StatusBarProps) {
  return (
    <footer className={styles.bar}>
      <div className={styles.left}>
        <span>AI Pass Platform</span>
        {activeFile && <span className={styles.file}>{activeFile}</span>}
      </div>
      <div className={styles.right}>
        <span>Ln {line}</span>
        <span>{language}</span>
        <span>{encoding}</span>
        <span>{provider}</span>
        <span>{model}</span>
      </div>
    </footer>
  );
}
