import { ok, type ApiResponse } from '@ai-pass/platform-core';
import { NextResponse } from 'next/server';
import { getDiscoveryHub } from './discovery-server';

export { getDiscoveryHub };

export function jsonOk<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(ok(data), { status });
}

export function jsonError(message: string, code = 'BAD_REQUEST', status = 400): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
