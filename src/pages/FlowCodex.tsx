import React, { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';
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
  { id: 'rpg', name: { uk: 'RPG', en: 'RPG' }, icon: '🗡️', category: 'game', description: { uk: 'Рольові ігри з прокачкою', en: 'Role-playing games' } },
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
  { id: 'productivity', name: { uk: 'Продуктивність', en: 'Productivity' }, icon: '📋', category: 'app', description: { uk: 'Нотатки, задачі', en: 'Notes, tasks' } },
  { id: 'social', name: { uk: 'Соціальні', en: 'Social' }, icon: '💬', category: 'app', description: { uk: 'Соціальні мережі, чати', en: 'Social networks, chats' } },
  { id: 'education', name: { uk: 'Навчання', en: 'Education' }, icon: '📚', category: 'app', description: { uk: 'Навчальні додатки', en: 'Learning apps' } },
  { id: 'health', name: { uk: "Здоров'я", en: 'Health' }, icon: '💪', category: 'app', description: { uk: "Фітнес, здоров'я", en: 'Fitness, health' } },
  { id: 'finance', name: { uk: 'Фінанси', en: 'Finance' }, icon: '💰', category: 'app', description: { uk: 'Бюджет, витрати', en: 'Budget, expenses' } },
  { id: 'entertainment', name: { uk: 'Розваги', en: 'Entertainment' }, icon: '🎬', category: 'app', description: { uk: 'Медіа, музика', en: 'Media, music' } },
  { id: 'business', name: { uk: 'Бізнес', en: 'Business' }, icon: '💼', category: 'app', description: { uk: 'CRM, управління', en: 'CRM, management' } },
  { id: 'utility', name: { uk: 'Утиліти', en: 'Utility' }, icon: '🔧', category: 'app', description: { uk: 'Інструменти', en: 'Tools' } },
];

const LINE_OPTIONS = [
  { value: 100, label: { uk: '~100 рядків (базовий)', en: '~100 lines (basic)' } },
  { value: 200, label: { uk: '~200 рядків (середній)', en: '~200 lines (medium)' } },
  { value: 400, label: { uk: '~400 рядків (розширений)', en: '~400 lines (extended)' } },
  { value: 600, label: { uk: '~600 рядків (повний)', en: '~600 lines (full)' } },
  { value: 1000, label: { uk: '~1000 рядків (максимум)', en: '~1000 lines (maximum)' } },
];

