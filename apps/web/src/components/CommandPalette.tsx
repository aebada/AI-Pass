'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { FileTreeNode } from '@ai-pass/shared';
import styles from './CommandPalette.module.css';
import { ModuleIcon } from '@ai-pass/ui';

export interface CommandItem {
  id: string;
  label: string;
  group: 'files' | 'commands' | 'navigation' | 'search';
  icon?: string;
  meta?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  fileTree: FileTreeNode[];
  onOpenFile: (path: string) => void;
  onToggleChat: () => void;
  onToggleTerminal: () => void;
  onOpenSettings: () => void;
  onSetChatMode?: (mode: 'chat' | 'agent' | 'composer') => void;
  searchInFiles?: (query: string) => Promise<Array<{ path: string; snippet: string }>>;
}

function flattenFiles(nodes: FileTreeNode[]): Array<{ path: string; name: string }> {
  const result: Array<{ path: string; name: string }> = [];
  for (const node of nodes) {
    if (node.type === 'file') result.push({ path: node.path, name: node.name });
    if (node.children) result.push(...flattenFiles(node.children));
  }
  return result;
}

export function CommandPalette({
  open,
  onClose,
  fileTree,
  onOpenFile,
  onToggleChat,
  onToggleTerminal,
  onOpenSettings,
  onSetChatMode,
  searchInFiles,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseCommands: CommandItem[] = useMemo(
    () => [
      { id: 'toggle-chat', label: 'Toggle Chat Panel', group: 'commands', icon: 'message-circle', action: onToggleChat },
      { id: 'toggle-terminal', label: 'Toggle Terminal', group: 'commands', icon: '⌨️', action: onToggleTerminal },
      { id: 'settings', label: 'Open Settings', group: 'commands', icon: 'settings', action: onOpenSettings },
      {
        id: 'mode-chat',
        label: 'Switch to Chat Mode',
        group: 'commands',
        icon: 'message-circle',
        action: () => onSetChatMode?.('chat'),
      },
      {
        id: 'mode-agent',
        label: 'Switch to Agent Mode',
        group: 'commands',
        icon: 'bot',
        action: () => onSetChatMode?.('agent'),
      },
      {
        id: 'mode-composer',
        label: 'Switch to Composer Mode',
        group: 'commands',
        icon: 'sparkles',
        action: () => onSetChatMode?.('composer'),
      },
      {
        id: 'nav-studio',
        label: 'Go to Solution Studio',
        group: 'navigation',
        icon: 'palette',
        action: () => {
          window.location.href = '/studio';
        },
      },
      {
        id: 'nav-requirements',
        label: 'Go to Requirements',
        group: 'navigation',
        icon: 'pen-line',
        action: () => {
          window.location.href = '/requirements';
        },
      },
      {
        id: 'nav-marketplace',
        label: 'Go to Marketplace',
        group: 'navigation',
        icon: 'store',
        action: () => {
          window.location.href = '/marketplace';
        },
      },
      {
        id: 'nav-solutions',
        label: 'Go to My Solutions',
        group: 'navigation',
        icon: 'package',
        action: () => {
          window.location.href = '/solutions';
        },
      },
      {
        id: 'nav-platform',
        label: 'Go to Platform',
        group: 'navigation',
        icon: 'settings',
        action: () => {
          window.location.href = '/platform';
        },
      },
      ...flattenFiles(fileTree).map((f) => ({
        id: `file-${f.path}`,
        label: f.name,
        group: 'files' as const,
        icon: 'file-text',
        meta: f.path,
        action: () => onOpenFile(f.path),
      })),
    ],
    [fileTree, onOpenFile, onOpenSettings, onSetChatMode, onToggleChat, onToggleTerminal]
  );

  const searchResultsItems: CommandItem[] = useMemo(() => searchResults, [searchResults]);

  useEffect(() => {
    if (!query.trim() || !searchInFiles) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    void searchInFiles(query).then((results) => {
      if (cancelled) return;
      setSearchResults(
        results.map((r) => ({
          id: `search-${r.path}`,
          label: r.path,
          group: 'search' as const,
          icon: 'search',
          meta: r.snippet.slice(0, 60),
          action: () => onOpenFile(r.path),
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [query, searchInFiles, onOpenFile]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const commands = q
      ? baseCommands.filter(
          (c) =>
            c.label.toLowerCase().includes(q) ||
            c.meta?.toLowerCase().includes(q) ||
            c.group.includes(q)
        )
      : baseCommands;
    return [...searchResultsItems, ...commands];
  }, [baseCommands, query, searchResultsItems]);

  const runItem = useCallback(
    (item: CommandItem) => {
      item.action();
      onClose();
      setQuery('');
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const groups = ['search', 'files', 'commands', 'navigation'] as const;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.palette} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Command palette">
        <div className={styles.inputRow}>
          <span>⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, commands, or navigate..."
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' && filtered[activeIndex]) {
                e.preventDefault();
                runItem(filtered[activeIndex]!);
              }
            }}
          />
        </div>

        <div className={styles.results}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No matching commands</div>
          ) : (
            groups.map((group) => {
              const items = filtered.filter((c) => c.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <div className={styles.groupLabel}>{group}</div>
                  {items.map((item) => {
                    const idx = filtered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => runItem(item)}
                      >
                        <span className={styles.itemIcon}>{item.icon && <ModuleIcon name={item.icon} size={16} />}</span>
                        <span>{item.label}</span>
                        {item.meta && <span className={styles.itemMeta}>{item.meta}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <span>
            <kbd>↑↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> run
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
