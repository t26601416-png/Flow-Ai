import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  Mic, Volume2, Upload, Play, Pause, AlertCircle, FileAudio,
  Languages, Trash2
} from 'lucide-react';

export default function AudioAI() {
  const { language, ollamaConnected, availableModels } = useStore();
  const [mode, setMode] = useState<'stt' | 'tts'>('stt');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<{ type: string; text: string; timestamp: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speechModels = availableModels.filter(m =>
    m.name.includes('whisper') || m.name.includes('speech') || m.name.includes('audio')
  );

  const hasSpeechModel = speechModels.length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAudioFile(e.target.files[0]);
      setResult('');
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise(r => setTimeout(r, 2000));
    
    if (mode === 'stt') {
      setResult(language === 'uk'
        ? '⚠️ Для Speech-to-Text потрібна модель Whisper. Встановіть: ollama pull whisper'
        : '⚠️ Speech-to-Text requires Whisper model. Install: ollama pull whisper');
    } else {
      setResult(language === 'uk'
        ? '⚠️ Для Text-to-Speech потрібна сумісна модель. Функція в розробці.'
        : '⚠️ Text-to-Speech requires a compatible model. Feature in development.');
    }
    
    setHistory(prev => [...prev, { type: mode, text: result, timestamp: Date.now() }]);
    setIsProcessing(false);
  };

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

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('stt')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'stt' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Mic className="w-4 h-4 inline mr-2" />
          Speech-to-Text
        </button>
        <button
          onClick={() => setMode('tts')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'tts' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Volume2 className="w-4 h-4 inline mr-2" />
          Text-to-Speech
        </button>
      </div>

      {!hasSpeechModel && (
        <div className="glass rounded-2xl p-5 mb-6 border-amber-500/20 border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-300 mb-1">
                {language === 'uk' ? 'Потрібна мовна модель' : 'Speech model required'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'uk'
                  ? 'Встановіть Whisper: ollama pull whisper'
                  : 'Install Whisper: ollama pull whisper'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            {mode === 'stt'
              ? (language === 'uk' ? 'Аудіо файл' : 'Audio File')
              : (language === 'uk' ? 'Текст для озвучення' : 'Text to speak')}
          </h3>

          {mode === 'stt' ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/20 rounded-xl p-8 text-center hover:border-indigo-500/40 transition-colors cursor-pointer"
              >
                <FileAudio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  {audioFile ? audioFile.name : (language === 'uk' ? 'Оберіть аудіо файл' : 'Select audio file')}
                </p>
                <p className="text-xs text-slate-500 mt-1">MP3, WAV, OGG, M4A</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-400" />
                <select className="bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
                  <option>🇺🇦 Українська</option>
                  <option>🇬🇧 English</option>
                  <option>🇩🇪 Deutsch</option>
                  <option>🇫🇷 Français</option>
                </select>
              </div>

              <button
                onClick={handleProcess}
                disabled={!audioFile || isProcessing}
                className="w-full py-3 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-sm font-medium transition-colors disabled:opacity-30"
              >
                {isProcessing ? (language === 'uk' ? 'Обробка...' : 'Processing...') : (language === 'uk' ? 'Розпізнати' : 'Transcribe')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={language === 'uk' ? 'Введіть текст для озвучення...' : 'Enter text to speak...'}
                rows={6}
                className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
              />

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <select className="bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
                  <option>{language === 'uk' ? 'Голос за замовчуванням' : 'Default Voice'}</option>
                </select>
              </div>

              <button
                onClick={handleProcess}
                disabled={!text.trim() || isProcessing}
                className="w-full py-3 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-sm font-medium transition-colors disabled:opacity-30"
              >
                {isProcessing ? (language === 'uk' ? 'Генерація...' : 'Generating...') : (language === 'uk' ? 'Озвучити' : 'Speak')}
              </button>
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">
            {language === 'uk' ? 'Результат' : 'Result'}
          </h3>
          <div className="bg-slate-800/30 rounded-xl p-4 min-h-[200px]">
            {result ? (
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{result}</p>
            ) : (
              <p className="text-sm text-slate-500 text-center mt-16">
                {language === 'uk' ? 'Результат зʼявиться тут' : 'Result will appear here'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-white mb-3">
            {language === 'uk' ? 'Історія обробки' : 'Processing History'}
          </h3>
          <div className="space-y-2">
            {history.slice(-5).reverse().map((item, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.type === 'stt' ? <Mic className="w-4 h-4 text-violet-400" /> : <Volume2 className="w-4 h-4 text-violet-400" />}
                  <span className="text-xs text-slate-300 truncate max-w-md">{item.text}</span>
                </div>
                <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
