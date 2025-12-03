'use client';

import { motion } from 'motion/react';
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
            <motion.button
              key={ratio.value}
              type="button"
              onClick={() => onAspectRatioChange(ratio.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                aspectRatio === ratio.value
                  ? 'bg-[#4B5E5A] text-white border-[#4B5E5A]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#4B5E5A]'
              }`}
            >
              {ratio.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resolution
        </label>
        <div className="flex gap-2">
          {RESOLUTIONS.map((res) => (
            <motion.button
              key={res.value}
              type="button"
              onClick={() => onResolutionChange(res.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors ${
                resolution === res.value
                  ? 'bg-[#4B5E5A] text-white border-[#4B5E5A]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#4B5E5A]'
              }`}
            >
              {res.label}
            </motion.button>
          ))}
        </div>
      </div>

      {currentDimensions && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg"
        >
          Output: <span className="font-medium">{currentDimensions}</span> pixels
        </motion.div>
      )}
    </div>
  );
}
