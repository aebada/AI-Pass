/**
 * Centralized error classification for AI providers.
 *
 * The public stream contract remains:
 *   { type: 'error', error: string }
 *
 * Internally, we classify errors so that every adapter formats
 * predictable, normalized error strings.
 */

export type ProviderErrorCode =
  | 'configuration_error'
  | 'authentication_failed'
  | 'authorization_failed'
  | 'invalid_request'
  | 'model_not_found'
  | 'rate_limited'
  | 'timeout'
  | 'network_error'
  | 'provider_unavailable'
  | 'invalid_response';

export interface ProviderError {
  code: ProviderErrorCode;
  message: string;
  provider: string;
  cause?: unknown;
}

export function createProviderError(
  code: ProviderErrorCode,
  message: string,
  provider: string,
  cause?: unknown,
): ProviderError {
  return { code, message, provider, cause };
}

/**
 * Convert an internal ProviderError into the public StreamChunk error string.
 *
 * Format:
 *   `${code}: ${provider} ${message}`
 *
 * Examples:
 *   configuration_error: Mistral API key is not configured
 *   timeout: Local request timed out
 *   network_error: Mistral endpoint is unreachable
 */
export function formatProviderError(error: ProviderError): string {
  return `${error.code}: ${error.provider} ${error.message}`;
}

/**
 * Classify an HTTP status code into a ProviderErrorCode.
 */
export function classifyHttpStatus(status: number): ProviderErrorCode {
  switch (status) {
    case 401:
      return 'authentication_failed';
    case 403:
      return 'authorization_failed';
    case 404:
      return 'model_not_found';
    case 429:
      return 'rate_limited';
    case 400:
      return 'invalid_request';
    case 503:
    case 504:
      return 'provider_unavailable';
    default:
      if (status >= 500) {
        return 'provider_unavailable';
      }
      return 'invalid_request';
  }
}

/**
 * Turn a caught error from fetch or stream processing into a ProviderError.
 */
export function classifyFetchError(
  error: unknown,
  provider: string,
  context?: { url?: string; timeoutMs?: number },
): ProviderError {
  const err = error as Partial<Error> & { name?: string };

  if (err.name === 'AbortError' || err instanceof Error && err.constructor.name === 'AbortError') {
    return createProviderError(
      'timeout',
      context?.timeoutMs
        ? `request timed out after ${context.timeoutMs} ms`
        : 'request timed out',
      provider,
      error,
    );
  }

  if (err instanceof TypeError) {
    // Network-level failures (DNS, connection refused, CORS in browser, etc.)
    return createProviderError(
      'network_error',
      context?.url
        ? `endpoint ${context.url} is unreachable`
        : 'endpoint is unreachable',
      provider,
      error,
    );
  }

  // Fallback for unexpected errors
  return createProviderError(
    'provider_unavailable',
    'unexpected error during request',
    provider,
    error,
  );
}
