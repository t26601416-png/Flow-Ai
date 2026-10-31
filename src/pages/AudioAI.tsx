import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Mic, Upload, Play, Pause, Download, Volume2, VolumeX, Trash2, AudioWaveform } from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  timestamp: number;
}

interface TextToSpeechSettings {
  text: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
}

export default function AudioAI() {
  const { language } = useStore();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const [ttsSettings, setTtsSettings] = useState<TextToSpeechSettings>({
    text: '',
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
  });
  
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !ttsSettings.voice) {
        // Try to find a Ukrainian voice, fallback to first available
        const ukrainianVoice = voices.find(v => v.lang.startsWith('uk'));
        setTtsSettings(prev => ({
          ...prev,
          voice: ukrainianVoice || voices[0]
        }));
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Update audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentAudio]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      audio.onloadedmetadata = () => {
        const newFile: AudioFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url,
          duration: audio.duration,
          size: file.size,
          timestamp: Date.now(),
        };
        setAudioFiles(prev => [...prev, newFile]);
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlayAudio = (file: AudioFile) => {
    if (currentAudio?.id === file.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentAudio(file);
      if (audioRef.current) {
        audioRef.current.src = file.url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDeleteAudio = (id: string) => {
    setAudioFiles(prev => prev.filter(f => f.id !== id));
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setIsMuted(volume === 0);
    }
  };

  const handleTextToSpeech = () => {
    if (!ttsSettings.text.trim()) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(ttsSettings.text);
    
    if (ttsSettings.voice) {
      utterance.voice = ttsSettings.voice;
    }
    
    utterance.rate = ttsSettings.rate;
    utterance.pitch = ttsSettings.pitch;
    utterance.volume = ttsSettings.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AudioWaveform className="w-7 h-7 text-purple-400" />
          Flow-1 Audio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {language === 'uk' 
            ? 'Завантажуйте аудіофайли та озвучуйте текст різними голосами'
            : 'Upload audio files and convert text to speech with different voices'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text to Speech Section */}
          <div className="space-y-4">
            <div className="glass rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                {language === 'uk' ? 'Озвучення тексту' : 'Text to Speech'}
              </h2>

              {/* Text Input */}
              <textarea
                value={ttsSettings.text}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, text: e.target.value }))}
                placeholder={language === 'uk' 
                  ? 'Введіть текст для озвучення...'
                  : 'Enter text to speak...'}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={5}
              />

              {/* Voice Selection */}
              <div className="mt-4">
                <label className="text-sm text-slate-300 mb-2 block">
                  {language === 'uk' ? 'Голос' : 'Voice'}
                </label>
                <select
                  value={ttsSettings.voice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    setTtsSettings(prev => ({ ...prev, voice: voice || null }));
                  }}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {availableVoices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Швидкість' : 'Rate'}: {ttsSettings.rate.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ttsSettings.rate}
                    onChange={(e) => setTtsSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Тон' : 'Pitch'}: {ttsSettings.pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ttsSettings.pitch}
                    onChange={(e) => setTtsSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Гучність' : 'Volume'}: {Math.round(ttsSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={ttsSettings.volume}
                    onChange={(e) => setTtsSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Speak Button */}
              <button
                onClick={isSpeaking ? handleStopSpeaking : handleTextToSpeech}
                disabled={!ttsSettings.text.trim()}
                className={`w-full mt-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isSpeaking
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    {language === 'uk' ? 'Зупинити' : 'Stop'}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    {language === 'uk' ? 'Озвучити' : 'Speak'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Audio Files Section */}
          <div className="space-y-4">
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  {language === 'uk' ? 'Аудіофайли' : 'Audio Files'}
                </h2>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {language === 'uk' ? 'Завантажити' : 'Upload'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {audioFiles.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{language === 'uk' 
                    ? 'Завантажте аудіофайли для відтворення'
                    : 'Upload audio files to play'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {audioFiles.map(file => (
                    <div
                      key={file.id}
                      className={`p-3 rounded-lg border transition-all ${
                        currentAudio?.id === file.id
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">
                            {formatTime(file.duration)} • {formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <button
                            onClick={() => handlePlayAudio(file)}
                            className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
                          >
                            {currentAudio?.id === file.id && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteAudio(file.id)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Player */}
            {currentAudio && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {language === 'uk' ? 'Програвач' : 'Player'}
                </h3>
                
                <audio ref={audioRef} src={currentAudio.url} />

                <div className="mb-4">
                  <p className="text-white font-medium truncate mb-2">{currentAudio.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-12">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-xs text-slate-400 w-12 text-right">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePlayAudio(currentAudio)}
                    className="px-6 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        {language === 'uk' ? 'Пауза' : 'Pause'}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {language === 'uk' ? 'Відтворити' : 'Play'}
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : 1}
                      onChange={handleVolumeChange}
                      className="w-24 accent-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
