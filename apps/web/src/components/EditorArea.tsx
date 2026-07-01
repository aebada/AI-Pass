import type { OpenFile, AppSettings } from '@ai-pass/shared';
import { MonacoEditor } from '@ai-pass/editor';
import { useInlineCompletion } from '../lib/useInlineCompletion';
import styles from './EditorArea.module.css';

interface EditorAreaProps {
  files: Record<string, OpenFile>;
  openTabs: string[];
  activeTab: string;
  fontSize: number;
  theme: 'vs-dark' | 'vs-light';
  settings: AppSettings;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
  onContentChange: (path: string, content: string) => void;
  onSelectionChange?: (path: string, selection: OpenFile['selection']) => void;
}

export function EditorArea({
  files,
  openTabs,
  activeTab,
  fontSize,
  theme,
  settings,
  onTabSelect,
  onTabClose,
  onContentChange,
  onSelectionChange,
}: EditorAreaProps) {
  const activeFile = files[activeTab];
  const registerInlineCompletion = useInlineCompletion(settings);

  return (
    <div className={styles.area}>
      <div className={styles.tabs}>
        {openTabs.map((path) => {
          const file = files[path];
          return (
            <div
              key={path}
              className={`${styles.tab} ${path === activeTab ? styles.activeTab : ''}`}
              onClick={() => onTabSelect(path)}
              onKeyDown={(e) => e.key === 'Enter' && onTabSelect(path)}
              role="tab"
              tabIndex={0}
              aria-selected={path === activeTab}
            >
              <span className={styles.tabName}>
                {file?.isDirty && <span className={styles.dirty}>●</span>}
                {path.split('/').pop()}
              </span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(path);
                }}
                aria-label={`Close ${path}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.editor}>
        {activeFile ? (
          <MonacoEditor
            key={activeTab}
            path={activeTab}
            value={activeFile.content}
            theme={theme}
            fontSize={fontSize}
            onChange={(val) => onContentChange(activeTab, val)}
            onSelectionChange={(sel) => onSelectionChange?.(activeTab, sel)}
            onMount={(editor, monaco) => registerInlineCompletion(editor, monaco)}
          />
        ) : (
          <div className={styles.empty}>Open a file to start editing</div>
        )}
      </div>
    </div>
  );
}
