'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './TerminalPanel.module.css';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

interface TerminalPanelProps {
  useXterm?: boolean;
}

function XtermTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    void (async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      await import('@xterm/xterm/css/xterm.css');

      if (disposed || !containerRef.current) return;

      const term = new Terminal({
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#0078d4',
        },
        fontSize: 13,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();
      term.writeln('AI Pass terminal - xterm.js (web)');
      term.writeln('Desktop app provides native shell via Electron.');
      term.write('$ ');

      const observer = new ResizeObserver(() => fitAddon.fit());
      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        term.dispose();
      };
    })();

    return () => {
      disposed = true;
    };
  }, []);

  return <div ref={containerRef} className={styles.xtermHost} />;
}

export function TerminalPanel({ useXterm = false }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: 'AI Pass Terminal v0.1.0' },
    { type: 'output', text: 'Type commands below. (Browser stub - native shell in desktop app)' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [lines]);

  if (useXterm) {
    return (
      <div className={styles.terminal}>
        <div className={styles.header}>
          <span>Terminal</span>
        </div>
        <XtermTerminal />
      </div>
    );
  }

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setLines((prev) => [...prev, { type: 'input', text: `$ ${trimmed}` }]);

    if (trimmed === 'clear') {
      setLines([]);
      return;
    }

    if (trimmed === 'help') {
      setLines((prev) => [
        ...prev,
        { type: 'output', text: 'Available commands: help, clear, echo <text>, pwd, ls' },
      ]);
      return;
    }

    if (trimmed.startsWith('echo ')) {
      setLines((prev) => [...prev, { type: 'output', text: trimmed.slice(5) }]);
      return;
    }

    if (trimmed === 'pwd') {
      setLines((prev) => [...prev, { type: 'output', text: '/workspace' }]);
      return;
    }

    if (trimmed === 'ls') {
      setLines((prev) => [
        ...prev,
        { type: 'output', text: 'src/\npackage.json\nREADME.md\ntsconfig.json' },
      ]);
      return;
    }

    setLines((prev) => [
      ...prev,
      { type: 'error', text: `Command not available in browser mode: ${trimmed}` },
      { type: 'output', text: 'Use the desktop app for full terminal integration.' },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    }
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.header}>
        <span>Terminal</span>
        <button type="button" onClick={() => setLines([])}>
          Clear
        </button>
      </div>
      <div className={styles.output}>
        {lines.map((line, i) => (
          <div key={i} className={styles[line.type]}>
            {line.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className={styles.inputRow}>
        <span className={styles.prompt}>$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
