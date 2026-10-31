# 🧠 Local Flow AI

**Повноцінна локальна AI платформа з 10 нейромережами**

![Local Flow AI](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Web-lightgrey)

---

## ✨ Можливості

### 🤖 10 нейромереж:

#### Текстові моделі:
- **Flow-1 Flash** ⚡ (82M параметрів) - швидкі відповіді
- **Flow-1 Pro** 🧠 (121M параметрів) - загальні завдання
- **Flow-argon 2** 🔥 (271M параметрів) - складні завдання
- **Flow 1.6 Carbon** 💎 (179M параметрів) - англійська + бізнес

#### Мультимедіа:
- **Flow-image 1** 🎨 - генерація зображень (5 стилів)
- **Flow-image 1.5** 🎨 - покращена генерація (6 стилів, до 1536×1536)
- **Flow-omni 1** 🎬 - відео 30 FPS
- **Flow-omni 1.5** 🎬 - відео 60 FPS (без ліміту тривалості)
- **Flow-wan 1** 📦 - 3D моделі з текстових описів
- **Flow-1 Audio** 🎵 - TTS + редактор + генератор музики

### 🛠️ Додаткові модулі:

- **AI Chat** 💬 - чат з AI + веб-пошук
- **Flow Builder** 🔀 - візуальний конструктор AI-процесів
- **AI Агенти** 🤖 - створення спеціалізованих агентів
- **Flow Codex** 💻 - генератор ігор та додатків
- **База знань** 📚 - RAG з завантаженням з URL
- **Вбудований браузер** 🌐 - пошук в інтернеті
- **API Server** 🔌 - локальний API з OpenAI-сумісними endpoints
- **Автоматизація** ⚡ - запуск Flow за розкладом

---

## 🚀 Швидкий старт

### Веб-версія:
```bash
npm install
npm run dev
```
Відкрийте http://localhost:1420

### Desktop версія (.exe):
Дивіться [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md)

---

## 📦 Встановлення

### Веб-версія (рекомендовано):
1. Клонуйте репозиторій
2. Встановіть залежності: `npm install`
3. Запустіть: `npm run dev`
4. Відкрийте браузер

### Desktop версія:
1. Встановіть [Node.js](https://nodejs.org/) 18+
2. Встановіть [Rust](https://rustup.rs/)
3. Встановіть Tauri CLI: `npm install -g @tauri-apps/cli`
4. Зберіть: `npm run tauri build`
5. Знайдіть .exe в `src-tauri/target/release/bundle/nsis/`

---

## 🎯 Використання

### AI Chat:
1. Завантажте модель (Flow-1 Flash для початку)
2. Напишіть повідомлення
3. Отримайте відповідь
4. Використовуйте 🔎 для веб-пошуку

### Генерація зображень:
1. Перейдіть у "Генерація зображень"
2. Оберіть модель (Flow-image 1 або 1.5)
3. Введіть промт
4. Оберіть стиль та якість
5. Натисніть "Згенерувати"

### Генерація відео:
1. Перейдіть у "Генерація відео"
2. Оберіть модель (Flow-omni 1 або 1.5)
3. Введіть промт
4. Налаштуйте тривалість та стиль
5. Натисніть "Згенерувати"

### 3D моделювання:
1. Перейдіть у "3D Моделювання"
2. Оберіть Flow-wan 1
3. Опишіть об'єкт (cube, sphere, car, тощо)
4. Оберіть колір
5. Натисніть "Створити 3D-модель"
6. Експортуйте у OBJ формат

### Аудіо:
1. Перейдіть у "Аудіо AI"
2. **Озвучення:** Введіть текст → оберіть голос → натисніть "Озвучити"
3. **Редактор:** Завантажте файл → налаштуйте ефекти → застосуйте
4. **Генератор:** Оберіть жанр (фонк, lo-fi, тощо) → налаштуйте параметри → згенеруйте

### Flow Codex:
1. Перейдіть у "Flow Codex"
2. Оберіть категорію (Ігри / Додатки)
3. Виберіть жанр
4. Вкажіть кількість рядків (100-1000)
5. Введіть промт
6. Натисніть "Згенерувати код"
7. Перегляньте прев'ю або завантажте HTML

---

## 🔧 Налаштування

### Моделі:
- Перейдіть у "Моделі"
- Завантажте потрібну модель
- Активуйте для використання

### AI параметри:
- Перейдіть у "Налаштування" → "AI Settings"
- Temperature: 0.0 - 2.0 (креативність)
- Top-P: 0.0 - 1.0 (різноманітність)
- Top-K: 1 - 100 (фокус)
- Max Tokens: 256 - 2048 (довжина відповіді)

### Приватність:
- Всі дані зберігаються локально
- Немає телеметрії
- Моделі працюють офлайн після завантаження
- Немає хмарних сервісів

---

## 📊 Системні вимоги

### Мінімальні:
- **ОС:** Windows 10/11 (64-bit) або сучасний браузер
- **RAM:** 4 GB
- **Диск:** 2 GB вільного місця
- **GPU:** Будь-який з підтримкою WebGL

### Рекомендовані:
- **ОС:** Windows 11 (64-bit)
- **RAM:** 8 GB+
- **Диск:** 10 GB+ SSD
- **GPU:** NVIDIA/AMD з 4GB+ VRAM

---

## 🏗️ Архітектура

```
Local Flow AI/
├── src/
│   ├── components/       # React компоненти
│   ├── pages/           # Сторінки додатку
│   ├── services/        # AI сервіси
│   │   ├── neuralEngine.ts      # Текстові моделі
│   │   ├── imageGenerator.ts    # Flow-image 1
│   │   ├── imageGeneratorV2.ts  # Flow-image 1.5
│   │   ├── videoGenerator.ts    # Flow-omni 1
│   │   ├── videoGeneratorV2.ts  # Flow-omni 1.5
│   │   ├── model3DGenerator.ts  # Flow-wan 1
│   │   └── webSearch.ts         # Веб-пошук
│   ├── store.ts         # Zustand store
│   ├── i18n.ts          # Переклади
│   └── App.tsx          # Головний компонент
├── src-tauri/           # Tauri backend (для .exe)
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── dist/                # Зібрана веб-версія
```

---

## 🤝 Внесок

Вітаємо внески! Якщо хочете допомогти:
1. Fork репозиторію
2. Створіть гілку: `git checkout -b feature/amazing-feature`
3. Commit зміни: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Відкрийте Pull Request

---

## 📝 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) файл

---

## 🙏 Подяки

- [Transformers.js](https://github.com/xenova/transformers.js) - AI моделі в браузері
- [Three.js](https://threejs.org/) - 3D рендеринг
- [React](https://react.dev/) - UI фреймворк
- [Tauri](https://tauri.app/) - Desktop фреймворк

---

## 📞 Підтримка

- 📖 [Документація](BUILD_INSTRUCTIONS.md)
- 🐛 [Проблеми](https://github.com/yourusername/local-flow-ai/issues)
- 💬 [Обговорення](https://github.com/yourusername/local-flow-ai/discussions)

---

**Створено з ❤️ для локального AI**

*Local Flow AI v1.0.0*
