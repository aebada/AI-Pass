import { useCallback, useRef } from 'react';
import type { AppSettings } from '@ai-pass/shared';
import { createProviderHub, createHubContext } from '@ai-pass/provider-hub';

export function useInlineCompletion(settings: AppSettings) {
  const disposableRef = useRef<{ dispose: () => void } | null>(null);

  const register = useCallback(
    (editor: unknown, monaco: unknown) => {
      const monacoApi = monaco as {
        languages: {
          registerInlineCompletionsProvider: (
            language: string,
            provider: {
              provideInlineCompletions: (
                doc: {
                  getValueInRange(range: {
                    startLineNumber: number;
                    startColumn: number;
                    endLineNumber: number;
                    endColumn: number;
                  }): string;
                  getLineCount(): number;
                  getLineMaxColumn(line: number): number;
                },
                position: { lineNumber: number; column: number },
                context: unknown,
                token: { isCancellationRequested: boolean }
              ) => Promise<{ items: Array<{ insertText: string; range: Record<string, number> }> }>;
              freeInlineCompletions: () => void;
            }
          ) => { dispose: () => void };
        };
      };
      const codeEditor = editor as { getModel(): { getLanguageId(): string } | null };
      disposableRef.current?.dispose();

      if (!settings.enableInlineCompletion) return;

      const model = codeEditor.getModel();
      if (!model) return;

      const language = model.getLanguageId();

      disposableRef.current = monacoApi.languages.registerInlineCompletionsProvider(language, {
        provideInlineCompletions: async (doc, position, _context, token) => {
          const prefix = doc.getValueInRange({
            startLineNumber: Math.max(1, position.lineNumber - 20),
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          if (prefix.trim().length < 3) {
            return { items: [] };
          }

          if (!settings.models.completion.apiKey) {
            return {
              items: [
                {
                  insertText: '// Tab: configure API key in Settings for AI completions',
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                },
              ],
            };
          }

          const suffix = doc.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: Math.min(doc.getLineCount(), position.lineNumber + 10),
            endColumn: doc.getLineMaxColumn(
              Math.min(doc.getLineCount(), position.lineNumber + 10)
            ),
          });

          try {
            const hub = createProviderHub({
              auth: {
                mode: settings.models.completion.apiKey ? 'byok' : 'managed',
                byokKeys: settings.models.completion.apiKey
                  ? { openai: settings.models.completion.apiKey }
                  : undefined,
              },
            });
            const hubContext = createHubContext('ide-user', 'professional', {
              taskType: 'completion',
              module: 'ide',
            });
            let text = '';

            for await (const chunk of hub.complete(
              { prefix, suffix, language, maxTokens: 128 },
              hubContext,
            )) {
              if (token.isCancellationRequested) return { items: [] };
              if (chunk.type === 'text' && chunk.content) text += chunk.content;
              if (chunk.type === 'error') break;
            }

            if (!text.trim()) return { items: [] };

            return {
              items: [
                {
                  insertText: text,
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                },
              ],
            };
          } catch {
            return { items: [] };
          }
        },
        freeInlineCompletions: () => {},
      });
    },
    [settings.enableInlineCompletion, settings.models.completion]
  );

  return register;
}
