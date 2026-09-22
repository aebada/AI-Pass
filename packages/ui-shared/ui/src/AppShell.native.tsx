import { StyleSheet, Text, View } from 'react-native';
import { tokens } from './tokens';
import { Sidebar, type SidebarProps } from './Sidebar.native';
import { ChatPanel, type ChatPanelProps } from './ChatPanel.native';
import { EditorArea, type EditorAreaProps } from './EditorArea.native';

export interface AppShellProps {
  title?: string;
  sidebar?: SidebarProps;
  editor?: EditorAreaProps;
  chat?: ChatPanelProps;
  terminal?: React.ReactNode;
  statusBar?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function AppShell({
  title = 'AI Pass',
  sidebar,
  editor,
  chat,
  statusBar,
  headerActions,
}: AppShellProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>AI-powered code editor</Text>
        {headerActions}
      </View>
      <View style={styles.body}>
        {sidebar && <Sidebar {...sidebar} />}
        <View style={styles.center}>
          {editor && <EditorArea {...editor} />}
        </View>
        {chat && <ChatPanel {...chat} />}
      </View>
      {statusBar ?? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ready</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.bg },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: tokens.colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    gap: tokens.spacing.md,
  },
  title: { fontWeight: '700', fontSize: tokens.fontSize.lg, color: tokens.colors.text },
  subtitle: { color: tokens.colors.textMuted, fontSize: tokens.fontSize.sm },
  body: { flex: 1, flexDirection: 'row' },
  center: { flex: 1 },
  footer: {
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
    backgroundColor: tokens.colors.accentMuted,
  },
  footerText: { color: tokens.colors.text, fontSize: tokens.fontSize.sm },
});

export { tokens };
export type { SidebarProps, ChatPanelProps, EditorAreaProps };
