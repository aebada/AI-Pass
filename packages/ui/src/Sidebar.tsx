import type { ReactNode } from 'react';
import type { FileTreeNode } from '@ai-pass/shared';
import { tokens } from './tokens';
import { ModuleIcon } from './workspace/ModuleIcon';

export interface SidebarProps {
  files?: FileTreeNode[];
  activePath?: string;
  onFileSelect?: (path: string) => void;
  title?: string;
}

function renderTree(
  nodes: FileTreeNode[],
  activePath: string | undefined,
  onFileSelect: ((path: string) => void) | undefined,
  depth = 0
): ReactNode {
  return nodes.map((node) => (
    <div key={node.path}>
      <button
        type="button"
        onClick={() => node.type === 'file' && onFileSelect?.(node.path)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
          paddingLeft: tokens.spacing.sm + depth * 12,
          background:
            node.path === activePath ? tokens.colors.bgHover : 'transparent',
          border: 'none',
          color: node.type === 'directory' ? tokens.colors.textMuted : tokens.colors.text,
          fontSize: tokens.fontSize.sm,
          textAlign: 'left',
          cursor: node.type === 'file' ? 'pointer' : 'default',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ marginRight: 6 }}><ModuleIcon name={node.type === 'directory' ? 'folder' : 'file-text'} size={14} /></span>
        {node.name}
      </button>
      {node.children && renderTree(node.children, activePath, onFileSelect, depth + 1)}
    </div>
  ));
}

export function Sidebar({
  files = [],
  activePath,
  onFileSelect,
  title = 'Explorer',
}: SidebarProps) {
  return (
    <aside
      style={{
        width: tokens.sidebarWidth,
        minWidth: tokens.sidebarWidth,
        background: tokens.colors.bgElevated,
        borderRight: `1px solid ${tokens.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          borderBottom: `1px solid ${tokens.colors.border}`,
          fontSize: tokens.fontSize.sm,
          fontWeight: 600,
          color: tokens.colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: tokens.spacing.xs }}>
        {files.length === 0 ? (
          <p
            style={{
              padding: tokens.spacing.md,
              color: tokens.colors.textMuted,
              fontSize: tokens.fontSize.sm,
            }}
          >
            No files open
          </p>
        ) : (
          renderTree(files, activePath, onFileSelect)
        )}
      </div>
    </aside>
  );
}
