import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Mic, Upload, Play, Pause, Download, Volume2, VolumeX, Trash2, AudioWaveform, Music, Wand2, Disc3 } from 'lucide-react';

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

type AudioTab = 'tts' | 'files' | 'editor' | 'generator';

interface MusicGeneratorSettings {
  genre: string;
  tempo: number;
  duration: number;
  key: string;
  instruments: string[];
}

interface AudioEditorSettings {
  pitch: number;
  speed: number;
  reverb: number;
  delay: number;
  distortion: number;
  lowpass: number;
  highpass: number;
}

export default function AudioAI() {
  const { language } = useStore();
  const [activeTab, setActiveTab] = useState<AudioTab>('tts');
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

  const [editorSettings, setEditorSettings] = useState<AudioEditorSettings>({
    pitch: 1,
    speed: 1,
    reverb: 0,
    delay: 0,
    distortion: 0,
    lowpass: 20000,
    highpass: 20,
  });

  const [generatorSettings, setGeneratorSettings] = useState<MusicGeneratorSettings>({
    genre: 'phonk',
    tempo: 140,
    duration: 30,
    key: 'C',
    instruments: ['drums', 'bass', 'melody'],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !ttsSettings.voice) {
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

  // Audio Editor - Apply effects
  const applyAudioEffects = async () => {
    if (!currentAudio) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      const response = await fetch(currentAudio.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Create offline context for processing
      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length / editorSettings.speed,
        audioBuffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = editorSettings.speed;

      // Apply pitch shift (simplified)
      source.detune.value = (editorSettings.pitch - 1) * 1200;

      // Create effects chain
      let lastNode: AudioNode = source;

      // Low-pass filter
      if (editorSettings.lowpass < 20000) {
        const lowpass = offlineCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = editorSettings.lowpass;
        lastNode.connect(lowpass);
        lastNode = lowpass;
      }

      // High-pass filter
      if (editorSettings.highpass > 20) {
        const highpass = offlineCtx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = editorSettings.highpass;
        lastNode.connect(highpass);
        lastNode = highpass;
      }

      // Distortion
      if (editorSettings.distortion > 0) {
        const distortion = offlineCtx.createWaveShaper();
        const curve = new Float32Array(256);
        const amount = editorSettings.distortion * 100;
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
        }
        distortion.curve = curve;
        lastNode.connect(distortion);
        lastNode = distortion;
      }

      lastNode.connect(offlineCtx.destination);
      source.start();

      const renderedBuffer = await offlineCtx.startRendering();
      
      // Convert to WAV
      const wav = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      const editedFile: AudioFile = {
        id: Date.now().toString() + Math.random(),
        name: `${currentAudio.name}_edited.wav`,
        url,
        duration: renderedBuffer.duration,
        size: blob.size,
        timestamp: Date.now(),
      };

      setAudioFiles(prev => [...prev, editedFile]);
      setCurrentAudio(editedFile);
    } catch (error) {
      console.error('Audio processing error:', error);
    }
  };

  // Music Generator
  const generateMusic = async () => {
    setIsGenerating(true);

    try {
      const ctx = new OfflineAudioContext(2, 44100 * generatorSettings.duration, 44100);
      
      // Genre-specific patterns
      const patterns = getGenrePattern(generatorSettings.genre, generatorSettings.tempo);
      
      // Generate drum pattern
      if (generatorSettings.instruments.includes('drums')) {
        generateDrumPattern(ctx, patterns.drums, generatorSettings.duration);
      }

      // Generate bass line
      if (generatorSettings.instruments.includes('bass')) {
        generateBassLine(ctx, patterns.bass, generatorSettings.key, generatorSettings.duration);
      }

      // Generate melody
      if (generatorSettings.instruments.includes('melody')) {
        generateMelody(ctx, patterns.melody, generatorSettings.key, generatorSettings.duration);
      }

      const renderedBuffer = await ctx.startRendering();
      const wav = audioBufferToWav(renderedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      const musicFile: AudioFile = {
        id: Date.now().toString() + Math.random(),
        name: `${generatorSettings.genre}_${generatorSettings.tempo}bpm.wav`,
        url,
        duration: renderedBuffer.duration,
        size: blob.size,
        timestamp: Date.now(),
      };

      setAudioFiles(prev => [...prev, musicFile]);
      setGeneratedMusic(url);
    } catch (error) {
      console.error('Music generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Genre patterns
  const getGenrePattern = (genre: string, tempo: number) => {
    const beatDuration = 60 / tempo;
    
    const patterns: Record<string, any> = {
      phonk: {
        drums: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
        bass: [0, 0, 7, 0, 0, 0, 7, 0, 5, 0, 0, 7, 0, 0, 3, 0],
        melody: [12, 0, 15, 0, 17, 0, 15, 0, 12, 0, 10, 0, 12, 0, 0, 0],
      },
      lofi: {
        drums: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        bass: [0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0],
        melody: [7, 0, 10, 0, 12, 0, 10, 0, 7, 0, 5, 0, 7, 0, 0, 0],
      },
      hiphop: {
        drums: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
        bass: [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 7, 0],
        melody: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      electronic: {
        drums: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        bass: [0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 5, 0, 0, 0, 3, 0],
        melody: [12, 15, 17, 19, 17, 15, 12, 10, 12, 15, 17, 19, 20, 19, 17, 15],
      },
      ambient: {
        drums: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bass: [0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0],
        melody: [7, 0, 0, 0, 10, 0, 0, 0, 12, 0, 0, 0, 10, 0, 0, 0],
      },
    };

    return patterns[genre] || patterns.phonk;
  };

  // Generate drum pattern
  const generateDrumPattern = (ctx: OfflineAudioContext, pattern: number[], duration: number) => {
    const beatDuration = 60 / generatorSettings.tempo;
    const samplesPerBeat = ctx.sampleRate * beatDuration;

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i]) {
        const startTime = i * samplesPerBeat / ctx.sampleRate;
        
        // Kick drum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.frequency.setValueAtTime(150, startTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        
        gain.gain.setValueAtTime(1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      }
    }
  };

  // Generate bass line
  const generateBassLine = (ctx: OfflineAudioContext, pattern: number[], key: string, duration: number) => {
    const beatDuration = 60 / generatorSettings.tempo;
    const samplesPerBeat = ctx.sampleRate * beatDuration;
    const keyOffset = getKeyOffset(key);

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] > 0) {
        const startTime = i * samplesPerBeat / ctx.sampleRate;
        const note = pattern[i] + keyOffset;
        const frequency = 440 * Math.pow(2, (note - 69) / 12) / 4;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + beatDuration * 0.9);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + beatDuration);
      }
    }
  };

  // Generate melody
  const generateMelody = (ctx: OfflineAudioContext, pattern: number[], key: string, duration: number) => {
    const beatDuration = 60 / generatorSettings.tempo;
    const samplesPerBeat = ctx.sampleRate * beatDuration;
    const keyOffset = getKeyOffset(key);

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] > 0) {
        const startTime = i * samplesPerBeat / ctx.sampleRate;
        const note = pattern[i] + keyOffset + 12;
        const frequency = 440 * Math.pow(2, (note - 69) / 12);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + beatDuration * 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + beatDuration);
      }
    }
  };

  const getKeyOffset = (key: string): number => {
    const keys: Record<string, number> = {
      'C': 60, 'C#': 61, 'D': 62, 'D#': 63, 'E': 64,
      'F': 65, 'F#': 66, 'G': 67, 'G#': 68, 'A': 69,
      'A#': 70, 'B': 71
    };
    return keys[key] || 60;
  };

  // Convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
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

  const tabs = [
    { id: 'tts' as AudioTab, icon: Mic, label: { uk: 'Озвучення', en: 'TTS' } },
    { id: 'files' as AudioTab, icon: Upload, label: { uk: 'Файли', en: 'Files' } },
    { id: 'editor' as AudioTab, icon: Wand2, label: { uk: 'AI Редактор', en: 'AI Editor' } },
    { id: 'generator' as AudioTab, icon: Music, label: { uk: 'Генератор', en: 'Generator' } },
  ];

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
            ? 'Озвучення тексту, редагування аудіо та генерація музики з AI'
            : 'Text-to-speech, audio editing and AI music generation'}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 px-4 flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label[language]}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Text-to-Speech Tab */}
        {activeTab === 'tts' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="glass rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                {language === 'uk' ? 'Озвучення тексту' : 'Text to Speech'}
              </h2>

              <textarea
                value={ttsSettings.text}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, text: e.target.value }))}
                placeholder={language === 'uk' 
                  ? 'Введіть текст для озвучення...'
                  : 'Enter text to speak...'}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={5}
              />

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
        )}

        {/* Audio Files Tab */}
        {activeTab === 'files' && (
          <div className="max-w-2xl mx-auto space-y-4">
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
        )}

        {/* AI Editor Tab */}
        {activeTab === 'editor' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="glass rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-orange-400" />
                {language === 'uk' ? 'AI Редактор аудіо' : 'AI Audio Editor'}
              </h2>

              {!currentAudio ? (
                <div className="text-center py-12 text-slate-500">
                  <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{language === 'uk' 
                    ? 'Оберіть аудіофайл у вкладці "Файли" для редагування'
                    : 'Select an audio file in "Files" tab to edit'}</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
                    <p className="text-white font-medium truncate">{currentAudio.name}</p>
                    <p className="text-xs text-slate-400">{formatTime(currentAudio.duration)}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        {language === 'uk' ? 'Тон (Pitch)' : 'Pitch'}: {editorSettings.pitch.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={editorSettings.pitch}
                        onChange={(e) => setEditorSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        {language === 'uk' ? 'Швидкість' : 'Speed'}: {editorSettings.speed.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={editorSettings.speed}
                        onChange={(e) => setEditorSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        {language === 'uk' ? 'Реверберація' : 'Reverb'}: {Math.round(editorSettings.reverb * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={editorSettings.reverb}
                        onChange={(e) => setEditorSettings(prev => ({ ...prev, reverb: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        {language === 'uk' ? 'Дисторшн' : 'Distortion'}: {Math.round(editorSettings.distortion * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={editorSettings.distortion}
                        onChange={(e) => setEditorSettings(prev => ({ ...prev, distortion: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">
                        {language === 'uk' ? 'Low-pass фільтр' : 'Low-pass Filter'}: {editorSettings.lowpass} Hz
                      </label>
                      <input
                        type="range"
                        min="200"
                        max="20000"
                        step="100"
                        value={editorSettings.lowpass}
                        onChange={(e) => setEditorSettings(prev => ({ ...prev, lowpass: parseFloat(e.target.value) }))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <button
                      onClick={applyAudioEffects}
                      className="w-full py-3 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-5 h-5" />
                      {language === 'uk' ? 'Застосувати ефекти' : 'Apply Effects'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Music Generator Tab */}
        {activeTab === 'generator' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="glass rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                {language === 'uk' ? 'AI Генератор музики' : 'AI Music Generator'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Жанр' : 'Genre'}
                  </label>
                  <select
                    value={generatorSettings.genre}
                    onChange={(e) => setGeneratorSettings(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="phonk">🎵 Фонк (Phonk)</option>
                    <option value="lofi">🎧 Lo-fi</option>
                    <option value="hiphop">🎤 Hip-Hop</option>
                    <option value="electronic">🎹 Electronic</option>
                    <option value="ambient">🌊 Ambient</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Темп' : 'Tempo'}: {generatorSettings.tempo} BPM
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="5"
                    value={generatorSettings.tempo}
                    onChange={(e) => setGeneratorSettings(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                    className="w-full accent-green-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Тривалість' : 'Duration'}: {generatorSettings.duration}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={generatorSettings.duration}
                    onChange={(e) => setGeneratorSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full accent-green-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Тональність' : 'Key'}
                  </label>
                  <select
                    value={generatorSettings.key}
                    onChange={(e) => setGeneratorSettings(prev => ({ ...prev, key: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:border-green-500"
                  >
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    {language === 'uk' ? 'Інструменти' : 'Instruments'}
                  </label>
                  <div className="flex gap-2">
                    {['drums', 'bass', 'melody'].map(inst => (
                      <button
                        key={inst}
                        onClick={() => {
                          setGeneratorSettings(prev => ({
                            ...prev,
                            instruments: prev.instruments.includes(inst)
                              ? prev.instruments.filter(i => i !== inst)
                              : [...prev.instruments, inst]
                          }));
                        }}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          generatorSettings.instruments.includes(inst)
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {inst === 'drums' && '🥁'}
                        {inst === 'bass' && '🎸'}
                        {inst === 'melody' && '🎹'}
                        {' '}{inst}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateMusic}
                  disabled={isGenerating}
                  className="w-full py-3 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {isGenerating ? (
                    <>
                      <Disc3 className="w-5 h-5 animate-spin" />
                      {language === 'uk' ? 'Генерація...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5" />
                      {language === 'uk' ? 'Згенерувати музику' : 'Generate Music'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
