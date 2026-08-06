import { useState, useRef, useEffect, useCallback } from 'react';
import type { AppSettings, EditorContext, Message, FileTreeNode } from '@ai-pass/shared';
import { createMessage } from '@ai-pass/shared';
import { buildSystemPrompt, createProviderHub, createHubContext } from '@ai-pass/provider-hub';
import { AgentRunner, createDefaultTools } from '@ai-pass/agent';
import { createBrowserAdapters } from '../lib/adapters';
import { MentionInput } from './MentionInput';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  mode: 'chat' | 'agent' | 'composer';
  onModeChange: (mode: 'chat' | 'agent' | 'composer') => void;
  settings: AppSettings;
  editorContext: EditorContext;
  fileTree: FileTreeNode[];
}

export function ChatPanel({ mode, onModeChange, settings, editorContext, fileTree }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<AgentRunner | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    const userMsg = createMessage('user', text);
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent('');

    const context = {
      editor: editorContext,
      rules: settings.rules,
      skills: settings.skills,
      cwd: editorContext.workspaceRoot,
    };

    try {
      if (mode === 'agent' || mode === 'composer') {
        const adapters = createBrowserAdapters(editorContext);
        const tools = createDefaultTools(adapters);
        const runner = new AgentRunner(context, {
          config: settings.models.agent,
          tools,
          mode,
          maxIterations: 10,
        });
        agentRef.current = runner;

        let content = '';
        for await (const chunk of runner.run(text)) {
          if (chunk.type === 'text' && chunk.content) {
            content += chunk.content;
            setStreamingContent(content);
          }
          if (chunk.type === 'error') {
            setMessages((prev) => [...prev, createMessage('assistant', `Error: ${chunk.error}`)]);
            break;
          }
        }
        if (content) {
          setMessages((prev) => [...prev, createMessage('assistant', content)]);
        }
      } else {
        const hub = createProviderHub({
          auth: {
            mode: settings.models.chat.apiKey ? 'byok' : 'managed',
            byokKeys: settings.models.chat.apiKey
              ? { openai: settings.models.chat.apiKey, anthropic: settings.models.chat.apiKey }
              : undefined,
          },
        });
        const hubContext = createHubContext('ide-user', 'professional', {
          taskType: 'chat',
          module: 'ide',
        });
        const systemPrompt = buildSystemPrompt(context, 'chat');
        let content = '';

        for await (const chunk of hub.streamChat(
          { messages: [...messages, userMsg], systemPrompt },
          hubContext,
        )) {
          if (chunk.type === 'text' && chunk.content) {
            content += chunk.content;
            setStreamingContent(content);
          }
          if (chunk.type === 'error') {
            setMessages((prev) => [...prev, createMessage('assistant', `Error: ${chunk.error}`)]);
            break;
          }
        }
        if (content) {
          setMessages((prev) => [...prev, createMessage('assistant', content)]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', `Error: ${err instanceof Error ? err.message : String(err)}`),
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [input, isStreaming, mode, settings, editorContext, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.modeTabs}>
          {(['chat', 'agent', 'composer'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={mode === m ? styles.activeMode : ''}
              onClick={() => onModeChange(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <button type="button" className={styles.clearBtn} onClick={() => setMessages([])} title="Clear chat">
          Clear
        </button>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && !isStreaming && (
          <div className={styles.welcome}>
            <h3>AI Pass Assistant</h3>
            <p>Ask about your code, use Agent mode for autonomous edits, or Composer for multi-file changes.</p>
            {!settings.models.chat.apiKey && (
              <p className={styles.hint}>Configure your API key in Settings to enable AI features.</p>
            )}
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.role}>{msg.role}</div>
            <div className={styles.content}>{msg.content}</div>
          </div>
        ))}
        {isStreaming && streamingContent && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.role}>assistant</div>
            <div className={styles.content}>
              {streamingContent}
              <span className={styles.cursor}>▊</span>
            </div>
          </div>
        )}
        {isStreaming && !streamingContent && (
          <div className={styles.thinking}>Thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <MentionInput
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'agent'
              ? 'Ask the agent to make changes... (@file, @codebase)'
              : mode === 'composer'
                ? 'Describe multi-file changes... (@file, @folder)'
                : 'Ask about your code... (@file, @docs)'
          }
          disabled={isStreaming}
          fileTree={fileTree}
        />
        <button type="button" className={styles.sendBtn} onClick={sendMessage} disabled={isStreaming || !input.trim()}>
          {isStreaming ? '...' : 'Send'}
        </button>
      </div>
    </aside>
  );
}
