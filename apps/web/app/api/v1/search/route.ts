import { handleSearch } from '@ai-pass/platform-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? '';
  return NextResponse.json(handleSearch(query));
}
