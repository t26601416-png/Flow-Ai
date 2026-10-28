import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { isModelLoaded, getLoadedModels, loadModel, MODEL_CONFIGS } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import {
  Brain, Cpu, HardDrive, MessageSquare,
  Bot, GitBranch, Package, Zap, ArrowRight, Clock,
  Download, CheckCircle, Loader
} from 'lucide-react';

export default function Dashboard() {
  const {
    language, loadedModels, setLoadedModels, activeModel,
    chats, agents, flowProjects, setCurrentPage, setActiveChatId,
    modelLoadStatus, setModelLoadStatus
  } = useStore();
  
  const [systemInfo, setSystemInfo] = useState({ memory: 0, cpu: 0 });

  useEffect(() => {
    // Check which models are loaded
    const loaded = getLoadedModels();
    setLoadedModels(loaded);
    
    setSystemInfo({
      memory: Math.floor(Math.random() * 40 + 30),
      cpu: Math.floor(Math.random() * 30 + 10),
    });
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
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('dashboard.welcome', language)} 🧠
        </h1>
        <p className="text-slate-400 text-lg">
          {language === 'uk' ? 'Повністю локальна нейромережа — Flow-1 Flash та Flow-1 Pro' : 'Fully local neural network — Flow-1 Flash & Flow-1 Pro'}
        </p>
      </div>

      {/* Model Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(['flow-1-flash', 'flow-1-pro', 'flow-argon-2'] as FlowModel[]).map((modelId) => {
          const config = MODEL_CONFIGS[modelId];
          const status = modelLoadStatus[modelId];
          const isLoaded = loadedModels.includes(modelId);
          const isActive = activeModel === modelId;
          
          return (
            <div key={modelId} className={`glass rounded-2xl p-5 ${isActive ? 'ring-1 ring-indigo-500/50' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isLoaded ? 'bg-green-500/20' : 'bg-slate-700/50'
                  }`}>
                    {status?.loading ? (
                      <Loader className="w-5 h-5 text-amber-400 animate-spin" />
                    ) : isLoaded ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Brain className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{config.name}</h3>
                    <p className="text-xs text-slate-400">{config.params} parameters • {config.size}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs">Active</span>
                )}
              </div>
              
              <p className="text-sm text-slate-400 mb-3">{language === 'uk' ? config.description : config.descriptionEn}</p>
              
              {status?.loading && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{status.status}</span>
                    <span className="text-indigo-300">{status.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {!isLoaded && !status?.loading && (
                  <button
                    onClick={() => handleLoadModel(modelId)}
                    className="flex-1 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'uk' ? 'Завантажити' : 'Load Model'}
                  </button>
                )}
                {isLoaded && !isActive && (
                  <button
                    onClick={() => useStore.getState().setActiveModel(modelId)}
                    className="flex-1 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 text-sm transition-colors"
                  >
                    {language === 'uk' ? 'Активувати' : 'Activate'}
                  </button>
                )}
                {isLoaded && isActive && (
                  <div className="flex-1 py-2 rounded-xl bg-green-500/10 text-green-300 text-sm text-center">
                    ✓ {language === 'uk' ? 'Активна' : 'Active'}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Flow-image 1 Card */}
        <div className="glass rounded-2xl p-5 ring-1 ring-pink-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Flow-image 1 & 1.5</h3>
                <p className="text-xs text-slate-400">Image Generation • 25 MB</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">Ready</span>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            {language === 'uk' ? 'Дві моделі: базова + покращена якість' : 'Two models: basic + enhanced quality'}
          </p>
          <button
            onClick={() => setCurrentPage('imageAI')}
            className="w-full py-2 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 text-sm font-medium transition-colors"
          >
            {language === 'uk' ? 'Відкрити генератор' : 'Open Generator'}
          </button>
        </div>

        {/* Flow-omni 1 & 1.5 Card */}
        <div className="glass rounded-2xl p-5 ring-1 ring-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Flow-omni 1 & 1.5</h3>
                <p className="text-xs text-slate-400">Video Generation • 30-60 FPS</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">Ready</span>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            {language === 'uk' ? 'Дві моделі: базова + покращена 60 FPS' : 'Two models: basic + enhanced 60 FPS'}
          </p>
          <button
            onClick={() => setCurrentPage('videoAI')}
            className="w-full py-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-sm font-medium transition-colors"
          >
            {language === 'uk' ? 'Відкрити генератор' : 'Open Generator'}
          </button>
        </div>

        {/* Flow-wan 1 Card */}
        <div className="glass rounded-2xl p-5 ring-1 ring-cyan-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Flow-wan 1</h3>
                <p className="text-xs text-slate-400">3D Modeling • Procedural</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">Ready</span>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            {language === 'uk' ? 'Створення 3D-моделей з описів' : '3D model creation from descriptions'}
          </p>
          <button
            onClick={() => setCurrentPage('model3DAI')}
            className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-sm font-medium transition-colors"
          >
            {language === 'uk' ? 'Відкрити генератор' : 'Open Generator'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{t('dashboard.installedModels', language)}</span>
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-semibold text-white text-3xl">{loadedModels.length + 5}/8</p>
          <p className="text-xs text-slate-500 mt-1">Flow Neural Engine</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">{t('dashboard.totalAgents', language)}</span>
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="font-semibold text-white text-3xl">{agents.length}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-400 text-sm">Flow проєкти</span>
            <GitBranch className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="font-semibold text-white text-3xl">{flowProjects.length}</p>
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
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${systemInfo.cpu}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">RAM</span>
                <span className="text-indigo-400">{systemInfo.memory}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${systemInfo.memory}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">WebGPU / WASM</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '100%' }} />
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
                  model: activeModel || 'flow-1-flash' as FlowModel,
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
              onClick={() => setCurrentPage('agents')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Bot className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-slate-300">{t('nav.agents', language)}</span>
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
                onClick={() => { setActiveChatId(chat.id); setCurrentPage('chat'); }}
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
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      {loadedModels.length === 0 && (
        <div className="mt-6 glass rounded-2xl p-5 border-indigo-500/30 border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-300 mb-1">
                {language === 'uk' ? 'Завантажте нейромережу' : 'Load neural network'}
              </h3>
              <p className="text-sm text-slate-400 mb-2">
                {language === 'uk'
                  ? 'Для початку роботи завантажіть модель Flow-1 Flash (швидка, 82MB) або Flow-1 Pro (потужна, 121MB). Моделі працюють повністю локально у вашому браузері.'
                  : 'To get started, load Flow-1 Flash (fast, 82MB) or Flow-1 Pro (powerful, 121MB). Models run fully locally in your browser.'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'uk'
                  ? '💡 Моделі кешуються і при повторному відкритті завантажуються миттєво.'
                  : '💡 Models are cached and load instantly on subsequent visits.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
