import { AIRouter, defaultAIRouter } from './ai-router.js';
import { PIIMasker, defaultPIIMasker } from './pii-masker.js';
import { executeHubPrompt, isProviderHubLive } from './provider-hub-bridge.js';
import type { MiddlewareExtractionRequest, MiddlewareExtractionResult } from './types.js';

export class AIMiddleware {
  constructor(
    private piiMasker: PIIMasker = defaultPIIMasker,
    private router: AIRouter = defaultAIRouter,
  ) {}

  async processExtraction(request: MiddlewareExtractionRequest): Promise<MiddlewareExtractionResult> {
    const rawText = request.rawText ?? this.buildSyntheticText(request.fileName);
    const pii = this.piiMasker.mask(rawText);
    const route = this.router.select({
      taskType: 'extraction',
      tenantId: request.tenantId,
      userId: request.userId,
      membershipTier: request.membershipTier,
      preferSpeed: true,
    });

    let creditsUsed = Math.ceil(
      route.estimatedInputTokens / 1000 + route.estimatedOutputTokens / 500,
    );

    let modelId = route.decision.model.id;
    let providerId: string = route.decision.model.providerId;
    let maskedText = pii.maskedText;

    if (isProviderHubLive()) {
      const hubResult = await executeHubPrompt({
        tenantId: request.tenantId,
        userId: request.userId,
        membershipTier: request.membershipTier,
        taskType: 'extraction',
        systemPrompt:
          'You are an invoice extraction assistant. Summarize key fields from the masked document text. Do not invent PII.',
        prompt: `Extract invoice fields from this document (${request.fileName}, ${request.mimeType}):\n\n${pii.maskedText}`,
      });

      if (hubResult) {
        maskedText = `${pii.maskedText}\n\n[AI extraction summary]\n${hubResult.content}`;
        modelId = hubResult.modelId;
        providerId = hubResult.providerId;
        creditsUsed += hubResult.credits;
      }
    }

    return {
      maskedText,
      route,
      pii,
      creditsUsed,
      modelId,
      providerId,
    };
  }

  private buildSyntheticText(fileName: string): string {
    return `Invoice document: ${fileName}. Vendor billing@acme-supplies.de IBAN DE89370400440532013000. Contact +49 30 12345678.`;
  }
}

export const defaultAIMiddleware = new AIMiddleware();
