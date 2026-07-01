import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Sidebar } from '@ai-pass/ui';
import type { FileTreeNode } from '@ai-pass/shared';
import { tokens } from '@ai-pass/ui';

const DEMO_FILES: FileTreeNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      { name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
      { name: 'utils.ts', path: 'src/utils.ts', type: 'file' },
    ],
  },
  { name: 'package.json', path: 'package.json', type: 'file' },
];

export default function FilesScreen() {
  const [activePath, setActivePath] = useState<string>();

  return (
    <View style={styles.container}>
      <Sidebar files={DEMO_FILES} activePath={activePath} onFileSelect={setActivePath} title="Files" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
});
