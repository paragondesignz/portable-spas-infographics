import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateInfographic } from '@/lib/gemini';
import { saveInfographic } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import type { GenerationRequest, GenerationResponse, AspectRatio, Resolution, InfographicStyle, LayoutStyle } from '@/types';

export const maxDuration = 60; // Allow up to 60 seconds for generation

// Load brand logo for infographic generation
function getBrandLogo(): string | null {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = readFileSync(logoPath);
    const base64 = logoBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Failed to load brand logo:', error);
    return null;
  }
}

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
    const { prompt, referenceImages, aspectRatio, resolution, style, layoutStyle, enrichedContext } = body;

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

    // Get brand logo for brand style
    const brandLogo = style === 'portable-spas-brand' ? getBrandLogo() : null;

    // Combine reference images with brand logo if applicable
    const allReferenceImages = [...(referenceImages || [])];
    if (brandLogo) {
      allReferenceImages.unshift(brandLogo); // Add logo as first reference image
    }

    // Generate the infographic
    const { imageData, mimeType } = await generateInfographic(
      fullPrompt,
      allReferenceImages,
      aspectRatio as AspectRatio,
      resolution as Resolution,
      style as InfographicStyle,
      layoutStyle as LayoutStyle,
      !!brandLogo // Pass flag indicating logo is included
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
