import type { FileTreeNode } from '@ai-pass/shared';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { tokens } from './tokens';

export interface SidebarProps {
  files?: FileTreeNode[];
  activePath?: string;
  onFileSelect?: (path: string) => void;
  title?: string;
}

function TreeNode({
  node,
  activePath,
  onFileSelect,
  depth,
}: {
  node: FileTreeNode;
  activePath?: string;
  onFileSelect?: (path: string) => void;
  depth: number;
}) {
  const isActive = node.path === activePath;
  return (
    <View>
      <TouchableOpacity
        disabled={node.type === 'directory'}
        onPress={() => onFileSelect?.(node.path)}
        style={[styles.item, { paddingLeft: tokens.spacing.sm + depth * 12 }, isActive && styles.itemActive]}
      >
        <Text style={styles.itemText}>
          {node.type === 'directory' ? '📁 ' : '📄 '}
          {node.name}
        </Text>
      </TouchableOpacity>
      {node.children?.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          activePath={activePath}
          onFileSelect={onFileSelect}
          depth={depth + 1}
        />
      ))}
    </View>
  );
}

export function Sidebar({ files = [], activePath, onFileSelect, title = 'Explorer' }: SidebarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <ScrollView style={styles.scroll}>
        {files.length === 0 ? (
          <Text style={styles.empty}>No files open</Text>
        ) : (
          files.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              activePath={activePath}
              onFileSelect={onFileSelect}
              depth={0}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bgElevated,
  },
  header: {
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
  empty: {
    padding: tokens.spacing.md,
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
  },
  item: {
    paddingVertical: tokens.spacing.xs,
    paddingRight: tokens.spacing.sm,
  },
  itemActive: {
    backgroundColor: tokens.colors.bgHover,
  },
  itemText: {
    color: tokens.colors.text,
    fontSize: tokens.fontSize.sm,
  },
});
