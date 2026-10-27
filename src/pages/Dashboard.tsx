import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { checkOllamaConnection } from '../services/ollama';
import {
  Brain, Cpu, HardDrive, Wifi, WifiOff, MessageSquare,
  Bot, GitBranch, Package, RefreshCw, Zap, ArrowRight, Clock
} from 'lucide-react';

export default function Dashboard() {
  const {
    language, ollamaConnected, setOllamaConnected, availableModels,
    activeModel, chats, agents, flowProjects, setCurrentPage, setActiveChatId
  } = useStore();
  
  const [systemInfo, setSystemInfo] = useState({
    memory: 0,
    cpu: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleCheckConnection();
    // Simulate system info
    setSystemInfo({
      memory: Math.floor(Math.random() * 40 + 30),
      cpu: Math.floor(Math.random() * 30 + 10),
    });
  }, []);

  const handleCheckConnection = async () => {
    setLoading(true);
    await checkOllamaConnection();
    setLoading(false);
  };

  const recentChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('dashboard.welcome', language)} 🧠
        </h1>
        <p className="text-slate-400 text-lg">
          {t('dashboard.subtitle', language)}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Engine Status */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{t('dashboard.engineStatus', language)}</span>
            <button
              onClick={handleCheckConnection}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {ollamaConnected ? (
              <Wifi className="w-8 h-8 text-green-400" />
            ) : (
              <WifiOff className="w-8 h-8 text-red-400" />
            )}
            <div>
              <p className={`font-semibold ${ollamaConnected ? 'text-green-400' : 'text-red-400'}`}>
                {ollamaConnected ? t('dashboard.connected', language) : t('dashboard.disconnected', language)}
              </p>
              <p className="text-xs text-slate-500">Ollama API</p>
            </div>
          </div>
        </div>

        {/* Active Model */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{t('dashboard.activeModel', language)}</span>
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="font-semibold text-white text-lg truncate">
            {activeModel || '—'}
          </p>
          <button
            onClick={() => setCurrentPage('models')}
            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1"
          >
            {t('models.available', language)} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Installed Models */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{t('dashboard.installedModels', language)}</span>
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-semibold text-white text-3xl">
            {availableModels.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {availableModels.length === 0 ? t('dashboard.noModels', language) : 'GGUF / Ollama'}
          </p>
        </div>

        {/* AI Agents */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{t('dashboard.totalAgents', language)}</span>
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="font-semibold text-white text-3xl">{agents.length}</p>
          <button
            onClick={() => setCurrentPage('agents')}
            className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1"
          >
            {language === 'uk' ? 'Керувати' : 'Manage'} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            {language === 'uk' ? 'Системні ресурси' : 'System Resources'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">CPU</span>
                <span className="text-indigo-400">{systemInfo.cpu}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${systemInfo.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">RAM</span>
                <span className="text-indigo-400">{systemInfo.memory}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${systemInfo.memory}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">GPU VRAM</span>
                <span className="text-slate-500">N/A</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t('dashboard.quickStart', language)}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setCurrentPage('chat');
                const newChat = {
                  id: `chat-${Date.now()}`,
                  title: language === 'uk' ? 'Новий чат' : 'New Chat',
                  messages: [],
                  model: activeModel,
                  systemPrompt: '',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                useStore.getState().addChat(newChat);
                useStore.getState().setActiveChatId(newChat.id);
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
            >
              <MessageSquare className="w-6 h-6 text-indigo-400" />
              <span className="text-xs text-slate-300">{t('nav.chat', language)}</span>
            </button>
            <button
              onClick={() => setCurrentPage('flowBuilder')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
            >
              <GitBranch className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-slate-300">Flow Builder</span>
            </button>
            <button
              onClick={() => setCurrentPage('models')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
            >
              <Package className="w-6 h-6 text-cyan-400" />
              <span className="text-xs text-slate-300">{t('nav.models', language)}</span>
            </button>
            <button
              onClick={() => setCurrentPage('knowledge')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <HardDrive className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-slate-300">{t('nav.knowledge', language)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('dashboard.recentChats', language)}
          </h3>
          <button
            onClick={() => setCurrentPage('chat')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            {language === 'uk' ? 'Всі чати' : 'All chats'} →
          </button>
        </div>
        {recentChats.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{language === 'uk' ? 'Ще немає діалогів' : 'No conversations yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setCurrentPage('chat');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{chat.title}</p>
                  <p className="text-xs text-slate-500">
                    {chat.messages.length} {language === 'uk' ? 'повідомлень' : 'messages'} • {chat.model || 'No model'}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!ollamaConnected && (
        <div className="mt-6 glass rounded-2xl p-5 border-amber-500/30 border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-300 mb-1">
                {language === 'uk' ? 'Ollama не підключено' : 'Ollama not connected'}
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                {t('dashboard.installOllama', language)}
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>1. {language === 'uk' ? 'Завантажте Ollama з' : 'Download Ollama from'} <a href="https://ollama.com" target="_blank" className="text-indigo-400 hover:underline">ollama.com</a></p>
                <p>2. {language === 'uk' ? 'Встановіть та запустіть Ollama' : 'Install and start Ollama'}</p>
                <p>3. {language === 'uk' ? 'Завантажте модель:' : 'Pull a model:'} <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">ollama pull llama3.2</code></p>
                <p>4. {language === 'uk' ? 'Натисніть' : 'Click'} "{t('dashboard.checkConnection', language)}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
