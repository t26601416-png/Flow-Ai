import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { MODEL_CONFIGS, loadModel, isModelLoaded, getLoadedModels, unloadModel } from '../services/neuralEngine';
import { IMAGE_MODEL_CONFIGS } from '../services/imageGenerator';
import { ADVANCED_IMAGE_MODEL_CONFIGS } from '../services/imageGeneratorV2';
import { VIDEO_MODEL_CONFIGS } from '../services/videoGenerator';
import type { FlowModel } from '../services/neuralEngine';
import {
  Package, Download, Trash2, Brain, Cpu, HardDrive,
  Zap, Loader, CheckCircle, Image, Video, Sparkles
} from 'lucide-react';

export default function Models() {
  const { language, loadedModels, setLoadedModels, activeModel, setActiveModel, modelLoadStatus, setModelLoadStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video'>('text');

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

  const textModels = Object.entries(MODEL_CONFIGS) as [FlowModel, typeof MODEL_CONFIGS[FlowModel]][];
  const imageModel = IMAGE_MODEL_CONFIGS['flow-image-1'];
  const videoModel = VIDEO_MODEL_CONFIGS['flow-omni-1'];

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-indigo-400" />
            {t('nav.models', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Локальні нейромережі Flow — працюють повністю у вашому браузері' : 'Local Flow neural networks — running fully in your browser'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${loadedModels.length > 0 ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/50 text-slate-400'}`}>
            <Brain className="w-4 h-4" />
            <span className="text-xs">{loadedModels.length + 3}/5 {language === 'uk' ? 'доступно' : 'available'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'text' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Brain className="w-4 h-4 inline mr-2" />
          {language === 'uk' ? 'Текстові моделі' : 'Text Models'}
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'image' ? 'bg-pink-500/20 text-pink-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Image className="w-4 h-4 inline mr-2" />
          {language === 'uk' ? 'Генерація зображень' : 'Image Generation'}
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'video' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Video className="w-4 h-4 inline mr-2" />
          {language === 'uk' ? 'Генерація відео' : 'Video Generation'}
        </button>
      </div>

      {/* Text Models Tab */}
      {activeTab === 'text' && (
        <>
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

          <div className="space-y-4">
            {textModels.map(([modelId, config]) => {
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
                      <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-sm font-medium">✓ Active</span>
                    )}
                  </div>

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

                  {status?.loading && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{status.status}</span>
                        <span className="text-indigo-300">{status.progress}%</span>
                      </div>
                      <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${status.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!isLoaded && !status?.loading && (
                      <button onClick={() => handleLoad(modelId)}
                        className="flex-1 py-3 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />{language === 'uk' ? 'Завантажити модель' : 'Load Model'}
                      </button>
                    )}
                    {isLoaded && !isActive && (
                      <>
                        <button onClick={() => setActiveModel(modelId)}
                          className="flex-1 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 text-sm font-medium transition-colors">
                          {language === 'uk' ? 'Активувати' : 'Activate'}
                        </button>
                        <button onClick={() => handleUnload(modelId)}
                          className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors">
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
                      <button disabled className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-300 text-sm font-medium flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />{language === 'uk' ? 'Завантаження...' : 'Loading...'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Image Models Tab */}
      {activeTab === 'image' && (
        <>
          <div className="glass rounded-2xl p-5 mb-6 border-pink-500/20 border">
            <div className="flex items-start gap-3">
              <Image className="w-5 h-5 text-pink-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Flow-image Engine</h3>
                <p className="text-xs text-slate-400">
                  {language === 'uk'
                    ? 'Модель Flow-image 1 генерує унікальні зображення на основі текстового опису. Використовує процедурну генерацію з Canvas API, працює миттєво та повністю локально.'
                    : 'Flow-image 1 generates unique images from text descriptions. Uses procedural generation with Canvas API, works instantly and fully locally.'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 ring-1 ring-pink-500/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <Image className="w-7 h-7 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{imageModel.name}</h2>
                  <p className="text-sm text-slate-400">{language === 'uk' ? imageModel.description : imageModel.descriptionEn}</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-green-500/20 text-green-300 text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Package className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Тип' : 'Type'}</p>
                <p className="text-sm font-medium text-white">{imageModel.type}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <HardDrive className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Розмір' : 'Size'}</p>
                <p className="text-sm font-medium text-white">{imageModel.size}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Швидкість' : 'Speed'}</p>
                <p className="text-sm font-medium text-white">{imageModel.speed}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Image className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Макс. розмір' : 'Max Size'}</p>
                <p className="text-sm font-medium text-white">{imageModel.maxResolution}px</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => useStore.getState().setCurrentPage('imageAI')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 hover:from-pink-500/30 hover:to-purple-500/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Image className="w-4 h-4" />
                {language === 'uk' ? 'Відкрити генератор' : 'Open Generator'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Можливості Flow-image 1' : 'Flow-image 1 Features'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { uk: '5 стилів генерації', en: '5 generation styles', emoji: '🎨' },
                { uk: 'Роздільна здатність до 1024×1024', en: 'Resolution up to 1024×1024', emoji: '📐' },
                { uk: 'Детермінована генерація', en: 'Deterministic generation', emoji: '🔒' },
                { uk: 'Миттєва генерація', en: 'Instant generation', emoji: '⚡' },
                { uk: 'Процедурні шуми Perlin', en: 'Perlin procedural noise', emoji: '🌊' },
                { uk: 'Палітри на основі промту', en: 'Prompt-based palettes', emoji: '🎭' },
                { uk: 'Експорт у PNG', en: 'PNG export', emoji: '💾' },
                { uk: '100% локально', en: '100% local', emoji: '🏠' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <span>{feature.emoji}</span>
                  {language === 'uk' ? feature.uk : feature.en}
                </div>
              ))}
            </div>
          </div>

          {/* Flow-image 1.5 */}
          {(() => {
            const advImageModel = ADVANCED_IMAGE_MODEL_CONFIGS['flow-image-1.5'];
            return (
              <div className="mt-6 glass rounded-2xl p-6 ring-1 ring-purple-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {advImageModel.name}
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs">NEW</span>
                      </h2>
                      <p className="text-sm text-slate-400">{language === 'uk' ? advImageModel.description : advImageModel.descriptionEn}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-green-500/20 text-green-300 text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                    <Package className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">{language === 'uk' ? 'Тип' : 'Type'}</p>
                    <p className="text-sm font-medium text-white">{advImageModel.type}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                    <HardDrive className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">{language === 'uk' ? 'Розмір' : 'Size'}</p>
                    <p className="text-sm font-medium text-white">{advImageModel.size}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                    <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">{language === 'uk' ? 'Якість' : 'Quality'}</p>
                    <p className="text-sm font-medium text-white">{advImageModel.quality}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                    <Image className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">{language === 'uk' ? 'Макс. розмір' : 'Max Size'}</p>
                    <p className="text-sm font-medium text-white">{advImageModel.maxResolution}px</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => useStore.getState().setCurrentPage('imageAI')}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 hover:from-purple-500/30 hover:to-pink-500/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {language === 'uk' ? 'Відкрити генератор' : 'Open Generator'}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-2">{language === 'uk' ? 'Особливості:' : 'Features:'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {advImageModel.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-purple-400">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Video Models Tab */}
      {activeTab === 'video' && (
        <>
          <div className="glass rounded-2xl p-5 mb-6 border-purple-500/20 border">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Flow-omni Engine</h3>
                <p className="text-xs text-slate-400">
                  {language === 'uk'
                    ? 'Модель Flow-omni 1 генерує відео з 30 кадрами на секунду. Використовує процедурну анімацію з Canvas API та MediaRecorder, працює повністю локально.'
                    : 'Flow-omni 1 generates video at 30 frames per second. Uses procedural animation with Canvas API and MediaRecorder, works fully locally.'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 ring-1 ring-purple-500/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Video className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{videoModel.name}</h2>
                  <p className="text-sm text-slate-400">{language === 'uk' ? videoModel.description : videoModel.descriptionEn}</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-green-500/20 text-green-300 text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Package className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Тип' : 'Type'}</p>
                <p className="text-sm font-medium text-white">{videoModel.type}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <HardDrive className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Розмір' : 'Size'}</p>
                <p className="text-sm font-medium text-white">{videoModel.size}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">FPS</p>
                <p className="text-sm font-medium text-white">{videoModel.fps}</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Video className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Макс. тривалість' : 'Max Duration'}</p>
                <p className="text-sm font-medium text-white">{videoModel.maxDuration}s</p>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-3 text-center">
                <Cpu className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{language === 'uk' ? 'Формат' : 'Format'}</p>
                <p className="text-sm font-medium text-white">WebM</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => useStore.getState().setCurrentPage('videoAI')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 hover:from-purple-500/30 hover:to-pink-500/30 text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                {language === 'uk' ? 'Відкрити генератор' : 'Open Generator'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Можливості Flow-omni 1' : 'Flow-omni 1 Features'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { uk: '30 кадрів на секунду', en: '30 frames per second', emoji: '🎬' },
                { uk: 'Тривалість до 10 секунд', en: 'Duration up to 10 seconds', emoji: '⏱️' },
                { uk: '4 стилі анімації', en: '4 animation styles', emoji: '🎨' },
                { uk: 'Роздільна здатність до 512×512', en: 'Resolution up to 512×512', emoji: '📐' },
                { uk: 'Процедурна анімація', en: 'Procedural animation', emoji: '🌊' },
                { uk: 'Палітри на основі промту', en: 'Prompt-based palettes', emoji: '🎭' },
                { uk: 'Експорт у WebM (VP9)', en: 'WebM (VP9) export', emoji: '💾' },
                { uk: '100% локально', en: '100% local', emoji: '🏠' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <span>{feature.emoji}</span>
                  {language === 'uk' ? feature.uk : feature.en}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Technical Info */}
      <div className="mt-6 glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-3">
          {language === 'uk' ? 'Технічна інформація' : 'Technical Information'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <p className="mb-1">• <span className="text-slate-300">Text Runtime:</span> ONNX Runtime (WASM/WebGPU)</p>
            <p className="mb-1">• <span className="text-slate-300">Image Runtime:</span> Canvas 2D API</p>
            <p className="mb-1">• <span className="text-slate-300">Architecture:</span> Transformer + Procedural</p>
            <p>• <span className="text-slate-300">Privacy:</span> 100% local, no server calls</p>
          </div>
          <div>
            <p className="mb-1">• <span className="text-slate-300">Cache:</span> IndexedDB (browser storage)</p>
            <p className="mb-1">• <span className="text-slate-300">Tokenizer:</span> BPE (Byte Pair Encoding)</p>
            <p className="mb-1">• <span className="text-slate-300">Image Algorithm:</span> Perlin Noise + Flow Fields</p>
            <p>• <span className="text-slate-300">Models:</span> Flow-1 Flash, Flow-1 Pro, Flow-image 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
