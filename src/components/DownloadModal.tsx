'use client';

import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';

interface DownloadModalProps {
  imageUrl: string;
  onClose: () => void;
  defaultFilename?: string;
}

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'pdf';

interface ImageDimensions {
  width: number;
  height: number;
}

const FORMAT_OPTIONS: { value: ImageFormat; label: string; supportsQuality: boolean }[] = [
  { value: 'png', label: 'PNG (lossless)', supportsQuality: false },
  { value: 'jpeg', label: 'JPEG (smaller file)', supportsQuality: true },
  { value: 'webp', label: 'WebP (modern, smallest)', supportsQuality: true },
  { value: 'pdf', label: 'PDF (print-ready)', supportsQuality: false },
];

const RESIZE_PRESETS = [
  { label: 'Original', scale: 1 },
  { label: '75%', scale: 0.75 },
  { label: '50%', scale: 0.5 },
  { label: '25%', scale: 0.25 },
];

export default function DownloadModal({
  imageUrl,
  onClose,
  defaultFilename = 'infographic',
}: DownloadModalProps) {
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(1);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setCustomWidth(img.width.toString());
      setCustomHeight(img.height.toString());
      imageRef.current = img;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (originalDimensions && !useCustomSize) {
      setCustomWidth(Math.round(originalDimensions.width * scale).toString());
      setCustomHeight(Math.round(originalDimensions.height * scale).toString());
    }
  }, [scale, originalDimensions, useCustomSize]);

  const handleWidthChange = (value: string) => {
    setCustomWidth(value);
    if (originalDimensions && value) {
      const newWidth = parseInt(value);
      if (!isNaN(newWidth)) {
        const aspectRatio = originalDimensions.height / originalDimensions.width;
        setCustomHeight(Math.round(newWidth * aspectRatio).toString());
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setCustomHeight(value);
    if (originalDimensions && value) {
      const newHeight = parseInt(value);
      if (!isNaN(newHeight)) {
        const aspectRatio = originalDimensions.width / originalDimensions.height;
        setCustomWidth(Math.round(newHeight * aspectRatio).toString());
      }
    }
  };

  const getOutputDimensions = (): ImageDimensions => {
    if (useCustomSize && customWidth && customHeight) {
      return {
        width: parseInt(customWidth) || originalDimensions?.width || 800,
        height: parseInt(customHeight) || originalDimensions?.height || 600,
      };
    }
    if (originalDimensions) {
      return {
        width: Math.round(originalDimensions.width * scale),
        height: Math.round(originalDimensions.height * scale),
      };
    }
    return { width: 800, height: 600 };
  };

  const handleDownload = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const dimensions = getOutputDimensions();
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Fill with white background for JPEG and PDF (no transparency)
      if (format === 'jpeg' || format === 'pdf') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(imageRef.current, 0, 0, dimensions.width, dimensions.height);

      if (format === 'pdf') {
        // Generate PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        // Calculate PDF dimensions (convert pixels to mm at 96 DPI)
        const pxToMm = 25.4 / 96;
        const pdfWidth = dimensions.width * pxToMm;
        const pdfHeight = dimensions.height * pxToMm;

        // Determine orientation
        const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait';

        // Create PDF with custom size
        const pdf = new jsPDF({
          orientation,
          unit: 'mm',
          format: [pdfWidth, pdfHeight],
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${defaultFilename}.pdf`);
        setProcessing(false);
        onClose();
      } else {
        // Generate image formats
        const mimeType = `image/${format}`;
        const qualityValue = format === 'png' ? undefined : quality / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              setProcessing(false);
              return;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${defaultFilename}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setProcessing(false);
            onClose();
          },
          mimeType,
          qualityValue
        );
      }
    } catch (error) {
      console.error('Download failed:', error);
      setProcessing(false);
    }
  };

  const selectedFormat = FORMAT_OPTIONS.find((f) => f.value === format);
  const dimensions = getOutputDimensions();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Download Options</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Format
            </label>
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    format === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={(e) => setFormat(e.target.value as ImageFormat)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG and WebP) */}
          {selectedFormat?.supportsQuality && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

          {/* Size Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>

            {/* Preset sizes */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {RESIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setScale(preset.scale);
                    setUseCustomSize(false);
                  }}
                  className={`py-2 px-3 text-sm rounded-lg border transition ${
                    !useCustomSize && scale === preset.scale
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom size toggle */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomSize}
                onChange={(e) => setUseCustomSize(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Custom dimensions</span>
            </label>

            {/* Custom size inputs */}
            {useCustomSize && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="text-gray-400 mt-5">×</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Output Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Output</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Dimensions:</span> {dimensions.width} × {dimensions.height} px
              </p>
              <p>
                <span className="font-medium">Format:</span> {format.toUpperCase()}
              </p>
              {selectedFormat?.supportsQuality && (
                <p>
                  <span className="font-medium">Quality:</span> {quality}%
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={processing || !originalDimensions}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
