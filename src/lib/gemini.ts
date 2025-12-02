import { GoogleGenAI } from '@google/genai';
import type { AspectRatio, Resolution, InfographicStyle, LayoutStyle } from '@/types';
import { INFOGRAPHIC_STYLES, LAYOUT_STYLES } from '@/types';

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

function getLayoutInstructions(layoutValue: LayoutStyle): string {
  const layout = LAYOUT_STYLES.find((l) => l.value === layoutValue);
  if (!layout) return '';

  const layoutGuides: Record<LayoutStyle, string> = {
    'timeline': `LAYOUT STRUCTURE: Timeline Infographic
Create a chronological visual narrative with the following structure:

LAYOUT REQUIREMENTS:
- Arrange content along a clear visual timeline axis (vertical or horizontal based on aspect ratio)
- Use a prominent central line, path, or connector as the visual backbone
- Place events, milestones, or steps at regular intervals along the timeline
- Each point should have a date/number marker, icon, and brief description
- Use alternating sides of the timeline for visual balance (left-right or top-bottom)
- Include clear start and end points with visual emphasis
- Connect timeline points with lines, arrows, or flowing paths

VISUAL ELEMENTS:
- Timeline markers (circles, dots, icons) at each point
- Connecting lines or paths between events
- Date/step labels prominently displayed
- Brief descriptive text boxes for each point
- Optional: milestone highlights for key events
- Direction indicators (arrows) showing flow of time/process`,

    'statistical': `LAYOUT STRUCTURE: Statistical/Data Infographic
Create a data-driven visual with charts, graphs, and numerical emphasis:

LAYOUT REQUIREMENTS:
- Feature prominent data visualizations (charts, graphs, meters)
- Include large, bold statistics and key numbers
- Use pie charts, bar graphs, line graphs, or icon arrays as appropriate
- Create clear data comparisons with visual representations
- Include percentage indicators, progress bars, or gauges
- Organize data into logical groupings or categories

VISUAL ELEMENTS:
- Large headline statistics with supporting context
- Chart types: pie/donut charts, bar charts, line graphs, area charts
- Icon arrays (pictographs) for countable items
- Progress bars or radial progress indicators
- Comparison visualizations (before/after, vs)
- Data callouts with key insights highlighted
- Legend and axis labels where appropriate`,

    'comparison': `LAYOUT STRUCTURE: Comparison Infographic
Create a side-by-side or versus-style layout for comparing options:

LAYOUT REQUIREMENTS:
- Divide the layout into clear comparison sections (2-3 columns or rows)
- Use consistent visual structure for each compared item
- Include a central divider or "VS" element if comparing two items
- Align comparable features/attributes horizontally for easy scanning
- Use checkmarks, X marks, or ratings to show differences
- Include summary or winner section if appropriate

VISUAL ELEMENTS:
- Clear section headers for each compared item
- Feature/attribute rows with visual indicators
- Icons or illustrations representing each option
- Check/cross marks or star ratings for feature comparison
- Highlight boxes for key differentiators
- Price/value callouts if relevant
- Visual balance between compared sections`,

    'process-flow': `LAYOUT STRUCTURE: Process Flow Infographic
Create a step-by-step visual guide showing how something works:

LAYOUT REQUIREMENTS:
- Organize content into numbered or sequential steps
- Use clear visual flow from start to finish
- Connect steps with arrows, lines, or flowing paths
- Each step should have an icon, number, title, and brief description
- Include visual progression indicators
- Can be linear, circular, or branching based on content

VISUAL ELEMENTS:
- Numbered step indicators (1, 2, 3... or Step 1, Step 2...)
- Directional arrows or connectors between steps
- Icons representing each step's action or concept
- Brief, clear text descriptions for each step
- Start/end markers or emphasis
- Optional: time estimates or duration for each step
- Color progression to show advancement`,

    'isometric-3d': `LAYOUT STRUCTURE: Isometric 3D Infographic
Create a modern 3D-style infographic with depth and visual interest:

LAYOUT REQUIREMENTS:
- Use isometric perspective (30-degree angles, no vanishing points)
- Create depth with layered elements and 3D objects
- Arrange information around or within 3D structures
- Use shadows and highlights to enhance 3D effect
- Incorporate 3D icons, buildings, or abstract shapes
- Create visual hierarchy through size and placement in 3D space

VISUAL ELEMENTS:
- Isometric icons and illustrations (cubes, buildings, devices)
- Layered platforms or floating elements
- 3D charts (isometric bar charts, 3D pie charts)
- Shadows and lighting effects for depth
- Connected elements in 3D space
- Modern, tech-forward aesthetic
- Clean lines with consistent isometric angles
- Bright accent colors against clean backgrounds`,
  };

  return layoutGuides[layoutValue] || '';
}

export async function generateInfographic(
  prompt: string,
  referenceImages: string[] = [],
  aspectRatio: AspectRatio,
  resolution: Resolution,
  style?: InfographicStyle,
  layoutStyle?: LayoutStyle,
  includeLogo?: boolean
): Promise<{ imageData: string; mimeType: string; textResponse?: string }> {
  const ai = getGeminiClient();

  // Build content parts
  const contentParts: Array<string | { inlineData: { mimeType: string; data: string } }> = [];

  // Get style-specific instructions (color scheme)
  const styleInstructions = style ? getStyleInstructions(style) : '';

  // Get layout-specific instructions (graphic structure)
  const layoutInstructions = layoutStyle ? getLayoutInstructions(layoutStyle) : '';

  // Add logo-specific instructions if logo is included
  const logoInstructions = includeLogo
    ? `
BRAND LOGO - CRITICAL (THE FIRST IMAGE IS THE LOGO - COPY IT EXACTLY):
The first reference image provided is the official "Portable Spas New Zealand" logo. You MUST include this logo in the infographic.

LOGO REQUIREMENTS:
1. COPY THE LOGO EXACTLY as provided - do not redraw, recreate, or interpret it
2. The logo has two parts: "PORTABLE SPAS" in bold uppercase, and "New Zealand" in script below
3. Reproduce BOTH parts exactly as shown in the reference image
4. Position: Place in bottom-right corner with adequate padding from edges
5. Size: Make it clearly visible but not dominant (roughly 10-15% of image width)
6. DO NOT modify, stretch, rotate, or distort the logo in any way
7. Ensure adequate contrast - place on a clear background area

`
    : '';

  // Add the prompt
  const enhancedPrompt = `Create a professional, visually appealing infographic for Portable Spas New Zealand based on the following information.

CRITICAL RULES - READ FIRST:
- NEVER include color names, hex codes, style names, or any design instruction text as visible text in the infographic
- NEVER write words like "Silvertide", "Tidemist", "Linen", "Soilstone", or any color/style terminology as text
- The design instructions below are for YOUR reference only - they should influence the visual design, NOT appear as text content
- Only include text that is part of the actual content to visualize (provided at the end)

The design should be clean, modern, and suitable for marketing materials.
Use a cohesive color scheme, clear typography, and visual hierarchy to present the information effectively.
Include relevant icons or illustrations where appropriate.
${logoInstructions}
${layoutInstructions ? `${layoutInstructions}\n\n` : ''}${styleInstructions ? `COLOR SCHEME & VISUAL STYLE (apply visually, do NOT write as text):\n${styleInstructions}\n\n` : ''}CONTENT TO VISUALIZE (this is the only text that should appear in the infographic):
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
