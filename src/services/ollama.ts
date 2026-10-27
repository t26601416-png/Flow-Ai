import { useStore } from '../store';

const getBaseUrl = () => useStore.getState().ollamaUrl;

export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const connected = response.ok;
    useStore.getState().setOllamaConnected(connected);
    if (connected) {
      const data = await response.json();
      useStore.getState().setAvailableModels(data.models || []);
    }
    return connected;
  } catch {
    useStore.getState().setOllamaConnected(false);
    return false;
  }
}

export async function listModels() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tags`);
    const data = await response.json();
    useStore.getState().setAvailableModels(data.models || []);
    useStore.getState().setOllamaConnected(true);
    return data.models || [];
  } catch {
    useStore.getState().setOllamaConnected(false);
    return [];
  }
}

export async function pullModel(modelName: string, onProgress?: (progress: any) => void): Promise<boolean> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
    });
    
    if (!response.ok) return false;
    
    const reader = response.body?.getReader();
    if (!reader) return false;
    
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (onProgress) onProgress(data);
          if (data.status === 'success') return true;
        } catch {}
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteModel(modelName: string): Promise<boolean> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface GenerateOptions {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_predict?: number;
  num_ctx?: number;
  stream?: boolean;
}

export async function* generateStream(options: GenerateOptions): AsyncGenerator<string> {
  const state = useStore.getState();
  
  const response = await fetch(`${state.ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || state.activeModel,
      prompt: options.prompt,
      system: options.system,
      stream: true,
      options: {
        temperature: options.temperature ?? state.temperature,
        top_p: options.top_p ?? state.topP,
        top_k: options.top_k ?? state.topK,
        num_predict: options.num_predict ?? state.maxTokens,
        num_ctx: options.num_ctx ?? state.contextLength,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n').filter(l => l.trim());
    buffer = lines.length > 0 && !buffer.endsWith('\n') ? lines.pop() || '' : '';

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.response) {
          yield data.response;
        }
        if (data.done) return;
      } catch {}
    }
  }
}

export async function chatStream(
  messages: { role: string; content: string }[],
  options: { model?: string; system?: string } = {}
): Promise<Response> {
  const state = useStore.getState();
  
  return fetch(`${state.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model || state.activeModel,
      messages: [
        ...(options.system ? [{ role: 'system', content: options.system }] : []),
        ...messages
      ],
      stream: true,
      options: {
        temperature: state.temperature,
        top_p: state.topP,
        top_k: state.topK,
        num_predict: state.maxTokens,
        num_ctx: state.contextLength,
      }
    }),
  });
}

export async function* chatStreamGenerator(
  messages: { role: string; content: string }[],
  options: { model?: string; system?: string } = {}
): AsyncGenerator<string> {
  const response = await chatStream(messages, options);
  
  if (!response.ok) {
    throw new Error(`Chat failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n').filter(l => l.trim());
    buffer = lines.length > 0 && !buffer.endsWith('\n') ? lines.pop() || '' : '';

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.message?.content) {
          yield data.message.content;
        }
        if (data.done) return;
      } catch {}
    }
  }
}
