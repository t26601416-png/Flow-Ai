import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import * as THREE from 'three';
import { generate3DModel, exportToOBJ, MODEL_3D_CONFIGS } from '../services/model3DGenerator';
import { Box, Download, RotateCw, ZoomIn, ZoomOut, Loader } from 'lucide-react';

export default function Model3DAI() {
  const { language } = useStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [objectType, setObjectType] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number>();

  const modelConfig = MODEL_3D_CONFIGS['flow-wan-1'];

  // Initialize Three.js renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(800, 600);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (scene && rendererRef.current && cameraRef.current) {
        // Rotate scene slowly
        scene.rotation.y += 0.005;
        rendererRef.current.render(scene, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, [scene]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);

    try {
      const result = await generate3DModel(prompt, {
        onProgress: (p) => setProgress(p),
      });
      
      setScene(result.scene);
      setObjectType(result.objectType);
    } catch (err) {
      console.error('3D generation failed:', err);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleExport = () => {
    if (!scene) return;
    
    const obj = exportToOBJ(scene);
    const blob = new Blob([obj], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-wan-${Date.now()}.obj`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.9);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.1);
    }
  };

  const handleResetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(5, 5, 5);
      cameraRef.current.lookAt(0, 1, 0);
    }
    if (scene) {
      scene.rotation.y = 0;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Box className="w-7 h-7 text-cyan-400" />
            {language === 'uk' ? '3D Моделювання' : '3D Modeling'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' ? 'Створення 3D-моделей — Flow-wan 1' : '3D Model Creation — Flow-wan 1'}
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
          {/* Prompt */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Опис 3D-об\'єкта' : '3D Object Description'}
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={language === 'uk'
                ? 'Опишіть 3D-об\'єкт... (напр: "червоний куб", "blue sphere", "стіл", "car", "tree")'
                : 'Describe the 3D object... (e.g: "red cube", "blue sphere", "table", "car", "tree")'}
              rows={4}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              {language === 'uk'
                ? '💡 Підтримувані об\'єкти: cube, sphere, cylinder, cone, torus, chair, table, car, house, tree, vase'
                : '💡 Supported objects: cube, sphere, cylinder, cone, torus, chair, table, car, house, tree, vase'}
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-500/30 text-cyan-200 hover:from-cyan-500/40 hover:to-blue-500/40 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {progress}% — {language === 'uk' ? 'Генерація...' : 'Generating...'}
              </>
            ) : (
              <>
                <Box className="w-5 h-5" />
                {language === 'uk' ? 'Створити 3D-модель' : 'Generate 3D Model'}
              </>
            )}
          </button>

          {isGenerating && (
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Controls */}
          {scene && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium text-white mb-3">
                {language === 'uk' ? 'Керування' : 'Controls'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleZoomIn}
                  className="px-3 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 text-sm flex items-center justify-center gap-2"
                >
                  <ZoomIn className="w-4 h-4" />
                  {language === 'uk' ? 'Збільшити' : 'Zoom In'}
                </button>
                <button
                  onClick={handleZoomOut}
                  className="px-3 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 text-sm flex items-center justify-center gap-2"
                >
                  <ZoomOut className="w-4 h-4" />
                  {language === 'uk' ? 'Зменшити' : 'Zoom Out'}
                </button>
                <button
                  onClick={handleResetView}
                  className="px-3 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 text-sm flex items-center justify-center gap-2 col-span-2"
                >
                  <RotateCw className="w-4 h-4" />
                  {language === 'uk' ? 'Скинути вигляд' : 'Reset View'}
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-sm flex items-center justify-center gap-2 col-span-2"
                >
                  <Download className="w-4 h-4" />
                  {language === 'uk' ? 'Експорт OBJ' : 'Export OBJ'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? '3D В\'ювер' : '3D Viewer'}
            </h3>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full rounded-xl border border-indigo-500/20 bg-slate-900"
                style={{ height: '600px' }}
              />
              {!scene && !isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl">
                  <div className="text-center">
                    <Box className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      {language === 'uk' ? '3D-модель з\'явиться тут' : '3D model will appear here'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'uk' ? 'Введіть опис та натисніть "Створити"' : 'Enter description and click "Generate"'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {scene && objectType && (
              <div className="mt-3">
                <p className="text-xs text-slate-400">
                  <span className="text-slate-300">Prompt:</span> {prompt}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'uk' ? 'Тип об\'єкта' : 'Object type'}: {objectType} • Flow-wan 1
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="mt-6 glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400" />
          {modelConfig.name} — {language === 'uk' ? 'Технічна інформація' : 'Technical Info'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Тип' : 'Type'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.type}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Швидкість' : 'Speed'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.speed}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Якість' : 'Quality'}</p>
            <p className="text-white font-medium mt-1">{modelConfig.quality}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-3 text-center">
            <p className="text-slate-400">{language === 'uk' ? 'Експорт' : 'Export'}</p>
            <p className="text-white font-medium mt-1">OBJ Format</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          {language === 'uk'
            ? '💡 Flow-wan 1 генерує процедурні 3D-моделі на основі текстового опису. Підтримує базові форми та складні об\'єкти. Експорт у формат OBJ для використання в Blender, Maya, 3ds Max.'
            : '💡 Flow-wan 1 generates procedural 3D models based on text descriptions. Supports basic shapes and complex objects. Export to OBJ format for use in Blender, Maya, 3ds Max.'}
        </p>
      </div>
    </div>
  );
}
