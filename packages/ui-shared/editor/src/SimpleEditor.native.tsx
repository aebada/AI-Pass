import { ScrollView, StyleSheet, TextInput } from 'react-native';

export interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  fontSize = 14,
}: CodeEditorProps) {
  return (
    <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
      <TextInput
        style={[styles.input, { fontSize }]}
        value={value}
        onChangeText={onChange}
        editable={!readOnly}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textAlignVertical="top"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d1117' },
  input: {
    flex: 1,
    minHeight: 400,
    padding: 16,
    color: '#e6edf3',
    fontFamily: 'monospace',
  },
});

export { CodeEditor as default };
