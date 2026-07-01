'use client';

import Link from 'next/link';
import { BrandLogoLink } from '../../app/components/BrandLogoLink';
import styles from './TitleBar.module.css';

interface TitleBarProps {
  onToggleChat: () => void;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  showChat: boolean;
  showTerminal: boolean;
  chatMode: 'chat' | 'agent' | 'composer';
}

export function TitleBar({
  onToggleChat,
  onToggleTerminal,
  onOpenSettings,
  onOpenCommandPalette,
  showChat,
  showTerminal,
  chatMode,
}: TitleBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <BrandLogoLink className={styles.logo} height={32} />
        <nav className={styles.nav}>
          <button type="button" onClick={onOpenCommandPalette} title="Command palette (⌘K)">
            ⌘K
          </button>
          <Link href="/studio" className={styles.navLink}>
            Studio
          </Link>
          <Link href="/marketplace" className={styles.navLink}>
            Marketplace
          </Link>
          <Link href="/requirements" className={styles.navLink}>
            Requirements
          </Link>
          <button type="button" onClick={onOpenSettings}>
            Settings
          </button>
        </nav>
      </div>
      <div className={styles.center}>
        <span className={styles.modeBadge}>{chatMode}</span>
        <span className={styles.subtitle}>AI Pass Platform</span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={showChat ? styles.active : ''}
          onClick={onToggleChat}
          title="Toggle chat panel"
        >
          Chat
        </button>
        <button
          type="button"
          className={showTerminal ? styles.active : ''}
          onClick={onToggleTerminal}
          title="Toggle terminal"
        >
          Terminal
        </button>
      </div>
    </header>
  );
}
