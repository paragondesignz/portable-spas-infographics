'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReferenceImage } from '@/types';

interface ReferenceImageLibraryProps {
  selectedImages: string[];
  onSelectionChange: (images: string[]) => void;
  maxSelection?: number;
}

export default function ReferenceImageLibrary({
  selectedImages,
  onSelectionChange,
  maxSelection = 5,
}: ReferenceImageLibraryProps) {
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/reference-images');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch reference images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        await fetch('/api/reference-images', {
          method: 'POST',
          body: formData,
        });
      }
      await fetchImages();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reference image?')) return;

    try {
      await fetch(`/api/reference-images?id=${id}`, { method: 'DELETE' });
      // Remove from selection if selected
      const imageToDelete = images.find((img) => img.id === id);
      if (imageToDelete && selectedImages.includes(imageToDelete.url)) {
        onSelectionChange(selectedImages.filter((url) => url !== imageToDelete.url));
      }
      await fetchImages();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const toggleSelection = (url: string) => {
    if (selectedImages.includes(url)) {
      onSelectionChange(selectedImages.filter((u) => u !== url));
    } else if (selectedImages.length < maxSelection) {
      onSelectionChange([...selectedImages, url]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Reference Images
        </label>
        <button
          type="button"
          onClick={() => setShowLibrary(!showLibrary)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {showLibrary ? 'Hide Library' : 'Show Library'}
        </button>
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700 w-full mb-1">
            {selectedImages.length} selected for generation:
          </span>
          {selectedImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Selected ${index + 1}`}
                className="w-16 h-16 object-cover rounded border-2 border-blue-400"
              />
              <button
                type="button"
                onClick={() => toggleSelection(url)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showLibrary && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">Image Library</h4>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-green-400 transition"
              >
                {uploading ? 'Uploading...' : '+ Add Images'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reference images saved yet.</p>
              <p className="text-sm">Upload images to build your library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {images.map((image) => {
                const isSelected = selectedImages.includes(image.url);
                return (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer ${
                      isSelected ? 'ring-2 ring-blue-500 rounded' : ''
                    }`}
                    onClick={() => toggleSelection(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full aspect-square object-cover rounded"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-30 rounded flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition">
                      {image.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Click images to select (max {maxSelection}). Selected images will be
            used as references for generation.
          </p>
        </div>
      )}
    </div>
  );
}
