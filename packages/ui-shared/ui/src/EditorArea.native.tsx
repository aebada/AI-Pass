import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { tokens } from './tokens';

export interface EditorAreaProps {
  filePath?: string;
  content?: string;
  language?: string;
  onChange?: (content: string) => void;
  children?: React.ReactNode;
}

export function EditorArea({
  filePath,
  content = '',
  language = 'plaintext',
  children,
}: EditorAreaProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Text style={styles.tabText}>📄 {filePath ?? 'No file selected'}</Text>
        {language ? <Text style={styles.langBadge}>{language}</Text> : null}
      </View>
      <View style={styles.editor}>
        {children ?? (
          <ScrollView style={styles.scroll}>
            <Text style={styles.code}>{content || '// Open a file to start editing'}</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: tokens.spacing.sm,
  },
  tabText: { color: tokens.colors.textMuted, fontSize: tokens.fontSize.sm, flex: 1 },
  langBadge: {
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
    backgroundColor: tokens.colors.bgHover,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editor: { flex: 1 },
  scroll: { flex: 1, padding: tokens.spacing.md },
  code: {
    fontFamily: 'monospace',
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
});
