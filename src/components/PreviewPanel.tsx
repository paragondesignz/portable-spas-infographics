'use client';

import { useState } from 'react';
import type { InfographicRecord } from '@/types';
import Lightbox from './Lightbox';

interface PreviewPanelProps {
  imageUrl: string | null;
  isGenerating: boolean;
  selectedRecord: InfographicRecord | null;
}

export default function PreviewPanel({
  imageUrl,
  isGenerating,
  selectedRecord,
}: PreviewPanelProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infographic-${selectedRecord?.id || 'new'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Preview</h2>
        {imageUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        )}
      </div>

      <div className="flex items-center justify-center p-4 min-h-[400px] max-h-[600px]">
        {isGenerating ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your infographic...</p>
            <p className="text-sm text-gray-400 mt-1">This may take up to 60 seconds</p>
          </div>
        ) : imageUrl ? (
          <button
            onClick={() => setShowLightbox(true)}
            className="relative group cursor-zoom-in w-full h-full flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt="Generated infographic"
              className="max-w-full max-h-[560px] w-auto h-auto object-contain rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click to enlarge
              </span>
            </div>
          </button>
        ) : (
          <div className="text-center text-gray-400">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Your generated infographic will appear here</p>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Ratio:</span> {selectedRecord.aspectRatio}
            </p>
            <p>
              <span className="font-medium">Resolution:</span> {selectedRecord.resolution}
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {new Date(selectedRecord.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && imageUrl && (
        <Lightbox
          imageUrl={imageUrl}
          onClose={() => setShowLightbox(false)}
          filename={`infographic-${selectedRecord?.id || 'new'}.png`}
        />
      )}
    </div>
  );
}
