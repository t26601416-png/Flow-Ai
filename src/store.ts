import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIAgent {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  model: string;
  tools: string[];
  createdAt: number;
}

export interface FlowProject {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  chunks: number;
  indexedAt: number;
}

export interface ModelInfo {
  name: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface AutomationTask {
  id: string;
  name: string;
  flowId: string;
  schedule: string;
  enabled: boolean;
  lastRun?: number;
  status: 'idle' | 'running' | 'error' | 'success';
}

interface AppState {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Language
  language: 'uk' | 'en';
  setLanguage: (lang: 'uk' | 'en') => void;
  
  // AI Engine
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  ollamaConnected: boolean;
  setOllamaConnected: (connected: boolean) => void;
  availableModels: ModelInfo[];
  setAvailableModels: (models: ModelInfo[]) => void;
  activeModel: string;
  setActiveModel: (model: string) => void;
  
  // AI Settings
  temperature: number;
  setTemperature: (t: number) => void;
  topP: number;
  setTopP: (t: number) => void;
  topK: number;
  setTopK: (t: number) => void;
  maxTokens: number;
  setMaxTokens: (t: number) => void;
  contextLength: number;
  setContextLength: (c: number) => void;
  
  // Chats
  chats: Chat[];
  activeChatId: string | null;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  setActiveChatId: (id: string | null) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  
  // Agents
  agents: AIAgent[];
  addAgent: (agent: AIAgent) => void;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  
  // Flows
  flowProjects: FlowProject[];
  addFlowProject: (project: FlowProject) => void;
  updateFlowProject: (id: string, updates: Partial<FlowProject>) => void;
  deleteFlowProject: (id: string) => void;
  
  // Knowledge Base
  knowledgeDocs: KnowledgeDoc[];
  addKnowledgeDoc: (doc: KnowledgeDoc) => void;
  deleteKnowledgeDoc: (id: string) => void;
  
  // Automation
  automationTasks: AutomationTask[];
  addAutomationTask: (task: AutomationTask) => void;
  updateAutomationTask: (id: string, updates: Partial<AutomationTask>) => void;
  deleteAutomationTask: (id: string) => void;
  
