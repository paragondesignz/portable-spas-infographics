import { GoogleGenAI } from '@google/genai';
import type { AspectRatio, Resolution, InfographicStyle, GraphicStyle } from '@/types';
import { INFOGRAPHIC_STYLES, GRAPHIC_STYLES } from '@/types';

let genaiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!genaiClient) {
    genaiClient = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY!,
    });
  }
  return genaiClient;
}

function getStyleInstructions(styleValue: InfographicStyle): string {
  const style = INFOGRAPHIC_STYLES.find((s) => s.value === styleValue);
  if (!style) return '';

  const colorHex = style.colors.join(', ');

  const styleGuides: Record<InfographicStyle, string> = {
    'portable-spas-brand': `Style: Portable Spas New Zealand Official Brand
CRITICAL: Follow these exact brand guidelines for all design elements.

COLOR PALETTE (use these exact hex colors - DO NOT write color names as text):
- #4B5E5A (primary dark teal-grey) - use for headlines, key elements
- #C4D0CD (soft blue-grey) - use for backgrounds, secondary elements
- #E3DEC8 (warm cream/beige) - use for backgrounds, contrast areas
- #907E59 (warm brown/tan) - use sparingly for accents
- #FFFFFF and #000000 for text contrast

TYPOGRAPHY STYLE:
- Headlines: Bold, clean, geometric sans-serif (like Montserrat Bold). Modern, confident.
- Accent text: Elegant flowing handwritten script (like Allura). Graceful loops, personal feel.
- Body text: Clean geometric sans-serif (like Poppins). Highly readable, friendly.

DESIGN ELEMENTS:
- Flowing wave motifs or patterns as decorative elements
- Rounded corners on containers and cards
- Hand-drawn style icons (simple line art)
- Clean layouts with clear visual hierarchy
- Generous whitespace

BRAND PERSONALITY:
- Approachable and down-to-earth
- Warm and inviting
- Family-friendly, New Zealand lifestyle
- Educational but engaging`,

    'modern-minimal': `Style: Modern Minimal
- Use generous whitespace and clean layouts
- Employ simple geometric shapes and thin lines
- Typography should be sans-serif, light weight
- Colors: subtle, muted tones with one accent (${colorHex})
- Icons should be simple line-art style
- Avoid clutter, let the content breathe`,

    'bold-corporate': `Style: Bold Corporate
- Use strong, confident layouts with clear sections
- Bold headlines with heavy font weights
- High contrast between text and backgrounds
- Colors: deep blues, gold accents, white space (${colorHex})
- Professional charts and data visualizations
- Sharp edges and defined boundaries`,

    'organic-natural': `Style: Organic Natural
- Use soft, flowing shapes and curved elements
- Earth tones and nature-inspired colors (${colorHex})
- Watercolor or gradient backgrounds
- Hand-drawn style icons and illustrations
- Rounded corners and organic layouts
- Evokes wellness, relaxation, and nature`,

    'tech-futuristic': `Style: Tech Futuristic
- Dark backgrounds with neon/bright accents (${colorHex})
- Geometric patterns and grid layouts
- Gradient effects and glowing elements
- Modern sans-serif or tech-style fonts
- Hexagonal or angular design elements
- Circuit-board or digital aesthetics`,

    'classic-elegant': `Style: Classic Elegant
- Refined typography with serif fonts
- Gold, cream, and rich brown tones (${colorHex})
- Subtle ornamental elements and borders
- Balanced, symmetrical layouts
- Premium, luxurious feel
- Timeless design principles`,

    'playful-vibrant': `Style: Playful Vibrant
- Bright, energetic colors (${colorHex})
- Fun illustrations and cartoon-style icons
- Dynamic, asymmetrical layouts
- Rounded shapes and bubbly elements
- Gradient overlays and colorful backgrounds
- Engaging and eye-catching design`,
  };

  return styleGuides[styleValue] || '';
}

function getGraphicStyleInstructions(graphicValue: GraphicStyle): string {
  const graphic = GRAPHIC_STYLES.find((g) => g.value === graphicValue);
  if (!graphic) return '';

  const graphicGuides: Record<GraphicStyle, string> = {
    'flat-design': `GRAPHIC STYLE: Flat Design
- Use solid, bold colors with no gradients or shadows
- All elements should be 2D with clean, sharp edges
- Icons and illustrations should be simple, geometric shapes
- No 3D effects, bevels, or realistic textures
- High contrast between elements
- Bold, sans-serif typography
- Clean separation between content areas`,

    'isometric': `GRAPHIC STYLE: Isometric 3D
- Use isometric perspective (30-degree angles, no vanishing points)
- Create depth with consistent 3D projection
- Objects should appear as 3D blocks/shapes viewed from above-right
- Add subtle shadows to ground the elements
- Icons and illustrations should all follow isometric grid
- Layered elements to show depth
- Modern, tech-forward aesthetic`,

    'hand-drawn': `GRAPHIC STYLE: Hand-Drawn / Sketch
- All elements should look hand-illustrated with organic, imperfect lines
- Use sketch-like strokes with slight wobble/variation
- Icons should look like pen/pencil drawings
- Include subtle texture like paper grain
- Typography can have a handwritten feel
- Warm, approachable, artisanal aesthetic
- Natural imperfections add character`,

    'geometric': `GRAPHIC STYLE: Geometric / Abstract
- Compose with bold geometric shapes (circles, triangles, hexagons)
- Use patterns and repeating elements
- Abstract representations rather than literal illustrations
- Strong visual rhythm and mathematical precision
- Overlapping shapes with transparency
- Dynamic angles and intersecting forms
- Modern, striking visual impact`,

    'minimalist': `GRAPHIC STYLE: Minimalist
- Maximum whitespace, minimum elements
- Only essential information displayed
- Very limited color palette (2-3 colors max)
- Simple line icons or no icons at all
- Generous margins and breathing room
- Light, airy feel with lots of empty space
- Typography-focused with clean sans-serif fonts`,

    'retro-vintage': `GRAPHIC STYLE: Retro / Vintage
- Design aesthetic from 1950s-1970s era
- Muted, warm color palette (mustard, olive, rust, cream)
- Halftone dots or aged texture effects
- Retro typography with serif or display fonts
- Rounded corners and classic badge shapes
- Nostalgic illustration style
- Subtle worn/distressed effects`,

    'gradient-glass': `GRAPHIC STYLE: Gradient & Glassmorphism
- Smooth, flowing color gradients throughout
- Frosted glass effects with blur and transparency
- Soft shadows and glowing highlights
- Layered translucent panels
- Vibrant, modern color transitions
- Subtle backdrop blur effects
- Contemporary, premium feel`,

    'line-art': `GRAPHIC STYLE: Line Art
- All illustrations as outlines only, no fills
- Consistent stroke weight throughout
- Elegant, sophisticated simplicity
- Icons drawn with single continuous lines where possible
- Minimal use of solid fills
- Clean white backgrounds
- Professional, refined aesthetic`,
  };

  return graphicGuides[graphicValue] || '';
}

