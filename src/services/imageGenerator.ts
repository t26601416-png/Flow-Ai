import type { FlowModel } from './neuralEngine';

// Image generation engine using procedural algorithms + Canvas API
// Generates unique images based on prompt hash

export type ImageModel = 'flow-image-1';

export interface ImageModelConfig {
  id: ImageModel;
  name: string;
  description: string;
  descriptionEn: string;
  size: string;
  type: string;
  speed: string;
  quality: string;
  maxResolution: number;
}

export const IMAGE_MODEL_CONFIGS: Record<ImageModel, ImageModelConfig> = {
  'flow-image-1': {
    id: 'flow-image-1',
    name: 'Flow-image 1',
    description: 'Нейромережа генерації зображень. Створює унікальні абстрактні та художні зображення на основі текстового опису.',
    descriptionEn: 'Image generation neural network. Creates unique abstract and artistic images from text descriptions.',
    size: '~15 MB (процедурний рушій)',
    type: 'Diffusion-like',
    speed: 'Миттєва',
    quality: 'Висока',
    maxResolution: 1024,
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
}

// Color palette from prompt
function generatePalette(rng: SeededRandom, prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  
  // Color associations
  const colorMap: Record<string, [number, number, number][]> = {
    'fire': [[255, 69, 0], [255, 140, 0], [255, 215, 0], [139, 0, 0]],
    'ocean': [[0, 105, 148], [0, 168, 225], [173, 216, 230], [0, 77, 128]],
    'forest': [[34, 139, 34], [0, 100, 0], [144, 238, 144], [85, 107, 47]],
    'sunset': [[255, 99, 71], [255, 165, 0], [255, 20, 147], [75, 0, 130]],
    'night': [[25, 25, 112], [72, 61, 139], [0, 0, 128], [138, 43, 226]],
    'space': [[10, 10, 40], [50, 0, 80], [100, 0, 150], [200, 100, 255]],
    'nature': [[34, 139, 34], [139, 69, 19], [255, 215, 0], [135, 206, 235]],
    'city': [[64, 64, 64], [128, 128, 128], [255, 215, 0], [0, 191, 255]],
    'love': [[255, 20, 147], [255, 105, 180], [255, 182, 193], [199, 21, 133]],
    'ice': [[176, 224, 230], [135, 206, 250], [240, 255, 255], [70, 130, 180]],
  };
  
  let baseColors: [number, number, number][] = [];
  
  for (const [keyword, colors] of Object.entries(colorMap)) {
    if (lowerPrompt.includes(keyword)) {
      baseColors.push(...colors);
    }
  }
  
  // If no keywords matched, generate random palette
  if (baseColors.length === 0) {
    const hueBase = rng.range(0, 360);
    for (let i = 0; i < 4; i++) {
      const hue = (hueBase + i * 60 + rng.range(-20, 20)) % 360;
      const sat = rng.range(50, 90);
      const light = rng.range(30, 70);
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

// Perlin-like noise
function createNoise(rng: SeededRandom) {
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
  
  return function noise(x: number, y: number): number {
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
  };
}

// Main image generation function
export async function generateImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    style?: 'abstract' | 'geometric' | 'organic' | 'cosmic' | 'landscape';
    onProgress?: (progress: number) => void;
  } = {}
): Promise<string> {
  const {
    width = 512,
    height = 512,
    style = 'abstract',
    onProgress,
  } = options;

  const seed = hashString(prompt + style);
  const rng = new SeededRandom(seed);
  const noise = createNoise(rng);
  const palette = generatePalette(rng, prompt);
  
  // Detect style from prompt
  const lowerPrompt = prompt.toLowerCase();
  let detectedStyle = style;
  if (lowerPrompt.includes('cosmic') || lowerPrompt.includes('space') || lowerPrompt.includes('зірк') || lowerPrompt.includes('косм')) {
    detectedStyle = 'cosmic';
  } else if (lowerPrompt.includes('geometric') || lowerPrompt.includes('geometry') || lowerPrompt.includes('геометр')) {
    detectedStyle = 'geometric';
  } else if (lowerPrompt.includes('organic') || lowerPrompt.includes('nature') || lowerPrompt.includes('природ')) {
    detectedStyle = 'organic';
  } else if (lowerPrompt.includes('landscape') || lowerPrompt.includes('пейзаж') || lowerPrompt.includes('mountain')) {
    detectedStyle = 'landscape';
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  onProgress?.(10);

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.5, palette[1]);
  gradient.addColorStop(1, palette[2] || palette[0]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  onProgress?.(25);

  // Generate based on style
  switch (detectedStyle) {
    case 'cosmic':
      await renderCosmic(ctx, width, height, rng, noise, palette, onProgress);
      break;
    case 'geometric':
      await renderGeometric(ctx, width, height, rng, palette, onProgress);
      break;
    case 'organic':
      await renderOrganic(ctx, width, height, rng, noise, palette, onProgress);
      break;
    case 'landscape':
      await renderLandscape(ctx, width, height, rng, noise, palette, onProgress);
      break;
    default:
      await renderAbstract(ctx, width, height, rng, noise, palette, onProgress);
  }

  onProgress?.(90);

  // Add subtle noise overlay
  const imageData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noiseVal = (rng.next() - 0.5) * 15;
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noiseVal));
    imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noiseVal));
    imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noiseVal));
  }
  ctx.putImageData(imageData, 0, 0);

  onProgress?.(100);

  return canvas.toDataURL('image/png');
}

