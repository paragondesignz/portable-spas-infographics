export interface InfographicRecord {
  id: string;
  url: string;
  thumbnailUrl: string;
  prompt: string;
  aspectRatio: string;
  resolution: string;
  createdAt: string;
}

export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

export interface GenerationRequest {
  prompt: string;
  referenceImages?: string[]; // base64 encoded images
  aspectRatio: AspectRatio;
  resolution: Resolution;
  enrichedContext?: string;
  style?: InfographicStyle;
}

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  id?: string;
  error?: string;
}

export interface PineconeContextRequest {
  query: string;
}

export interface PineconeContextResponse {
  success: boolean;
  context?: string;
  citations?: Array<{
    content: string;
    reference: string;
  }>;
  error?: string;
}

export type AspectRatio =
  | '1:1'
  | '2:3'
  | '3:2'
  | '3:4'
  | '4:3'
  | '4:5'
  | '5:4'
  | '9:16'
  | '16:9'
  | '21:9';

export type Resolution = '1K' | '2K' | '4K';

export type InfographicStyle =
  | 'modern-minimal'
  | 'bold-corporate'
  | 'organic-natural'
  | 'tech-futuristic'
  | 'classic-elegant'
  | 'playful-vibrant';

export interface StyleOption {
  value: InfographicStyle;
  label: string;
  description: string;
  colors: string[];
  preview: string;
}

export const INFOGRAPHIC_STYLES: StyleOption[] = [
  {
    value: 'modern-minimal',
    label: 'Modern Minimal',
    description: 'Clean lines, lots of whitespace, subtle colors',
    colors: ['#F8FAFC', '#64748B', '#0EA5E9'],
    preview: 'Sleek and contemporary with focus on clarity',
  },
  {
    value: 'bold-corporate',
    label: 'Bold Corporate',
    description: 'Strong colors, professional look, impactful headers',
    colors: ['#1E3A8A', '#FBBF24', '#FFFFFF'],
    preview: 'Professional and authoritative presentation',
  },
  {
    value: 'organic-natural',
    label: 'Organic Natural',
    description: 'Earth tones, soft curves, nature-inspired',
    colors: ['#F0FDF4', '#22C55E', '#854D0E'],
    preview: 'Eco-friendly and wellness-focused aesthetic',
  },
  {
    value: 'tech-futuristic',
    label: 'Tech Futuristic',
    description: 'Gradients, geometric shapes, high-tech feel',
    colors: ['#0F172A', '#8B5CF6', '#06B6D4'],
    preview: 'Cutting-edge and innovation-driven design',
  },
  {
    value: 'classic-elegant',
    label: 'Classic Elegant',
    description: 'Refined typography, gold accents, timeless appeal',
    colors: ['#FFFBEB', '#78350F', '#D97706'],
    preview: 'Sophisticated and premium appearance',
  },
  {
    value: 'playful-vibrant',
    label: 'Playful Vibrant',
    description: 'Bright colors, fun illustrations, energetic mood',
    colors: ['#FDF4FF', '#EC4899', '#F97316'],
    preview: 'Engaging and lively visual experience',
  },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string; dimensions: Record<Resolution, string> }[] = [
  { value: '1:1', label: 'Square (1:1)', dimensions: { '1K': '1024×1024', '2K': '2048×2048', '4K': '4096×4096' } },
  { value: '2:3', label: 'Portrait (2:3)', dimensions: { '1K': '848×1264', '2K': '1696×2528', '4K': '3392×5056' } },
  { value: '3:2', label: 'Landscape (3:2)', dimensions: { '1K': '1264×848', '2K': '2528×1696', '4K': '5056×3392' } },
  { value: '3:4', label: 'Portrait (3:4)', dimensions: { '1K': '896×1200', '2K': '1792×2400', '4K': '3584×4800' } },
  { value: '4:3', label: 'Landscape (4:3)', dimensions: { '1K': '1200×896', '2K': '2400×1792', '4K': '4800×3584' } },
  { value: '4:5', label: 'Portrait (4:5)', dimensions: { '1K': '928×1152', '2K': '1856×2304', '4K': '3712×4608' } },
  { value: '5:4', label: 'Landscape (5:4)', dimensions: { '1K': '1152×928', '2K': '2304×1856', '4K': '4608×3712' } },
  { value: '9:16', label: 'Vertical (9:16)', dimensions: { '1K': '768×1376', '2K': '1536×2752', '4K': '3072×5504' } },
  { value: '16:9', label: 'Widescreen (16:9)', dimensions: { '1K': '1376×768', '2K': '2752×1536', '4K': '5504×3072' } },
  { value: '21:9', label: 'Ultrawide (21:9)', dimensions: { '1K': '1584×672', '2K': '3168×1344', '4K': '6336×2688' } },
];

export const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: '1K', label: '1K (Standard)' },
  { value: '2K', label: '2K (High)' },
  { value: '4K', label: '4K (Ultra)' },
];