export default function FlowCodex() {
  const { language } = useStore();
  const [category, setCategory] = useState<'game' | 'app'>('game');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [prompt, setPrompt] = useState('');
  const [features, setFeatures] = useState('');
  const [designStyle, setDesignStyle] = useState('modern');
  const [lineCount, setLineCount] = useState(200);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentGenres = category === 'game' ? GAME_GENRES : APP_GENRES;

  const generateCode = (): string => {
    if (!selectedGenre) return '';

    const title = prompt.slice(0, 50) || 'Flow Codex Project';
    
    const colorSchemes: Record<string, { primary: string; secondary: string; bg: string; text: string; accent: string }> = {
      modern: { primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f172a', text: '#e2e8f0', accent: '#22d3ee' },
      minimalist: { primary: '#111111', secondary: '#555555', bg: '#fafafa', text: '#111111', accent: '#333333' },
      retro: { primary: '#ff006e', secondary: '#fb5607', bg: '#1a1a2e', text: '#eaeaea', accent: '#ffbe0b' },
      neon: { primary: '#00ff87', secondary: '#60efff', bg: '#0a0a0f', text: '#ffffff', accent: '#ff00ff' },
      dark: { primary: '#1e40af', secondary: '#3b82f6', bg: '#000000', text: '#e5e7eb', accent: '#60a5fa' },
      colorful: { primary: '#ec4899', secondary: '#f59e0b', bg: '#1e1b4b', text: '#ffffff', accent: '#34d399' },
    };
    
    const c = colorSchemes[designStyle] || colorSchemes.modern;
    const isGame = category === 'game';
    const isLarge = lineCount >= 400;
    const isMedium = lineCount >= 200;

    let code = '<!DOCTYPE html>\n';
    code += '<html lang="uk">\n';
    code += '<head>\n';
    code += '    <meta charset="UTF-8">\n';
    code += '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    code += `    <title>${title}</title>\n`;
    code += '    <style>\n';
    code += '        * { margin: 0; padding: 0; box-sizing: border-box; }\n\n';
    code += `        body {\n`;
    code += `            font-family: 'Segoe UI', Tahoma, sans-serif;\n`;
    code += `            background: ${c.bg};\n`;
    code += `            color: ${c.text};\n`;
    code += `            min-height: 100vh;\n`;
    code += `            overflow-x: hidden;\n`;
    code += `        }\n\n`;
    code += `        .header {\n`;
    code += `            background: linear-gradient(135deg, ${c.primary}, ${c.secondary});\n`;
    code += `            padding: 20px 40px;\n`;
    code += `            text-align: center;\n`;
    code += `            box-shadow: 0 4px 20px rgba(0,0,0,0.3);\n`;
    code += `        }\n\n`;
    code += `        .header h1 {\n`;
    code += `            font-size: 2rem;\n`;
    code += `            color: white;\n`;
    code += `            text-shadow: 0 2px 10px rgba(0,0,0,0.3);\n`;
    code += `        }\n\n`;
    code += `        .main { padding: 30px; max-width: 1200px; margin: 0 auto; }\n\n`;

    if (isGame) {
      code += `        .game-area {\n`;
      code += `            position: relative;\n`;
      code += `            width: 100%;\n`;
      code += `            max-width: 800px;\n`;
      code += `            height: 500px;\n`;
      code += `            margin: 20px auto;\n`;
      code += `            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);\n`;
      code += `            border: 3px solid ${c.primary};\n`;
      code += `            border-radius: 15px;\n`;
      code += `            overflow: hidden;\n`;
      code += `            box-shadow: 0 0 30px ${c.primary}40;\n`;
      code += `        }\n\n`;
      code += `        .player {\n`;
      code += `            position: absolute;\n`;
      code += `            width: 40px;\n`;
      code += `            height: 40px;\n`;
      code += `            background: ${c.primary};\n`;
      code += `            border-radius: 50%;\n`;
      code += `            box-shadow: 0 0 15px ${c.primary};\n`;
      code += `            transition: left 0.05s, top 0.05s;\n`;
      code += `            z-index: 10;\n`;
      code += `        }\n\n`;
      code += `        .collectible {\n`;
      code += `            position: absolute;\n`;
      code += `            width: 25px;\n`;
      code += `            height: 25px;\n`;
      code += `            background: ${c.accent};\n`;
      code += `            border-radius: 50%;\n`;
      code += `            box-shadow: 0 0 10px ${c.accent};\n`;
      code += `            animation: pulse 1s infinite alternate;\n`;
      code += `        }\n\n`;
      code += `        @keyframes pulse {\n`;
      code += `            from { transform: scale(1); opacity: 0.8; }\n`;
      code += `            to { transform: scale(1.2); opacity: 1; }\n`;
      code += `        }\n\n`;
      code += `        .hud {\n`;
      code += `            display: flex;\n`;
      code += `            justify-content: space-between;\n`;
      code += `            padding: 15px 30px;\n`;
      code += `            font-size: 1.2rem;\n`;
      code += `            font-weight: bold;\n`;
      code += `        }\n\n`;
      code += `        .controls {\n`;
      code += `            text-align: center;\n`;
      code += `            padding: 20px;\n`;
      code += `        }\n\n`;
      code += `        .btn {\n`;
      code += `            background: linear-gradient(135deg, ${c.primary}, ${c.secondary});\n`;
      code += `            color: white;\n`;
      code += `            border: none;\n`;
      code += `            padding: 12px 35px;\n`;
      code += `            font-size: 1.1rem;\n`;
      code += `            border-radius: 50px;\n`;
      code += `            cursor: pointer;\n`;
      code += `            margin: 5px;\n`;
      code += `            transition: all 0.3s;\n`;
      code += `            box-shadow: 0 4px 15px rgba(0,0,0,0.3);\n`;
      code += `        }\n\n`;
      code += `        .btn:hover {\n`;
      code += `            transform: translateY(-3px);\n`;
      code += `            box-shadow: 0 8px 25px rgba(0,0,0,0.4);\n`;
      code += `        }\n\n`;

      if (isMedium) {
        code += `        .obstacle {\n`;
        code += `            position: absolute;\n`;
        code += `            background: ${c.secondary};\n`;
        code += `            border-radius: 5px;\n`;
        code += `            box-shadow: 0 0 10px ${c.secondary}80;\n`;
        code += `        }\n\n`;
        code += `        .ground {\n`;
        code += `            position: absolute;\n`;
        code += `            bottom: 0;\n`;
        code += `            width: 100%;\n`;
        code += `            height: 50px;\n`;
        code += `            background: linear-gradient(0deg, ${c.primary}40, transparent);\n`;
        code += `        }\n\n`;
        code += `        .particle {\n`;
        code += `            position: absolute;\n`;
        code += `            width: 5px;\n`;
        code += `            height: 5px;\n`;
        code += `            background: ${c.accent};\n`;
        code += `            border-radius: 50%;\n`;
        code += `            pointer-events: none;\n`;
        code += `        }\n\n`;
        code += `        .game-over {\n`;
        code += `            position: absolute;\n`;
        code += `            top: 50%;\n`;
        code += `            left: 50%;\n`;
        code += `            transform: translate(-50%, -50%);\n`;
        code += `            background: rgba(0,0,0,0.8);\n`;
        code += `            padding: 40px;\n`;
        code += `            border-radius: 20px;\n`;
        code += `            text-align: center;\n`;
        code += `            display: none;\n`;
        code += `            z-index: 100;\n`;
        code += `        }\n\n`;
        code += `        .level-indicator {\n`;
        code += `            position: absolute;\n`;
        code += `            top: 10px;\n`;
        code += `            right: 10px;\n`;
        code += `            background: ${c.primary}80;\n`;
        code += `            padding: 5px 15px;\n`;
        code += `            border-radius: 20px;\n`;
        code += `            font-size: 0.9rem;\n`;
        code += `        }\n\n`;
      }
    } else {
      // App styles
      code += `        .card {\n`;
      code += `            background: rgba(255,255,255,0.05);\n`;
      code += `            border: 1px solid rgba(255,255,255,0.1);\n`;
      code += `            border-radius: 15px;\n`;
      code += `            padding: 25px;\n`;
      code += `            margin-bottom: 20px;\n`;
      code += `            backdrop-filter: blur(10px);\n`;
      code += `            transition: transform 0.3s;\n`;
      code += `        }\n\n`;
      code += `        .card:hover { transform: translateY(-3px); }\n\n`;
      code += `        .input-group {\n`;
      code += `            display: flex;\n`;
      code += `            gap: 10px;\n`;
      code += `            margin-bottom: 20px;\n`;
      code += `        }\n\n`;
      code += `        .input-field {\n`;
      code += `            flex: 1;\n`;
      code += `            padding: 12px 20px;\n`;
      code += `            border: 2px solid ${c.primary}40;\n`;
      code += `            border-radius: 12px;\n`;
      code += `            background: rgba(255,255,255,0.05);\n`;
      code += `            color: ${c.text};\n`;
      code += `            font-size: 1rem;\n`;
      code += `            transition: border-color 0.3s;\n`;
      code += `        }\n\n`;
      code += `        .input-field:focus {\n`;
      code += `            outline: none;\n`;
      code += `            border-color: ${c.primary};\n`;
      code += `        }\n\n`;
      code += `        .btn {\n`;
      code += `            background: linear-gradient(135deg, ${c.primary}, ${c.secondary});\n`;
      code += `            color: white;\n`;
      code += `            border: none;\n`;
      code += `            padding: 12px 30px;\n`;
      code += `            border-radius: 12px;\n`;
      code += `            cursor: pointer;\n`;
      code += `            font-size: 1rem;\n`;
      code += `            transition: all 0.3s;\n`;
      code += `        }\n\n`;
      code += `        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px ${c.primary}40; }\n\n`;
      code += `        .list-item {\n`;
      code += `            display: flex;\n`;
      code += `            justify-content: space-between;\n`;
      code += `            align-items: center;\n`;
      code += `            padding: 15px 20px;\n`;
      code += `            background: rgba(255,255,255,0.03);\n`;
      code += `            border-radius: 10px;\n`;
      code += `            margin-bottom: 8px;\n`;
      code += `            transition: background 0.3s;\n`;
      code += `        }\n\n`;
      code += `        .list-item:hover { background: rgba(255,255,255,0.08); }\n\n`;
      code += `        .delete-btn {\n`;
      code += `            background: #ef4444;\n`;
      code += `            color: white;\n`;
      code += `            border: none;\n`;
      code += `            padding: 5px 15px;\n`;
      code += `            border-radius: 8px;\n`;
      code += `            cursor: pointer;\n`;
      code += `            transition: background 0.3s;\n`;
      code += `        }\n\n`;
      code += `        .delete-btn:hover { background: #dc2626; }\n\n`;

      if (isMedium) {
        code += `        .stats {\n`;
        code += `            display: grid;\n`;
        code += `            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n`;
        code += `            gap: 15px;\n`;
        code += `            margin-bottom: 20px;\n`;
        code += `        }\n\n`;
        code += `        .stat-card {\n`;
        code += `            background: linear-gradient(135deg, ${c.primary}20, ${c.secondary}20);\n`;
        code += `            padding: 20px;\n`;
        code += `            border-radius: 12px;\n`;
        code += `            text-align: center;\n`;
        code += `        }\n\n`;
        code += `        .stat-value { font-size: 2rem; font-weight: bold; color: ${c.primary}; }\n`;
        code += `        .stat-label { font-size: 0.85rem; color: ${c.text}99; margin-top: 5px; }\n\n`;
        code += `        .filter-bar {\n`;
        code += `            display: flex;\n`;
        code += `            gap: 10px;\n`;
        code += `            margin-bottom: 20px;\n`;
        code += `            flex-wrap: wrap;\n`;
        code += `        }\n\n`;
        code += `        .filter-btn {\n`;
        code += `            padding: 8px 16px;\n`;
        code += `            border-radius: 20px;\n`;
        code += `            border: 1px solid ${c.primary}40;\n`;
        code += `            background: transparent;\n`;
        code += `            color: ${c.text};\n`;
        code += `            cursor: pointer;\n`;
        code += `            transition: all 0.3s;\n`;
        code += `        }\n\n`;
        code += `        .filter-btn.active {\n`;
        code += `            background: ${c.primary};\n`;
        code += `            border-color: ${c.primary};\n`;
        code += `        }\n\n`;
      }
    }

    code += '    </style>\n';
    code += '</head>\n';
    code += '<body>\n';
    code += `    <div class="header">\n`;
    code += `        <h1>${title}</h1>\n`;
    code += `    </div>\n`;
    code += `    <div class="main">\n`;

    if (isGame) {
      code += `        <div class="hud">\n`;
      code += `            <div>⭐ <span id="score">0</span></div>\n`;
      code += `            <div>🏆 <span id="highScore">0</span></div>\n`;
      if (isMedium) {
        code += `            <div>❤️ <span id="lives">3</span></div>\n`;
        code += `            <div>⏱️ <span id="timer">0</span>s</div>\n`;
      }
      code += `        </div>\n`;
      code += `        <div class="game-area" id="gameArea">\n`;
      code += `            <div class="player" id="player"></div>\n`;
      code += `            <div class="ground"></div>\n`;
      if (isMedium) {
        code += `            <div class="level-indicator" id="levelIndicator">Рівень 1</div>\n`;
        code += `            <div class="game-over" id="gameOver">\n`;
        code += `                <h2 style="font-size:2rem;margin-bottom:15px;">💀 Game Over</h2>\n`;
        code += `                <p style="margin-bottom:20px;">Рахунок: <span id="finalScore">0</span></p>\n`;
        code += `                <button class="btn" onclick="restartGame()">Грати знову</button>\n`;
        code += `            </div>\n`;
      }
      code += `        </div>\n`;
      code += `        <div class="controls">\n`;
      code += `            <button class="btn" id="startBtn" onclick="startGame()">▶ Почати</button>\n`;
      code += `            <button class="btn" id="pauseBtn" onclick="pauseGame()" style="display:none;">⏸ Пауза</button>\n`;
      code += `        </div>\n`;
      code += `        <p style="text-align:center;color:#888;margin-top:10px;">← → для руху, Пробіл для стрибка</p>\n`;
    } else {
      if (isMedium) {
        code += `        <div class="stats">\n`;
        code += `            <div class="stat-card">\n`;
        code += `                <div class="stat-value" id="totalCount">0</div>\n`;
        code += `                <div class="stat-label">Всього записів</div>\n`;
        code += `            </div>\n`;
        code += `            <div class="stat-card">\n`;
        code += `                <div class="stat-value" id="todayCount">0</div>\n`;
        code += `                <div class="stat-label">Сьогодні</div>\n`;
        code += `            </div>\n`;
        code += `            <div class="stat-card">\n`;
        code += `                <div class="stat-value" id="weekCount">0</div>\n`;
        code += `                <div class="stat-label">Цього тижня</div>\n`;
        code += `            </div>\n`;
        code += `        </div>\n`;
        code += `        <div class="filter-bar">\n`;
        code += `            <button class="filter-btn active" onclick="filterItems('all')">Всі</button>\n`;
        code += `            <button class="filter-btn" onclick="filterItems('today')">Сьогодні</button>\n`;
        code += `            <button class="filter-btn" onclick="filterItems('week')">Тиждень</button>\n`;
        code += `        </div>\n`;
      }
      code += `        <div class="card">\n`;
      code += `            <div class="input-group">\n`;
      code += `                <input type="text" class="input-field" id="inputField" placeholder="Введіть дані...">\n`;
      code += `                <button class="btn" onclick="addItem()">+ Додати</button>\n`;
      code += `            </div>\n`;
      code += `            <div id="listContainer"></div>\n`;
      code += `        </div>\n`;
    }

    code += `    </div>\n\n`;
    code += `    <script>\n`;

    if (isGame) {
      code += generateGameJS(c, isMedium, isLarge);
    } else {
      code += generateAppJS(c, isMedium, isLarge);
    }

    code += `    </script>\n`;
    code += `</body>\n`;
    code += `</html>`;

    return code;
  };

  const generateGameJS = (c: { primary: string; secondary: string; accent: string }, isMedium: boolean, isLarge: boolean): string => {
    let js = '';
    js += `        // === Flow Codex Game Engine ===\n`;
    js += `        const gameArea = document.getElementById('gameArea');\n`;
    js += `        const playerEl = document.getElementById('player');\n`;
    js += `        const scoreEl = document.getElementById('score');\n`;
    js += `        const highScoreEl = document.getElementById('highScore');\n`;
    js += `        const startBtn = document.getElementById('startBtn');\n`;
    js += `        const pauseBtn = document.getElementById('pauseBtn');\n\n`;
    
    js += `        let state = {\n`;
    js += `            running: false,\n`;
    js += `            paused: false,\n`;
    js += `            score: 0,\n`;
    js += `            highScore: parseInt(localStorage.getItem('flowCodex_highScore') || '0'),\n`;
    js += `            playerX: 380,\n`;
    js += `            playerY: 400,\n`;
    js += `            velY: 0,\n`;
    js += `            speed: 5,\n`;
    js += `            gravity: 0.6,\n`;
    js += `            jumpPower: -13,\n`;
    js += `            keys: {},\n`;
    js += `            collectibles: [],\n`;
    js += `            animFrame: null\n`;
    js += `        };\n\n`;

    if (isMedium) {
      js += `        state.lives = 3;\n`;
      js += `        state.level = 1;\n`;
      js += `        state.timer = 0;\n`;
      js += `        state.obstacles = [];\n`;
      js += `        state.particles = [];\n\n`;
      js += `        const livesEl = document.getElementById('lives');\n`;
      js += `        const timerEl = document.getElementById('timer');\n`;
      js += `        const levelEl = document.getElementById('levelIndicator');\n`;
      js += `        const gameOverEl = document.getElementById('gameOver');\n`;
      js += `        const finalScoreEl = document.getElementById('finalScore');\n\n`;
    }

    js += `        highScoreEl.textContent = state.highScore;\n\n`;

    js += `        // Input handling\n`;
    js += `        document.addEventListener('keydown', (e) => {\n`;
    js += `            state.keys[e.key] = true;\n`;
    js += `            if (e.key === ' ' && state.running && state.playerY >= 400) {\n`;
    js += `                state.velY = state.jumpPower;\n`;
    js += `                e.preventDefault();\n`;
    js += `            }\n`;
    js += `        });\n`;
    js += `        document.addEventListener('keyup', (e) => { state.keys[e.key] = false; });\n\n`;

    js += `        // Spawn collectibles\n`;
    js += `        function spawnCollectible() {\n`;
    js += `            const el = document.createElement('div');\n`;
    js += `            el.className = 'collectible';\n`;
    js += `            const x = Math.random() * 720 + 20;\n`;
    js += `            const y = Math.random() * 350 + 50;\n`;
    js += `            el.style.left = x + 'px';\n`;
    js += `            el.style.top = y + 'px';\n`;
    js += `            gameArea.appendChild(el);\n`;
    js += `            state.collectibles.push({ el, x, y, collected: false });\n`;
    js += `        }\n\n`;

    if (isMedium) {
      js += `        // Spawn obstacles\n`;
      js += `        function spawnObstacle() {\n`;
      js += `            const el = document.createElement('div');\n`;
      js += `            el.className = 'obstacle';\n`;
      js += `            const w = 30 + Math.random() * 40;\n`;
      js += `            const h = 30 + Math.random() * 40;\n`;
      js += `            el.style.width = w + 'px';\n`;
      js += `            el.style.height = h + 'px';\n`;
      js += `            el.style.left = '800px';\n`;
      js += `            el.style.bottom = '50px';\n`;
      js += `            gameArea.appendChild(el);\n`;
      js += `            state.obstacles.push({ el, x: 800, w, h, speed: 2 + state.level });\n`;
      js += `        }\n\n`;

      js += `        // Create particles\n`;
      js += `        function createParticles(x, y, color) {\n`;
      js += `            for (let i = 0; i < 8; i++) {\n`;
      js += `                const p = document.createElement('div');\n`;
      js += `                p.className = 'particle';\n`;
      js += `                p.style.left = x + 'px';\n`;
      js += `                p.style.top = y + 'px';\n`;
      js += `                p.style.background = color;\n`;
      js += `                gameArea.appendChild(p);\n`;
      js += `                state.particles.push({\n`;
      js += `                    el: p, x, y,\n`;
      js += `                    vx: (Math.random() - 0.5) * 8,\n`;
      js += `                    vy: (Math.random() - 0.5) * 8,\n`;
      js += `                    life: 30\n`;
      js += `                });\n`;
      js += `            }\n`;
      js += `        }\n\n`;
    }

    js += `        // Collision detection\n`;
    js += `        function checkCollision(ax, ay, aw, ah, bx, by, bw, bh) {\n`;
    js += `            return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;\n`;
    js += `        }\n\n`;

    js += `        // Main game loop\n`;
    js += `        function gameLoop() {\n`;
    js += `            if (!state.running || state.paused) return;\n\n`;
    js += `            // Player movement\n`;
    js += `            if (state.keys['ArrowLeft'] && state.playerX > 0) state.playerX -= state.speed;\n`;
    js += `            if (state.keys['ArrowRight'] && state.playerX < 740) state.playerX += state.speed;\n\n`;
    js += `            // Gravity\n`;
    js += `            state.velY += state.gravity;\n`;
    js += `            state.playerY += state.velY;\n`;
    js += `            if (state.playerY >= 400) { state.playerY = 400; state.velY = 0; }\n\n`;
    js += `            // Update player\n`;
    js += `            playerEl.style.left = state.playerX + 'px';\n`;
    js += `            playerEl.style.top = state.playerY + 'px';\n\n`;

    js += `            // Check collectibles\n`;
    js += `            state.collectibles.forEach((c, i) => {\n`;
    js += `                if (!c.collected && checkCollision(state.playerX, state.playerY, 40, 40, c.x, c.y, 25, 25)) {\n`;
    js += `                    c.collected = true;\n`;
    js += `                    c.el.remove();\n`;
    js += `                    state.score += 10;\n`;
    js += `                    scoreEl.textContent = state.score;\n`;
    js += `                    spawnCollectible();\n`;
    if (isMedium) {
      js += `                    createParticles(c.x, c.y, '${c.accent}');\n`;
    }
    js += `                }\n`;
    js += `            });\n\n`;

    if (isMedium) {
      js += `            // Update obstacles\n`;
      js += `            state.obstacles.forEach((o, i) => {\n`;
      js += `                o.x -= o.speed;\n`;
      js += `                o.el.style.left = o.x + 'px';\n`;
      js += `                if (o.x < -100) { o.el.remove(); state.obstacles.splice(i, 1); return; }\n`;
      js += `                if (checkCollision(state.playerX, state.playerY, 40, 40, o.x, 420, o.w, o.h)) {\n`;
      js += `                    state.lives--;\n`;
      js += `                    livesEl.textContent = state.lives;\n`;
      js += `                    createParticles(state.playerX + 20, state.playerY + 20, '#ef4444');\n`;
      js += `                    o.el.remove();\n`;
      js += `                    state.obstacles.splice(i, 1);\n`;
      js += `                    if (state.lives <= 0) { endGame(); return; }\n`;
      js += `                }\n`;
      js += `            });\n\n`;

      js += `            // Update particles\n`;
      js += `            state.particles.forEach((p, i) => {\n`;
      js += `                p.x += p.vx;\n`;
      js += `                p.y += p.vy;\n`;
      js += `                p.life--;\n`;
      js += `                p.el.style.left = p.x + 'px';\n`;
      js += `                p.el.style.top = p.y + 'px';\n`;
      js += `                p.el.style.opacity = p.life / 30;\n`;
      js += `                if (p.life <= 0) { p.el.remove(); state.particles.splice(i, 1); }\n`;
      js += `            });\n\n`;

      js += `            // Timer and level\n`;
      js += `            if (Date.now() % 1000 < 20) {\n`;
      js += `                state.timer++;\n`;
      js += `                timerEl.textContent = state.timer;\n`;
      js += `                if (state.timer % 15 === 0 && state.level < 10) {\n`;
      js += `                    state.level++;\n`;
      js += `                    levelEl.textContent = 'Рівень ' + state.level;\n`;
      js += `                    state.speed += 0.5;\n`;
      js += `                }\n`;
      js += `            }\n\n`;

      js += `            // Spawn obstacles periodically\n`;
      js += `            if (Math.random() < 0.02 + state.level * 0.005) spawnObstacle();\n\n`;
    }

    js += `            state.animFrame = requestAnimationFrame(gameLoop);\n`;
    js += `        }\n\n`;

    js += `        // Start game\n`;
    js += `        function startGame() {\n`;
    js += `            state.running = true;\n`;
    js += `            state.paused = false;\n`;
    js += `            state.score = 0;\n`;
    js += `            state.playerX = 380;\n`;
    js += `            state.playerY = 400;\n`;
    js += `            state.velY = 0;\n`;
    js += `            scoreEl.textContent = '0';\n`;
    if (isMedium) {
      js += `            state.lives = 3;\n`;
      js += `            state.level = 1;\n`;
      js += `            state.timer = 0;\n`;
      js += `            state.speed = 5;\n`;
      js += `            livesEl.textContent = '3';\n`;
      js += `            timerEl.textContent = '0';\n`;
      js += `            levelEl.textContent = 'Рівень 1';\n`;
      js += `            gameOverEl.style.display = 'none';\n`;
      js += `            state.obstacles.forEach(o => o.el.remove());\n`;
      js += `            state.obstacles = [];\n`;
    }
    js += `            state.collectibles.forEach(c => c.el.remove());\n`;
    js += `            state.collectibles = [];\n`;
    js += `            for (let i = 0; i < 5; i++) spawnCollectible();\n`;
    js += `            startBtn.style.display = 'none';\n`;
    js += `            pauseBtn.style.display = 'inline-block';\n`;
    js += `            gameLoop();\n`;
    js += `        }\n\n`;

    js += `        // Pause game\n`;
    js += `        function pauseGame() {\n`;
    js += `            state.paused = !state.paused;\n`;
    js += `            pauseBtn.textContent = state.paused ? '▶ Продовжити' : '⏸ Пауза';\n`;
    js += `            if (!state.paused) gameLoop();\n`;
    js += `        }\n\n`;

    if (isMedium) {
      js += `        // End game\n`;
      js += `        function endGame() {\n`;
      js += `            state.running = false;\n`;
      js += `            if (state.score > state.highScore) {\n`;
      js += `                state.highScore = state.score;\n`;
      js += `                localStorage.setItem('flowCodex_highScore', state.highScore);\n`;
      js += `                highScoreEl.textContent = state.highScore;\n`;
      js += `            }\n`;
      js += `            finalScoreEl.textContent = state.score;\n`;
      js += `            gameOverEl.style.display = 'block';\n`;
      js += `            startBtn.style.display = 'inline-block';\n`;
      js += `            pauseBtn.style.display = 'none';\n`;
      js += `            startBtn.textContent = '▶ Грати знову';\n`;
      js += `        }\n\n`;

      js += `        // Restart game\n`;
      js += `        function restartGame() { startGame(); }\n\n`;
    } else {
      js += `        // End game (simple)\n`;
      js += `        function endGame() {\n`;
      js += `            state.running = false;\n`;
      js += `            if (state.score > state.highScore) {\n`;
      js += `                state.highScore = state.score;\n`;
      js += `                localStorage.setItem('flowCodex_highScore', state.highScore);\n`;
      js += `                highScoreEl.textContent = state.highScore;\n`;
      js += `            }\n`;
      js += `            alert('Game Over! Рахунок: ' + state.score);\n`;
      js += `            startBtn.style.display = 'inline-block';\n`;
      js += `            pauseBtn.style.display = 'none';\n`;
      js += `        }\n\n`;
    }

    return js;
  };

  const generateAppJS = (c: { primary: string; secondary: string; accent: string }, isMedium: boolean, isLarge: boolean): string => {
    let js = '';
    js += `        // === Flow Codex App Engine ===\n`;
    js += `        const inputField = document.getElementById('inputField');\n`;
    js += `        const listContainer = document.getElementById('listContainer');\n\n`;
    
    js += `        let items = JSON.parse(localStorage.getItem('flowCodex_items') || '[]');\n`;
    js += `        let currentFilter = 'all';\n\n`;

    if (isMedium) {
      js += `        const totalCountEl = document.getElementById('totalCount');\n`;
      js += `        const todayCountEl = document.getElementById('todayCount');\n`;
      js += `        const weekCountEl = document.getElementById('weekCount');\n\n`;
    }

    js += `        // Render items\n`;
    js += `        function renderItems() {\n`;
    js += `            listContainer.innerHTML = '';\n`;
    js += `            const now = Date.now();\n`;
    js += `            const dayMs = 86400000;\n`;
    js += `            const weekMs = dayMs * 7;\n\n`;
    js += `            let filtered = items;\n`;
    js += `            if (currentFilter === 'today') {\n`;
    js += `                filtered = items.filter(i => now - i.date < dayMs);\n`;
    js += `            } else if (currentFilter === 'week') {\n`;
    js += `                filtered = items.filter(i => now - i.date < weekMs);\n`;
    js += `            }\n\n`;
    js += `            filtered.forEach((item, index) => {\n`;
    js += `                const div = document.createElement('div');\n`;
    js += `                div.className = 'list-item';\n`;
    js += `                const timeStr = new Date(item.date).toLocaleString('uk-UA');\n`;
    js += `                div.innerHTML = '<div><strong>' + item.text + '</strong><br><small style="opacity:0.5">' + timeStr + '</small></div>';\n`;
    js += `                const delBtn = document.createElement('button');\n`;
    js += `                delBtn.className = 'delete-btn';\n`;
    js += `                delBtn.textContent = '✕';\n`;
    js += `                delBtn.onclick = () => deleteItem(item.id);\n`;
    js += `                div.appendChild(delBtn);\n`;
    js += `                listContainer.appendChild(div);\n`;
    js += `            });\n\n`;

    if (isMedium) {
      js += `            // Update stats\n`;
      js += `            totalCountEl.textContent = items.length;\n`;
      js += `            todayCountEl.textContent = items.filter(i => now - i.date < dayMs).length;\n`;
      js += `            weekCountEl.textContent = items.filter(i => now - i.date < weekMs).length;\n`;
    }

    js += `        }\n\n`;

    js += `        // Add item\n`;
    js += `        function addItem() {\n`;
    js += `            const value = inputField.value.trim();\n`;
    js += `            if (!value) return;\n`;
    js += `            items.unshift({ id: Date.now(), text: value, date: Date.now() });\n`;
    js += `            localStorage.setItem('flowCodex_items', JSON.stringify(items));\n`;
    js += `            inputField.value = '';\n`;
    js += `            renderItems();\n`;
    js += `        }\n\n`;

    js += `        // Delete item\n`;
    js += `        function deleteItem(id) {\n`;
    js += `            items = items.filter(i => i.id !== id);\n`;
    js += `            localStorage.setItem('flowCodex_items', JSON.stringify(items));\n`;
    js += `            renderItems();\n`;
    js += `        }\n\n`;

    if (isMedium) {
      js += `        // Filter items\n`;
      js += `        function filterItems(filter) {\n`;
      js += `            currentFilter = filter;\n`;
      js += `            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));\n`;
      js += `            event.target.classList.add('active');\n`;
      js += `            renderItems();\n`;
      js += `        }\n\n`;
    }

    js += `        // Enter key support\n`;
    js += `        inputField.addEventListener('keypress', (e) => {\n`;
    js += `            if (e.key === 'Enter') addItem();\n`;
    js += `        });\n\n`;

    js += `        // Initial render\n`;
    js += `        renderItems();\n`;

    return js;
  };

  const handleGenerate = () => {
    if (!prompt.trim() || !selectedGenre) return;
    
    setIsGenerating(true);
    setGeneratedCode('');
    setShowPreview(false);

    // Generate code in steps for visual effect
    setTimeout(() => {
      const code = generateCode();
      setGeneratedCode(code);
      setIsGenerating(false);
    }, 500);
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
    a.download = (selectedGenre?.id || 'project') + '-' + Date.now() + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const codeLines = generatedCode ? generatedCode.split('\n').length : 0;

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
              ? 'Генератор ігор та додатків з повноцінним кодом' 
              : 'Game and app generator with full code'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Категорія' : 'Category'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setCategory('game'); setSelectedGenre(null); }}
                className={'px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ' +
                  (category === 'game' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50')}
              >
                <Gamepad2 className="w-4 h-4" />
                {language === 'uk' ? 'Ігри' : 'Games'}
              </button>
              <button
                onClick={() => { setCategory('app'); setSelectedGenre(null); }}
                className={'px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ' +
                  (category === 'app' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50')}
              >
                <Smartphone className="w-4 h-4" />
                {language === 'uk' ? 'Додатки' : 'Apps'}
              </button>
            </div>
          </div>

          {/* Genre */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? 'Жанр' : 'Genre'}
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {currentGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre)}
                  className={'px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ' +
                    (selectedGenre?.id === genre.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50')}
                >
                  <span>{genre.icon}</span>
                  <span className="truncate">{genre.name[language]}</span>
                </button>
              ))}
            </div>
            {selectedGenre && (
              <p className="text-xs text-slate-500 mt-2">{selectedGenre.description[language]}</p>
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
              <option value="modern">{language === 'uk' ? '🎨 Сучасний' : '🎨 Modern'}</option>
              <option value="minimalist">{language === 'uk' ? '◻️ Мінімалізм' : '◻️ Minimalist'}</option>
              <option value="retro">{language === 'uk' ? '📼 Ретро' : '📼 Retro'}</option>
              <option value="neon">{language === 'uk' ? '💡 Неон' : '💡 Neon'}</option>
              <option value="dark">{language === 'uk' ? '🌑 Темний' : '🌑 Dark'}</option>
              <option value="colorful">{language === 'uk' ? '🌈 Яскравий' : '🌈 Colorful'}</option>
            </select>
          </div>

          {/* Line Count */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? '📏 Кількість рядків коду' : '📏 Code Lines Count'}
            </h3>
            <select
              value={lineCount}
              onChange={(e) => setLineCount(parseInt(e.target.value))}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              {LINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label[language]}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              {language === 'uk' 
                ? 'Більше рядків = більше функцій та деталей' 
                : 'More lines = more features and details'}
            </p>
          </div>

          {/* Prompt */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? '✏️ Промт' : '✏️ Prompt'}
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={language === 'uk'
                ? 'Опишіть вашу гру або додаток...'
                : 'Describe your game or app...'}
              rows={3}
              className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          {/* Features */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              {language === 'uk' ? '⚙️ Додаткові функції' : '⚙️ Additional Features'}
            </h3>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder={language === 'uk'
                ? 'Додаткові вимоги...'
                : 'Additional requirements...'}
              rows={2}
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
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                {language === 'uk' ? 'Згенерований код' : 'Generated Code'}
                {codeLines > 0 && (
                  <span className="text-xs text-slate-500">({codeLines} {language === 'uk' ? 'рядків' : 'lines'})</span>
                )}
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
                    {copied ? '✓' : (language === 'uk' ? 'Копіювати' : 'Copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    {language === 'uk' ? 'HTML' : 'HTML'}
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
              <div className="bg-slate-900/50 rounded-xl p-4 overflow-auto" style={{ maxHeight: '600px' }}>
                {generatedCode ? (
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {generatedCode}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center" style={{ height: '400px' }}>
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
