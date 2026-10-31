# Local Flow AI - Інструкція зі збірки .exe файлу

## 🚀 Швидкий старт (Web версія)

### Веб-версія (без компіляції):
```bash
npm install
npm run dev
```
Відкрийте http://localhost:1420

---

## 📦 Збірка .exe файлу (Tauri)

### Вимоги:
1. **Node.js** 18+ - [Завантажити](https://nodejs.org/)
2. **Rust** - [Завантажити](https://rustup.rs/)
3. **Visual Studio Build Tools** (Windows) - [Завантажити](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
4. **WebView2** (Windows 10/11) - зазвичай вже встановлено

### Кроки збірки:

#### 1. Встановіть Tauri CLI
```bash
npm install -g @tauri-apps/cli
```

#### 2. Встановіть залежності
```bash
npm install
```

#### 3. Зберіть .exe файл
```bash
npm run tauri build
```

#### 4. Знайдіть .exe файл
Після збірки файл буде в:
```
src-tauri/target/release/bundle/nsis/Local Flow AI_1.0.0_x64-setup.exe
```

---

## 🔧 Альтернатива: Electron

Якщо Tauri не працює, можна використати Electron:

### 1. Встановіть Electron
```bash
npm install --save-dev electron electron-builder
```

### 2. Створіть `electron.js` в корені:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icon.png')
  });

  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### 3. Додайте в `package.json`:
```json
{
  "main": "electron.js",
  "scripts": {
    "electron": "electron .",
    "build:exe": "electron-builder"
  },
  "build": {
    "appId": "com.localflowai.app",
    "productName": "Local Flow AI",
    "win": {
      "target": "nsis",
      "icon": "icon.png"
    }
  }
}
```

### 4. Зберіть:
```bash
npm run build
npm run build:exe
```

---

## 📋 Системні вимоги

### Мінімальні:
- **ОС:** Windows 10/11 (64-bit)
- **RAM:** 4 GB
- **Диск:** 2 GB вільного місця
- **GPU:** Будь-який з підтримкою WebGL

### Рекомендовані:
- **ОС:** Windows 11 (64-bit)
- **RAM:** 8 GB+
- **Диск:** 10 GB+ SSD
- **GPU:** NVIDIA/AMD з 4GB+ VRAM

---

## 🎯 Функціонал

### Текстові моделі:
- ✅ Flow-1 Flash (82M параметрів)
- ✅ Flow-1 Pro (121M параметрів)
- ✅ Flow-argon 2 (271M параметрів)
- ✅ Flow 1.6 Carbon (179M параметрів)

### Мультимедіа:
- ✅ Flow-image 1 (генерація зображень)
- ✅ Flow-image 1.5 (покращена генерація)
- ✅ Flow-omni 1 (відео 30 FPS)
- ✅ Flow-omni 1.5 (відео 60 FPS)
- ✅ Flow-wan 1 (3D моделі)
- ✅ Flow-1 Audio (TTS + редактор + генератор)

### Додаткові модулі:
- ✅ AI Chat з веб-пошуком
- ✅ Flow Builder (візуальний конструктор)
- ✅ AI Агенти
- ✅ Flow Codex (генератор ігор/додатків)
- ✅ База знань з RAG
- ✅ Вбудований браузер
- ✅ API Server

---

## 🐛 Вирішення проблем

### Помилка: "Rust compiler not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Помилка: "WebView2 not found"
Завантажте та встановіть [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### Помилка: "Build tools not found"
Встановіть [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) з опцією "Desktop development with C++"

---

## 📞 Підтримка

Якщо виникли проблеми:
1. Перевірте системні вимоги
2. Оновіть Node.js та Rust до останніх версій
3. Видаліть `node_modules` та `src-tauri/target`
4. Спробуйте знову: `npm install && npm run tauri build`

---

**Local Flow AI v1.0.0** - Повноцінна локальна AI платформа
