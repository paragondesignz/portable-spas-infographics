'use client';

import { INFOGRAPHIC_STYLES, type InfographicStyle } from '@/types';

interface StyleSelectorProps {
  selectedStyle: InfographicStyle;
  onStyleChange: (style: InfographicStyle) => void;
}

export default function StyleSelector({
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Infographic Style
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {INFOGRAPHIC_STYLES.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onStyleChange(style.value)}
            className={`relative p-3 rounded-lg border-2 transition-all text-left ${
              selectedStyle === style.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {/* Color Preview Swatches */}
            <div className="flex gap-1 mb-2">
              {style.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Style Label */}
            <h3
              className={`font-medium text-sm ${
                selectedStyle === style.value ? 'text-blue-700' : 'text-gray-800'
              }`}
            >
              {style.label}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {style.description}
            </p>

            {/* Selected Indicator */}
            {selectedStyle === style.value && (
              <div className="absolute top-2 right-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
