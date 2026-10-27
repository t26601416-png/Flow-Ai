import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { Mic, Volume2, FileAudio, Languages, AlertCircle } from 'lucide-react';

export default function AudioAI() {
  const { language } = useStore();
  const [mode, setMode] = useState<'stt' | 'tts'>('stt');
  const [text, setText] = useState('');

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mic className="w-7 h-7 text-violet-400" />
            {t('nav.audioAI', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Розпізнавання та синтез мовлення' : 'Speech recognition and synthesis'}
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
                ? 'Аудіо-модуль буде підтримувати Whisper (STT) та TTS моделі після інтеграції Flow-1 Audio.'
                : 'Audio module will support Whisper (STT) and TTS models after Flow-1 Audio integration.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('stt')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'stt' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <Mic className="w-4 h-4 inline mr-2" />Speech-to-Text
        </button>
        <button onClick={() => setMode('tts')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'tts' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <Volume2 className="w-4 h-4 inline mr-2" />Text-to-Speech
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            {mode === 'stt' ? (language === 'uk' ? 'Аудіо файл' : 'Audio File') : (language === 'uk' ? 'Текст для озвучення' : 'Text to speak')}
          </h3>
          {mode === 'stt' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-indigo-500/20 rounded-xl p-8 text-center opacity-50">
                <FileAudio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{language === 'uk' ? 'Доступно з Flow-1 Audio' : 'Available with Flow-1 Audio'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-400" />
                <select disabled className="bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-500 opacity-50">
                  <option>🇺🇦 Українська</option>
                  <option>🇬🇧 English</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder={language === 'uk' ? 'Введіть текст...' : 'Enter text...'}
                rows={6} disabled
                className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-500 placeholder-slate-600 resize-none opacity-50" />
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">{language === 'uk' ? 'Результат' : 'Result'}</h3>
          <div className="bg-slate-800/30 rounded-xl p-4 min-h-[200px] flex items-center justify-center">
            <p className="text-sm text-slate-600 text-center">
              {language === 'uk' ? 'Функція буде доступна після інтеграції Flow-1 Audio' : 'Available after Flow-1 Audio integration'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
