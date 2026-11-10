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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const value = input.value.trim();
    if (value && onSend) {
      onSend(value);
      input.value = '';
    }
  };

  return (
    <aside
      style={{
        width: tokens.chatWidth,
        minWidth: tokens.chatWidth,
        background: tokens.colors.bgElevated,
        borderLeft: `1px solid ${tokens.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          borderBottom: `1px solid ${tokens.colors.border}`,
          fontSize: tokens.fontSize.sm,
          fontWeight: 600,
          color: tokens.colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: tokens.spacing.md,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing.sm,
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: tokens.colors.textMuted, fontSize: tokens.fontSize.sm }}>
            Ask AI Pass anything about your codebase…
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: tokens.spacing.sm,
                borderRadius: 6,
                background:
                  msg.role === 'user' ? tokens.colors.bgHover : tokens.colors.bg,
                border: `1px solid ${tokens.colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: tokens.fontSize.sm,
                  color: tokens.colors.textMuted,
                  marginBottom: 4,
                  textTransform: 'capitalize',
                }}
              >
                {msg.role}
              </div>
              <div style={{ fontSize: tokens.fontSize.md, color: tokens.colors.text, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <p style={{ color: tokens.colors.accent, fontSize: tokens.fontSize.sm }}>Thinking…</p>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: tokens.spacing.md,
          borderTop: `1px solid ${tokens.colors.border}`,
          display: 'flex',
          gap: tokens.spacing.sm,
        }}
      >
        <input
          name="message"
          type="text"
          placeholder="Message AI Pass…"
          disabled={isLoading}
          style={{
            flex: 1,
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            background: tokens.colors.bg,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 6,
            color: tokens.colors.text,
            fontSize: tokens.fontSize.md,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            background: tokens.colors.accentMuted,
            border: 'none',
            borderRadius: 6,
            color: tokens.colors.text,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: tokens.fontSize.md,
          }}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
