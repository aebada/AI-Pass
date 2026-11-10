import type { Message } from '@ai-pass/shared';

export interface ChatMessageProps {
  message: Message;
}

const roleColors: Record<Message['role'], string> = {
  user: 'var(--ai-accent)',
  assistant: 'var(--ai-success)',
  system: 'var(--ai-text-muted)',
  tool: '#d2a8ff',
};

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--ai-border)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: roleColors[message.role],
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {message.role}
      </div>
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'var(--ai-font)',
          fontSize: 13,
          color: 'var(--ai-text)',
          lineHeight: 1.5,
        }}
      >
        {message.content}
      </pre>
    </div>
  );
}
