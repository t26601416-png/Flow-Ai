import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
import { generateTextStream, isModelLoaded, loadModel } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import {
  Code2, Gamepad2, Smartphone, Sparkles, Play, Download, Copy, Check,
  Loader
} from 'lucide-react';

interface Genre {
  id: string;
  name: { uk: string; en: string };
  icon: string;
  category: 'game' | 'app';
  description: { uk: string; en: string };
}

const GAME_GENRES: Genre[] = [
  { id: 'action', name: { uk: 'Action', en: 'Action' }, icon: '⚔️', category: 'game', description: { uk: 'Екшн, шутери, файтинги', en: 'Action, shooters, fighting' } },
  { id: 'rpg', name: { uk: 'RPG', en: 'RPG' }, icon: '🗡️', category: 'game', description: { uk: 'Рольові ігри з прокачкою', en: 'Role-playing games with progression' } },
  { id: 'puzzle', name: { uk: 'Puzzle', en: 'Puzzle' }, icon: '🧩', category: 'game', description: { uk: 'Головоломки, логічні ігри', en: 'Puzzles, logic games' } },
  { id: 'strategy', name: { uk: 'Strategy', en: 'Strategy' }, icon: '♟️', category: 'game', description: { uk: 'Стратегії, тактики', en: 'Strategy, tactics' } },
  { id: 'adventure', name: { uk: 'Adventure', en: 'Adventure' }, icon: '🗺️', category: 'game', description: { uk: 'Пригоди, квести', en: 'Adventure, quests' } },
  { id: 'platformer', name: { uk: 'Platformer', en: 'Platformer' }, icon: '🏃', category: 'game', description: { uk: 'Платформери', en: 'Platformers' } },
  { id: 'racing', name: { uk: 'Racing', en: 'Racing' }, icon: '🏎️', category: 'game', description: { uk: 'Гонки', en: 'Racing games' } },
  { id: 'sports', name: { uk: 'Sports', en: 'Sports' }, icon: '⚽', category: 'game', description: { uk: 'Спортивні ігри', en: 'Sports games' } },
  { id: 'simulation', name: { uk: 'Simulation', en: 'Simulation' }, icon: '🎯', category: 'game', description: { uk: 'Симулятори', en: 'Simulators' } },
  { id: 'horror', name: { uk: 'Horror', en: 'Horror' }, icon: '👻', category: 'game', description: { uk: 'Хорор, жахи', en: 'Horror, scary' } },
];

const APP_GENRES: Genre[] = [
  { id: 'productivity', name: { uk: 'Продуктивність', en: 'Productivity' }, icon: '📋', category: 'app', description: { uk: 'Нотатки, задачі, планувальники', en: 'Notes, tasks, planners' } },
  { id: 'social', name: { uk: 'Соціальні', en: 'Social' }, icon: '💬', category: 'app', description: { uk: 'Соціальні мережі, чати', en: 'Social networks, chats' } },
  { id: 'education', name: { uk: 'Навчання', en: 'Education' }, icon: '📚', category: 'app', description: { uk: 'Навчальні додатки, курси', en: 'Learning apps, courses' } },
  { id: 'health', name: { uk: "Здоров'я", en: 'Health' }, icon: '💪', category: 'app', description: { uk: "Фітнес, здоров'я, тренування", en: 'Fitness, health, workouts' } },
  { id: 'finance', name: { uk: 'Фінанси', en: 'Finance' }, icon: '💰', category: 'app', description: { uk: 'Бюджет, витрати, інвестиції', en: 'Budget, expenses, investments' } },
  { id: 'entertainment', name: { uk: 'Розваги', en: 'Entertainment' }, icon: '🎬', category: 'app', description: { uk: 'Медіа, музика, відео', en: 'Media, music, video' } },
  { id: 'business', name: { uk: 'Бізнес', en: 'Business' }, icon: '💼', category: 'app', description: { uk: 'CRM, управління проєктами', en: 'CRM, project management' } },
  { id: 'utility', name: { uk: 'Утиліти', en: 'Utility' }, icon: '🔧', category: 'app', description: { uk: 'Інструменти, конвертери', en: 'Tools, converters' } },
];

