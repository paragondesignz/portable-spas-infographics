'use client';

import { LAYOUT_STYLES, type LayoutStyle } from '@/types';

interface LayoutStyleSelectorProps {
  selectedLayout: LayoutStyle;
  onLayoutChange: (layout: LayoutStyle) => void;
}

export default function LayoutStyleSelector({
  selectedLayout,
  onLayoutChange,
}: LayoutStyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Layout Style
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {LAYOUT_STYLES.map((layout) => (
          <button
            key={layout.value}
            type="button"
            onClick={() => onLayoutChange(layout.value)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedLayout === layout.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{layout.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm">
                  {layout.label}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {layout.description}
                </p>
              </div>
            </div>
            {selectedLayout === layout.value && (
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
