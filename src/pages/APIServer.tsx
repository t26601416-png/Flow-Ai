import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  Server, Power, Key, Copy, Plus, Trash2, BookOpen,
  Globe, Shield, Activity
} from 'lucide-react';

export default function APIServer() {
  const {
    language, apiServerEnabled, setApiServerEnabled,
    apiServerPort, setApiServerPort,
    apiKeys, addApiKey, removeApiKey
  } = useStore();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');

  const generateKey = () => {
    const key = 'lfai-' + Array.from({ length: 32 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36))
    ).join('');
    setNewKey(key);
  };

  const handleAddKey = () => {
    if (newKey.trim()) {
      addApiKey(newKey.trim());
      setNewKey('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Server className="w-7 h-7 text-blue-400" />
            {t('nav.apiServer', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Локальний API-сервер з OpenAI-сумісними endpoints' : 'Local API server with OpenAI-compatible endpoints'}
          </p>
        </div>
        <button
          onClick={() => setApiServerEnabled(!apiServerEnabled)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            apiServerEnabled
              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Power className="w-4 h-4" />
          {apiServerEnabled
            ? (language === 'uk' ? 'Запущено' : 'Running')
            : (language === 'uk' ? 'Запустити' : 'Start')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Status */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            {language === 'uk' ? 'Статус сервера' : 'Server Status'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{language === 'uk' ? 'Статус' : 'Status'}</span>
              <span className={`text-sm font-medium ${apiServerEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {apiServerEnabled ? (language === 'uk' ? 'Активний' : 'Active') : (language === 'uk' ? 'Зупинено' : 'Stopped')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{language === 'uk' ? 'Порт' : 'Port'}</span>
              <input
                type="number"
                value={apiServerPort}
                onChange={(e) => setApiServerPort(parseInt(e.target.value) || 8080)}
                className="w-24 bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-sm text-white text-right focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">URL</span>
              <span className="text-sm text-indigo-300 font-mono">http://localhost:{apiServerPort}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{language === 'uk' ? 'Мережа' : 'Network'}</span>
              <span className="text-sm text-slate-300">localhost only</span>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            API Keys
          </h3>
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-slate-800/50 rounded-lg px-3 py-2 text-slate-300 font-mono truncate">
                  {key}
                </code>
                <button
                  onClick={() => handleCopy(key)}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                >
                  {copiedKey === key ? <span className="text-green-400 text-xs">✓</span> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeApiKey(key)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="API Key"
                className="flex-1 bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={generateKey}
                className="px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Generate
              </button>
              <button
                onClick={handleAddKey}
                disabled={!newKey.trim()}
                className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="mt-6 glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          {language === 'uk' ? 'API Endpoints' : 'API Endpoints'}
        </h3>
        <div className="space-y-2">
          {[
            { method: 'GET', path: '/api/tags', desc: language === 'uk' ? 'Список моделей' : 'List models' },
            { method: 'POST', path: '/api/generate', desc: language === 'uk' ? 'Генерація тексту' : 'Generate text' },
            { method: 'POST', path: '/api/chat', desc: language === 'uk' ? 'Чат з моделлю' : 'Chat with model' },
            { method: 'POST', path: '/v1/chat/completions', desc: 'OpenAI-compatible chat' },
            { method: 'POST', path: '/v1/completions', desc: 'OpenAI-compatible completion' },
            { method: 'GET', path: '/v1/models', desc: language === 'uk' ? 'Список моделей (OpenAI)' : 'List models (OpenAI)' },
          ].map((ep, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                ep.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {ep.method}
              </span>
              <code className="text-xs text-slate-300 font-mono flex-1">{ep.path}</code>
              <span className="text-xs text-slate-500">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 glass rounded-2xl p-5 border-blue-500/20 border">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">
              {language === 'uk' ? 'Безпека' : 'Security'}
            </h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• {language === 'uk' ? 'Сервер доступний тільки локально' : 'Server is only accessible locally'}</li>
              <li>• {language === 'uk' ? 'API-ключі необхідні для авторизації' : 'API keys required for authorization'}</li>
              <li>• {language === 'uk' ? 'Всі запити логуються' : 'All requests are logged'}</li>
              <li>• {language === 'uk' ? 'Обмеження частоти запитів: 60/хв' : 'Rate limiting: 60/min'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
