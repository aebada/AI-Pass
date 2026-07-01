import type { McpServerConfig } from '@ai-pass/shared';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpClientOptions {
  config: McpServerConfig;
  onLog?: (message: string) => void;
}

export class McpClient {
  private config: McpServerConfig;
  private connected = false;
  private tools: McpTool[] = [];
  private onLog?: (message: string) => void;

  constructor(options: McpClientOptions) {
    this.config = options.config;
    this.onLog = options.onLog;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  get availableTools(): McpTool[] {
    return [...this.tools];
  }

  async connect(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error(`MCP server "${this.config.name}" is disabled`);
    }
    this.log(`Connecting to ${this.config.name}…`);
    // Stub: real implementation would spawn config.command with stdio transport
    this.connected = true;
    this.tools = [];
    this.log(`Connected to ${this.config.name}`);
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.log(`Disconnecting from ${this.config.name}`);
    this.connected = false;
    this.tools = [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (!this.connected) {
      throw new Error('MCP client is not connected');
    }
    this.log(`Calling tool ${name}`);
    return JSON.stringify({ name, args, result: 'stub' });
  }

  private log(message: string): void {
    this.onLog?.(message);
  }
}

export function createMcpClient(options: McpClientOptions): McpClient {
  return new McpClient(options);
}
