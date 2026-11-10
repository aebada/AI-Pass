export interface OtelSpan {
  name: string;
  traceId: string;
  spanId: string;
  startedAt: string;
  endedAt?: string;
  attributes?: Record<string, string | number | boolean>;
}

let traceCounter = 0;

/** OpenTelemetry stub — records spans in-memory for dev */
export class OtelStub {
  private spans: OtelSpan[] = [];

  startSpan(name: string, attributes?: Record<string, string | number | boolean>): OtelSpan {
    traceCounter += 1;
    const span: OtelSpan = {
      name,
      traceId: `trace_${traceCounter}`,
      spanId: `span_${Date.now()}`,
      startedAt: new Date().toISOString(),
      attributes,
    };
    this.spans.push(span);
    return span;
  }

  endSpan(span: OtelSpan): void {
    span.endedAt = new Date().toISOString();
  }

  getSpans(limit = 100): OtelSpan[] {
    return this.spans.slice(-limit);
  }
}

export const defaultOtelStub = new OtelStub();
