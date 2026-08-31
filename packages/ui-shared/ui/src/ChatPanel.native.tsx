import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Message } from '@ai-pass/shared';
import { tokens } from './tokens';

export interface ChatPanelProps {
  messages?: Message[];
  onSend?: (content: string) => void;
  isLoading?: boolean;
  title?: string;
}

export function ChatPanel({
  messages = [],
  onSend,
  isLoading = false,
  title = 'AI Chat',
}: ChatPanelProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const value = input.trim();
    if (value && onSend) {
      onSend(value);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 ? (
          <Text style={styles.empty}>Ask AI Pass anything about your codebase…</Text>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}
            >
              <Text style={styles.role}>{msg.role}</Text>
              <Text style={styles.content}>{msg.content}</Text>
            </View>
          ))
        )}
        {isLoading && <ActivityIndicator color={tokens.colors.accent} />}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Message AI Pass…"
          placeholderTextColor={tokens.colors.textMuted}
          editable={!isLoading}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isLoading}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bgElevated },
  header: {
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messages: { flex: 1 },
  messagesContent: { padding: tokens.spacing.md, gap: tokens.spacing.sm },
  empty: { color: tokens.colors.textMuted, fontSize: tokens.fontSize.sm },
  bubble: {
    padding: tokens.spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: tokens.spacing.sm,
  },
  userBubble: { backgroundColor: tokens.colors.bgHover },
  assistantBubble: { backgroundColor: tokens.colors.bg },
  role: {
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  content: { color: tokens.colors.text, fontSize: tokens.fontSize.md },
  inputRow: {
    flexDirection: 'row',
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  input: {
    flex: 1,
    padding: tokens.spacing.sm,
    backgroundColor: tokens.colors.bg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 6,
    color: tokens.colors.text,
    fontSize: tokens.fontSize.md,
  },
  sendBtn: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.colors.accentMuted,
    borderRadius: 6,
    justifyContent: 'center',
  },
  sendText: { color: tokens.colors.text, fontSize: tokens.fontSize.md },
});
