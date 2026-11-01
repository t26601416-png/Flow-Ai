@echo off
chcp 65001 >nul
title Local Flow AI - Build .exe
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║        Local Flow AI - Автоматична збірка .exe           ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ПОМИЛКА] Node.js не знайдено!
    echo.
    echo Будь ласка, встановіть Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js знайдено
node --version
echo.

:: Check if Rust is installed
where rustc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ПОМИЛКА] Rust не знайдено!
    echo.
    echo Будь ласка, встановіть Rust:
    echo https://rustup.rs/
    echo.
    pause
    exit /b 1
)

echo [✓] Rust знайдено
rustc --version
echo.

:: Check if Tauri CLI is installed
where tauri >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ІНФОРМАЦІЯ] Tauri CLI не знайдено. Встановлюю...
    echo.
    npm install -g @tauri-apps/cli
    if %ERRORLEVEL% NEQ 0 (
        echo [ПОМИЛКА] Не вдалося встановити Tauri CLI
        pause
        exit /b 1
    )
)

echo [✓] Tauri CLI знайдено
tauri --version
echo.

:: Install dependencies
echo [КРОК 1/3] Встановлення залежностей...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ПОМИЛКА] Не вдалося встановити залежності
    pause
    exit /b 1
)
echo.

:: Build the application
echo [КРОК 2/3] Збірка додатку...
echo.
echo Це може зайняти 5-15 хвилин...
echo.
call npm run tauri build
if %ERRORLEVEL% NEQ 0 (
    echo [ПОМИЛКА] Не вдалося зібрати додаток
    pause
    exit /b 1
)
echo.

:: Find the .exe file
echo [КРОК 3/3] Пошук .exe файлу...
echo.

set "EXE_PATH=src-tauri\target\release\bundle\nsis"

if exist "%EXE_PATH%\*.exe" (
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                                                           ║
    echo ║                    ✓ ЗБІРКА УСПІШНА!                     ║
    echo ║                                                           ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    echo .exe файл знайдено:
    echo.
    dir /b "%EXE_PATH%\*.exe"
    echo.
    echo Повний шлях:
    echo %CD%\%EXE_PATH%\
    echo.
    echo Бажаєте відкрити папку з .exe файлом? (Y/N)
    set /p OPEN_FOLDER=
    if /i "%OPEN_FOLDER%"=="Y" (
        explorer "%EXE_PATH%"
    )
) else (
    echo [ПОМИЛКА] .exe файл не знайдено
    echo.
    echo Перевірте папку: %EXE_PATH%
    pause
    exit /b 1
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              Local Flow AI готовий до використання!       ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
pause
