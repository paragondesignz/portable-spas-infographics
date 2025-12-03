'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/kokonutui/loader';
import type { InfographicRecord } from '@/types';
import Lightbox from './Lightbox';
import DownloadModal from './DownloadModal';

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
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Preview</h2>
        <AnimatePresence>
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                onClick={() => setShowDownloadModal(true)}
                size="sm"
                className="bg-[#4B5E5A] hover:bg-[#3d4e4a] text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center p-4 min-h-[400px] max-h-[600px]">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Loader
                title="Generating your infographic..."
                subtitle="This may take up to 60 seconds"
                size="md"
              />
            </motion.div>
          ) : imageUrl ? (
            <motion.button
              key="image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowLightbox(true)}
              className="relative group cursor-zoom-in w-full h-full flex items-center justify-center"
            >
              <img
                src={imageUrl}
                alt="Generated infographic"
                className="max-w-full max-h-[560px] w-auto h-auto object-contain rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Click to enlarge
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400"
            >
              <ImageIcon className="mx-auto h-16 w-16 mb-4 stroke-1" />
              <p>Your generated infographic will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedRecord && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
            <p>
              <span className="font-medium">Ratio:</span> {selectedRecord.aspectRatio}
            </p>
            <p>
              <span className="font-medium">Resolution:</span> {selectedRecord.resolution}
            </p>
            {selectedRecord.style && (
              <p>
                <span className="font-medium">Color Scheme:</span> {selectedRecord.style}
              </p>
            )}
            {selectedRecord.graphicStyle && (
              <p>
                <span className="font-medium">Graphic Style:</span> {selectedRecord.graphicStyle}
              </p>
            )}
            <p className="col-span-2">
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
          onDownload={() => {
            setShowLightbox(false);
            setShowDownloadModal(true);
          }}
          filename={`infographic-${selectedRecord?.id || 'new'}`}
        />
      )}

      {/* Download Modal */}
      {showDownloadModal && imageUrl && (
        <DownloadModal
          imageUrl={imageUrl}
          onClose={() => setShowDownloadModal(false)}
          defaultFilename={`infographic-${selectedRecord?.id || 'new'}`}
        />
      )}
    </div>
  );
}
