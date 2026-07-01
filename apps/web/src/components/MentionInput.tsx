'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FileTreeNode } from '@ai-pass/shared';
import styles from './MentionInput.module.css';

export interface MentionOption {
  id: string;
  label: string;
  insert: string;
  icon: string;
  description?: string;
}

const BUILTIN_MENTIONS: MentionOption[] = [
  { id: 'codebase', label: 'codebase', insert: '@codebase', icon: '🔍', description: 'Search entire project' },
  { id: 'docs', label: 'docs', insert: '@docs', icon: '📚', description: 'Documentation context' },
  { id: 'folder', label: 'folder', insert: '@folder', icon: '📁', description: 'Current folder' },
];

function flattenFiles(nodes: FileTreeNode[]): MentionOption[] {
  const result: MentionOption[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push({
        id: node.path,
        label: node.name,
        insert: `@file:${node.path}`,
        icon: '📄',
        description: node.path,
      });
    }
    if (node.children) result.push(...flattenFiles(node.children));
  }
  return result;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  fileTree: FileTreeNode[];
  rows?: number;
}

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  fileTree,
  rows = 3,
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fileMentions = flattenFiles(fileTree);
  const allOptions = [...BUILTIN_MENTIONS, ...fileMentions];

  const filtered = mentionQuery
    ? allOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          o.insert.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : allOptions;

  const insertMention = useCallback(
    (option: MentionOption) => {
      const el = textareaRef.current;
      if (!el) return;

      const cursor = el.selectionStart;
      const before = value.slice(0, cursor);
      const atIndex = before.lastIndexOf('@');
      const prefix = atIndex >= 0 ? value.slice(0, atIndex) : value;
      const suffix = value.slice(cursor);
      const next = `${prefix}${option.insert} ${suffix}`;
      onChange(next);
      setShowMentions(false);
      setMentionQuery('');
      requestAnimationFrame(() => {
        const pos = prefix.length + option.insert.length + 1;
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    },
    [value, onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    onChange(next);

    const cursor = e.target.selectionStart;
    const before = next.slice(0, cursor);
    const atMatch = before.match(/@([\w./-]*)$/);

    if (atMatch) {
      setShowMentions(true);
      setMentionQuery(atMatch[1] ?? '');
      setActiveIndex(0);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        insertMention(filtered[activeIndex]!);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [mentionQuery]);

  return (
    <div className={styles.mentionWrap}>
      {showMentions && filtered.length > 0 && (
        <div className={styles.mentionMenu} role="listbox">
          {filtered.slice(0, 12).map((option, i) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              className={`${styles.mentionItem} ${i === activeIndex ? styles.mentionItemActive : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(option);
              }}
            >
              <span className={styles.mentionIcon}>{option.icon}</span>
              <span>@{option.label}</span>
              {option.description && <span className={styles.mentionDesc}>{option.description}</span>}
            </button>
          ))}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </div>
  );
}
