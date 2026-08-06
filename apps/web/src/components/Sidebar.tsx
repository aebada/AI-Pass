'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EXTERNAL_PROJECT_LINKS } from '@ai-pass/platform-core';
import type { FileTreeNode, GitFileStatus } from '@ai-pass/shared';
import styles from './Sidebar.module.css';
import { ModuleIcon } from '@ai-pass/ui';

const BUSINESS_LINKS = [
  { href: '/studio', icon: 'palette', label: 'Solution Studio' },
  { href: '/requirements', icon: 'pen-line', label: 'Requirements' },
  { href: '/marketplace', icon: 'store', label: 'Marketplace' },
  { href: '/solutions', icon: 'package', label: 'My Solutions' },
  { href: '/platform', icon: 'settings', label: 'Platform' },
  { href: '/platform/governance', icon: 'scale', label: 'Governance' },
];

const GIT_STATUS_LABEL: Record<GitFileStatus['status'], string> = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  untracked: 'U',
  renamed: 'R',
};

interface SidebarProps {
  fileTree: FileTreeNode[];
  gitStatus: GitFileStatus[];
  activeFile?: string;
  onFileSelect: (path: string) => void;
  onOpenFolder?: () => void;
  workspaceLabel?: string;
}

function TreeNode({
  node,
  depth,
  activeFile,
  onFileSelect,
  expanded,
  onToggle,
}: {
  node: FileTreeNode;
  depth: number;
  activeFile?: string;
  onFileSelect: (path: string) => void;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isDir = node.type === 'directory';
  const isOpen = expanded.has(node.path);

  return (
    <li>
      <button
        type="button"
        className={`${isDir ? styles.folder : styles.file} ${node.path === activeFile ? styles.activeFile : ''}`}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => {
          if (isDir) onToggle(node.path);
          else onFileSelect(node.path);
        }}
      >
        {isDir && <span className={styles.chevron}>{isOpen ? '▼' : '▶'}</span>}
        {!isDir && <span className={styles.chevron} />}
        <span><ModuleIcon name={isDir ? 'folder' : 'file-text'} size={14} /></span>
        <span>{node.name}</span>
      </button>
      {isDir && isOpen && node.children && (
        <ul className={styles.tree}>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({
  fileTree,
  gitStatus,
  activeFile,
  onFileSelect,
  onOpenFolder,
  workspaceLabel = 'sample-project',
}: SidebarProps) {
  const [tab, setTab] = useState<'explorer' | 'git' | 'business'>('explorer');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['src']));

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.tabs}>
        <button type="button" className={tab === 'explorer' ? styles.active : ''} onClick={() => setTab('explorer')}>
          Explorer
        </button>
        <button type="button" className={tab === 'git' ? styles.active : ''} onClick={() => setTab('git')}>
          Git
        </button>
        <button type="button" className={tab === 'business' ? styles.active : ''} onClick={() => setTab('business')}>
          Business
        </button>
      </div>

      <div className={styles.content}>
        {tab === 'explorer' && (
          <>
            <div className={styles.workspaceBar}>
              <span className={styles.workspaceName}>{workspaceLabel}</span>
              {onOpenFolder && (
                <button type="button" className={styles.openFolderBtn} onClick={onOpenFolder} title="Open folder">
                  Open
                </button>
              )}
            </div>
            <ul className={styles.tree}>
              {fileTree.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  depth={0}
                  activeFile={activeFile}
                  onFileSelect={onFileSelect}
                  expanded={expanded}
                  onToggle={toggleFolder}
                />
              ))}
            </ul>
          </>
        )}

        {tab === 'git' && (
          <div className={styles.gitList}>
            {gitStatus.length === 0 ? (
              <p className={styles.emptyHint}>No changes</p>
            ) : (
              gitStatus.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={styles.gitItem}
                  onClick={() => onFileSelect(item.path)}
                >
                  <span className={styles.gitStatus} data-status={item.status}>
                    {GIT_STATUS_LABEL[item.status]}
                  </span>
                  <span>{item.path}</span>
                </button>
              ))
            )}
          </div>
        )}

        {tab === 'business' && (
          <nav className={styles.businessNav}>
            <p className={styles.businessHint}>AI Pass business features</p>
            {BUSINESS_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.businessLink}>
                <span><ModuleIcon name={link.icon} size={16} /></span>
                {link.label}
              </Link>
            ))}
            <p className={styles.businessHint}>External projects</p>
            {EXTERNAL_PROJECT_LINKS.map((project) => (
              <a
                key={project.id}
                href={project.url}
                className={styles.businessLink}
                target="_blank"
                rel="noopener noreferrer"
                title={project.description}
              >
                <span><ModuleIcon name="link" size={14} /></span>
                {project.label}
              </a>
            ))}
            <Link href="/" className={styles.businessLink}>
              <span><ModuleIcon name="home" size={14} /></span>
              Landing
            </Link>
          </nav>
        )}
      </div>
    </aside>
  );
}
