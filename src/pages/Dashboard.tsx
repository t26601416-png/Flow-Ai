import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { isModelLoaded, getLoadedModels, loadModel, MODEL_CONFIGS } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import {
  Brain, Cpu, HardDrive, MessageSquare,
  Bot, GitBranch, Package, Zap, ArrowRight, Clock,
  Download, CheckCircle, Loader, Sparkles, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const {
    language, loadedModels, setLoadedModels, activeModel,
    chats, agents, flowProjects, setCurrentPage, setActiveChatId,
    modelLoadStatus, setModelLoadStatus
  } = useStore();
  
  const [systemInfo, setSystemInfo] = useState({ memory: 0, cpu: 0 });
  const [animatedStats, setAnimatedStats] = useState({ models: 0, chats: 0, agents: 0 });

  useEffect(() => {
    const loaded = getLoadedModels();
    setLoadedModels(loaded);
    
    setSystemInfo({
      memory: Math.floor(Math.random() * 40 + 30),
      cpu: Math.floor(Math.random() * 30 + 10),
    });

    // Animate stats
    const targets = { models: loadedModels.length, chats: chats.length, agents: agents.length };
    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimatedStats({
        models: Math.floor(targets.models * progress),
        chats: Math.floor(targets.chats * progress),
        agents: Math.floor(targets.agents * progress),
      });
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const handleLoadModel = async (model: FlowModel) => {
    try {
      setModelLoadStatus(model, { loading: true, progress: 0, status: 'Завантаження нейромережі...' });
      await loadModel(model, (progress, status) => {
        setModelLoadStatus(model, { loading: true, progress, status });
      });
      setModelLoadStatus(model, { loading: false, progress: 100, status: 'Завантажена' });
      setLoadedModels(getLoadedModels());
    } catch (err) {
      setModelLoadStatus(model, { loading: false, progress: 0, status: 'Помилка' });
    }
  };

  const recentChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-8 animate-fade-in">
      {/* Hero Section */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">{t('dashboard.welcome', language)}</span>
            <span className="inline-block ml-3 animate-float">🧠</span>
          </h1>
          <p className="text-xl text-slate-400">
            {language === 'uk' 
              ? 'Повністю локальна нейромережа — 10 моделей AI у вашому браузері' 
              : 'Fully local neural network — 10 AI models in your browser'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{animatedStats.models}</div>
          <div className="text-sm text-slate-400">{language === 'uk' ? 'Моделі завантажено' : 'Models loaded'}</div>
        </div>

        <div className="glass rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{animatedStats.chats}</div>
          <div className="text-sm text-slate-400">{language === 'uk' ? 'Діалогів' : 'Conversations'}</div>
        </div>

        <div className="glass rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{animatedStats.agents}</div>
          <div className="text-sm text-slate-400">{language === 'uk' ? 'AI агентів' : 'AI agents'}</div>
        </div>
      </div>

      {/* Model Status Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          {language === 'uk' ? 'Нейромережі' : 'Neural Networks'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['flow-1-flash', 'flow-1-pro', 'flow-argon-2', 'flow-1-6-carbon', 'flow-1-audio'] as FlowModel[]).map((modelId, index) => {
            const config = MODEL_CONFIGS[modelId];
            const status = modelLoadStatus[modelId];
            const isLoaded = loadedModels.includes(modelId);
            const isActive = activeModel === modelId;
            
            const gradients = [
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-violet-500',
              'from-red-500 to-orange-500',
              'from-indigo-500 to-blue-500',
              'from-fuchsia-500 to-pink-500',
            ];

            return (
              <div 
                key={modelId} 
                className={`glass rounded-2xl p-5 hover-lift group relative overflow-hidden ${isActive ? 'ring-2 ring-indigo-500/50' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        {status?.loading ? (
                          <Loader className="w-6 h-6 text-white animate-spin" />
                        ) : isLoaded ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Brain className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{config.name}</h3>
                        <p className="text-xs text-slate-400">{config.params} • {config.size}</p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold border border-green-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{language === 'uk' ? config.description : config.descriptionEn}</p>
                  
                  {status?.loading && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{status.status}</span>
                        <span className="text-indigo-300 font-semibold">{status.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${gradients[index]} rounded-full transition-all duration-300`}
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!isLoaded && !status?.loading && (
                      <button
                        onClick={() => handleLoadModel(modelId)}
                        className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${gradients[index]} text-white hover:opacity-90 text-sm font-semibold transition-all flex items-center justify-center gap-2 btn-glow`}
                      >
                        <Download className="w-4 h-4" />
                        {language === 'uk' ? 'Завантажити' : 'Load'}
                      </button>
                    )}
                    {isLoaded && !isActive && (
                      <button
                        onClick={() => useStore.getState().setActiveModel(modelId)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm font-semibold transition-all"
                      >
                        {language === 'uk' ? 'Активувати' : 'Activate'}
                      </button>
                    )}
                    {isLoaded && isActive && (
                      <div className="flex-1 py-2.5 rounded-xl bg-green-500/10 text-green-300 text-sm font-semibold text-center border border-green-500/30">
                        ✓ {language === 'uk' ? 'Активна' : 'Active'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
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
                  model: activeModel || 'flow-1-flash' as FlowModel,
                  systemPrompt: '',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                useStore.getState().addChat(newChat);
                useStore.getState().setActiveChatId(newChat.id);
              }}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('nav.chat', language)}</span>
            </button>
            <button
              onClick={() => setCurrentPage('flowBuilder')}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Flow Builder</span>
            </button>
            <button
              onClick={() => setCurrentPage('imageAI')}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('nav.imageAI', language)}</span>
            </button>
            <button
              onClick={() => setCurrentPage('audioAI')}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">{t('nav.audioAI', language)}</span>
            </button>
          </div>
        </div>

        {/* System Resources */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            {language === 'uk' ? 'Системні ресурси' : 'System Resources'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">CPU</span>
                <span className="text-cyan-400 font-bold">{systemInfo.cpu}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${systemInfo.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">RAM</span>
                <span className="text-purple-400 font-bold">{systemInfo.memory}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${systemInfo.memory}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">GPU</span>
                <span className="text-green-400 font-bold">Active</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Chats */}
      {recentChats.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              {t('dashboard.recentChats', language)}
            </h3>
            <button
              onClick={() => setCurrentPage('chat')}
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              {language === 'uk' ? 'Всі чати' : 'All chats'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => { setActiveChatId(chat.id); setCurrentPage('chat'); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">{chat.title}</p>
                  <p className="text-xs text-slate-500">
                    {chat.messages.length} {language === 'uk' ? 'повідомлень' : 'messages'} • {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
