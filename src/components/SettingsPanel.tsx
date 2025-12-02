'use client';

import { ASPECT_RATIOS, RESOLUTIONS, type AspectRatio, type Resolution } from '@/types';

interface SettingsPanelProps {
  aspectRatio: AspectRatio;
  resolution: Resolution;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onResolutionChange: (resolution: Resolution) => void;
}

export default function SettingsPanel({
  aspectRatio,
  resolution,
  onAspectRatioChange,
  onResolutionChange,
}: SettingsPanelProps) {
  const selectedRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
  const currentDimensions = selectedRatio?.dimensions[resolution];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => onAspectRatioChange(ratio.value)}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                aspectRatio === ratio.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resolution
        </label>
        <div className="flex gap-2">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.value}
              type="button"
              onClick={() => onResolutionChange(res.value)}
              className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                resolution === res.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      {currentDimensions && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          Output: <span className="font-medium">{currentDimensions}</span> pixels
        </div>
      )}
    </div>
  );
}
