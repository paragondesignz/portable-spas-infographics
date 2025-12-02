'use client';

import { GRAPHIC_STYLES, type GraphicStyle } from '@/types';

interface GraphicStyleSelectorProps {
  selectedStyle: GraphicStyle;
  onStyleChange: (style: GraphicStyle) => void;
}

export default function GraphicStyleSelector({
  selectedStyle,
  onStyleChange,
}: GraphicStyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Graphic Style
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GRAPHIC_STYLES.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onStyleChange(style.value)}
            className={`relative p-3 rounded-lg border-2 transition-all text-left ${
              selectedStyle === style.value
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 text-sm truncate">
                  {style.label}
                </h4>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {style.description}
            </p>
            {selectedStyle === style.value && (
              <div className="absolute top-1 right-1">
                <svg
                  className="w-4 h-4 text-blue-500"
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
