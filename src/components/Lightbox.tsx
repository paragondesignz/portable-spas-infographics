'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
  onDownload?: () => void;
  filename?: string;
}

export default function Lightbox({ imageUrl, onClose, onDownload, filename = 'infographic' }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset position when zooming back to 1 or below
  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => {
      const newScale = Math.max(s - 0.25, 0.25);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  // Constrain position to keep image visible
  const constrainPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (!containerRef.current || !imageRef.current) return { x, y };

    const container = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;

    // Calculate scaled image dimensions
    const scaledWidth = img.naturalWidth * currentScale;
    const scaledHeight = img.naturalHeight * currentScale;

    // Calculate maximum allowed offset (keep at least 20% of image visible)
    const minVisible = 0.2;
    const maxX = Math.max(0, (scaledWidth - container.width * minVisible) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height * minVisible) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        const constrained = constrainPosition(newX, newY, scale);
        setPosition(constrained);
      }
    },
    [isDragging, dragStart, scale, constrainPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;
        const constrained = constrainPosition(newX, newY, scale);
        setPosition(constrained);
      }
    },
    [isDragging, dragStart, scale, constrainPosition]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => {
      const newScale = Math.min(Math.max(s + delta, 0.25), 5);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        // Constrain position when zooming out
        const constrained = constrainPosition(position.x, position.y, newScale);
        setPosition(constrained);
      }
      return newScale;
    });
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    },
    [onClose, handleZoomIn, handleZoomOut, handleReset]
  );

  // Track image size for constraint calculations
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">{Math.round(scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition"
            title="Zoom out (-)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition"
            title="Zoom in (+)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition"
            title="Reset view (0)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition"
            title="Download"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className={`flex-1 flex items-center justify-center overflow-hidden ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
        onClick={(e) => {
          // Only close if clicking the background, not the image, and not dragging
          if (e.target === containerRef.current && !isDragging) onClose();
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Enlarged infographic"
          className="max-w-none select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          draggable={false}
          onLoad={handleImageLoad}
        />
      </div>

      {/* Help text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
        Scroll to zoom • Drag to pan • Press Esc to close
      </div>
    </div>
  );
}
