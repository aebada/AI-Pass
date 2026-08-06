import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { tokens } from '@ai-pass/ui';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Models</Text>
        <Text style={styles.label}>Chat model: gpt-4o (configure API key)</Text>
        <Text style={styles.label}>Agent model: gpt-4o</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Editor</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Inline completion</Text>
          <Switch value trackColor={{ true: tokens.colors.accentMuted }} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Codebase indexing</Text>
          <Switch value trackColor={{ true: tokens.colors.accentMuted }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.label}>AI Pass Mobile v0.1.0</Text>
        <Text style={styles.muted}>Expo + React Native</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
  content: { padding: tokens.spacing.lg, gap: tokens.spacing.lg },
  heading: {
    fontSize: tokens.fontSize.xl,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  section: {
    gap: tokens.spacing.sm,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.bgElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  sectionTitle: {
    fontSize: tokens.fontSize.md,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: tokens.colors.text, fontSize: tokens.fontSize.md },
  muted: { color: tokens.colors.textMuted, fontSize: tokens.fontSize.sm },
});
