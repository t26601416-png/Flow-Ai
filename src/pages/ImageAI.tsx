import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { isModelLoaded, MODEL_CONFIGS } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import { Image, Wand2, AlertCircle, Settings2 } from 'lucide-react';

export default function ImageAI() {
  const { language, loadedModels } = useStore();
  const [prompt, setPrompt] = useState('');

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

      <div className="glass rounded-2xl p-5 mb-6 border-amber-500/20 border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-300 mb-1">
              {language === 'uk' ? 'Модуль в розробці' : 'Module in development'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'uk'
                ? 'Для генерації зображень потрібна модель Stable Diffusion. Flow-1 Flash та Flow-1 Pro — текстові моделі. Підтримка image-моделей буде додана у наступних оновленнях.'
                : 'Image generation requires a Stable Diffusion model. Flow-1 Flash and Flow-1 Pro are text models. Image model support will be added in future updates.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-pink-400" />
            {language === 'uk' ? 'Генерація (скоро)' : 'Generation (coming soon)'}
          </h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={language === 'uk' ? 'Опишіть зображення...' : 'Describe the image...'}
            rows={4}
            disabled
            className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-500 placeholder-slate-600 resize-none opacity-50"
          />
          <p className="text-xs text-slate-500 mt-3">
            {language === 'uk'
              ? '⚠️ Потрібна image-модель (Flow-1 Vision або Stable Diffusion)'
              : '⚠️ Requires image model (Flow-1 Vision or Stable Diffusion)'}
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            {language === 'uk' ? 'Аналіз зображень (скоро)' : 'Image Analysis (coming soon)'}
          </h3>
          <div className="border-2 border-dashed border-indigo-500/20 rounded-xl p-8 text-center opacity-50">
            <Image className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {language === 'uk' ? 'Функція буде доступна з Flow-1 Vision' : 'Available with Flow-1 Vision'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
