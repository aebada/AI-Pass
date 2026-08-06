import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function jsonError(message: string, code = 'BAD_REQUEST', status = 400): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export {
  parseUserId,
  parseTier,
  parseUserName,
} from '@ai-pass/digital-twin/api';
