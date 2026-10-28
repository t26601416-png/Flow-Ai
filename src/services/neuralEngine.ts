import { pipeline, env, type TextGenerationPipeline } from '@huggingface/transformers';

// Configure transformers.js for local operation
env.allowLocalModels = false;
env.useBrowserCache = true;
if (env.backends?.onnx?.wasm) {
  (env.backends.onnx.wasm as any).numThreads = 4;
}

export type FlowModel = 'flow-1-flash' | 'flow-1-pro' | 'flow-argon-2';

interface ModelConfig {
  id: string;
  hfModel: string;
  name: string;
  description: string;
  descriptionEn: string;
  size: string;
  params: string;
  speed: string;
  quality: string;
  category: string;
  maxTokens: number;
}

export const MODEL_CONFIGS: Record<FlowModel, ModelConfig> = {
  'flow-1-flash': {
    id: 'flow-1-flash',
    hfModel: 'Xenova/distilgpt2',
    name: 'Flow-1 Flash',
    description: 'Швидка нейромережа для миттєвих відповідей. Оптимізована для швидкості.',
    descriptionEn: 'Fast neural network for instant responses. Optimized for speed.',
    size: '~82 MB',
    params: '82M',
    speed: 'Дуже швидка',
    quality: 'Хороша',
    category: 'General AI',
    maxTokens: 256,
  },
  'flow-1-pro': {
    id: 'flow-1-pro',
    hfModel: 'Xenova/gpt2',
    name: 'Flow-1 Pro',
    description: 'Потужна нейромережа з 129 млн параметрів для складних завдань. Оптимізована для точності та якості.',
    descriptionEn: 'Powerful neural network with 129 million parameters for complex tasks. Optimized for accuracy and quality.',
    size: '~500 MB',
    params: '129M',
    speed: 'Середня',
    quality: 'Відмінна',
    category: 'General AI',
    maxTokens: 512,
  },
  'flow-argon-2': {
    id: 'flow-argon-2',
    hfModel: 'Xenova/gpt2-large',
    name: 'Flow-argon 2',
    description: 'Найпотужніша нейромережа з 327 млн параметрів. Найкраща якість для складних завдань.',
    descriptionEn: 'Most powerful neural network with 327 million parameters. Best quality for complex tasks.',
    size: '~1.5 GB',
    params: '327M',
    speed: 'Повільна',
    quality: 'Найкраща',
    category: 'Advanced AI',
    maxTokens: 2048,
  },
};

// Pipeline cache
const pipelines: Map<FlowModel, TextGenerationPipeline> = new Map();
const loadingState: Map<FlowModel, { loading: boolean; progress: number; status: string }> = new Map();

export function getModelLoadingState(model: FlowModel) {
  return loadingState.get(model) || { loading: false, progress: 0, status: '' };
}

export function isModelLoaded(model: FlowModel): boolean {
  return pipelines.has(model);
}

export async function loadModel(
  model: FlowModel,
  onProgress?: (progress: number, status: string) => void
): Promise<TextGenerationPipeline> {
  if (pipelines.has(model)) {
    return pipelines.get(model)!;
  }

  const config = MODEL_CONFIGS[model];
  loadingState.set(model, { loading: true, progress: 0, status: 'Ініціалізація...' });

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      loadingState.set(model, { loading: true, progress: 0, status: `Спроба ${attempt}/${maxRetries}...` });
      onProgress?.(0, `Спроба ${attempt}/${maxRetries}...`);

      const pipe = await pipeline('text-generation', config.hfModel, {
        progress_callback: (data: any) => {
          if (data.status === 'progress' && data.progress) {
            const progress = Math.round(data.progress);
            const status = data.file || 'Завантаження...';
            loadingState.set(model, { loading: true, progress, status });
            onProgress?.(progress, status);
          } else if (data.status === 'ready') {
            loadingState.set(model, { loading: false, progress: 100, status: 'Готова' });
            onProgress?.(100, 'Готова');
          } else if (data.status === 'initiate') {
            loadingState.set(model, { loading: true, progress: 0, status: `Завантаження ${data.file}...` });
            onProgress?.(0, `Завантаження ${data.file}...`);
          }
        },
      });

      pipelines.set(model, pipe as TextGenerationPipeline);
      loadingState.set(model, { loading: false, progress: 100, status: 'Завантажена' });
      return pipe as TextGenerationPipeline;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed for ${model}:`, error);
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000;
        loadingState.set(model, { loading: true, progress: 0, status: `Помилка, повтор через ${waitTime/1000}с...` });
        onProgress?.(0, `Помилка, повтор через ${waitTime/1000}с...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  loadingState.set(model, { loading: false, progress: 0, status: 'Помилка завантаження' });
  throw lastError || new Error('Failed to load model after multiple attempts');
}

export async function generateText(
  model: FlowModel,
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    repetitionPenalty?: number;
    onToken?: (token: string) => void;
  } = {}
): Promise<string> {
  const pipe = await loadModel(model);
  const config = MODEL_CONFIGS[model];

  const result = await pipe(prompt, {
    max_new_tokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 0.9,
    top_k: options.topK || 50,
    repetition_penalty: options.repetitionPenalty || 1.2,
    do_sample: true,
  });

  const generatedText = result[0]?.generated_text || '';
  // Remove the prompt from the output
  const response = generatedText.slice(prompt.length).trim();
  
  if (options.onToken) {
    // Simulate streaming by calling onToken for each word
    const words = response.split(' ');
    for (const word of words) {
      options.onToken(word + ' ');
      await new Promise(r => setTimeout(r, 20));
    }
  }

  return response;
}

export async function generateTextStream(
  model: FlowModel,
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    repetitionPenalty?: number;
    onToken?: (token: string) => void;
    abortSignal?: AbortSignal;
  } = {}
): Promise<string> {
  const pipe = await loadModel(model);
  const config = MODEL_CONFIGS[model];

  // Generate full response
  const result = await pipe(prompt, {
    max_new_tokens: options.maxTokens || config.maxTokens,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 0.9,
    top_k: options.topK || 50,
    repetition_penalty: options.repetitionPenalty || 1.2,
    do_sample: true,
  });

  const generatedText = result[0]?.generated_text || '';
  const response = generatedText.slice(prompt.length).trim();

  // Stream tokens to callback
  if (options.onToken) {
    const tokens = response.split(/(\s+)/);
    let accumulated = '';
    for (const token of tokens) {
      if (options.abortSignal?.aborted) break;
      accumulated += token;
      options.onToken(token);
      await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
    }
  }

  return response;
}

export function unloadModel(model: FlowModel) {
  pipelines.delete(model);
  loadingState.delete(model);
}

export function unloadAllModels() {
  pipelines.clear();
  loadingState.clear();
}

export function getLoadedModels(): FlowModel[] {
  return Array.from(pipelines.keys());
}
