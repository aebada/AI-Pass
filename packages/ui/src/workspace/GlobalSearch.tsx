'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultGlobalSearchService, type SearchResult } from '@ai-pass/platform-core';
import { ModuleIcon } from './ModuleIcon';
import { tokens } from './tokens';

export interface GlobalSearchProps {
  onNavigate?: (route: string) => void;
  placeholder?: string;
}

const TYPE_LABELS: Record<string, string> = {
  module: 'Module',
  app: 'App',
  agent: 'Agent',
  workflow: 'Workflow',
  knowledge: 'Knowledge',
  marketplace: 'Marketplace',
  report: 'Report',
  chat: 'Chat',
};

export function GlobalSearch({ onNavigate, placeholder = 'Search modules, apps, agents…' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length >= 1) {
      setResults(defaultGlobalSearchService.search({ query, limit: 8 }));
      setOpen(true);
      setActiveIndex(0);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navigate = useCallback(
    (route: string) => {
      setOpen(false);
      setQuery('');
      if (onNavigate) {
        onNavigate(route);
      } else if (typeof window !== 'undefined') {
        window.location.href = route;
      }
    },
    [onNavigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].route);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Global search"
          style={{
            width: '100%',
            height: 34,
            padding: '0 64px 0 34px',
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.colors.border}`,
            background: 'rgba(255,255,255,0.03)',
            color: tokens.colors.text,
            fontSize: tokens.fontSize.sm,
            outline: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 11,
            top: '50%',
            transform: 'translateY(-50%)',
            color: tokens.colors.textMuted,
            pointerEvents: 'none',
            display: 'flex',
          }}
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <kbd
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 10,
            color: tokens.colors.textMuted,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 4,
            padding: '1px 5px',
            background: 'transparent',
            fontFamily: 'inherit',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: tokens.colors.bgElevated,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radius.md,
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {results.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onMouseDown={() => navigate(r.route)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: i === activeIndex ? tokens.colors.bgHover : 'transparent',
                color: tokens.colors.text,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {r.icon ? <ModuleIcon name={r.icon} /> : <span style={{ width: 20 }}>·</span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: tokens.fontSize.sm, fontWeight: 500 }}>{r.title}</div>
                <div
                  style={{
                    fontSize: tokens.fontSize.xs,
                    color: tokens.colors.textMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.description}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: tokens.colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {TYPE_LABELS[r.type] ?? r.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
