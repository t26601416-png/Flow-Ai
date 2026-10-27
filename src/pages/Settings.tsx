import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { checkOllamaConnection } from '../services/ollama';
import {
  Settings as SettingsIcon, Globe, Palette, Cpu, Shield,
  Save, Check, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

export default function Settings() {
  const {
    language, setLanguage, theme, setTheme,
    ollamaUrl, setOllamaUrl, ollamaConnected, activeModel, setActiveModel,
    availableModels, temperature, setTemperature, topP, setTopP,
    topK, setTopK, maxTokens, setMaxTokens, contextLength, setContextLength,
    chats, agents, flowProjects
  } = useStore();

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    if (confirm(language === 'uk' ? 'Видалити всі дані? Цю дію не можна скасувати.' : 'Delete all data? This cannot be undone.')) {
      localStorage.removeItem('local-flow-ai-storage');
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', icon: Globe, label: t('settings.general', language) },
    { id: 'ai', icon: Cpu, label: t('settings.aiSettings', language) },
    { id: 'performance', icon: Cpu, label: t('settings.performance', language) },
    { id: 'privacy', icon: Shield, label: t('settings.privacy', language) },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-slate-400" />
            {t('nav.settings', language)}
          </h1>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm animate-fade-in">
            <Check className="w-4 h-4" />
            {t('common.success', language)}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Language */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  {t('settings.language', language)}
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setLanguage('uk'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${language === 'uk' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
                  >
                    🇺🇦 Українська
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${language === 'en' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  {t('settings.theme', language)}
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setTheme('dark'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
                  >
                    🌙 {t('settings.dark', language)}
                  </button>
                  <button
                    onClick={() => { setTheme('light'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${theme === 'light' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
                  >
                    ☀️ {t('settings.light', language)}
                  </button>
                </div>
              </div>

              {/* Ollama Connection */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-indigo-400" />
                  {t('settings.ollamaUrl', language)}
                </h3>
                <div className="flex gap-2">
                  <input
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <button
                    onClick={async () => { await checkOllamaConnection(); showSaved(); }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className={`flex items-center gap-2 mt-2 text-xs ${ollamaConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {ollamaConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {ollamaConnected ? t('dashboard.connected', language) : t('dashboard.disconnected', language)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Default Model */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{t('dashboard.activeModel', language)}</h3>
                <select
                  value={activeModel}
                  onChange={(e) => { setActiveModel(e.target.value); showSaved(); }}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">{language === 'uk' ? 'Оберіть модель' : 'Select model'}</option>
                  {availableModels.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Temperature */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{t('settings.temperature', language)}</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => { setTemperature(parseFloat(e.target.value)); showSaved(); }}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-sm text-indigo-300 w-12 text-right">{temperature}</span>
                </div>
              </div>

              {/* Top P */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Top-P</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => { setTopP(parseFloat(e.target.value)); showSaved(); }}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-sm text-indigo-300 w-12 text-right">{topP}</span>
                </div>
              </div>

              {/* Top K */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Top-K</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={topK}
                    onChange={(e) => { setTopK(parseInt(e.target.value)); showSaved(); }}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-sm text-indigo-300 w-12 text-right">{topK}</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{t('settings.maxTokens', language)}</h3>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => { setMaxTokens(parseInt(e.target.value) || 2048); showSaved(); }}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Context Length */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{t('settings.contextLength', language)}</h3>
                <input
                  type="number"
                  value={contextLength}
                  onChange={(e) => { setContextLength(parseInt(e.target.value) || 4096); showSaved(); }}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{language === 'uk' ? 'Використання ресурсів' : 'Resource Usage'}</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">CPU Threads</span>
                    <span className="text-white">Auto</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPU Layers</span>
                    <span className="text-white">Auto</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'uk' ? 'Кеш моделей' : 'Model Cache'}</span>
                    <span className="text-white">5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'uk' ? 'Паралельні запити' : 'Parallel Requests'}</span>
                    <span className="text-white">1</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  {language === 'uk'
                    ? '⚡ Ці налаштування керуються Ollama. Для детального налаштування використовуйте змінні оточення Ollama.'
                    : '⚡ These settings are managed by Ollama. For detailed configuration, use Ollama environment variables.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  {language === 'uk' ? 'Локальне зберігання' : 'Local Storage'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'uk' ? 'Чати' : 'Chats'}</span>
                    <span className="text-white">{chats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'uk' ? 'Агенти' : 'Agents'}</span>
                    <span className="text-white">{agents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flows</span>
                    <span className="text-white">{flowProjects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'uk' ? 'Сховище' : 'Storage'}</span>
                    <span className="text-white">localStorage</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">
                  {language === 'uk' ? 'Керування даними' : 'Data Management'}
                </h3>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                >
                  {language === 'uk' ? '🗑️ Видалити всі дані' : '🗑️ Delete all data'}
                </button>
                <p className="text-xs text-slate-500 mt-3">
                  {language === 'uk'
                    ? '⚠️ Всі чати, агенти та налаштування буде видалено.'
                    : '⚠️ All chats, agents and settings will be deleted.'}
                </p>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-2">
                  {language === 'uk' ? 'Приватність' : 'Privacy'}
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {language === 'uk' ? 'Всі дані зберігаються локально' : 'All data stored locally'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {language === 'uk' ? 'Немає телеметрії' : 'No telemetry'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {language === 'uk' ? 'Моделі працюють офлайн' : 'Models run offline'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    {language === 'uk' ? 'Немає хмарних сервісів' : 'No cloud services'}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
