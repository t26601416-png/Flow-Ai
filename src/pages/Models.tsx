import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { MODEL_CONFIGS, loadModel, isModelLoaded, getLoadedModels, unloadModel } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import {
  Package, Download, Trash2, Check, Brain, Cpu, HardDrive,
  Zap, Loader, CheckCircle, AlertCircle
} from 'lucide-react';

export default function Models() {
  const { language, loadedModels, setLoadedModels, activeModel, setActiveModel, modelLoadStatus, setModelLoadStatus } = useStore();

  const handleLoad = async (model: FlowModel) => {
    try {
      setModelLoadStatus(model, { loading: true, progress: 0, status: 'Ініціалізація...' });
      await loadModel(model, (progress, status) => {
        setModelLoadStatus(model, { loading: true, progress, status });
      });
      setModelLoadStatus(model, { loading: false, progress: 100, status: 'Завантажена' });
      setLoadedModels(getLoadedModels());
    } catch (err) {
      setModelLoadStatus(model, { loading: false, progress: 0, status: 'Помилка завантаження' });
    }
  };

  const handleUnload = (model: FlowModel) => {
    unloadModel(model);
    setLoadedModels(getLoadedModels());
    if (activeModel === model) setActiveModel('');
  };

  const models = Object.entries(MODEL_CONFIGS) as [FlowModel, typeof MODEL_CONFIGS[FlowModel]][];

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-indigo-400" />
            {t('nav.models', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Локальні нейромережі Flow-1 — працюють повністю у вашому браузері' : 'Local Flow-1 neural networks — running fully in your browser'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${loadedModels.length > 0 ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/50 text-slate-400'}`}>
            <Brain className="w-4 h-4" />
            <span className="text-xs">{loadedModels.length}/2 {language === 'uk' ? 'завантажено' : 'loaded'}</span>
          </div>
        </div>
      </div>

      {/* Architecture Info */}
      <div className="glass rounded-2xl p-5 mb-6 border-indigo-500/20 border">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-indigo-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Flow-1 Neural Engine</h3>
            <p className="text-xs text-slate-400">
              {language === 'uk'
                ? 'Моделі Flow-1 працюють на основі Transformer архітектури через WebAssembly/WebGPU. Після першого завантаження моделі кешуються в IndexedDB браузера і працюють повністю офлайн.'
                : 'Flow-1 models use Transformer architecture via WebAssembly/WebGPU. After first download, models are cached in browser IndexedDB and work fully offline.'}
            </p>
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div className="space-y-4">
        {models.map(([modelId, config]) => {
          const isLoaded = loadedModels.includes(modelId);
          const isActive = activeModel === modelId;
          const status = modelLoadStatus[modelId];
          
          return (
            <div key={modelId} className={`glass rounded-2xl p-6 ${isActive ? 'ring-1 ring-indigo-500/50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isLoaded ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' : 'bg-slate-700/50'
                  }`}>
                    {status?.loading ? (
                      <Loader className="w-7 h-7 text-amber-400 animate-spin" />
                    ) : isLoaded ? (
                      <CheckCircle className="w-7 h-7 text-green-400" />
                    ) : (
                      <Brain className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{config.name}</h2>
                    <p className="text-sm text-slate-400">{language === 'uk' ? config.description : config.descriptionEn}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                    ✓ Active
                  </span>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <Cpu className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{language === 'uk' ? 'Параметри' : 'Parameters'}</p>
                  <p className="text-sm font-medium text-white">{config.params}</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <HardDrive className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{language === 'uk' ? 'Розмір' : 'Size'}</p>
                  <p className="text-sm font-medium text-white">{config.size}</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{language === 'uk' ? 'Швидкість' : 'Speed'}</p>
                  <p className="text-sm font-medium text-white">{config.speed}</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <Brain className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{language === 'uk' ? 'Якість' : 'Quality'}</p>
                  <p className="text-sm font-medium text-white">{config.quality}</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                  <Package className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{language === 'uk' ? 'Категорія' : 'Category'}</p>
                  <p className="text-sm font-medium text-white">{config.category}</p>
                </div>
              </div>

              {/* Progress Bar */}
              {status?.loading && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{status.status}</span>
                    <span className="text-indigo-300">{status.progress}%</span>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!isLoaded && !status?.loading && (
                  <button
                    onClick={() => handleLoad(modelId)}
                    className="flex-1 py-3 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'uk' ? 'Завантажити модель' : 'Load Model'}
                  </button>
                )}
                {isLoaded && !isActive && (
                  <>
                    <button
                      onClick={() => setActiveModel(modelId)}
                      className="flex-1 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 text-sm font-medium transition-colors"
                    >
                      {language === 'uk' ? 'Активувати' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleUnload(modelId)}
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {isLoaded && isActive && (
                  <div className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-300 text-sm font-medium text-center">
                    ✓ {language === 'uk' ? 'Активна модель' : 'Active Model'}
                  </div>
                )}
                {status?.loading && (
                  <button
                    disabled
                    className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-300 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Loader className="w-4 h-4 animate-spin" />
                    {language === 'uk' ? 'Завантаження...' : 'Loading...'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Info */}
      <div className="mt-6 glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-3">
          {language === 'uk' ? 'Технічна інформація' : 'Technical Information'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <p className="mb-1">• <span className="text-slate-300">Runtime:</span> ONNX Runtime (WASM/WebGPU)</p>
            <p className="mb-1">• <span className="text-slate-300">Architecture:</span> Transformer (GPT-2 family)</p>
            <p className="mb-1">• <span className="text-slate-300">Cache:</span> IndexedDB (browser storage)</p>
            <p>• <span className="text-slate-300">Privacy:</span> 100% local, no server calls</p>
          </div>
          <div>
            <p className="mb-1">• <span className="text-slate-300">Tokenizer:</span> BPE (Byte Pair Encoding)</p>
            <p className="mb-1">• <span className="text-slate-300">Context:</span> 1024 tokens</p>
            <p className="mb-1">• <span className="text-slate-300">Quantization:</span> INT8 (optimized)</p>
            <p>• <span className="text-slate-300">First load:</span> Downloads from CDN, then cached</p>
          </div>
        </div>
      </div>
    </div>
  );
}