export default function FlowCodex() {
  const { language, activeModel, loadedModels, setLoadedModels, modelLoadStatus, setModelLoadStatus } = useStore();
  const [category, setCategory] = useState<'game' | 'app'>('game');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [prompt, setPrompt] = useState('');
  const [features, setFeatures] = useState('');
  const [designStyle, setDesignStyle] = useState('modern');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentGenres = category === 'game' ? GAME_GENRES : APP_GENRES;
  const model = (activeModel || 'flow-1-flash') as FlowModel;

  // Generate complete HTML template based on genre and style
  const generateBaseTemplate = (genre: Genre, style: string, prompt: string, features: string): string => {
    const title = prompt.slice(0, 50) || 'Flow Codex Project';
    
    // Color schemes based on design style
    const colorSchemes: Record<string, { primary: string; secondary: string; bg: string; text: string }> = {
      modern: { primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f172a', text: '#e2e8f0' },
      minimalist: { primary: '#000000', secondary: '#666666', bg: '#ffffff', text: '#000000' },
      retro: { primary: '#ff006e', secondary: '#fb5607', bg: '#1a1a2e', text: '#eaeaea' },
      neon: { primary: '#00ff87', secondary: '#60efff', bg: '#0a0a0f', text: '#ffffff' },
      dark: { primary: '#1e40af', secondary: '#3b82f6', bg: '#000000', text: '#e5e7eb' },
      colorful: { primary: '#ec4899', secondary: '#f59e0b', bg: '#1e1b4b', text: '#ffffff' },
    };
    
    const colors = colorSchemes[style] || colorSchemes.modern;
    
    // Base HTML structure
    let html = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: ${colors.bg};
            color: ${colors.text};
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2.5rem;
        }
`;

    // Add genre-specific styles
    if (category === 'game') {
      html += `
        .game-canvas {
            width: 100%;
            max-width: 800px;
            height: 600px;
            background: #000;
            border: 3px solid ${colors.primary};
            border-radius: 10px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
        }
        
        .score-board {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .btn {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.2rem;
            border-radius: 50px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
        
        .player {
            position: absolute;
            width: 50px;
            height: 50px;
            background: ${colors.primary};
            border-radius: 50%;
            transition: all 0.1s;
        }
        
        .obstacle {
            position: absolute;
            background: ${colors.secondary};
            border-radius: 5px;
        }
`;
    } else {
      // App-specific styles
      html += `
        .app-content {
            display: grid;
            gap: 20px;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            transition: transform 0.2s;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .input-field {
            width: 100%;
            padding: 15px;
            border: 2px solid ${colors.primary};
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            color: ${colors.text};
            font-size: 1rem;
            margin-bottom: 15px;
        }
        
        .input-field:focus {
            outline: none;
            border-color: ${colors.secondary};
        }
        
        .btn {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
            transition: transform 0.2s;
            width: 100%;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .list-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
`;
    }

    html += `
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
`;

    // Add genre-specific HTML content
    if (category === 'game') {
      html += `
        <div class="score-board">
            <div>Рахунок: <span id="score">0</span></div>
            <div>Рекорд: <span id="highScore">0</span></div>
        </div>
        <div class="game-canvas" id="gameCanvas">
            <div class="player" id="player"></div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn" id="startBtn">Почати гру</button>
            <button class="btn" id="pauseBtn" style="display: none;">Пауза</button>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888;">
            <p>Використовуйте стрілки ← → для керування</p>
        </div>
`;
    } else {
      html += `
        <div class="app-content">
            <input type="text" class="input-field" id="inputField" placeholder="Введіть дані...">
            <button class="btn" id="actionBtn">Додати</button>
            <div id="listContainer"></div>
        </div>
`;
    }

    html += `
    </div>
    
    <script>
        // ${genre.name[language]} ${category === 'game' ? 'гра' : 'додаток'}
        // Стиль: ${style}
        // Промт: ${prompt}
        ${features ? `// Додаткові функції: ${features}` : ''}
        
`;

    // Add genre-specific JavaScript
    if (category === 'game') {
      html += generateGameLogic(genre, prompt);
    } else {
      html += generateAppLogic(genre, prompt);
    }

    html += `
    </script>
</body>
</html>`;

    return html;
  };

  // Generate game logic based on genre
  const generateGameLogic = (genre: Genre, prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Default platformer logic
    let logic = `
        // Game variables
        const canvas = document.getElementById('gameCanvas');
        const player = document.getElementById('player');
        const scoreEl = document.getElementById('score');
        const highScoreEl = document.getElementById('highScore');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        let score = 0;
        let highScore = localStorage.getItem('highScore') || 0;
        let gameRunning = false;
        let playerX = 375;
        let playerY = 500;
        let velocityY = 0;
        const gravity = 0.5;
        const jumpPower = -12;
        let keys = {};
        
        highScoreEl.textContent = highScore;
        
        // Player movement
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
            if (e.key === ' ' && gameRunning && playerY >= 500) {
                velocityY = jumpPower;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
        
        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            // Update player position
            if (keys['ArrowLeft'] && playerX > 0) playerX -= 5;
            if (keys['ArrowRight'] && playerX < 750) playerX += 5;
            
            // Apply gravity
            velocityY += gravity;
            playerY += velocityY;
            
            // Ground collision
            if (playerY >= 500) {
                playerY = 500;
                velocityY = 0;
            }
            
            // Update player element
            player.style.left = playerX + 'px';
            player.style.top = playerY + 'px';
            
            // Update score
            score++;
            scoreEl.textContent = score;
            
            requestAnimationFrame(gameLoop);
        }
        
        // Start game
        startBtn.addEventListener('click', () => {
            gameRunning = true;
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            score = 0;
            playerX = 375;
            playerY = 500;
            gameLoop();
        });
        
        // Pause game
        pauseBtn.addEventListener('click', () => {
            gameRunning = false;
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            startBtn.textContent = 'Продовжити';
        });
        
        // Update high score
        function updateHighScore() {
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreEl.textContent = highScore;
            }
        }
`;

    return logic;
  };

  // Generate app logic based on genre
  const generateAppLogic = (genre: Genre, prompt: string): string => {
    return `
        // App variables
        const inputField = document.getElementById('inputField');
        const actionBtn = document.getElementById('actionBtn');
        const listContainer = document.getElementById('listContainer');
        
        let items = JSON.parse(localStorage.getItem('items') || '[]');
        
        // Render items
        function renderItems() {
            listContainer.innerHTML = '';
            items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = \`
                    <span>\${item}</span>
                    <button onclick="deleteItem(\${index})" style="background: #ef4444; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer;">Видалити</button>
                \`;
                listContainer.appendChild(div);
            });
        }
        
        // Add item
        actionBtn.addEventListener('click', () => {
            const value = inputField.value.trim();
            if (value) {
                items.push(value);
                localStorage.setItem('items', JSON.stringify(items));
                inputField.value = '';
                renderItems();
            }
        });
        
        // Delete item
        function deleteItem(index) {
            items.splice(index, 1);
            localStorage.setItem('items', JSON.stringify(items));
            renderItems();
        }
        
        // Initial render
        renderItems();
        
        // Enter key support
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                actionBtn.click();
            }
        });
`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedGenre || isGenerating) return;

    setIsGenerating(true);
    setGeneratedCode('');

    try {
      // Step 1: Generate base template locally (instant)
      setGeneratedCode('<!-- Генерація базового шаблону... -->\n');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let fullCode = generateBaseTemplate(selectedGenre, designStyle, prompt, features);
      setGeneratedCode(fullCode);
      
      // Step 2: Try to enhance with AI if model is available
      if (isModelLoaded(model)) {
        setGeneratedCode(fullCode + '\n\n<!-- Покращення коду за допомогою AI... -->');
        
        const enhancementPrompt = `Доповни цей ${category === 'game' ? 'гру' : 'додаток'} додатковими функціями:
${features || 'Додай більше інтерактивності та анімацій'}

Напиши ТІЛЬКИ додатковий JavaScript код, який можна вставити перед закриваючим </script>. Не пиши пояснень, тільки код.`;

        try {
          let aiEnhancement = '';
          await generateTextStream(model, enhancementPrompt, {
            maxTokens: 512,
            temperature: 0.7,
            onToken: (token) => {
              aiEnhancement += token;
            },
          });
          
          // Insert AI enhancement before closing </script>
          if (aiEnhancement.trim()) {
            fullCode = fullCode.replace(
              '    </script>',
              `\n        // AI Enhanced Features\n        ${aiEnhancement}\n    </script>`
            );
            setGeneratedCode(fullCode);
          }
        } catch (aiErr) {
          console.log('AI enhancement skipped:', aiErr);
        }
      }
      
      // Step 3: Final complete code
      setGeneratedCode(fullCode);
      
    } catch (err) {
      console.error('Generation failed:', err);
      // Fallback: generate basic template even on error
      if (selectedGenre) {
        const fallbackCode = generateBaseTemplate(selectedGenre, designStyle, prompt, features);
        setGeneratedCode(fallbackCode);
      } else {
        setGeneratedCode(`<!-- Помилка генерації: ${err instanceof Error ? err.message : 'Невідома помилка'} -->`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGenre?.id || 'project'}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Code2 className="w-7 h-7 text-emerald-400" />
            Flow Codex
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'uk' 
              ? 'Генератор ігор та додатків з детальним промтом' 
              : 'Game and app generator with detailed prompts'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category Selection */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Категорія' : 'Category'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setCategory('game'); setSelectedGenre(null); }}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  category === 'game'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                {language === 'uk' ? 'Ігри' : 'Games'}
              </button>
              <button
                onClick={() => { setCategory('app'); setSelectedGenre(null); }}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  category === 'app'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                {language === 'uk' ? 'Додатки' : 'Apps'}
              </button>
            </div>
          </div>

          {/* Genre Selection */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Жанр' : 'Genre'}
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {currentGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedGenre?.id === genre.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{genre.icon}</span>
                  <span className="truncate">{genre.name[language]}</span>
                </button>
              ))}
            </div>
            {selectedGenre && (
              <p className="text-xs text-slate-500 mt-2">
                {selectedGenre.description[language]}
              </p>
            )}
          </div>

          {/* Design Style */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Стиль дизайну' : 'Design Style'}
            </h3>
            <select
              value={designStyle}
              onChange={(e) => setDesignStyle(e.target.value)}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              <option value="modern">{language === 'uk' ? 'Сучасний' : 'Modern'}</option>
              <option value="minimalist">{language === 'uk' ? 'Мінімалізм' : 'Minimalist'}</option>
              <option value="retro">{language === 'uk' ? 'Ретро' : 'Retro'}</option>
              <option value="neon">{language === 'uk' ? 'Неон' : 'Neon'}</option>
              <option value="dark">{language === 'uk' ? 'Темний' : 'Dark'}</option>
              <option value="colorful">{language === 'uk' ? 'Яскравий' : 'Colorful'}</option>
            </select>
          </div>

          {/* Prompt */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Промт' : 'Prompt'}
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={language === 'uk'
                ? 'Опишіть вашу гру або додаток... (напр: "Гра де котик збирає зірки")'
                : 'Describe your game or app... (e.g: "Game where a cat collects stars")'}
              rows={4}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          {/* Additional Features */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Додаткові функції' : 'Additional Features'}
            </h3>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder={language === 'uk'
                ? 'Додаткові вимоги... (напр: "рахунок очків, 3 рівні складності")'
                : 'Additional requirements... (e.g: "score counter, 3 difficulty levels")'}
              rows={3}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || !selectedGenre || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-blue-500/30 border border-emerald-500/30 text-emerald-200 hover:from-emerald-500/40 hover:to-blue-500/40 text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {language === 'uk' ? 'Генерація...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {language === 'uk' ? 'Згенерувати код' : 'Generate Code'}
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Code Output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Code Display */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                {language === 'uk' ? 'Згенерований код' : 'Generated Code'}
              </h3>
              {generatedCode && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    {showPreview ? (language === 'uk' ? 'Код' : 'Code') : (language === 'uk' ? 'Превʼю' : 'Preview')}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? (language === 'uk' ? 'Скопійовано' : 'Copied') : (language === 'uk' ? 'Копіювати' : 'Copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    {language === 'uk' ? 'Завантажити' : 'Download'}
                  </button>
                </div>
              )}
            </div>

            {showPreview && generatedCode ? (
              <div className="bg-white rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  srcDoc={generatedCode}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-xl p-4 overflow-auto max-h-[600px]">
                {generatedCode ? (
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {generatedCode}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        {language === 'uk' ? 'Код з\'явиться тут' : 'Code will appear here'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {language === 'uk' 
                          ? 'Оберіть жанр, введіть промт та натисніть "Згенерувати"' 
                          : 'Select genre, enter prompt and click "Generate"'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
