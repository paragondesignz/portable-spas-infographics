'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Loader from '@/components/kokonutui/loader';
import SettingsPanel from './SettingsPanel';
import ReferenceImageLibrary from './ReferenceImageLibrary';
import StyleSelector from './StyleSelector';
import GraphicStyleSelector from './GraphicStyleSelector';
import type { AspectRatio, Resolution, InfographicStyle, GraphicStyle, GenerationResponse, PineconeContextResponse } from '@/types';

interface GeneratorFormProps {
  onGenerate: (imageUrl: string, id: string) => void;
  onGenerating: (isGenerating: boolean) => void;
}

export default function GeneratorForm({ onGenerate, onGenerating }: GeneratorFormProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('2K');
  const [style, setStyle] = useState<InfographicStyle>('portable-spas-brand');
  const [graphicStyle, setGraphicStyle] = useState<GraphicStyle>('flat-design');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [useRAG, setUseRAG] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ragContext, setRagContext] = useState<string | null>(null);

  const fetchContext = async (): Promise<string | null> => {
    if (!useRAG || !prompt.trim()) return null;

    try {
      const response = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt }),
      });

      const data: PineconeContextResponse = await response.json();
      if (data.success && data.context) {
        setRagContext(data.context);
        return data.context;
      }
    } catch (error) {
      console.error('Failed to fetch RAG context:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter content for the infographic');
      return;
    }

    setError('');
    setLoading(true);
    onGenerating(true);
    setRagContext(null);

    try {
      // First, fetch RAG context if enabled
      const context = await fetchContext();

      // Convert selected image URLs to base64
      const referenceImages: string[] = [];
      for (const url of selectedImages) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          referenceImages.push(base64);
        } catch (err) {
          console.error('Failed to convert image to base64:', err);
        }
      }

      // Generate infographic
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImages,
          aspectRatio,
          resolution,
          style,
          graphicStyle,
          enrichedContext: context,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || `Server error: ${response.status}`);
        } catch {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const data: GenerationResponse = await response.json();

      if (data.success && data.imageUrl && data.id) {
        onGenerate(data.imageUrl, data.id);
        // Keep prompt for easy regeneration with same content
        setSelectedImages([]);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`An error occurred during generation: ${errorMessage}`);
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
      onGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Infographic Content
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 resize-none focus:ring-2 focus:ring-[#4B5E5A] focus:border-[#4B5E5A]"
          placeholder="Paste your text content here. Include key facts, statistics, features, or specifications you want to visualize in the infographic..."
        />
      </div>

      <StyleSelector selectedStyle={style} onStyleChange={setStyle} />

      <GraphicStyleSelector selectedStyle={graphicStyle} onStyleChange={setGraphicStyle} />

      <ReferenceImageLibrary
        selectedImages={selectedImages}
        onSelectionChange={setSelectedImages}
        maxSelection={5}
      />

      <SettingsPanel
        aspectRatio={aspectRatio}
        resolution={resolution}
        onAspectRatioChange={setAspectRatio}
        onResolutionChange={setResolution}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useRAG"
          checked={useRAG}
          onChange={(e) => setUseRAG(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="useRAG" className="text-sm text-gray-700">
          Enrich with Portable Spas NZ technical knowledge
        </label>
      </div>

      {ragContext && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">
              RAG Context Retrieved:
            </p>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('rag-context-content');
                if (el) {
                  el.classList.toggle('line-clamp-4');
                  const btn = document.getElementById('rag-toggle-btn');
                  if (btn) {
                    btn.textContent = el.classList.contains('line-clamp-4') ? 'Show more' : 'Show less';
                  }
                }
              }}
              id="rag-toggle-btn"
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              Show more
            </button>
          </div>
          <p id="rag-context-content" className="text-sm text-green-700 line-clamp-4 whitespace-pre-wrap">{ragContext}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={loading || !prompt.trim()}
        size="lg"
        className="w-full bg-[#4B5E5A] hover:bg-[#3d4e4a] text-white py-3 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Generating...</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Generate Infographic</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}