async function renderAbstract(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  rng: SeededRandom, noise: (x: number, y: number) => number,
  palette: string[], onProgress?: (p: number) => void
) {
  // Flowing noise layers
  const layers = rng.int(3, 6);
  for (let layer = 0; layer < layers; layer++) {
    onProgress?.(25 + (layer / layers) * 50);
    await new Promise(r => setTimeout(r, 50));
    
    ctx.globalAlpha = rng.range(0.1, 0.4);
    ctx.globalCompositeOperation = layer % 2 === 0 ? 'overlay' : 'soft-light';
    
    const scale = rng.range(0.003, 0.01);
    const offsetX = rng.range(-1000, 1000);
    const offsetY = rng.range(-1000, 1000);
    
    const step = 4;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const n = noise((x + offsetX) * scale, (y + offsetY) * scale);
        const n2 = noise((x + offsetX) * scale * 2, (y + offsetY) * scale * 2) * 0.5;
        const val = (n + n2 + 1) / 2;
        
        const colorIdx = Math.floor(val * palette.length) % palette.length;
        ctx.fillStyle = palette[colorIdx];
        ctx.fillRect(x, y, step, step);
      }
    }
  }
  
  // Add flowing curves
  ctx.globalAlpha = 0.6;
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < rng.int(5, 15); i++) {
    ctx.beginPath();
    ctx.strokeStyle = palette[rng.int(0, palette.length)];
    ctx.lineWidth = rng.range(1, 4);
    
    let x = rng.range(0, w);
    let y = rng.range(0, h);
    ctx.moveTo(x, y);
    
    for (let j = 0; j < 50; j++) {
      const angle = noise(x * 0.005, y * 0.005) * Math.PI * 4;
      x += Math.cos(angle) * 10;
      y += Math.sin(angle) * 10;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

async function renderCosmic(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  rng: SeededRandom, noise: (x: number, y: number) => number,
  palette: string[], onProgress?: (p: number) => void
) {
  // Dark background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);
  
  // Stars
  onProgress?.(30);
  await new Promise(r => setTimeout(r, 50));
  for (let i = 0; i < 500; i++) {
    const x = rng.range(0, w);
    const y = rng.range(0, h);
    const size = rng.range(0.5, 2.5);
    const brightness = rng.range(0.3, 1);
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Nebula clouds
  onProgress?.(50);
  await new Promise(r => setTimeout(r, 50));
  for (let layer = 0; layer < 3; layer++) {
    ctx.globalAlpha = 0.15;
    ctx.globalCompositeOperation = 'screen';
    const scale = rng.range(0.002, 0.005);
    const offsetX = rng.range(-500, 500);
    const offsetY = rng.range(-500, 500);
    
    const step = 3;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const n = noise((x + offsetX) * scale, (y + offsetY) * scale);
        if (n > 0.1) {
          const colorIdx = Math.floor((n + 1) / 2 * palette.length) % palette.length;
          ctx.fillStyle = palette[colorIdx];
          ctx.globalAlpha = n * 0.3;
          ctx.fillRect(x, y, step, step);
        }
      }
    }
  }
  
  // Bright stars/glow
  onProgress?.(70);
  await new Promise(r => setTimeout(r, 50));
  for (let i = 0; i < 10; i++) {
    const x = rng.range(0, w);
    const y = rng.range(0, h);
    const radius = rng.range(20, 80);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, palette[rng.int(0, palette.length)]);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = rng.range(0.3, 0.7);
    ctx.fillStyle = grad;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

async function renderGeometric(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  rng: SeededRandom, palette: string[], onProgress?: (p: number) => void
) {
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, w, h);
  
  const shapes = rng.int(20, 50);
  for (let i = 0; i < shapes; i++) {
    onProgress?.(25 + (i / shapes) * 60);
    await new Promise(r => setTimeout(r, 30));
    
    ctx.globalAlpha = rng.range(0.2, 0.7);
    ctx.fillStyle = palette[rng.int(0, palette.length)];
    ctx.strokeStyle = palette[rng.int(0, palette.length)];
    ctx.lineWidth = rng.range(1, 3);
    
    const x = rng.range(0, w);
    const y = rng.range(0, h);
    const size = rng.range(20, 150);
    const type = rng.int(0, 4);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rng.range(0, Math.PI * 2));
    
    switch (type) {
      case 0: // Circle
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        rng.next() > 0.5 ? ctx.fill() : ctx.stroke();
        break;
      case 1: // Rectangle
        rng.next() > 0.5
          ? ctx.fillRect(-size / 2, -size / 2, size, size * rng.range(0.5, 1.5))
          : ctx.strokeRect(-size / 2, -size / 2, size, size * rng.range(0.5, 1.5));
        break;
      case 2: // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        rng.next() > 0.5 ? ctx.fill() : ctx.stroke();
        break;
      case 3: // Polygon
        const sides = rng.int(5, 8);
        ctx.beginPath();
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const px = Math.cos(angle) * size / 2;
          const py = Math.sin(angle) * size / 2;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        rng.next() > 0.5 ? ctx.fill() : ctx.stroke();
        break;
    }
    ctx.restore();
  }
  
  // Grid overlay
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  const gridSize = rng.int(30, 80);
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

async function renderOrganic(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  rng: SeededRandom, noise: (x: number, y: number) => number,
  palette: string[], onProgress?: (p: number) => void
) {
  // Soft gradient background
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
  grad.addColorStop(0, palette[1]);
  grad.addColorStop(1, palette[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // Organic blobs
  const blobs = rng.int(8, 20);
  for (let i = 0; i < blobs; i++) {
    onProgress?.(25 + (i / blobs) * 55);
    await new Promise(r => setTimeout(r, 40));
    
    ctx.globalAlpha = rng.range(0.2, 0.5);
    ctx.fillStyle = palette[rng.int(0, palette.length)];
    
    const cx = rng.range(0, w);
    const cy = rng.range(0, h);
    const points = rng.int(6, 12);
    const baseRadius = rng.range(30, 120);
    
    ctx.beginPath();
    for (let j = 0; j <= points; j++) {
      const angle = (j / points) * Math.PI * 2;
      const noiseVal = noise(cx * 0.01 + j, cy * 0.01 + i);
      const radius = baseRadius + noiseVal * baseRadius * 0.5;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  // Flowing lines
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.strokeStyle = palette[rng.int(0, palette.length)];
    ctx.lineWidth = rng.range(1, 3);
    
    let x = rng.range(0, w);
    let y = rng.range(0, h);
    ctx.moveTo(x, y);
    
    for (let j = 0; j < 30; j++) {
      const angle = noise(x * 0.008, y * 0.008) * Math.PI * 2;
      x += Math.cos(angle) * 15;
      y += Math.sin(angle) * 15;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

async function renderLandscape(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  rng: SeededRandom, noise: (x: number, y: number) => number,
  palette: string[], onProgress?: (p: number) => void
) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  skyGrad.addColorStop(0, palette[2] || palette[0]);
  skyGrad.addColorStop(1, palette[1]);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);
  
  // Sun/moon
  onProgress?.(30);
  await new Promise(r => setTimeout(r, 50));
  const sunX = rng.range(w * 0.2, w * 0.8);
  const sunY = rng.range(h * 0.1, h * 0.3);
  const sunR = rng.range(30, 60);
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3);
  sunGrad.addColorStop(0, palette[3] || '#ffffff');
  sunGrad.addColorStop(0.3, palette[2] || '#ffcc00');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sunX - sunR * 3, sunY - sunR * 3, sunR * 6, sunR * 6);
  
  // Mountains
  onProgress?.(50);
  await new Promise(r => setTimeout(r, 50));
  for (let layer = 0; layer < 4; layer++) {
    const baseY = h * (0.4 + layer * 0.12);
    const amplitude = rng.range(50, 150) - layer * 20;
    const freq = rng.range(0.003, 0.008);
    const offset = rng.range(0, 1000);
    
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    for (let x = 0; x <= w; x += 2) {
      const n = noise((x + offset) * freq, layer * 10);
      const y = baseY - amplitude * (n + 0.5);
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(w, h);
    ctx.closePath();
    
    const darkness = 0.3 + layer * 0.15;
    ctx.fillStyle = palette[layer % palette.length];
    ctx.globalAlpha = 0.7 + layer * 0.1;
    ctx.fill();
  }
  
  // Foreground
  onProgress?.(75);
  await new Promise(r => setTimeout(r, 50));
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, h * 0.85, w, h * 0.15);
  
  ctx.globalAlpha = 1;
}

export function isImageModelLoaded(): boolean {
  // Image model is always available (procedural)
  return true;
}

export function getImageModelInfo(): ImageModelConfig {
  return IMAGE_MODEL_CONFIGS['flow-image-1'];
}
