#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        Local Flow AI - Автоматична збірка .exe           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ПОМИЛКА] Node.js не знайдено!"
    echo ""
    echo "Будь ласка, встановіть Node.js:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[✓] Node.js знайдено"
node --version
echo ""

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "[ПОМИЛКА] Rust не знайдено!"
    echo ""
    echo "Будь ласка, встановіть Rust:"
    echo "https://rustup.rs/"
    echo ""
    exit 1
fi

echo "[✓] Rust знайдено"
rustc --version
echo ""

# Check if Tauri CLI is installed
if ! command -v tauri &> /dev/null; then
    echo "[ІНФОРМАЦІЯ] Tauri CLI не знайдено. Встановлюю..."
    echo ""
    npm install -g @tauri-apps/cli
    if [ $? -ne 0 ]; then
        echo "[ПОМИЛКА] Не вдалося встановити Tauri CLI"
        exit 1
    fi
fi

echo "[✓] Tauri CLI знайдено"
tauri --version
echo ""

# Install dependencies
echo "[КРОК 1/3] Встановлення залежностей..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo "[ПОМИЛКА] Не вдалося встановити залежності"
    exit 1
fi
echo ""

# Build the application
echo "[КРОК 2/3] Збірка додатку..."
echo ""
echo "Це може зайняти 5-15 хвилин..."
echo ""
npm run tauri build
if [ $? -ne 0 ]; then
    echo "[ПОМИЛКА] Не вдалося зібрати додаток"
    exit 1
fi
echo ""

# Find the executable
echo "[КРОК 3/3] Пошук виконуваного файлу..."
echo ""

EXE_PATH="src-tauri/target/release/bundle"

if [ -d "$EXE_PATH" ]; then
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║                    ✓ ЗБІРКА УСПІШНА!                     ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "Виконувані файли знайдено:"
    echo ""
    find "$EXE_PATH" -type f \( -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" \) -exec ls -lh {} \;
    echo ""
    echo "Повний шлях:"
    echo "$(pwd)/$EXE_PATH"
    echo ""
else
    echo "[ПОМИЛКА] Виконувані файли не знайдено"
    echo ""
    echo "Перевірте папку: $EXE_PATH"
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              Local Flow AI готовий до використання!       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
