import React, { useState } from 'react';
import { useStore, AIAgent } from '../store';
import { t } from '../i18n';
import { chatStreamGenerator } from '../services/ollama';
import {
  Bot, Plus, Trash2, Edit3, MessageSquare, X, Check,
  Wrench, Brain, Play
} from 'lucide-react';

const defaultIcons = ['💻', '🌐', '📊', '🎨', '📝', '🔬', '🎯', '⚡', '🧠', '🤖'];
const availableTools = [
  { id: 'code_generation', name: { uk: 'Генерація коду', en: 'Code Generation' } },
  { id: 'code_review', name: { uk: 'Ревʼю коду', en: 'Code Review' } },
  { id: 'debug', name: { uk: 'Дебаг', en: 'Debug' } },
  { id: 'translation', name: { uk: 'Переклад', en: 'Translation' } },
  { id: 'analysis', name: { uk: 'Аналіз', en: 'Analysis' } },
  { id: 'summarization', name: { uk: 'Сумаризація', en: 'Summarization' } },
  { id: 'web_search', name: { uk: 'Веб-пошук', en: 'Web Search' } },
  { id: 'file_ops', name: { uk: 'Робота з файлами', en: 'File Operations' } },
  { id: 'math', name: { uk: 'Математика', en: 'Math' } },
  { id: 'reasoning', name: { uk: 'Міркування', en: 'Reasoning' } },
];

export default function Agents() {
  const { language, agents, addAgent, updateAgent, deleteAgent, activeModel, availableModels, ollamaConnected } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [chatAgent, setChatAgent] = useState<AIAgent | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentResponse, setAgentResponse] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('🤖');
  const [formDescription, setFormDescription] = useState('');
  const [formSystemPrompt, setFormSystemPrompt] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formTools, setFormTools] = useState<string[]>([]);

  const resetForm = () => {
    setFormName('');
    setFormIcon('🤖');
    setFormDescription('');
    setFormSystemPrompt('');
    setFormModel(activeModel);
    setFormTools([]);
    setEditingAgent(null);
  };

  const handleCreate = () => {
    if (!formName.trim()) return;
    
    if (editingAgent) {
      updateAgent(editingAgent.id, {
        name: formName,
        icon: formIcon,
        description: formDescription,
        systemPrompt: formSystemPrompt,
        model: formModel,
        tools: formTools,
      });
    } else {
      const newAgent: AIAgent = {
        id: `agent-${Date.now()}`,
        name: formName,
        icon: formIcon,
        description: formDescription,
        systemPrompt: formSystemPrompt,
        model: formModel,
        tools: formTools,
        createdAt: Date.now(),
      };
      addAgent(newAgent);
    }
    
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = (agent: AIAgent) => {
    setFormName(agent.name);
    setFormIcon(agent.icon);
    setFormDescription(agent.description);
    setFormSystemPrompt(agent.systemPrompt);
    setFormModel(agent.model);
    setFormTools(agent.tools);
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleAgentChat = async () => {
    if (!chatInput.trim() || !chatAgent || isGenerating) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);
    setAgentResponse('');

    try {
      const messages = [...chatMessages, userMsg];
      let fullResponse = '';
      
      const generator = chatStreamGenerator(messages, {
        model: chatAgent.model || activeModel,
        system: chatAgent.systemPrompt,
      });

      for await (const chunk of generator) {
        fullResponse += chunk;
        setAgentResponse(fullResponse);
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
      setAgentResponse('');
    } catch (err: any) {
      setAgentResponse(`⚠️ ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-cyan-400" />
            {t('nav.agents', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Створюйте та керуйте AI-агентами' : 'Create and manage AI agents'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('agents.create', language)}
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="glass rounded-2xl p-5 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{agent.icon}</span>
                <div>
                  <h3 className="font-medium text-white">{agent.name}</h3>
                  <p className="text-xs text-slate-400">{agent.model || activeModel || 'Default'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(agent)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteAgent(agent.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{agent.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {agent.tools.slice(0, 3).map(tool => (
                <span key={tool} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px]">
                  {tool}
                </span>
              ))}
              {agent.tools.length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 text-[10px]">
                  +{agent.tools.length - 3}
                </span>
              )}
            </div>
            <button
              onClick={() => { setChatAgent(agent); setChatMessages([]); setAgentResponse(''); }}
              className="w-full py-2 rounded-xl bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              {language === 'uk' ? 'Запустити' : 'Run'}
            </button>
          </div>
        ))}
      </div>

      {/* Agent Chat Modal */}
      {chatAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-[80vh] glass rounded-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-indigo-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{chatAgent.icon}</span>
                <div>
                  <h3 className="font-medium text-white">{chatAgent.name}</h3>
                  <p className="text-xs text-slate-400">{chatAgent.description}</p>
                </div>
              </div>
              <button
                onClick={() => setChatAgent(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' ? 'bg-indigo-500/20 text-white' : 'bg-slate-800/50 text-slate-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {agentResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-xl px-4 py-2.5 text-sm bg-slate-800/50 text-slate-200">
                    {agentResponse}
                    {isGenerating && <span className="animate-pulse">▊</span>}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-indigo-500/20">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAgentChat()}
                  placeholder={language === 'uk' ? 'Запитайте агента...' : 'Ask the agent...'}
                  className="flex-1 bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
                <button
                  onClick={handleAgentChat}
                  disabled={!chatInput.trim() || isGenerating}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors disabled:opacity-30"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingAgent ? (language === 'uk' ? 'Редагувати агента' : 'Edit Agent') : t('agents.create', language)}
              </h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Icon */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">{language === 'uk' ? 'Іконка' : 'Icon'}</label>
                <div className="flex gap-2 flex-wrap">
                  {defaultIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setFormIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${formIcon === icon ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t('agents.name', language)}</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t('agents.description', language)}</label>
                <input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t('agents.systemPrompt', language)}</label>
                <textarea
                  value={formSystemPrompt}
                  onChange={(e) => setFormSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              {/* Model */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{language === 'uk' ? 'Модель' : 'Model'}</label>
                <select
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">{language === 'uk' ? 'За замовчуванням' : 'Default'}</option>
                  {availableModels.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Tools */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> {t('agents.tools', language)}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setFormTools(prev =>
                        prev.includes(tool.id) ? prev.filter(t => t !== tool.id) : [...prev, tool.id]
                      )}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        formTools.includes(tool.id)
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
                      }`}
                    >
                      {tool.name[language]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-white/5 text-sm transition-colors"
              >
                {t('common.cancel', language)}
              </button>
              <button
                onClick={handleCreate}
                disabled={!formName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 text-sm font-medium transition-colors disabled:opacity-30"
              >
                {editingAgent ? (language === 'uk' ? 'Оновити' : 'Update') : (language === 'uk' ? 'Створити' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
