import { GoogleGenAI } from '@google/genai';
import type { AspectRatio, Resolution, InfographicStyle } from '@/types';
import { INFOGRAPHIC_STYLES } from '@/types';

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

COLOR PALETTE (use these exact colors):
- Silvertide #4B5E5A (primary dark teal-grey) - use for headlines, key elements
- Tidemist #C4D0CD (soft blue-grey) - use for backgrounds, secondary elements
- Linen #E3DEC8 (warm cream/beige) - use for backgrounds, contrast areas
- Soilstone #907E59 (warm brown/tan) - use sparingly for accents
- White #FFFFFF and Black #000000 for text contrast

TYPOGRAPHY STYLE (CRITICAL - follow closely):
- Headlines (H1/H2): Use a bold, clean, geometric sans-serif font similar to Montserrat Bold or Inter Bold.
  Characteristics: rounded letterforms, modern, confident, slightly condensed tracking. NO thin or light weights.
- Accent text (H3/labels): Use an elegant flowing handwritten script font similar to Allura or Great Vibes.
  Characteristics: connected cursive letters, graceful loops, slightly slanted, personal feel.
- Body text: Use a clean geometric sans-serif like Poppins or Open Sans.
  Characteristics: highly readable, friendly rounded letters, medium weight for body.
- Typography hierarchy: H1 very large and bold, H2 medium-large, script accents for warmth, body text smaller and lighter.
- Letter spacing: Headlines slightly tighter, body text normal spacing.

DESIGN ELEMENTS:
- Include flowing wave motifs or patterns as decorative elements
- Use rounded corners on containers and cards
- Hand-drawn style icons where appropriate (simple line art)
- Clean, modern layouts with clear visual hierarchy
- Generous whitespace - don't overcrowd

BRAND PERSONALITY:
- Approachable and down-to-earth, not elitist
- Warm and inviting - luxury made accessible
- Kiwi-focused, family-friendly feel
- Educational but never dry or boring
- Touch of playful wit where appropriate

IMAGERY STYLE:
- Warm, inviting, grounded in reality
- Aspirational but achievable ("I could have that")
- Focus on relaxation, family, wellbeing
- Natural settings, New Zealand lifestyle`,

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

export async function generateInfographic(
  prompt: string,
  referenceImages: string[] = [],
  aspectRatio: AspectRatio,
  resolution: Resolution,
  style?: InfographicStyle
): Promise<{ imageData: string; mimeType: string; textResponse?: string }> {
  const ai = getGeminiClient();

  // Build content parts
  const contentParts: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

  // Get style-specific instructions
  const styleInstructions = style ? getStyleInstructions(style) : '';

  // Add the prompt
  const enhancedPrompt = `Create a professional, visually appealing infographic for Portable Spas New Zealand based on the following information.
The design should be clean, modern, and suitable for marketing materials.
Use a cohesive color scheme, clear typography, and visual hierarchy to present the information effectively.
Include relevant icons or illustrations where appropriate.

${styleInstructions ? `DESIGN STYLE REQUIREMENTS:\n${styleInstructions}\n\n` : ''}Content to visualize:
${prompt}`;

  contentParts.push(enhancedPrompt);

  // Add reference images if provided
  for (const imageBase64 of referenceImages) {
    // Extract mime type and data from base64 string
    const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      contentParts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
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
