import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlowModel } from './services/neuralEngine';

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
  model: FlowModel | '';
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
  model: FlowModel | '';
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

export interface ModelLoadStatus {
  model: FlowModel;
  loaded: boolean;
  loading: boolean;
  progress: number;
  status: string;
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
  
  // Neural Engine
  activeModel: FlowModel | '';
  setActiveModel: (model: FlowModel | '') => void;
  loadedModels: FlowModel[];
  setLoadedModels: (models: FlowModel[]) => void;
  modelLoadStatus: Record<FlowModel, { loading: boolean; progress: number; status: string }>;
  setModelLoadStatus: (model: FlowModel, status: { loading: boolean; progress: number; status: string }) => void;
  
  // AI Settings
  temperature: number;
  setTemperature: (t: number) => void;
  topP: number;
  setTopP: (t: number) => void;
  topK: number;
  setTopK: (t: number) => void;
  maxTokens: number;
  setMaxTokens: (t: number) => void;
  repetitionPenalty: number;
  setRepetitionPenalty: (r: number) => void;
  
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
      
      // Neural Engine
      activeModel: '',
      setActiveModel: (model) => set({ activeModel: model }),
      loadedModels: [],
      setLoadedModels: (models) => set({ loadedModels: models }),
      modelLoadStatus: {
        'flow-1-flash': { loading: false, progress: 0, status: '' },
        'flow-1-pro': { loading: false, progress: 0, status: '' },
      },
      setModelLoadStatus: (model, status) => set((s) => ({
        modelLoadStatus: { ...s.modelLoadStatus, [model]: status }
      })),
      
      // AI Settings
      temperature: 0.7,
      setTemperature: (t) => set({ temperature: t }),
      topP: 0.9,
      setTopP: (t) => set({ topP: t }),
      topK: 50,
      setTopK: (t) => set({ topK: t }),
      maxTokens: 256,
      setMaxTokens: (t) => set({ maxTokens: t }),
      repetitionPenalty: 1.2,
      setRepetitionPenalty: (r) => set({ repetitionPenalty: r }),
      
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
          systemPrompt: 'Ти — досвідчений програміст. Допоможи користувачу з написанням коду.',
          model: '',
          tools: ['code_generation', 'code_review', 'debug'],
          createdAt: Date.now()
        },
        {
          id: 'agent-translator',
          name: 'Перекладач',
          icon: '🌐',
          description: 'Професійний перекладач між українською та англійською',
          systemPrompt: 'Ти — професійний перекладач. Перекладай тексти між українською та англійською мовами.',
          model: '',
          tools: ['translation'],
          createdAt: Date.now()
        },
        {
          id: 'agent-analyst',
          name: 'Аналітик',
          icon: '📊',
          description: 'Аналіз даних та документів',
          systemPrompt: 'Ти — аналітик даних. Аналізуй надану інформацію та роби висновки.',
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
        activeModel: state.activeModel,
        temperature: state.temperature,
        topP: state.topP,
        topK: state.topK,
        maxTokens: state.maxTokens,
        repetitionPenalty: state.repetitionPenalty,
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
