import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { MODEL_CONFIGS } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import {
  Settings as SettingsIcon, Globe, Palette, Cpu, Shield, Check
} from 'lucide-react';

export default function Settings() {
  const {
    language, setLanguage, theme, setTheme,
    activeModel, setActiveModel,
    temperature, setTemperature, topP, setTopP,
    topK, setTopK, maxTokens, setMaxTokens, repetitionPenalty, setRepetitionPenalty,
    chats, agents, flowProjects
  } = useStore();

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleClearData = () => {
    if (confirm(language === 'uk' ? 'Видалити всі дані?' : 'Delete all data?')) {
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
            <Check className="w-4 h-4" /> {t('common.success', language)}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <div className="w-48 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 max-w-2xl">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />{t('settings.language', language)}
                </h3>
                <div className="flex gap-3">
                  <button onClick={() => { setLanguage('uk'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${language === 'uk' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}>
                    🇺🇦 Українська
                  </button>
                  <button onClick={() => { setLanguage('en'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${language === 'en' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}>
                    🇬🇧 English
                  </button>
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />{t('settings.theme', language)}
                </h3>
                <div className="flex gap-3">
                  <button onClick={() => { setTheme('dark'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}>
                    🌙 {t('settings.dark', language)}
                  </button>
                  <button onClick={() => { setTheme('light'); showSaved(); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${theme === 'light' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}>
                    ☀️ {t('settings.light', language)}
                  </button>
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{language === 'uk' ? 'Модель за замовчуванням' : 'Default Model'}</h3>
                <select value={activeModel} onChange={(e) => { setActiveModel(e.target.value as FlowModel); showSaved(); }}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                  <option value="flow-1-flash">Flow-1 Flash ⚡</option>
                  <option value="flow-1-pro">Flow-1 Pro 🧠</option>
                  <option value="flow-argon-2">Flow-argon 2 🔥</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{t('settings.temperature', language)}</h3>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="2" step="0.1" value={temperature}
                    onChange={(e) => { setTemperature(parseFloat(e.target.value)); showSaved(); }} className="flex-1 accent-indigo-500" />
                  <span className="text-sm text-indigo-300 w-12 text-right">{temperature}</span>
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Top-P</h3>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="1" step="0.05" value={topP}
                    onChange={(e) => { setTopP(parseFloat(e.target.value)); showSaved(); }} className="flex-1 accent-indigo-500" />
                  <span className="text-sm text-indigo-300 w-12 text-right">{topP}</span>
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Top-K</h3>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="100" step="1" value={topK}
                    onChange={(e) => { setTopK(parseInt(e.target.value)); showSaved(); }} className="flex-1 accent-indigo-500" />
                  <span className="text-sm text-indigo-300 w-12 text-right">{topK}</span>
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{t('settings.maxTokens', language)}</h3>
                <input type="number" value={maxTokens}
                  onChange={(e) => { setMaxTokens(parseInt(e.target.value) || 256); showSaved(); }}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{language === 'uk' ? 'Штраф за повторення' : 'Repetition Penalty'}</h3>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="2" step="0.05" value={repetitionPenalty}
                    onChange={(e) => { setRepetitionPenalty(parseFloat(e.target.value)); showSaved(); }} className="flex-1 accent-indigo-500" />
                  <span className="text-sm text-indigo-300 w-12 text-right">{repetitionPenalty}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{language === 'uk' ? 'Налаштування нейромережі' : 'Neural Network Settings'}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Runtime</span><span className="text-white">ONNX WASM/WebGPU</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Threads</span><span className="text-white">4 (auto)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Cache</span><span className="text-white">IndexedDB</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">{language === 'uk' ? 'Кеш моделей' : 'Model Cache'}</span><span className="text-white">Persistent</span></div>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  {language === 'uk'
                    ? '⚡ Моделі Flow-1 працюють через ONNX Runtime у браузері. Використовується WebAssembly для CPU та WebGPU для прискорення.'
                    : '⚡ Flow-1 models run via ONNX Runtime in the browser. Uses WebAssembly for CPU and WebGPU for acceleration.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />{language === 'uk' ? 'Локальне зберігання' : 'Local Storage'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">{language === 'uk' ? 'Чати' : 'Chats'}</span><span className="text-white">{chats.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">{language === 'uk' ? 'Агенти' : 'Agents'}</span><span className="text-white">{agents.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Flows</span><span className="text-white">{flowProjects.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">{language === 'uk' ? 'Сховище' : 'Storage'}</span><span className="text-white">localStorage + IndexedDB</span></div>
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">{language === 'uk' ? 'Керування даними' : 'Data Management'}</h3>
                <button onClick={handleClearData}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors">
                  {language === 'uk' ? '🗑️ Видалити всі дані' : '🗑️ Delete all data'}
                </button>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white mb-2">{language === 'uk' ? 'Приватність' : 'Privacy'}</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />{language === 'uk' ? '100% локально — нейромережа працює у браузері' : '100% local — neural network runs in browser'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />{language === 'uk' ? 'Немає телеметрії' : 'No telemetry'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />{language === 'uk' ? 'Моделі працюють офлайн після завантаження' : 'Models work offline after loading'}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />{language === 'uk' ? 'Немає хмарних сервісів' : 'No cloud services'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
