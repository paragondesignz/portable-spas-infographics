'use client';

import { useState, useEffect } from 'react';
import type { InfographicRecord } from '@/types';

interface ThumbnailGalleryProps {
  onSelect: (record: InfographicRecord) => void;
  selectedId: string | null;
  refreshTrigger?: number;
}

export default function ThumbnailGallery({
  onSelect,
  selectedId,
  refreshTrigger,
}: ThumbnailGalleryProps) {
  const [infographics, setInfographics] = useState<InfographicRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInfographics = async () => {
    try {
      const response = await fetch('/api/infographics');
      const data = await response.json();
      if (data.success) {
        setInfographics(data.infographics);
      }
    } catch (error) {
      console.error('Failed to fetch infographics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfographics();
  }, [refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this infographic?')) return;

    try {
      await fetch(`/api/infographics?id=${id}`, { method: 'DELETE' });
      await fetchInfographics();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Generated Infographics</h3>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">
        Generated Infographics ({infographics.length})
      </h3>

      {infographics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No infographics generated yet.</p>
          <p className="text-sm">Your creations will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          {infographics.map((record) => (
            <div
              key={record.id}
              onClick={() => onSelect(record)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                selectedId === record.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={record.thumbnailUrl}
                alt={record.prompt.substring(0, 50)}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition">
                <button
                  onClick={(e) => handleDelete(e, record.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1 opacity-0 group-hover:opacity-100 transition">
                <p className="text-white text-xs truncate">{record.aspectRatio}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
