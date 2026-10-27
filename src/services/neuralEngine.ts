import { pipeline, env, type TextGenerationPipeline } from '@huggingface/transformers';

// Configure transformers.js for local operation
env.allowLocalModels = false;
env.useBrowserCache = true;
if (env.backends?.onnx?.wasm) {
  (env.backends.onnx.wasm as any).numThreads = 4;
}

export type FlowModel = 'flow-1-flash' | 'flow-1-pro';

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
    description: 'Потужна нейромережа для складних завдань. Найкраща якість генерації.',
    descriptionEn: 'Powerful neural network for complex tasks. Best generation quality.',
    size: '~500 MB',
    params: '124M',
    speed: 'Середня',
    quality: 'Відмінна',
    category: 'General AI',
    maxTokens: 512,
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

  try {
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
    loadingState.set(model, { loading: false, progress: 0, status: 'Помилка' });
    throw error;
  }
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
