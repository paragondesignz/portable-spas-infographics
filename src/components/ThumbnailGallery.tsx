'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import Loader from '@/components/kokonutui/loader';
import type { InfographicRecord } from '@/types';

interface ThumbnailGalleryProps {
  onSelect: (record: InfographicRecord) => void;
  selectedId: string | null;
  refreshTrigger?: number;
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className="w-full h-full relative bg-gray-200">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
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
        <div className="flex items-center justify-center py-8">
          <Loader
            title="Loading gallery..."
            subtitle="Fetching your infographics"
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">
        Generated Infographics ({infographics.length})
      </h3>

      {infographics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          <ImageIcon className="mx-auto h-12 w-12 mb-3 stroke-1 text-gray-300" />
          <p>No infographics generated yet.</p>
          <p className="text-sm">Your creations will appear here.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {infographics.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => onSelect(record)}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedId === record.id
                    ? 'border-[#4B5E5A] ring-2 ring-[#4B5E5A]/20'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-square">
                  <ThumbnailImage
                    src={record.url}
                    alt={record.prompt?.substring(0, 50) || 'Infographic'}
                  />
                </div>

                {/* Delete button - only visible on hover */}
                <button
                  onClick={(e) => handleDelete(e, record.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Aspect ratio label - only visible on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/70 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate text-center">{record.aspectRatio}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
