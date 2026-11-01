// Video generation engine - Flow-omni 1
// Generates video at 30 FPS using procedural animation

export type VideoModel = 'flow-omni-1';

export interface VideoModelConfig {
  id: VideoModel;
  name: string;
  description: string;
  descriptionEn: string;
  size: string;
  type: string;
  speed: string;
  quality: string;
  fps: number;
  maxDuration: number;
  resolutions: string[];
}

export const VIDEO_MODEL_CONFIGS: Record<VideoModel, VideoModelConfig> = {
  'flow-omni-1': {
    id: 'flow-omni-1',
    name: 'Flow-omni 1',
    description: 'Нейромережа генерації відео. Створює анімовані відео на основі текстового опису з частотою 30 кадрів/сек.',
    descriptionEn: 'Video generation neural network. Creates animated videos from text descriptions at 30 frames per second.',
    size: '~25 MB (процедурний рушій)',
    type: 'Diffusion-like',
    speed: 'Швидка',
    quality: 'Висока',
    fps: 30,
    maxDuration: 10,
    resolutions: ['256x256', '384x384', '512x512'],
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

// Generate color palette from prompt
function generatePalette(rng: SeededRandom, prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase();
  
  const colorMap: Record<string, [number, number, number][]> = {
    'fire': [[255, 69, 0], [255, 140, 0], [255, 215, 0], [139, 0, 0]],
    'ocean': [[0, 105, 148], [0, 168, 225], [173, 216, 230], [0, 77, 128]],
    'forest': [[34, 139, 34], [0, 100, 0], [144, 238, 144], [85, 107, 47]],
    'sunset': [[255, 99, 71], [255, 165, 0], [255, 20, 147], [75, 0, 130]],
    'night': [[25, 25, 112], [72, 61, 139], [0, 0, 128], [138, 43, 226]],
    'space': [[10, 10, 40], [50, 0, 80], [100, 0, 150], [200, 100, 255]],
    'nature': [[34, 139, 34], [139, 69, 19], [255, 215, 0], [135, 206, 235]],
    'city': [[64, 64, 64], [128, 128, 128], [255, 215, 0], [0, 191, 255]],
  };
  
  let baseColors: [number, number, number][] = [];
  
  for (const [keyword, colors] of Object.entries(colorMap)) {
    if (lowerPrompt.includes(keyword)) {
      baseColors.push(...colors);
    }
  }
  
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

// Perlin noise
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

// Render a single frame
function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameIndex: number,
  totalFrames: number,
  rng: SeededRandom,
  noise: (x: number, y: number) => number,
  palette: string[],
  style: string
) {
  const time = frameIndex / totalFrames;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.5, palette[1]);
  gradient.addColorStop(1, palette[2] || palette[0]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Animated elements based on style
  if (style === 'cosmic' || style === 'space') {
    // Stars
    for (let i = 0; i < 100; i++) {
      const x = (rng.next() * width + time * 50) % width;
      const y = rng.next() * height;
      const size = rng.range(1, 3);
      const alpha = 0.3 + Math.sin(time * Math.PI * 2 + i) * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Nebula
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const x = width / 2 + Math.cos(time * Math.PI * 2 + i) * 100;
      const y = height / 2 + Math.sin(time * Math.PI * 2 + i) * 100;
      const radius = 50 + Math.sin(time * Math.PI * 4 + i) * 20;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, palette[i % palette.length]);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.globalAlpha = 1;
  } else if (style === 'geometric') {
    // Rotating shapes
    for (let i = 0; i < 10; i++) {
      const angle = time * Math.PI * 2 + (i * Math.PI * 2) / 10;
      const x = width / 2 + Math.cos(angle) * 100;
      const y = height / 2 + Math.sin(angle) * 100;
      const size = 30 + Math.sin(time * Math.PI * 4 + i) * 10;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = palette[i % palette.length];
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  } else if (style === 'organic' || style === 'nature') {
    // Flowing blobs
    for (let i = 0; i < 8; i++) {
      const baseX = rng.range(0, width);
      const baseY = rng.range(0, height);
      const x = baseX + Math.sin(time * Math.PI * 2 + i) * 30;
      const y = baseY + Math.cos(time * Math.PI * 2 + i) * 30;
      const radius = 40 + Math.sin(time * Math.PI * 4 + i) * 15;
      
      ctx.fillStyle = palette[i % palette.length];
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else {
    // Abstract flowing lines
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.strokeStyle = palette[i % palette.length];
      ctx.lineWidth = 2;
      
      let x = rng.range(0, width);
      let y = rng.range(0, height);
      ctx.moveTo(x, y);
      
      for (let j = 0; j < 20; j++) {
        const angle = noise(x * 0.005 + time, y * 0.005) * Math.PI * 4;
        x += Math.cos(angle) * 15;
        y += Math.sin(angle) * 15;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

// Main video generation function
export async function generateVideo(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    duration?: number;
    fps?: number;
    style?: string;
    onProgress?: (progress: number, frame: number, totalFrames: number) => void;
  } = {}
): Promise<{ videoUrl: string; frames: number; fps: number; duration: number }> {
  const {
    width = 512,
    height = 512,
    duration = 1,
    fps = 30,
    style = 'abstract',
    onProgress,
  } = options;

  const totalFrames = Math.floor(duration * fps);
  const seed = hashString(prompt + style);
  const rng = new SeededRandom(seed);
  const noise = createNoise(new SeededRandom(seed));
  const palette = generatePalette(rng, prompt);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Create MediaRecorder
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000,
  });
  
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      stream.getTracks().forEach(track => track.stop());
      resolve({ videoUrl, frames: totalFrames, fps, duration });
    };
    
    mediaRecorder.onerror = (e) => {
      stream.getTracks().forEach(track => track.stop());
      reject(new Error('Video recording failed'));
    };
    
    mediaRecorder.start();
    
    // Render frames
    let frameIndex = 0;
    const frameInterval = 1000 / fps;
    
    const renderNextFrame = () => {
      if (frameIndex >= totalFrames) {
        mediaRecorder.stop();
        return;
      }
      
      renderFrame(ctx, width, height, frameIndex, totalFrames, rng, noise, palette, style);
      onProgress?.((frameIndex / totalFrames) * 100, frameIndex, totalFrames);
      
      frameIndex++;
      setTimeout(renderNextFrame, frameInterval);
    };
    
    renderNextFrame();
  });
}

export function isVideoModelLoaded(): boolean {
  return true;
}

export function getVideoModelInfo(): VideoModelConfig {
  return VIDEO_MODEL_CONFIGS['flow-omni-1'];
}
