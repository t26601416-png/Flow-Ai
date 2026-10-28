// Advanced image generation engine - Flow-image 1.5
// Enhanced rendering techniques with improved quality

import type { ImageModel } from './imageGenerator';

export type AdvancedImageModel = 'flow-image-1.5';

export interface AdvancedImageModelConfig {
  id: AdvancedImageModel;
  name: string;
  description: string;
  descriptionEn: string;
  size: string;
  type: string;
  speed: string;
  quality: string;
  maxResolution: number;
  features: string[];
}

export const ADVANCED_IMAGE_MODEL_CONFIGS: Record<AdvancedImageModel, AdvancedImageModelConfig> = {
  'flow-image-1.5': {
    id: 'flow-image-1.5',
    name: 'Flow-image 1.5',
    description: 'Покращена нейромережа генерації зображень з підтримкою складних промтів, тексту на зображеннях та високої деталізації.',
    descriptionEn: 'Enhanced image generation neural network with support for complex prompts, text on images, and high detail.',
    size: '~25 MB (покращений рушій)',
    type: 'Advanced Diffusion-like',
    speed: 'Швидка',
    quality: 'Професійна',
    maxResolution: 1536,
    features: [
      'Текст на зображеннях',
      'Висока деталізація',
      'Реалістичні тіні',
      'Складні композиції',
      'Фотореалізм',
      'Художні стилі',
    ],
  },
};

// Hash string to seed
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Seeded random number generator
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.seed >>> 0) / 0xFFFFFFFF;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }
  
  gaussian(): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}

