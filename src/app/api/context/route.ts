import { NextRequest, NextResponse } from 'next/server';
import { queryAssistant } from '@/lib/pinecone';
import { isAuthenticated } from '@/lib/auth';
import type { PineconeContextResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as PineconeContextResponse,
        { status: 401 }
      );
    }

    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' } as PineconeContextResponse,
        { status: 400 }
      );
    }

    const { context, citations } = await queryAssistant(query);

    return NextResponse.json({
      success: true,
      context,
      citations,
    } as PineconeContextResponse);
  } catch (error) {
    console.error('Context retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve context',
      } as PineconeContextResponse,
      { status: 500 }
    );
  }
}
