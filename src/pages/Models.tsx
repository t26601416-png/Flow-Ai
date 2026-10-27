import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { listModels, pullModel, deleteModel, checkOllamaConnection } from '../services/ollama';
import {
  Package, Download, Trash2, Search, RefreshCw, Check,
  AlertCircle, Cpu, HardDrive, Wifi, WifiOff
} from 'lucide-react';

const popularModels = [
  { name: 'llama3.2', description: 'Meta Llama 3.2 — 3B parameters', size: '2.0 GB', params: '3B', category: 'General AI' },
  { name: 'llama3.1:8b', description: 'Meta Llama 3.1 — 8B parameters', size: '4.7 GB', params: '8B', category: 'General AI' },
  { name: 'mistral', description: 'Mistral 7B — High performance', size: '4.1 GB', params: '7B', category: 'General AI' },
  { name: 'codellama', description: 'Code Llama — Code generation', size: '3.8 GB', params: '7B', category: 'Coding AI' },
  { name: 'phi3', description: 'Microsoft Phi-3 — Small but powerful', size: '2.3 GB', params: '3.8B', category: 'Small Language Models' },
  { name: 'gemma2', description: 'Google Gemma 2 — 9B parameters', size: '5.4 GB', params: '9B', category: 'General AI' },
  { name: 'qwen2.5', description: 'Alibaba Qwen 2.5 — Multilingual', size: '4.4 GB', params: '7B', category: 'General AI' },
  { name: 'nomic-embed-text', description: 'Embedding model for RAG', size: '274 MB', params: '137M', category: 'Embedding Models' },
  { name: 'deepseek-coder-v2', description: 'DeepSeek Coder V2 — Advanced coding', size: '8.9 GB', params: '16B', category: 'Coding AI' },
  { name: 'llava', description: 'LLaVA — Vision + Language', size: '4.7 GB', params: '7B', category: 'Vision AI' },
  { name: 'mixtral', description: 'Mistral Mixtral 8x7B — MoE', size: '26 GB', params: '46.7B', category: 'Reasoning AI' },
  { name: 'whisper', description: 'OpenAI Whisper — Speech recognition', size: '1.5 GB', params: '394M', category: 'Speech Models' },
];

export default function Models() {
  const { language, ollamaConnected, availableModels, setAvailableModels, activeModel, setActiveModel } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [downloadingModels, setDownloadingModels] = useState<Record<string, { progress: number; status: string }>>({});
  const [tab, setTab] = useState<'installed' | 'available'>('installed');

  useEffect(() => {
    if (ollamaConnected) {
      listModels();
    }
  }, [ollamaConnected]);

  const handleDownload = async (modelName: string) => {
    setDownloadingModels(prev => ({ ...prev, [modelName]: { progress: 0, status: 'downloading' } }));
    
    await pullModel(modelName, (data) => {
      if (data.status) {
        setDownloadingModels(prev => ({
          ...prev,
          [modelName]: { progress: data.completed ? Math.round((data.completed / (data.total || 1)) * 100) : 0, status: data.status }
        }));
      }
    });

    setDownloadingModels(prev => {
      const updated = { ...prev };
      delete updated[modelName];
      return updated;
    });
    
    await listModels();
  };

  const handleDelete = async (modelName: string) => {
    if (confirm(language === 'uk' ? `Видалити модель ${modelName}?` : `Delete model ${modelName}?`)) {
      await deleteModel(modelName);
      await listModels();
      if (activeModel === modelName) setActiveModel('');
    }
  };

  const categories = ['all', 'General AI', 'Coding AI', 'Reasoning AI', 'Vision AI', 'Embedding Models', 'Speech Models', 'Small Language Models'];

  const filteredAvailable = popularModels.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    const isInstalled = availableModels.some(am => am.name === m.name || m.name.startsWith(am.name.split(':')[0]));
    return matchesSearch && matchesCategory && !isInstalled;
  });

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-indigo-400" />
            {t('nav.models', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Керування локальними AI моделями' : 'Manage local AI models'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${ollamaConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {ollamaConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-xs">{ollamaConnected ? 'Ollama' : 'Offline'}</span>
          </div>
          <button
            onClick={() => checkOllamaConnection()}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('installed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'installed' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          {t('models.installed', language)} ({availableModels.length})
        </button>
        <button
          onClick={() => setTab('available')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'available' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          {t('models.available', language)}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('models.search', language)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-indigo-500/20 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800/50 border border-indigo-500/20 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? (language === 'uk' ? 'Всі категорії' : 'All categories') : c}</option>
          ))}
        </select>
      </div>

      {/* Installed Models */}
      {tab === 'installed' && (
        <div className="space-y-3">
          {availableModels.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {t('dashboard.noModels', language)}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {language === 'uk'
                  ? 'Перейдіть на вкладку "Доступні" щоб завантажити модель'
                  : 'Go to "Available" tab to download a model'}
              </p>
              {!ollamaConnected && (
                <p className="text-sm text-amber-400 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('dashboard.installOllama', language)}
                </p>
              )}
            </div>
          ) : (
            availableModels.map((model) => (
              <div key={model.name} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeModel === model.name ? 'bg-indigo-500/20' : 'bg-slate-700/50'}`}>
                    <Package className={`w-5 h-5 ${activeModel === model.name ? 'text-indigo-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{model.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      {model.details?.parameter_size && (
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{model.details.parameter_size}</span>
                      )}
                      {model.size && (
                        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{(model.size / 1e9).toFixed(1)} GB</span>
                      )}
                      {model.details?.quantization_level && (
                        <span>{model.details.quantization_level}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeModel === model.name ? (
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveModel(model.name)}
                      className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 text-xs transition-colors"
                    >
                      {language === 'uk' ? 'Обрати' : 'Select'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(model.name)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Available Models */}
      {tab === 'available' && (
        <div className="space-y-3">
          {filteredAvailable.map((model) => {
            const isDownloading = downloadingModels[model.name];
            return (
              <div key={model.name} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{model.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{model.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{model.params} params</span>
                        <span>{model.size}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{model.category}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {isDownloading ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-indigo-300">{isDownloading.status}</span>
                        <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${isDownloading.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(model.name)}
                        disabled={!ollamaConnected}
                        className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t('models.download', language)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredAvailable.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>{language === 'uk' ? 'Моделі не знайдено' : 'No models found'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