  // API Server
  apiServerEnabled: boolean;
  setApiServerEnabled: (enabled: boolean) => void;
  apiServerPort: number;
  setApiServerPort: (port: number) => void;
  apiKeys: string[];
  addApiKey: (key: string) => void;
  removeApiKey: (key: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // Language
      language: 'uk',
      setLanguage: (language) => set({ language }),
      
      // AI Engine
      ollamaUrl: 'http://localhost:11434',
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      ollamaConnected: false,
      setOllamaConnected: (connected) => set({ ollamaConnected: connected }),
      availableModels: [],
      setAvailableModels: (models) => set({ availableModels: models }),
      activeModel: '',
      setActiveModel: (model) => set({ activeModel: model }),
      
      // AI Settings
      temperature: 0.7,
      setTemperature: (t) => set({ temperature: t }),
      topP: 0.9,
      setTopP: (t) => set({ topP: t }),
      topK: 40,
      setTopK: (t) => set({ topK: t }),
      maxTokens: 2048,
      setMaxTokens: (t) => set({ maxTokens: t }),
      contextLength: 4096,
      setContextLength: (c) => set({ contextLength: c }),
      
      // Chats
      chats: [],
      activeChatId: null,
      addChat: (chat) => set((s) => ({ chats: [...s.chats, chat] })),
      updateChat: (id, updates) => set((s) => ({
        chats: s.chats.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteChat: (id) => set((s) => ({
        chats: s.chats.filter(c => c.id !== id),
        activeChatId: s.activeChatId === id ? null : s.activeChatId
      })),
      setActiveChatId: (id) => set({ activeChatId: id }),
      addMessage: (chatId, message) => set((s) => ({
        chats: s.chats.map(c => c.id === chatId ? {
          ...c,
          messages: [...c.messages, message],
          updatedAt: Date.now()
        } : c)
      })),
      
      // Agents
      agents: [
        {
          id: 'agent-programmer',
          name: 'Програміст',
          icon: '💻',
          description: 'AI-асистент для написання та аналізу коду',
          systemPrompt: 'Ти — досвідчений програміст. Допоможи користувачу з написанням коду, дебагом та архітектурними рішеннями. Відповідай структуровано з прикладами коду.',
          model: '',
          tools: ['code_generation', 'code_review', 'debug'],
          createdAt: Date.now()
        },
        {
          id: 'agent-translator',
          name: 'Перекладач',
          icon: '🌐',
          description: 'Професійний перекладач між українською та англійською',
          systemPrompt: 'Ти — професійний перекладач. Перекладай тексти між українською та англійською мовами, зберігаючи стиль та контекст оригіналу.',
          model: '',
          tools: ['translation'],
          createdAt: Date.now()
        },
        {
          id: 'agent-analyst',
          name: 'Аналітик',
          icon: '📊',
          description: 'Аналіз даних та документів',
          systemPrompt: 'Ти — аналітик даних. Аналізуй надану інформацію, знаходь закономірності, роби висновки та рекомендації.',
          model: '',
          tools: ['analysis', 'summarization'],
          createdAt: Date.now()
        }
      ],
      addAgent: (agent) => set((s) => ({ agents: [...s.agents, agent] })),
      updateAgent: (id, updates) => set((s) => ({
        agents: s.agents.map(a => a.id === id ? { ...a, ...updates } : a)
      })),
      deleteAgent: (id) => set((s) => ({ agents: s.agents.filter(a => a.id !== id) })),
      
      // Flows
      flowProjects: [],
      addFlowProject: (project) => set((s) => ({ flowProjects: [...s.flowProjects, project] })),
      updateFlowProject: (id, updates) => set((s) => ({
        flowProjects: s.flowProjects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteFlowProject: (id) => set((s) => ({ flowProjects: s.flowProjects.filter(p => p.id !== id) })),
      
      // Knowledge Base
      knowledgeDocs: [],
      addKnowledgeDoc: (doc) => set((s) => ({ knowledgeDocs: [...s.knowledgeDocs, doc] })),
      deleteKnowledgeDoc: (id) => set((s) => ({ knowledgeDocs: s.knowledgeDocs.filter(d => d.id !== id) })),
      
      // Automation
      automationTasks: [],
      addAutomationTask: (task) => set((s) => ({ automationTasks: [...s.automationTasks, task] })),
      updateAutomationTask: (id, updates) => set((s) => ({
        automationTasks: s.automationTasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteAutomationTask: (id) => set((s) => ({ automationTasks: s.automationTasks.filter(t => t.id !== id) })),
      
      // API Server
      apiServerEnabled: false,
      setApiServerEnabled: (enabled) => set({ apiServerEnabled: enabled }),
      apiServerPort: 8080,
      setApiServerPort: (port) => set({ apiServerPort: port }),
      apiKeys: [],
      addApiKey: (key) => set((s) => ({ apiKeys: [...s.apiKeys, key] })),
      removeApiKey: (key) => set((s) => ({ apiKeys: s.apiKeys.filter(k => k !== key) })),
    }),
    {
      name: 'local-flow-ai-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        ollamaUrl: state.ollamaUrl,
        activeModel: state.activeModel,
        temperature: state.temperature,
        topP: state.topP,
        topK: state.topK,
        maxTokens: state.maxTokens,
        contextLength: state.contextLength,
        chats: state.chats,
        agents: state.agents,
        flowProjects: state.flowProjects,
        knowledgeDocs: state.knowledgeDocs,
        automationTasks: state.automationTasks,
        apiServerEnabled: state.apiServerEnabled,
        apiServerPort: state.apiServerPort,
        apiKeys: state.apiKeys,
      })
    }
  )
);
