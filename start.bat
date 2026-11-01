@echo off
chcp 65001 >nul
title Local Flow AI
color 0B

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              🧠 Local Flow AI v1.0.0                     ║
echo ║                                                           ║
echo ║         Повноцінна локальна AI платформа                 ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [ІНФОРМАЦІЯ] Залежності не встановлені. Встановлюю...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ПОМИЛКА] Не вдалося встановити залежності
        pause
        exit /b 1
    )
)

echo [✓] Залежності встановлені
echo.
echo Запускаю Local Flow AI...
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo Відкрийте браузер і перейдіть за адресою:
echo.
echo    http://localhost:1420
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo Для зупинки натисніть Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════
echo.

:: Start the development server
call npm run dev

pause
