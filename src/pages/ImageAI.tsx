import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { generateImage, IMAGE_MODEL_CONFIGS } from '../services/imageGenerator';
import { generateAdvancedImage, ADVANCED_IMAGE_MODEL_CONFIGS } from '../services/imageGeneratorV2';
import { Image, Wand2, Download, Sparkles, Loader, Trash2, ZoomIn } from 'lucide-react';

interface GeneratedImage {
  id: string;
  prompt: string;
  dataUrl: string;
  style: string;
  resolution: string;
  model: string;
  timestamp: number;
}

export default function ImageAI() {
  const { language } = useStore();
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState('1024x1024');
  const [style, setStyle] = useState<string>('abstract');
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [selectedModel, setSelectedModel] = useState<'flow-image-1' | 'flow-image-1.5'>('flow-image-1.5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);

  const modelConfig = selectedModel === 'flow-image-1' 
    ? IMAGE_MODEL_CONFIGS['flow-image-1']
    : ADVANCED_IMAGE_MODEL_CONFIGS['flow-image-1.5'];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);

    try {
      const [width, height] = resolution.split('x').map(Number);
      
      let dataUrl: string;
      
      if (selectedModel === 'flow-image-1') {
        dataUrl = await generateImage(prompt, {
          width,
          height,
          style: style as any,
          onProgress: (p) => setProgress(p),
        });
      } else {
        dataUrl = await generateAdvancedImage(prompt, {
          width,
          height,
          style: style as any,
          quality,
          onProgress: (p) => setProgress(p),
        });
      }

      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt: prompt.trim(),
        dataUrl,
        style,
        resolution,
        model: selectedModel,
        timestamp: Date.now(),
      };

      setHistory(prev => [newImage, ...prev]);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `flow-image-${image.id}.png`;
    link.click();
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(img => img.id !== id));
  };

  const stylesV1 = [
    { id: 'abstract', label: { uk: 'Абстракт', en: 'Abstract' }, emoji: '🎨' },
    { id: 'geometric', label: { uk: 'Геометрія', en: 'Geometric' }, emoji: '📐' },
    { id: 'organic', label: { uk: 'Органічний', en: 'Organic' }, emoji: '🌿' },
    { id: 'cosmic', label: { uk: 'Космос', en: 'Cosmic' }, emoji: '🌌' },
    { id: 'landscape', label: { uk: 'Пейзаж', en: 'Landscape' }, emoji: '🏔️' },
  ];

  const stylesV15 = [
    { id: 'photorealistic', label: { uk: 'Фотореалізм', en: 'Photorealistic' }, emoji: '📷' },
    { id: 'artistic', label: { uk: 'Художній', en: 'Artistic' }, emoji: '🎨' },
    { id: 'abstract', label: { uk: 'Абстракт', en: 'Abstract' }, emoji: '✨' },
    { id: 'minimalist', label: { uk: 'Мінімалізм', en: 'Minimalist' }, emoji: '◻️' },
    { id: 'portrait', label: { uk: 'Портрет', en: 'Portrait' }, emoji: '👤' },
    { id: 'landscape', label: { uk: 'Пейзаж', en: 'Landscape' }, emoji: '🏔️' },
  ];

  const currentStyles = selectedModel === 'flow-image-1' ? stylesV1 : stylesV15;

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Image className="w-7 h-7 text-pink-400" />
            {t('nav.imageAI', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Генерація зображень — Flow-image' : 'Image Generation — Flow-image'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs">{modelConfig.name} • Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Model Selector */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Модель' : 'Model'}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedModel('flow-image-1');
                  setStyle('abstract');
                  setResolution('512x512');
                }}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  selectedModel === 'flow-image-1'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>Flow-image 1</span>
                <span className="text-xs">82 MB</span>
              </button>
              <button
                onClick={() => {
                  setSelectedModel('flow-image-1.5');
                  setStyle('artistic');
                  setResolution('1024x1024');
                }}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  selectedModel === 'flow-image-1.5'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>Flow-image 1.5 ✨</span>
                <span className="text-xs">GPT Image 2</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-pink-400" />
              Prompt
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedModel === 'flow-image-1.5'
                ? (language === 'uk'
                  ? 'Опишіть зображення... (напр: "photorealistic portrait with text: Hello World", "artistic landscape with vibrant colors")'
                  : 'Describe the image... (e.g: "photorealistic portrait with text: Hello World", "artistic landscape with vibrant colors")')
                : (language === 'uk'
                  ? 'Опишіть зображення... (напр: cosmic nebula with stars, ocean sunset, geometric patterns)'
                  : 'Describe the image... (e.g: cosmic nebula with stars, ocean sunset, geometric patterns)')}
              rows={4}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
            {selectedModel === 'flow-image-1.5' && (
              <p className="text-xs text-slate-500 mt-2">
                💡 {language === 'uk' 
                  ? 'Підтримує текст: додайте "text: ваш текст" для відображення на зображенні'
                  : 'Supports text: add "text: your text" to display on image'}
              </p>
            )}
          </div>

          {/* Style */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Стиль' : 'Style'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {currentStyles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    style === s.id
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{s.emoji}</span>
                  {s.label[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Quality (only for Flow-image 1.5) */}
          {selectedModel === 'flow-image-1.5' && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium text-white mb-3">
                {language === 'uk' ? 'Якість' : 'Quality'}
              </h3>
              <div className="space-y-2">
                {(['standard', 'high', 'ultra'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`w-full px-4 py-2 rounded-xl text-sm transition-all ${
                      quality === q
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q === 'standard' && (language === 'uk' ? 'Стандартна' : 'Standard')}
                    {q === 'high' && (language === 'uk' ? 'Висока' : 'High')}
                    {q === 'ultra' && (language === 'uk' ? 'Ультра' : 'Ultra')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Роздільна здатність' : 'Resolution'}
            </h3>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              {selectedModel === 'flow-image-1' ? (
                <>
                  <option value="256x256">256 × 256</option>
                  <option value="512x512">512 × 512</option>
                  <option value="768x768">768 × 768</option>
                  <option value="1024x1024">1024 × 1024</option>
                </>
              ) : (
                <>
                  <option value="512x512">512 × 512</option>
                  <option value="768x768">768 × 768</option>
                  <option value="1024x1024">1024 × 1024</option>
                  <option value="1536x1536">1536 × 1536 (Ultra)</option>
                </>
              )}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`w-full py-4 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${
              selectedModel === 'flow-image-1.5'
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30 text-purple-200 hover:from-purple-500/40 hover:to-pink-500/40'
                : 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-500/30 text-pink-200 hover:from-pink-500/40 hover:to-purple-500/40'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {progress}% — {language === 'uk' ? 'Генерація...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {language === 'uk' ? 'Згенерувати зображення' : 'Generate Image'}
              </>
            )}
          </button>

          {isGenerating && (
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  selectedModel === 'flow-image-1.5'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Result & History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Latest Result */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Результат' : 'Result'}
            </h3>
            {history.length > 0 ? (
              <div className="relative group">
                <img
                  src={history[0].dataUrl}
                  alt={history[0].prompt}
                  className="w-full rounded-xl border border-indigo-500/20"
                />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewImage(history[0])}
                    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(history[0])}
                    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300">Prompt:</span> {history[0].prompt}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {history[0].model} • {history[0].resolution} • {currentStyles.find(s => s.id === history[0].style)?.label[language]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-slate-800/30 rounded-xl border-2 border-dashed border-indigo-500/20 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    {language === 'uk' ? 'Зображення зʼявиться тут' : 'Image will appear here'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {language === 'uk' ? 'Введіть промт та натисніть "Згенерувати"' : 'Enter a prompt and click "Generate"'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center justify-between">
                <span>{language === 'uk' ? 'Історія генерацій' : 'Generation History'}</span>
                <span className="text-xs text-slate-500">{history.length} {language === 'uk' ? 'зображень' : 'images'}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {history.slice(1).map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.dataUrl}
                      alt={img.prompt}
                      className="w-full aspect-square object-cover rounded-xl border border-indigo-500/10 cursor-pointer hover:border-indigo-500/40 transition-colors"
                      onClick={() => setPreviewImage(img)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(img)}
                        className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(img)}
                        className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(img.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{img.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage.dataUrl}
              alt={previewImage.prompt}
              className="max-w-full max-h-[80vh] rounded-2xl border border-indigo-500/30"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDownload(previewImage)}
                className="p-3 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-3 rounded-xl bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-white">{previewImage.prompt}</p>
              <p className="text-xs text-slate-400 mt-1">
                {previewImage.model} • {previewImage.resolution} • {currentStyles.find(s => s.id === previewImage.style)?.label[language]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Model Info */}
      <div className="mt-6 glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          {modelConfig.name} — {language === 'uk' ? 'Технічна інформація' : 'Technical Info'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Тип' : 'Type'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.type}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Якість' : 'Quality'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.quality}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Макс. роздільна здатність' : 'Max Resolution'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.maxResolution}px</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Робота' : 'Runtime'}</p>
            <p className="text-white font-medium mt-1">Canvas API</p>
          </div>
        </div>
        {selectedModel === 'flow-image-1.5' && 'features' in modelConfig && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2">{language === 'uk' ? 'Особливості:' : 'Features:'}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(modelConfig as typeof ADVANCED_IMAGE_MODEL_CONFIGS['flow-image-1.5']).features.map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-purple-400">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-3">
          {selectedModel === 'flow-image-1.5'
            ? (language === 'uk'
              ? '💡 Flow-image 1.5 використовує покращені алгоритми з багаторівневим рендерингом, підтримкою тексту на зображеннях та якістю як у GPT Image 2.'
              : '💡 Flow-image 1.5 uses enhanced algorithms with multi-layer rendering, text support on images, and GPT Image 2 quality.')
            : (language === 'uk'
              ? '💡 Flow-image 1 використовує процедурну генерацію на основі хешу промту. Кожне зображення унікальне та детерміноване.'
              : '💡 Flow-image 1 uses procedural generation based on prompt hash. Each image is unique and deterministic.')}
        </p>
      </div>
    </div>
  );
}
