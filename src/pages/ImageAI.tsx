import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  Image, Wand2, Download, AlertCircle, Settings2, RefreshCw
} from 'lucide-react';

export default function ImageAI() {
  const { language, ollamaConnected, availableModels } = useStore();
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState('512x512');
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; timestamp: number }[]>([]);

  const visionModels = availableModels.filter(m =>
    m.name.includes('llava') || m.name.includes('vision') || m.name.includes('bakllava')
  );

  const hasVisionModel = visionModels.length > 0;

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Image className="w-7 h-7 text-pink-400" />
            {t('nav.imageAI', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Генерація та аналіз зображень' : 'Image generation and analysis'}
          </p>
        </div>
      </div>

      {!hasVisionModel && (
        <div className="glass rounded-2xl p-5 mb-6 border-amber-500/20 border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-300 mb-1">
                {language === 'uk' ? 'Потрібна Vision-модель' : 'Vision model required'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'uk'
                  ? 'Для роботи з зображеннями встановіть модель llava: ollama pull llava'
                  : 'To work with images, install a vision model: ollama pull llava'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Panel */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-pink-400" />
            {language === 'uk' ? 'Генерація' : 'Generation'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={language === 'uk' ? 'Опишіть зображення...' : 'Describe the image...'}
                rows={4}
                className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{language === 'uk' ? 'Роздільна здатність' : 'Resolution'}</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="256x256">256×256</option>
                  <option value="512x512">512×512</option>
                  <option value="768x768">768×768</option>
                  <option value="1024x1024">1024×1024</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{language === 'uk' ? 'Кількість' : 'Count'}</label>
                <select
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                </select>
              </div>
            </div>

            <button
              disabled={!prompt.trim() || !ollamaConnected || isGenerating}
              className="w-full py-3 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-30"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {language === 'uk' ? 'Згенерувати' : 'Generate'}
            </button>

            <p className="text-xs text-slate-500">
              {language === 'uk'
                ? '⚠️ Для генерації зображень потрібна сумісна локальна модель (Stable Diffusion, SDXL тощо). Ollama не підтримує генерацію зображень напряму.'
                : '⚠️ Image generation requires a compatible local model (Stable Diffusion, SDXL etc). Ollama does not support image generation directly.'}
            </p>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            {language === 'uk' ? 'Аналіз зображення' : 'Image Analysis'}
          </h3>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-indigo-500/20 rounded-xl p-8 text-center hover:border-indigo-500/40 transition-colors cursor-pointer">
              <Image className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                {language === 'uk'
                  ? 'Перетягніть зображення або натисніть для завантаження'
                  : 'Drag & drop an image or click to upload'}
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP</p>
            </div>

            {hasVisionModel ? (
              <div className="text-xs text-green-400 flex items-center gap-1">
                ✓ {language === 'uk' ? 'Vision-модель доступна' : 'Vision model available'}: {visionModels[0]?.name}
              </div>
            ) : (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {language === 'uk' ? 'Встановіть llava для аналізу' : 'Install llava for analysis'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-white mb-3">
            {language === 'uk' ? 'Історія генерацій' : 'Generation History'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {history.map((item, i) => (
              <div key={i} className="glass rounded-xl p-3">
                <div className="aspect-square bg-slate-800/50 rounded-lg mb-2 flex items-center justify-center">
                  <Image className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-xs text-slate-400 truncate">{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
