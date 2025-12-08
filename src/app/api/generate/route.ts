import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { generateInfographic } from '@/lib/gemini';
import { saveInfographic } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import type { GenerationRequest, GenerationResponse, AspectRatio, Resolution, InfographicStyle, GraphicStyle } from '@/types';

export const maxDuration = 60; // Allow up to 60 seconds for generation

// Load and compress brand logo for infographic generation
async function getBrandLogo(): Promise<string | null> {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = readFileSync(logoPath);

    // Compress logo to max 512px width
    const compressedBuffer = await sharp(logoBuffer)
      .resize(512, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64 = compressedBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
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
    const { prompt, referenceImages, aspectRatio, resolution, style, graphicStyle, enrichedContext } = body;

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

    // Get brand logo for all infographics
    const brandLogo = await getBrandLogo();

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
      graphicStyle as GraphicStyle,
      !!brandLogo // Pass flag indicating logo is included
    );

    // Save to Vercel Blob with all settings
    const record = await saveInfographic(
      imageData,
      mimeType,
      prompt,
      aspectRatio,
      resolution,
      style,
      graphicStyle
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