export async function generateInfographic(
  prompt: string,
  referenceImages: string[] = [],
  aspectRatio: AspectRatio,
  resolution: Resolution,
  style?: InfographicStyle,
  graphicStyle?: GraphicStyle,
  includeLogo?: boolean
): Promise<{ imageData: string; mimeType: string; textResponse?: string }> {
  const ai = getGeminiClient();

  // Build content parts - Gemini docs: reference images FIRST, then ONE descriptive prompt
  const contentParts: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

  // Get style-specific instructions (color scheme)
  const styleInstructions = style ? getStyleInstructions(style) : '';

  // Get graphic style instructions (visual treatment)
  const graphicInstructions = graphicStyle ? getGraphicStyleInstructions(graphicStyle) : '';

  // Helper to parse and add image to content parts
  const addImagePart = (imageBase64: string): boolean => {
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      contentParts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      });
      return true;
    }
    return false;
  };

  // Separate logo from user reference images
  // Logo is always first in the array when present
  const logoImage = includeLogo && referenceImages.length > 0 ? referenceImages[0] : null;
  // Limit to 3 reference images max (per Gemini best practices)
  const userReferenceImages = (includeLogo ? referenceImages.slice(1) : referenceImages).slice(0, 3);

  // STEP 1: Add ALL style reference images FIRST (before any text)
  // Per Gemini docs: "provide reference images first, then describe how to combine them"
  for (const imageBase64 of userReferenceImages) {
    addImagePart(imageBase64);
  }

  // STEP 2: Add logo image (if present)
  if (logoImage) {
    addImagePart(logoImage);
  }

  // STEP 3: Add ONE comprehensive prompt AFTER all images
  // Per Gemini docs: "Descriptive paragraph will almost always produce a better, more coherent image than a list of disconnected words"

  // Build the style transfer instruction based on reference images
  const hasStyleRefs = userReferenceImages.length > 0;
  const styleTransferInstruction = hasStyleRefs
    ? `Transform this infographic into the exact visual style shown in the ${userReferenceImages.length === 1 ? 'reference image' : 'reference images'} provided above. Preserve the content but render it with the same color palette, illustration style, typography feel, layout patterns, and overall aesthetic mood as the reference${userReferenceImages.length > 1 ? 's' : ''}. The reference image${userReferenceImages.length > 1 ? 's show' : ' shows'} exactly how I want the final output to look.`
    : '';

  // Build logo instruction
  const logoInstruction = logoImage
    ? `The ${hasStyleRefs ? 'last' : 'provided'} image shows the Portable Spas New Zealand logo. Reproduce this logo exactly in the bottom-right corner of the infographic, sized at roughly 12% of image width. The logo has "PORTABLE SPAS" in bold sans-serif on top and "New Zealand" in elegant script below. Maintain clear space around the logo equal to the height of the letter O.`
    : '';

  const fullPrompt = `Create a professional marketing infographic for Portable Spas New Zealand.

${styleTransferInstruction}

${logoInstruction}

The infographic should visualize the following content:
${prompt}

Design guidelines:
- Clean, modern, polished look suitable for marketing materials
- Clear visual hierarchy with icons and illustrations supporting the content
- Natural flow guiding the viewer through the information
- Only show the actual content text, no design terminology or color names
- Use friendly phrases like "Visit portablespas.co.nz" instead of bare URLs or "Click Here" links
- Emails like service@portablespas.co.nz may appear naturally

${graphicInstructions ? `Apply this graphic style: ${graphicInstructions}` : ''}
${styleInstructions ? `Use this color approach: ${styleInstructions}` : ''}`;

  contentParts.push(fullPrompt);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-image',
    contents: contentParts,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
    },
  });

  let imageData = '';
  let mimeType = 'image/png';
  let textResponse = '';

  // Process response parts
  const candidates = response.candidates;
  if (candidates && candidates[0]?.content?.parts) {
    for (const part of candidates[0].content.parts) {
      if ('text' in part && part.text) {
        textResponse = part.text;
      } else if ('inlineData' in part && part.inlineData) {
        imageData = part.inlineData.data || '';
        mimeType = part.inlineData.mimeType || 'image/png';
      }
    }
  }

  if (!imageData) {
    throw new Error('No image was generated');
  }

  return { imageData, mimeType, textResponse };
}
