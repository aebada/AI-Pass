import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChatPanel } from '@ai-pass/ui';
import { createMessage, type Message } from '@ai-pass/shared';
import { tokens } from '@ai-pass/ui';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [...prev, createMessage('user', text)]);
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', `Mobile agent (demo): ${text}`),
      ]);
      setIsLoading(false);
    }, 600);
  }, []);

  return (
    <View style={styles.container}>
      <ChatPanel messages={messages} onSend={handleSend} isLoading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.colors.bg },
});