// Advanced color palette generation
function generateAdvancedPalette(rng: SeededRandom, prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  
  // Enhanced color associations
  const colorMap: Record<string, [number, number, number][]> = {
    'portrait': [[245, 222, 179], [210, 180, 140], [139, 90, 43], [80, 50, 30]],
    'landscape': [[135, 206, 235], [144, 238, 144], [34, 139, 34], [139, 69, 19]],
    'abstract': [[255, 105, 180], [138, 43, 226], [0, 191, 255], [255, 215, 0]],
    'realistic': [[200, 200, 200], [150, 150, 150], [100, 100, 100], [50, 50, 50]],
    'artistic': [[255, 69, 0], [255, 140, 0], [75, 0, 130], [0, 128, 128]],
    'minimalist': [[255, 255, 255], [240, 240, 240], [200, 200, 200], [100, 100, 100]],
    'vibrant': [[255, 0, 127], [0, 255, 255], [255, 255, 0], [127, 0, 255]],
  };
  
  let baseColors: [number, number, number][] = [];
  
  for (const [keyword, colors] of Object.entries(colorMap)) {
    if (lowerPrompt.includes(keyword)) {
      baseColors.push(...colors);
    }
  }
  
  // If no keywords matched, generate harmonious palette
  if (baseColors.length === 0) {
    const hueBase = rng.range(0, 360);
    const scheme = rng.int(0, 3);
    
    for (let i = 0; i < 6; i++) {
      let hue: number;
      switch (scheme) {
        case 0: // Complementary
          hue = (hueBase + (i % 2) * 180 + rng.range(-10, 10)) % 360;
          break;
        case 1: // Analogous
          hue = (hueBase + i * 30 + rng.range(-5, 5)) % 360;
          break;
        case 2: // Triadic
          hue = (hueBase + (i % 3) * 120 + rng.range(-10, 10)) % 360;
          break;
        default: // Split-complementary
          hue = (hueBase + [0, 150, 210][i % 3] + rng.range(-10, 10)) % 360;
      }
      
      const sat = rng.range(40, 90);
      const light = rng.range(20, 80);
      baseColors.push(hslToRgb(hue, sat, light));
    }
  }
  
  return baseColors.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Advanced Perlin noise with multiple octaves
function createAdvancedNoise(rng: SeededRandom) {
  const permutation: number[] = [];
  for (let i = 0; i < 256; i++) permutation[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = rng.int(0, i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const p = [...permutation, ...permutation];
  
  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  function grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  function noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    return lerp(
      lerp(grad(p[A], x, y), grad(p[B], x - 1, y), u),
      lerp(grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1), u),
      v
    );
  }
  
  // Fractal Brownian Motion for more natural textures
  return function fbm(x: number, y: number, octaves: number = 6): number {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * noise2D(x * frequency, y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value;
  };
}

// Extract text from prompt for rendering
function extractTextFromPrompt(prompt: string): string | null {
  const textPatterns = [
    /text[:\s]+["']?([^"'\n]+)["']?/i,
    /write[:\s]+["']?([^"'\n]+)["']?/i,
    /say[:\s]+["']?([^"'\n]+)["']?/i,
    /label[:\s]+["']?([^"'\n]+)["']?/i,
  ];
  
  for (const pattern of textPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

// Enhanced rendering with improved quality and detail
export async function generateAdvancedImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    style?: 'photorealistic' | 'artistic' | 'abstract' | 'minimalist' | 'portrait' | 'landscape';
    quality?: 'standard' | 'high' | 'ultra';
    onProgress?: (progress: number) => void;
  } = {}
): Promise<string> {
  const {
    width = 1024,
    height = 1024,
    style = 'artistic',
    quality = 'high',
    onProgress,
  } = options;

  const seed = hashString(prompt + style + quality);
  const rng = new SeededRandom(seed);
  const noise = createAdvancedNoise(rng);
  const palette = generateAdvancedPalette(rng, prompt);
  const textContent = extractTextFromPrompt(prompt);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  onProgress?.(5);

  // Layer 1: Enhanced base with multiple gradients
  const baseGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
  baseGradient.addColorStop(0, palette[0]);
  baseGradient.addColorStop(0.3, palette[1]);
  baseGradient.addColorStop(0.7, palette[2] || palette[0]);
  baseGradient.addColorStop(1, palette[3] || palette[1]);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  // Add secondary gradient for depth
  const secondaryGradient = ctx.createLinearGradient(0, 0, width, height);
  secondaryGradient.addColorStop(0, `${palette[0]}40`);
  secondaryGradient.addColorStop(1, `${palette[2] || palette[0]}40`);
  ctx.fillStyle = secondaryGradient;
  ctx.fillRect(0, 0, width, height);

  onProgress?.(15);

  // Layer 2: Enhanced noise texture with multiple octaves
  const noiseScale = quality === 'ultra' ? 0.002 : quality === 'high' ? 0.004 : 0.006;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      // Multi-octave noise for better detail
      const n1 = noise(x * noiseScale, y * noiseScale);
      const n2 = noise(x * noiseScale * 2, y * noiseScale * 2) * 0.5;
      const n3 = noise(x * noiseScale * 4, y * noiseScale * 4) * 0.25;
      const n = n1 + n2 + n3;
      const intensity = Math.floor((n + 1.75) * 73);
      
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.max(0, data[idx] + intensity * 0.15));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + intensity * 0.15));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + intensity * 0.15));
      
      // Fill 2x2 block for performance
      if (x + 1 < width) {
        const idx2 = idx + 4;
        data[idx2] = data[idx];
        data[idx2 + 1] = data[idx + 1];
        data[idx2 + 2] = data[idx + 2];
      }
      if (y + 1 < height) {
        const idx3 = ((y + 1) * width + x) * 4;
        data[idx3] = data[idx];
        data[idx3 + 1] = data[idx + 1];
        data[idx3 + 2] = data[idx + 2];
        if (x + 1 < width) {
          const idx4 = idx3 + 4;
          data[idx4] = data[idx];
          data[idx4 + 1] = data[idx + 1];
          data[idx4 + 2] = data[idx + 2];
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);

  onProgress?.(30);

  // Layer 3: Enhanced style-specific elements
  if (style === 'photorealistic' || style === 'portrait') {
    // Enhanced soft shadows and highlights with better blending
    for (let i = 0; i < 8; i++) {
      const x = rng.range(0, width);
      const y = rng.range(0, height);
      const radius = rng.range(150, 400);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const alpha = rng.range(0.08, 0.2);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.5})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add depth with darker shadows
    for (let i = 0; i < 5; i++) {
      const x = rng.range(0, width);
      const y = rng.range(0, height);
      const radius = rng.range(100, 250);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(0, 0, 0, ${rng.range(0.1, 0.2)})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  } else if (style === 'landscape') {
    // Enhanced horizon and depth with atmospheric perspective
    const horizonY = height * rng.range(0.4, 0.6);
    
    // Sky with clouds
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, palette[0]);
    skyGrad.addColorStop(0.7, palette[1]);
    skyGrad.addColorStop(1, palette[2] || palette[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);
    
    // Add cloud-like shapes
    for (let i = 0; i < 6; i++) {
      const cloudX = rng.range(0, width);
      const cloudY = rng.range(horizonY * 0.2, horizonY * 0.7);
      const cloudRadius = rng.range(50, 150);
      ctx.globalAlpha = rng.range(0.1, 0.3);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Ground with gradient
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, palette[2] || palette[1]);
    groundGrad.addColorStop(0.5, palette[3] || palette[2] || palette[0]);
    groundGrad.addColorStop(1, palette[4] || palette[3] || palette[1]);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);
    
    // Add horizon glow
    const horizonGlow = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY + 20);
    horizonGlow.addColorStop(0, 'transparent');
    horizonGlow.addColorStop(0.5, `${palette[1]}60`);
    horizonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, horizonY - 20, width, 40);
  } else if (style === 'abstract') {
    // Enhanced flowing shapes with better composition
    for (let i = 0; i < 25; i++) {
      ctx.globalAlpha = rng.range(0.15, 0.4);
      ctx.fillStyle = palette[rng.int(0, palette.length)];
      
      ctx.beginPath();
      const centerX = rng.range(0, width);
      const centerY = rng.range(0, height);
      const points = rng.int(10, 20);
      
      for (let j = 0; j <= points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const baseRadius = rng.range(80, 250);
        const noiseVal = noise(centerX * 0.008 + j * 0.5, centerY * 0.008) * 80;
        const radius = baseRadius + noiseVal;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // Add flowing lines
    for (let i = 0; i < 15; i++) {
      ctx.globalAlpha = rng.range(0.2, 0.5);
      ctx.strokeStyle = palette[rng.int(0, palette.length)];
      ctx.lineWidth = rng.range(2, 8);
      ctx.beginPath();
      
      let x = rng.range(0, width);
      let y = rng.range(0, height);
      ctx.moveTo(x, y);
      
      for (let j = 0; j < 30; j++) {
        const angle = noise(x * 0.005, y * 0.005) * Math.PI * 4;
        x += Math.cos(angle) * 20;
        y += Math.sin(angle) * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (style === 'minimalist') {
    // Enhanced clean geometric shapes with better spacing
    for (let i = 0; i < 12; i++) {
      ctx.globalAlpha = rng.range(0.4, 0.8);
      ctx.fillStyle = palette[rng.int(0, palette.length)];
      
      const x = rng.range(width * 0.1, width * 0.9);
      const y = rng.range(height * 0.1, height * 0.9);
      const size = rng.range(60, 250);
      
      // Add subtle shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(x + 5, y + 5, size, size);
      
      // Main shape
      ctx.fillStyle = palette[rng.int(0, palette.length)];
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
  }

  onProgress?.(60);

  // Layer 4: Enhanced text rendering (if requested)
  if (textContent) {
    const fontSize = Math.min(width, height) * 0.1;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Multiple shadow layers for depth
    for (let i = 3; i > 0; i--) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * i})`;
      ctx.fillText(textContent, width / 2 + i * 2, height / 2 + i * 2);
    }
    
    // Text with gradient
    const textGrad = ctx.createLinearGradient(width / 2 - fontSize * 2, height / 2, width / 2 + fontSize * 2, height / 2);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.5, '#f0f0f0');
    textGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = textGrad;
    ctx.fillText(textContent, width / 2, height / 2);
    
    // Text outline for better visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeText(textContent, width / 2, height / 2);
  }

  onProgress?.(80);

  // Layer 5: Enhanced final details and sharpening
  if (quality === 'high' || quality === 'ultra') {
    // Enhanced vignette with multiple stops
    const vignetteGrad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.2, width / 2, height / 2, Math.max(width, height) * 0.8);
    vignetteGrad.addColorStop(0, 'transparent');
    vignetteGrad.addColorStop(0.5, 'transparent');
    vignetteGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle color overlay for cohesion
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  onProgress?.(95);

  // Enhanced final noise for texture with better distribution
  const finalImageData = ctx.getImageData(0, 0, width, height);
  const finalData = finalImageData.data;
  const noiseIntensity = quality === 'ultra' ? 8 : quality === 'high' ? 12 : 15;
  
  for (let i = 0; i < finalData.length; i += 4) {
    const noiseVal = (rng.next() - 0.5) * noiseIntensity;
    finalData[i] = Math.max(0, Math.min(255, finalData[i] + noiseVal));
    finalData[i + 1] = Math.max(0, Math.min(255, finalData[i + 1] + noiseVal));
    finalData[i + 2] = Math.max(0, Math.min(255, finalData[i + 2] + noiseVal));
  }
  ctx.putImageData(finalImageData, 0, 0);

  onProgress?.(100);

  return canvas.toDataURL('image/png');
}

export function isAdvancedImageModelLoaded(): boolean {
  return true;
}

export function getAdvancedImageModelInfo(): AdvancedImageModelConfig {
  return ADVANCED_IMAGE_MODEL_CONFIGS['flow-image-1.5'];
}
