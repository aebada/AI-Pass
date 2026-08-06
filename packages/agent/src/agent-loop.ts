import {
  createMessage,
  type AgentContext,
  type AgentState,
  type Message,
  type ModelConfig,
  type StreamChunk,
  type ToolDefinition,
} from '@ai-pass/shared';
import { buildSystemPrompt, createProviderHub, createHubContext } from '@ai-pass/provider-hub';

export interface AgentRunnerOptions {
  config: ModelConfig;
  tools: ToolDefinition[];
  maxIterations?: number;
  mode?: 'agent' | 'composer';
  userId?: string;
  membershipTier?: import('@ai-pass/shared').MembershipTier;
  onStateChange?: (state: AgentState) => void;
}

export class AgentRunner {
  private state: AgentState;
  private context: AgentContext;
  private options: AgentRunnerOptions;

  constructor(context: AgentContext, options: AgentRunnerOptions) {
    this.context = context;
    this.options = options;
    this.state = {
      status: 'idle',
      messages: [],
      iteration: 0,
      maxIterations: options.maxIterations ?? 10,
    };
  }

  getState(): AgentState {
    return { ...this.state };
  }

  private setState(partial: Partial<AgentState>): void {
    this.state = { ...this.state, ...partial };
    this.options.onStateChange?.(this.getState());
  }

  async *run(userMessage: string): AsyncIterable<StreamChunk> {
    const userMsg = createMessage('user', userMessage);
    const messages = [...this.state.messages, userMsg];
    this.setState({ messages, status: 'thinking' });

    const hub = createProviderHub({
      auth: {
        mode: this.options.config.apiKey ? 'byok' : 'managed',
        byokKeys: this.options.config.apiKey
          ? { openai: this.options.config.apiKey, anthropic: this.options.config.apiKey }
          : undefined,
      },
    });
    const hubContext = createHubContext(
      this.options.userId ?? 'agent-user',
      this.options.membershipTier ?? 'professional',
      { taskType: 'agent', module: 'agent', preferredModelId: undefined },
    );
    const systemPrompt = buildSystemPrompt(this.context, this.options.mode ?? 'agent');

    while (this.state.iteration < this.state.maxIterations) {
      this.setState({ iteration: this.state.iteration + 1, status: 'streaming' });

      let assistantContent = '';
      const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];

      for await (const chunk of hub.streamChat(
        { messages, tools: this.options.tools, systemPrompt, modelId: undefined },
        hubContext,
      )) {
        if (chunk.type === 'text' && chunk.content) {
          assistantContent += chunk.content;
          yield chunk;
        }
        if (chunk.type === 'tool_call' && chunk.toolCall) {
          toolCalls.push(chunk.toolCall);
        }
        if (chunk.type === 'error') {
          this.setState({ status: 'error', error: chunk.error });
          yield chunk;
          return;
        }
      }

      const assistantMsg = createMessage('assistant', assistantContent, {
        toolCalls: toolCalls.length ? toolCalls : undefined,
      });
      messages.push(assistantMsg);
      this.setState({ messages });

      if (!toolCalls.length) {
        this.setState({ status: 'done' });
        yield { type: 'done' };
        return;
      }

      for (const tc of toolCalls) {
        this.setState({ status: 'tool_running', currentToolCall: tc });
        const tool = this.options.tools.find((t) => t.name === tc.name);
        let result: string;
        if (!tool) {
          result = `Unknown tool: ${tc.name}`;
        } else {
          try {
            result = await tool.execute(tc.arguments, this.context);
          } catch (err) {
            result = `Tool error: ${err instanceof Error ? err.message : String(err)}`;
          }
        }

        const toolMsg = createMessage('tool', result, { toolCallId: tc.id });
        messages.push(toolMsg);
        this.setState({ messages, currentToolCall: undefined });
      }
    }

    this.setState({ status: 'done' });
    yield { type: 'done' };
  }

  reset(): void {
    this.setState({
      status: 'idle',
      messages: [],
      iteration: 0,
      error: undefined,
      currentToolCall: undefined,
    });
  }

  setContext(context: AgentContext): void {
    this.context = context;
  }

  getMessages(): Message[] {
    return [...this.state.messages];
  }
}
