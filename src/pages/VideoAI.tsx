import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { generateVideo, VIDEO_MODEL_CONFIGS } from '../services/videoGenerator';
import { generateAdvancedVideo, ADVANCED_VIDEO_MODEL_CONFIGS } from '../services/videoGeneratorV2';
import { Video, Play, Pause, Download, Settings, Loader, Sparkles } from 'lucide-react';

export default function VideoAI() {
  const { language } = useStore();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(2);
  const [resolution, setResolution] = useState('512x512');
  const [style, setStyle] = useState('abstract');
  const [selectedModel, setSelectedModel] = useState<'flow-omni-1' | 'flow-omni-1.5'>('flow-omni-1.5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ frames: number; fps: number; duration: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const modelConfig = selectedModel === 'flow-omni-1' 
    ? VIDEO_MODEL_CONFIGS['flow-omni-1']
    : ADVANCED_VIDEO_MODEL_CONFIGS['flow-omni-1.5'];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);
    
    const [width, height] = resolution.split('x').map(Number);
    const fps = modelConfig.fps;
    const frames = duration * fps;
    setTotalFrames(frames);
    
    try {
      let result;
      
      if (selectedModel === 'flow-omni-1') {
        result = await generateVideo(prompt, {
          width,
          height,
          duration,
          fps,
          style,
          onProgress: (prog, frame, total) => {
            setProgress(prog);
            setCurrentFrame(frame);
            setTotalFrames(total);
          },
        });
      } else {
        result = await generateAdvancedVideo(prompt, {
          width,
          height,
          duration,
          fps,
          style,
          onProgress: (prog, frame, total) => {
            setProgress(prog);
            setCurrentFrame(frame);
            setTotalFrames(total);
          },
        });
      }
      
      if (!result.videoUrl) {
        throw new Error('Failed to generate video');
      }
      
      setVideoUrl(result.videoUrl);
      setVideoInfo({ frames: result.frames, fps: result.fps, duration: result.duration });
    } catch (error) {
      console.error('Video generation failed:', error);
      alert(`Помилка генерації: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `flow-video-${Date.now()}.webm`;
    a.click();
  };

  const styles = [
    { id: 'abstract', label: { uk: 'Абстракт', en: 'Abstract' }, emoji: '🎨' },
    { id: 'cosmic', label: { uk: 'Космос', en: 'Cosmic' }, emoji: '🌌' },
    { id: 'geometric', label: { uk: 'Геометрія', en: 'Geometric' }, emoji: '📐' },
    { id: 'organic', label: { uk: 'Органічний', en: 'Organic' }, emoji: '🌿' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Video className="w-7 h-7 text-purple-400" />
            {t('nav.videoAI', language)}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Генерація відео — Flow-omni 1' : 'Video Generation — Flow-omni 1'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs">{modelConfig.name} • {modelConfig.fps} FPS</span>
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
                  setSelectedModel('flow-omni-1');
                  setDuration(1);
                  setResolution('512x512');
                }}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  selectedModel === 'flow-omni-1'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>Flow-omni 1</span>
                <span className="text-xs">30 FPS</span>
              </button>
              <button
                onClick={() => {
                  setSelectedModel('flow-omni-1.5');
                  setDuration(2);
                  setResolution('512x512');
                }}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  selectedModel === 'flow-omni-1.5'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>Flow-omni 1.5 ✨</span>
                <span className="text-xs">60 FPS</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Prompt
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={language === 'uk'
                ? 'Опишіть відео... (напр: cosmic space journey, ocean waves, geometric patterns)'
                : 'Describe the video... (e.g: cosmic space journey, ocean waves, geometric patterns)'}
              rows={4}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          {/* Style */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Стиль' : 'Style'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    style === s.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{s.emoji}</span>
                  {s.label[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Тривалість' : 'Duration'}
            </h3>
            {selectedModel === 'flow-omni-1' ? (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-sm text-purple-300 w-12 text-right">{duration}s</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {duration * modelConfig.fps} {language === 'uk' ? 'кадрів' : 'frames'} @ {modelConfig.fps} FPS
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-sm text-purple-300 w-12 text-right">{duration}s</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {duration * modelConfig.fps} {language === 'uk' ? 'кадрів' : 'frames'} @ {modelConfig.fps} FPS
                </p>
                <p className="text-xs text-purple-400 mt-1">
                  ✨ {language === 'uk' ? 'Без ліміту тривалості' : 'Unlimited duration'}
                </p>
              </>
            )}
          </div>

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
              {modelConfig.resolutions.map((res) => (
                <option key={res} value={res}>{res}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30 text-purple-200 hover:from-purple-500/40 hover:to-pink-500/40 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {progress.toFixed(0)}% — {currentFrame}/{totalFrames} {language === 'uk' ? 'кадрів' : 'frames'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {language === 'uk' ? 'Згенерувати відео' : 'Generate Video'}
              </>
            )}
          </button>

          {isGenerating && (
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Результат' : 'Result'}
            </h3>
            {videoUrl ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  loop
                  className="w-full rounded-xl border border-indigo-500/20"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      <span className="text-slate-300">Prompt:</span> {prompt}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {videoInfo?.duration}s • {videoInfo?.frames} frames • {videoInfo?.fps} FPS • {resolution}
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'uk' ? 'Завантажити' : 'Download'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-800/30 rounded-xl border-2 border-dashed border-indigo-500/20 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    {language === 'uk' ? 'Відео зʼявиться тут' : 'Video will appear here'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {language === 'uk' ? 'Введіть промт та натисніть "Згенерувати"' : 'Enter a prompt and click "Generate"'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="mt-6 glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          {modelConfig.name} — {language === 'uk' ? 'Технічна інформація' : 'Technical Info'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Тип' : 'Type'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.type}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">FPS</p>
            <p className="text-white font-medium mt-1">{modelConfig.fps}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Макс. тривалість' : 'Max Duration'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.maxDuration}s</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Формат' : 'Format'}</p>
            <p className="text-white font-medium mt-1">WebM (VP9)</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {language === 'uk'
            ? '💡 Flow-omni 1 генерує відео з 30 кадрами на секунду. Відео створюється процедурно на основі текстового опису та експортується у формат WebM.'
            : '💡 Flow-omni 1 generates video at 30 frames per second. Videos are created procedurally based on text description and exported in WebM format.'}
        </p>
      </div>
    </div>
  );
}
