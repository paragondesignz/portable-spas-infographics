import { NextRequest, NextResponse } from 'next/server';
import { generateInfographic } from '@/lib/gemini';
import { saveInfographic } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import type { GenerationRequest, GenerationResponse, AspectRatio, Resolution, InfographicStyle } from '@/types';

export const maxDuration = 60; // Allow up to 60 seconds for generation

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as GenerationResponse,
        { status: 401 }
      );
    }

    const body: GenerationRequest = await request.json();
    const { prompt, referenceImages, aspectRatio, resolution, style, enrichedContext } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' } as GenerationResponse,
        { status: 400 }
      );
    }

    // Combine prompt with enriched context if available
    const fullPrompt = enrichedContext
      ? `${prompt}\n\nAdditional Context from Portable Spas NZ Knowledge Base:\n${enrichedContext}`
      : prompt;

    // Generate the infographic
    const { imageData, mimeType, textResponse } = await generateInfographic(
      fullPrompt,
      referenceImages || [],
      aspectRatio as AspectRatio,
      resolution as Resolution,
      style as InfographicStyle
    );

    // Save to Vercel Blob
    const record = await saveInfographic(
      imageData,
      mimeType,
      prompt,
      aspectRatio,
      resolution
    );

    return NextResponse.json({
      success: true,
      imageUrl: record.url,
      thumbnailUrl: record.thumbnailUrl,
      id: record.id,
    } as GenerationResponse);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate infographic',
      } as GenerationResponse,
      { status: 500 }
    );
  }
}
