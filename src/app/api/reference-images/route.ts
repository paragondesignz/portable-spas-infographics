import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from '@/lib/auth';
import type { ReferenceImage } from '@/types';

const REFERENCE_PREFIX = 'reference-images/';
const METADATA_PREFIX = 'reference-images/metadata/';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { blobs } = await list({ prefix: METADATA_PREFIX });
    const images: ReferenceImage[] = [];

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const data = (await response.json()) as ReferenceImage;
        images.push(data);
      } catch (error) {
        console.error(`Failed to fetch metadata for ${blob.pathname}:`, error);
      }
    }

    // Sort by creation date, newest first
    images.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error('List reference images error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list reference images',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = (formData.get('name') as string) || file.name;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const extension = file.name.split('.').pop() || 'png';

    // Upload the image
    const imageBlob = await put(
      `${REFERENCE_PREFIX}${id}.${extension}`,
      file,
      {
        access: 'public',
        contentType: file.type,
      }
    );

    // Create metadata
    const metadata: ReferenceImage = {
      id,
      url: imageBlob.url,
      name,
      createdAt: new Date().toISOString(),
    };

    // Save metadata
    await put(
      `${METADATA_PREFIX}${id}.json`,
      JSON.stringify(metadata),
      {
        access: 'public',
        contentType: 'application/json',
      }
    );

    return NextResponse.json({ success: true, image: metadata });
  } catch (error) {
    console.error('Upload reference image error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload reference image',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Delete image file
    const { blobs: imageBlobs } = await list({ prefix: REFERENCE_PREFIX });
    const imageBlob = imageBlobs.find((b) => b.pathname.includes(id) && !b.pathname.includes('metadata'));
    if (imageBlob) {
      await del(imageBlob.url);
    }

    // Delete metadata
    const { blobs: metadataBlobs } = await list({ prefix: METADATA_PREFIX });
    const metadataBlob = metadataBlobs.find((b) => b.pathname.includes(id));
    if (metadataBlob) {
      await del(metadataBlob.url);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reference image error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete reference image',
      },
      { status: 500 }
    );
  }
}
