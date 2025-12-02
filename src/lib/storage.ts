import { put, list, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import type { InfographicRecord } from '@/types';

const METADATA_PREFIX = 'infographics/metadata/';
const IMAGE_PREFIX = 'infographics/images/';

export async function saveInfographic(
  imageData: string,
  mimeType: string,
  prompt: string,
  aspectRatio: string,
  resolution: string
): Promise<InfographicRecord> {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const extension = mimeType.split('/')[1] || 'png';

  // Convert base64 to buffer
  const imageBuffer = Buffer.from(imageData, 'base64');

  // Upload the full image
  const imageBlob = await put(`${IMAGE_PREFIX}${id}.${extension}`, imageBuffer, {
    access: 'public',
    contentType: mimeType,
  });

  // Create and upload metadata
  const record: InfographicRecord = {
    id,
    url: imageBlob.url,
    thumbnailUrl: imageBlob.url, // Vercel Blob doesn't auto-generate thumbnails, using same URL
    prompt,
    aspectRatio,
    resolution,
    createdAt: timestamp,
  };

  const metadataBlob = await put(
    `${METADATA_PREFIX}${id}.json`,
    JSON.stringify(record),
    {
      access: 'public',
      contentType: 'application/json',
    }
  );

  // Return record with actual URLs
  return {
    ...record,
    url: imageBlob.url,
  };
}

export async function listInfographics(): Promise<InfographicRecord[]> {
  const { blobs } = await list({ prefix: METADATA_PREFIX });

  const records: InfographicRecord[] = [];

  for (const blob of blobs) {
    try {
      const response = await fetch(blob.url);
      const record = (await response.json()) as InfographicRecord;
      records.push(record);
    } catch (error) {
      console.error(`Failed to fetch metadata for ${blob.pathname}:`, error);
    }
  }

  // Sort by creation date, newest first
  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteInfographic(id: string): Promise<void> {
  const { blobs } = await list({ prefix: IMAGE_PREFIX });
  const imageBlob = blobs.find((b) => b.pathname.includes(id));
  if (imageBlob) {
    await del(imageBlob.url);
  }

  const { blobs: metadataBlobs } = await list({ prefix: METADATA_PREFIX });
  const metadataBlob = metadataBlobs.find((b) => b.pathname.includes(id));
  if (metadataBlob) {
    await del(metadataBlob.url);
  }
}
